import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import type { ExpenseType } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { type, demandId, productId } = req.query;
  let expenses = store.expenses.findAll();
  
  if (type && typeof type === 'string') {
    expenses = expenses.filter(e => e.type === type);
  }
  if (demandId && typeof demandId === 'string') {
    expenses = expenses.filter(e => e.demandId === demandId);
  }
  if (productId && typeof productId === 'string') {
    expenses = expenses.filter(e => e.productId === productId);
  }
  
  res.json({
    success: true,
    data: expenses,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const expense = store.expenses.findById(req.params.id);
  if (!expense) {
    res.status(404).json({
      success: false,
      error: '费用记录不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    data: expense,
  });
});

router.post('/', (req: Request, res: Response) => {
  const { type, amount, description, demandId, productId, date } = req.body;
  
  if (!type || !amount || !description || !date) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段',
    });
    return;
  }
  
  const newExpense = store.expenses.create({
    type: type as ExpenseType,
    amount: Number(amount),
    description,
    demandId,
    productId,
    date,
  });
  
  res.status(201).json({
    success: true,
    data: newExpense,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const expense = store.expenses.findById(req.params.id);
  if (!expense) {
    res.status(404).json({
      success: false,
      error: '费用记录不存在',
    });
    return;
  }
  
  const updatedExpense = store.expenses.update(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedExpense,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.expenses.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: '费用记录不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    message: '删除成功',
  });
});

export default router;
