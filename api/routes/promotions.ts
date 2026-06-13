import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import type { Promotion, PromotionStatus, PromotionType } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { status, active } = req.query;
  let promotions = store.promotions.findAll();

  if (status && typeof status === 'string') {
    promotions = promotions.filter(p => p.status === status);
  }

  if (active === 'true') {
    promotions = store.promotions.findActive();
  }

  res.json({
    success: true,
    data: promotions,
  });
});

router.get('/applicable', (req: Request, res: Response) => {
  const { amount, phone } = req.query;
  const totalAmount = Number(amount);

  if (!amount || isNaN(totalAmount) || totalAmount < 0) {
    res.status(400).json({
      success: false,
      error: '请提供有效的金额参数 amount',
    });
    return;
  }

  const activePromotions = store.promotions.findActive();
  const applicable = activePromotions.filter(p => {
    if (totalAmount < p.minAmount) return false;
    if (p.usageLimit > 0 && p.usedCount >= p.usageLimit) return false;
    return true;
  }).sort((a, b) => b.discountAmount - a.discountAmount);

  let usedTypesThisMonth: PromotionType[] = [];
  if (phone && typeof phone === 'string') {
    const types = new Set<PromotionType>();
    applicable.forEach(p => {
      if (store.promotions.hasUserUsedTypeThisMonth(phone, p.type)) {
        types.add(p.type);
      }
    });
    usedTypesThisMonth = Array.from(types);
  }

  res.json({
    success: true,
    data: applicable,
    usedTypesThisMonth,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const promotion = store.promotions.findById(req.params.id);
  if (!promotion) {
    res.status(404).json({
      success: false,
      error: '优惠活动不存在',
    });
    return;
  }

  res.json({
    success: true,
    data: promotion,
  });
});

router.post('/', (req: Request, res: Response) => {
  const { name, description, type, minAmount, discountAmount, startDate, endDate, status, usageLimit } = req.body;

  if (!name || minAmount === undefined || discountAmount === undefined || !startDate || !endDate) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段：name, minAmount, discountAmount, startDate, endDate',
    });
    return;
  }

  if (Number(minAmount) < 0 || Number(discountAmount) < 0) {
    res.status(400).json({
      success: false,
      error: '满减金额和减免金额不能为负数',
    });
    return;
  }

  if (Number(discountAmount) >= Number(minAmount)) {
    res.status(400).json({
      success: false,
      error: '减免金额必须小于满减门槛金额',
    });
    return;
  }

  const newPromotion = store.promotions.create({
    name,
    description: description || '',
    type: (type as any) || 'other',
    minAmount: Number(minAmount),
    discountAmount: Number(discountAmount),
    startDate,
    endDate,
    status: (status as PromotionStatus) || 'active',
    usageLimit: usageLimit !== undefined ? Number(usageLimit) : 0,
  });

  res.status(201).json({
    success: true,
    data: newPromotion,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const promotion = store.promotions.findById(req.params.id);
  if (!promotion) {
    res.status(404).json({
      success: false,
      error: '优惠活动不存在',
    });
    return;
  }

  const { minAmount, discountAmount } = req.body;
  if (minAmount !== undefined && Number(minAmount) < 0) {
    res.status(400).json({
      success: false,
      error: '满减金额不能为负数',
    });
    return;
  }
  if (discountAmount !== undefined && Number(discountAmount) < 0) {
    res.status(400).json({
      success: false,
      error: '减免金额不能为负数',
    });
    return;
  }

  const finalMinAmount = minAmount !== undefined ? Number(minAmount) : promotion.minAmount;
  const finalDiscountAmount = discountAmount !== undefined ? Number(discountAmount) : promotion.discountAmount;
  if (finalDiscountAmount >= finalMinAmount) {
    res.status(400).json({
      success: false,
      error: '减免金额必须小于满减门槛金额',
    });
    return;
  }

  const updatedPromotion = store.promotions.update(req.params.id, {
    ...req.body,
    minAmount: finalMinAmount,
    discountAmount: finalDiscountAmount,
  });

  res.json({
    success: true,
    data: updatedPromotion,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.promotions.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: '优惠活动不存在',
    });
    return;
  }

  res.json({
    success: true,
    message: '删除成功',
  });
});

export default router;
