import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import { canTransitionDemandStatus } from '../../shared/types.js';
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
  const { customerName, customerPhone, productName, quantity, budget, description, deadline, status } = req.body;
  
  if (!customerName || !customerPhone || !productName || !quantity || !budget || !deadline) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段',
    });
    return;
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
  
  const updatedDemand = store.demands.update(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedDemand,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.demands.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: '需求不存在',
    });
    return;
  }
  
  res.json({
    success: true,
    message: '删除成功',
  });
});

export default router;
