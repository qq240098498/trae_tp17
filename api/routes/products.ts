import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import type { ProductStatus } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { status, category, demandId } = req.query;
  let products = store.products.findAll();
  
  if (status && typeof status === 'string') {
    products = products.filter(p => p.status === status);
  }
  if (category && typeof category === 'string') {
    products = products.filter(p => p.category === category);
  }
  if (demandId && typeof demandId === 'string') {
    products = products.filter(p => p.demandId === demandId);
  }
  
  res.json({
    success: true,
    data: products,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const product = store.products.findById(req.params.id);
  if (!product) {
    res.status(404).json({
      success: false,
      error: '商品不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    data: product,
  });
});

router.post('/', (req: Request, res: Response) => {
  const { name, category, brand, purchasePrice, sellingPrice, quantity, demandId, status, purchaseDate, remark } = req.body;
  
  if (!name || !category || !brand || !purchasePrice || !sellingPrice || !quantity) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段',
    });
    return;
  }
  
  const newProduct = store.products.create({
    name,
    category,
    brand,
    purchasePrice: Number(purchasePrice),
    sellingPrice: Number(sellingPrice),
    quantity: Number(quantity),
    demandId,
    status: (status as ProductStatus) || 'pending',
    purchaseDate,
    remark,
  });
  
  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const product = store.products.findById(req.params.id);
  if (!product) {
    res.status(404).json({
      success: false,
      error: '商品不存在',
    });
    return;
  }
  
  const updatedProduct = store.products.update(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedProduct,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.products.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: '商品不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    message: '删除成功',
  });
});

export default router;
