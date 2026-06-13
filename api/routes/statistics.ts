import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/overview', (req: Request, res: Response) => {
  const overview = store.statistics.getOverview();
  
  res.json({
    success: true,
    data: overview,
  });
});

router.get('/sales-trend', (req: Request, res: Response) => {
  const { days } = req.query;
  const daysNum = days ? Number(days) : 7;
  const trend = store.statistics.getSalesTrend(daysNum);
  
  res.json({
    success: true,
    data: trend,
  });
});

router.get('/product-ranking', (req: Request, res: Response) => {
  const { limit } = req.query;
  const limitNum = limit ? Number(limit) : 5;
  const ranking = store.statistics.getProductRanking(limitNum);
  
  res.json({
    success: true,
    data: ranking,
  });
});

router.get('/expense-by-type', (req: Request, res: Response) => {
  const expenseByType = store.statistics.getExpenseByType();
  
  res.json({
    success: true,
    data: expenseByType,
  });
});

export default router;
