import express, { type Request, type Response } from 'express';
import { store } from '../data/store.js';
import {
  canTransitionRefundStatus,
  canDemandApplyRefund,
  getRefundTypeForDemand,
  defaultReturnAddress,
} from '../../shared/types.js';
import type { Refund, RefundStatus, RefundType } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { status, type, demandId } = req.query;
  let refunds = store.refunds.findAll();

  if (status && typeof status === 'string') {
    refunds = refunds.filter((r) => r.status === status);
  }
  if (type && typeof type === 'string') {
    refunds = refunds.filter((r) => r.type === type);
  }
  if (demandId && typeof demandId === 'string') {
    refunds = refunds.filter((r) => r.demandId === demandId);
  }

  res.json({
    success: true,
    data: refunds,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  const demand = store.demands.findById(refund.demandId);
  res.json({
    success: true,
    data: {
      ...refund,
      demand,
    },
  });
});

router.post('/', (req: Request, res: Response) => {
  const { demandId, reason, reasonCategory, refundAmount, type, images } = req.body;

  if (!demandId || !reason || !refundAmount) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段：demandId, reason, refundAmount',
    });
    return;
  }

  const demand = store.demands.findById(demandId);
  if (!demand) {
    res.status(404).json({
      success: false,
      error: '关联的代购需求不存在',
    });
    return;
  }

  if (!canDemandApplyRefund(demand.status)) {
    res.status(400).json({
      success: false,
      error: `当前订单状态「${demand.status}」无法申请退款`,
    });
    return;
  }

  if (store.refunds.hasActiveRefundForDemand(demandId)) {
    res.status(400).json({
      success: false,
      error: '该订单已有进行中的退款申请',
    });
    return;
  }

  const refundType: RefundType = type || getRefundTypeForDemand(demand.status) || 'before_delivery';

  const amount = Number(refundAmount);
  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({
      success: false,
      error: '退款金额必须为正数',
    });
    return;
  }

  if (amount > demand.budget) {
    res.status(400).json({
      success: false,
      error: '退款金额不能超过订单预算金额',
    });
    return;
  }

  const newRefund = store.refunds.create({
    demandId,
    type: refundType,
    status: 'pending',
    reason,
    reasonCategory,
    refundAmount: amount,
    images,
  });

  res.status(201).json({
    success: true,
    data: newRefund,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  const { status, rejectReason, returnTrackingNumber, returnCarrier, refundDate, reviewedAt, reviewedBy, returnReceivedDate } = req.body;

  if (status && status !== refund.status) {
    const newStatus = status as RefundStatus;
    if (!canTransitionRefundStatus(refund.status, newStatus)) {
      res.status(400).json({
        success: false,
        error: `退款状态不能从「${refund.status}」变更为「${newStatus}」`,
      });
      return;
    }
  }

  const finalData: Partial<Refund> = { ...req.body };

  if (status === 'rejected' && !rejectReason) {
    res.status(400).json({
      success: false,
      error: '拒绝退款必须填写拒绝原因',
    });
    return;
  }

  if (status === 'approved') {
    finalData.reviewedAt = reviewedAt || new Date().toISOString();
  }

  if (status === 'refunded') {
    finalData.refundDate = refundDate || new Date().toISOString();
    store.demands.update(refund.demandId, { status: 'refunded' });
    if (refund.type === 'before_delivery') {
      const demand = store.demands.findById(refund.demandId);
      if (demand?.promotionId) {
        store.promotions.decrementUsedCount(demand.promotionId);
      }
    }
  }

  if (status === 'return_received') {
    finalData.returnReceivedDate = returnReceivedDate || new Date().toISOString();
  }

  const updatedRefund = store.refunds.update(req.params.id, finalData);

  res.json({
    success: true,
    data: updatedRefund,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  if (['approved', 'return_shipped', 'return_received', 'refunded'].includes(refund.status)) {
    res.status(400).json({
      success: false,
      error: '当前状态不允许删除退款申请',
    });
    return;
  }

  store.refunds.delete(req.params.id);

  res.json({
    success: true,
    message: '删除成功',
  });
});

router.post('/:id/approve', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  if (refund.status !== 'pending') {
    res.status(400).json({
      success: false,
      error: '只有待审核状态的申请可以批准',
    });
    return;
  }

  const updateData: Partial<Refund> = {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  };

  if (refund.type === 'after_delivery') {
    updateData.returnAddress = defaultReturnAddress;
  }

  const updatedRefund = store.refunds.update(req.params.id, updateData);

  res.json({
    success: true,
    data: updatedRefund,
  });
});

router.post('/:id/reject', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  if (refund.status !== 'pending') {
    res.status(400).json({
      success: false,
      error: '只有待审核状态的申请可以拒绝',
    });
    return;
  }

  const { rejectReason } = req.body;
  if (!rejectReason) {
    res.status(400).json({
      success: false,
      error: '拒绝退款必须填写拒绝原因',
    });
    return;
  }

  const updatedRefund = store.refunds.update(req.params.id, {
    status: 'rejected',
    rejectReason,
    reviewedAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: updatedRefund,
  });
});

router.post('/:id/complete-refund', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  const validStatuses = ['approved', 'return_received'];
  if (!validStatuses.includes(refund.status)) {
    res.status(400).json({
      success: false,
      error: '当前状态不允许完成退款',
    });
    return;
  }

  if (refund.type === 'after_delivery' && refund.status !== 'return_received') {
    res.status(400).json({
      success: false,
      error: '已收货退款需要先确认收到退货后才能退款',
    });
    return;
  }

  store.demands.update(refund.demandId, { status: 'refunded' });

  const demand = store.demands.findById(refund.demandId);
  if (demand?.promotionId) {
    store.promotions.decrementUsedCount(demand.promotionId);
  }

  const updatedRefund = store.refunds.update(req.params.id, {
    status: 'refunded',
    refundDate: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: updatedRefund,
  });
});

router.post('/:id/receive-return', (req: Request, res: Response) => {
  const refund = store.refunds.findById(req.params.id);
  if (!refund) {
    res.status(404).json({
      success: false,
      error: '退款申请不存在',
    });
    return;
  }

  if (refund.type !== 'after_delivery') {
    res.status(400).json({
      success: false,
      error: '未收货退款无需确认退货',
    });
    return;
  }

  if (refund.status !== 'return_shipped') {
    res.status(400).json({
      success: false,
      error: '当前状态不允许确认收货，只有退货已寄出后才能确认收货',
    });
    return;
  }

  const { receivedBy } = req.body;

  const updatedRefund = store.refunds.update(req.params.id, {
    status: 'return_received',
    returnReceivedDate: new Date().toISOString(),
    returnReceivedBy: receivedBy || '系统',
  });

  res.json({
    success: true,
    data: updatedRefund,
  });
});

export default router;
