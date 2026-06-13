import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import { canTransitionDemandStatus, calculatePromotionDiscount, promotionTypeLabels } from '../../shared/types.js';
import type { Demand, DemandStatus } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  let demands = store.demands.findAll();
  
  if (status && typeof status === 'string') {
    demands = demands.filter(d => d.status === status);
  }
  
  res.json({
    success: true,
    data: demands,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    data: demand,
  });
});

router.post('/', (req: Request, res: Response) => {
  const { customerName, customerPhone, productName, quantity, budget, description, deadline, status, promotionId } = req.body;
  
  if (!customerName || !customerPhone || !productName || !quantity || !budget || !deadline) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段',
    });
    return;
  }

  let discountAmount = 0;
  let finalPromotionId: string | undefined;

  if (promotionId) {
    const promotion = store.promotions.findById(promotionId);
    if (!promotion) {
      res.status(400).json({
        success: false,
        error: '优惠活动不存在',
      });
      return;
    }

    const hasUsedThisMonth = store.promotions.hasUserUsedTypeThisMonth(
      customerPhone,
      promotion.type
    );
    if (hasUsedThisMonth) {
      const typeLabel = promotionTypeLabels[promotion.type] || promotion.type;
      res.status(400).json({
        success: false,
        error: `该手机号本月已使用过「${typeLabel}」类型的优惠，同类型优惠每人每月限用一张`,
      });
      return;
    }

    discountAmount = calculatePromotionDiscount(promotion, Number(budget));
    if (discountAmount <= 0) {
      res.status(400).json({
        success: false,
        error: '该优惠活动不满足使用条件',
      });
      return;
    }

    finalPromotionId = promotionId;
    store.promotions.incrementUsedCount(promotionId);
  }
  
  const newDemand = store.demands.create({
    customerName,
    customerPhone,
    productName,
    quantity: Number(quantity),
    budget: Number(budget),
    description: description || '',
    deadline,
    status: (status as DemandStatus) || 'pending',
    promotionId: finalPromotionId,
    discountAmount,
  });
  
  res.status(201).json({
    success: true,
    data: newDemand,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }
  
  if (req.body.status && req.body.status !== demand.status) {
    const newStatus = req.body.status as DemandStatus;
    if (!canTransitionDemandStatus(demand.status, newStatus)) {
      res.status(400).json({
        success: false,
        error: `状态不能从"${demand.status}"变更为"${newStatus}"`,
      });
      return;
    }
  }

  let finalData = { ...req.body };
  const newPromotionId = req.body.promotionId;
  const oldPromotionId = demand.promotionId;
  const budget = req.body.budget !== undefined ? Number(req.body.budget) : demand.budget;

  if (newPromotionId !== undefined) {
    if (newPromotionId === null || newPromotionId === '') {
      if (oldPromotionId) {
        store.promotions.decrementUsedCount(oldPromotionId);
      }
      finalData.promotionId = undefined;
      finalData.discountAmount = 0;
    } else if (newPromotionId !== oldPromotionId) {
      if (oldPromotionId) {
        store.promotions.decrementUsedCount(oldPromotionId);
      }

      const promotion = store.promotions.findById(newPromotionId);
      if (!promotion) {
        res.status(400).json({
          success: false,
          error: '优惠活动不存在',
        });
        return;
      }

      const hasUsedThisMonth = store.promotions.hasUserUsedTypeThisMonth(
        demand.customerPhone,
        promotion.type
      );
      if (hasUsedThisMonth) {
        const typeLabel = promotionTypeLabels[promotion.type] || promotion.type;
        res.status(400).json({
          success: false,
          error: `该手机号本月已使用过「${typeLabel}」类型的优惠，同类型优惠每人每月限用一张`,
        });
        return;
      }

      const discountAmount = calculatePromotionDiscount(promotion, budget);
      if (discountAmount <= 0) {
        res.status(400).json({
          success: false,
          error: '该优惠活动不满足使用条件',
        });
        return;
      }

      store.promotions.incrementUsedCount(newPromotionId);
      finalData.discountAmount = discountAmount;
    } else if (newPromotionId === oldPromotionId && req.body.budget !== undefined) {
      const promotion = store.promotions.findById(newPromotionId);
      if (promotion) {
        const discountAmount = calculatePromotionDiscount(promotion, budget);
        finalData.discountAmount = discountAmount;
      }
    }
  }
  
  const updatedDemand = store.demands.update(req.params.id, finalData);
  
  res.json({
    success: true,
    data: updatedDemand,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }

  if (demand.promotionId) {
    store.promotions.decrementUsedCount(demand.promotionId);
  }

  store.demands.delete(req.params.id);
  
  res.json({
    success: true,
    message: '删除成功',
  });
});

router.get('/:id/products', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }

  const products = store.products.findByDemandId(req.params.id);
  
  res.json({
    success: true,
    data: products,
  });
});

router.post('/:id/bind-products', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }

  const { productIds } = req.body as { productIds?: string[] };
  if (!productIds || !Array.isArray(productIds)) {
    res.status(400).json({
      success: false,
      error: '缺少 productIds 数组参数',
    });
    return;
  }

  const boundProducts = [];
  const errors: string[] = [];

  for (const productId of productIds) {
    const product = store.products.findById(productId);
    if (!product) {
      errors.push(`商品 ${productId} 不存在`);
      continue;
    }
    if (product.demandId && product.demandId !== req.params.id) {
      errors.push(`商品 ${product.name} 已绑定到其他需求`);
      continue;
    }
    const updated = store.products.update(productId, { demandId: req.params.id });
    if (updated) boundProducts.push(updated);
  }

  res.json({
    success: true,
    data: {
      bound: boundProducts,
      errors,
    },
    message: `成功绑定 ${boundProducts.length} 个商品${errors.length > 0 ? `，${errors.length} 个失败` : ''}`,
  });
});

router.post('/:id/unbind-products', (req: Request, res: Response) => {
  const demand = store.demands.findById(req.params.id);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }

  const { productIds } = req.body as { productIds?: string[] };
  if (!productIds || !Array.isArray(productIds)) {
    const allProducts = store.products.findByDemandId(req.params.id);
    for (const product of allProducts) {
      store.products.update(product.id, { demandId: undefined });
    }
    res.json({
      success: true,
      message: `已解绑 ${allProducts.length} 个商品`,
    });
    return;
  }

  let unboundCount = 0;
  for (const productId of productIds) {
    const product = store.products.findById(productId);
    if (product && product.demandId === req.params.id) {
      store.products.update(productId, { demandId: undefined });
      unboundCount++;
    }
  }

  res.json({
    success: true,
    message: `已解绑 ${unboundCount} 个商品`,
  });
});

export default router;
