export type DemandStatus = 'pending' | 'purchasing' | 'shipping' | 'completed' | 'cancelled' | 'refunded';

export type ProductStatus = 'pending' | 'purchased' | 'shipped' | 'delivered';

export type ExpenseType = 'purchase' | 'shipping' | 'service' | 'tax' | 'other';

export type PromotionStatus = 'active' | 'inactive' | 'expired';

export type PromotionType = 'new_user' | 'full_reduction' | 'festival' | 'vip' | 'other';

export type RefundType = 'before_delivery' | 'after_delivery';

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'return_shipped' | 'return_received' | 'refunded' | 'cancelled';

export type RefundReasonCategory =
  | 'quality_issue'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged'
  | 'no_longer_needed'
  | 'price_difference'
  | 'purchase_mistake'
  | 'logistics_delay'
  | 'other';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  minAmount: number;
  discountAmount: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  usageLimit: number;
  usedCount: number;
  createdAt: string;
}

export interface Demand {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  budget: number;
  description: string;
  deadline: string;
  status: DemandStatus;
  promotionId?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  demandId?: string;
  status: ProductStatus;
  purchaseDate?: string;
  remark?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  type: ExpenseType;
  amount: number;
  description: string;
  demandId?: string;
  productId?: string;
  date: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  demandId: string;
  type: RefundType;
  status: RefundStatus;
  reason: string;
  reasonCategory?: RefundReasonCategory;
  refundAmount: number;
  rejectReason?: string;
  returnTrackingNumber?: string;
  returnCarrier?: string;
  returnAddress?: {
    name: string;
    phone: string;
    address: string;
    zipCode?: string;
  };
  returnReceivedBy?: string;
  refundDate?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  returnReceivedDate?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalOrders: number;
  totalSales: number;
  totalProfit: number;
  totalExpenses: number;
  pendingDemands: number;
}

export interface SalesTrendItem {
  date: string;
  sales: number;
  profit: number;
}

export interface ProductRankItem {
  product: Product;
  count: number;
  revenue: number;
}

export interface ProductCostStat {
  product: Product;
  demand?: Demand;
  quantity: number;
  purchaseCost: number;
  sellingRevenue: number;
  relatedExpenses: number;
  grossProfit: number;
  profitRate: number;
  discountAmount: number;
  netRevenue: number;
  netProfit: number;
}

export const statusLabels: Record<DemandStatus, string> = {
  pending: '待处理',
  purchasing: '采购中',
  shipping: '运输中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export const refundTypeLabels: Record<RefundType, string> = {
  before_delivery: '未收货退款',
  after_delivery: '已收货退款',
};

export const refundReasonCategoryLabels: Record<RefundReasonCategory, string> = {
  quality_issue: '商品质量问题',
  wrong_item: '发错商品',
  not_as_described: '与描述不符',
  damaged: '商品破损',
  no_longer_needed: '不想要了',
  price_difference: '价格差异',
  purchase_mistake: '购买错误',
  logistics_delay: '物流太慢',
  other: '其他原因',
};

export const defaultReturnAddress = {
  name: '代购售后服务中心',
  phone: '400-888-8888',
  address: '广东省深圳市南山区科技园南区A座18楼售后服务部',
  zipCode: '518000',
};

export const refundStatusLabels: Record<RefundStatus, string> = {
  pending: '待审核',
  approved: '已批准',
  rejected: '已拒绝',
  return_shipped: '退货已寄出',
  return_received: '退货已收到',
  refunded: '已退款',
  cancelled: '已取消',
};

export const productStatusLabels: Record<ProductStatus, string> = {
  pending: '待采购',
  purchased: '已采购',
  shipped: '已发货',
  delivered: '已送达',
};

export const expenseTypeLabels: Record<ExpenseType, string> = {
  purchase: '采购成本',
  shipping: '物流费用',
  service: '服务费',
  tax: '税费',
  other: '其他',
};

export const demandStatusTransitions: Record<DemandStatus, DemandStatus[]> = {
  pending: ['purchasing', 'cancelled', 'refunded'],
  purchasing: ['shipping', 'cancelled', 'refunded'],
  shipping: ['completed', 'cancelled', 'refunded'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export const productStatusTransitions: Record<ProductStatus, ProductStatus[]> = {
  pending: ['purchased'],
  purchased: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
};

export const refundStatusTransitions: Record<RefundStatus, RefundStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['return_shipped', 'refunded', 'cancelled'],
  rejected: [],
  return_shipped: ['return_received', 'cancelled'],
  return_received: ['refunded', 'cancelled'],
  refunded: [],
  cancelled: [],
};

export const demandStatusTransitionLabels: Record<string, string> = {
  'pending->purchasing': '开始采购',
  'purchasing->shipping': '发货',
  'shipping->completed': '确认完成',
  'pending->cancelled': '取消订单',
  'purchasing->cancelled': '取消订单',
  'shipping->cancelled': '取消订单',
  'pending->refunded': '退款',
  'purchasing->refunded': '退款',
  'shipping->refunded': '退款',
  'completed->refunded': '退款',
};

export const productStatusTransitionLabels: Record<string, string> = {
  'pending->purchased': '确认采购',
  'purchased->shipped': '发货',
  'shipped->delivered': '确认送达',
};

export const refundStatusTransitionLabels: Record<string, string> = {
  'pending->approved': '批准退款',
  'pending->rejected': '拒绝退款',
  'pending->cancelled': '取消申请',
  'approved->return_shipped': '客户已寄出退货',
  'approved->refunded': '直接退款',
  'approved->cancelled': '取消退款',
  'return_shipped->return_received': '确认收到退货',
  'return_shipped->cancelled': '取消退款',
  'return_received->refunded': '确认退款',
  'return_received->cancelled': '取消退款',
};

export function canTransitionDemandStatus(from: DemandStatus, to: DemandStatus): boolean {
  return demandStatusTransitions[from].includes(to);
}

export function canTransitionProductStatus(from: ProductStatus, to: ProductStatus): boolean {
  return productStatusTransitions[from].includes(to);
}

export function canTransitionRefundStatus(from: RefundStatus, to: RefundStatus): boolean {
  return refundStatusTransitions[from].includes(to);
}

export function getNextDemandStatuses(current: DemandStatus): DemandStatus[] {
  return demandStatusTransitions[current];
}

export function getNextProductStatuses(current: ProductStatus): ProductStatus[] {
  return productStatusTransitions[current];
}

export function getNextRefundStatuses(current: RefundStatus): RefundStatus[] {
  return refundStatusTransitions[current];
}

export function canDemandApplyRefund(status: DemandStatus): boolean {
  return ['pending', 'purchasing', 'shipping', 'completed'].includes(status);
}

export function getRefundTypeForDemand(status: DemandStatus): RefundType | null {
  if (['pending', 'purchasing', 'shipping'].includes(status)) {
    return 'before_delivery';
  }
  if (status === 'completed') {
    return 'after_delivery';
  }
  return null;
}

export const categories = ['电子产品', '美妆护肤', '服装鞋包', '母婴用品', '食品保健品', '家居用品', '其他'];

export const promotionStatusLabels: Record<PromotionStatus, string> = {
  active: '进行中',
  inactive: '未启用',
  expired: '已过期',
};

export const promotionTypeLabels: Record<PromotionType, string> = {
  new_user: '新人专享',
  full_reduction: '满减优惠',
  festival: '节日特惠',
  vip: '会员专属',
  other: '其他',
};

export function hasUserUsedPromotionTypeThisMonth(
  demands: Demand[],
  promotions: Promotion[],
  customerPhone: string,
  promotionType: PromotionType,
  currentMonth: Date = new Date()
): boolean {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  return demands.some(demand => {
    if (demand.customerPhone !== customerPhone) return false;
    if (!demand.promotionId) return false;

    const demandDate = new Date(demand.createdAt);
    if (demandDate.getFullYear() !== year || demandDate.getMonth() !== month) return false;

    const promotion = promotions.find(p => p.id === demand.promotionId);
    if (!promotion) return false;

    return promotion.type === promotionType;
  });
}

export function calculatePromotionDiscount(promotion: Promotion, totalAmount: number): number {
  if (promotion.status !== 'active') return 0;
  if (totalAmount < promotion.minAmount) return 0;
  if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) return 0;
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  end.setHours(23, 59, 59, 999);
  if (now < start || now > end) return 0;
  return promotion.discountAmount;
}

export function getApplicablePromotions(promotions: Promotion[], totalAmount: number): Promotion[] {
  return promotions.filter((p) => calculatePromotionDiscount(p, totalAmount) > 0);
}

export function getBestPromotion(promotions: Promotion[], totalAmount: number): Promotion | null {
  const applicable = getApplicablePromotions(promotions, totalAmount);
  if (applicable.length === 0) return null;
  return applicable.reduce((best, current) =>
    current.discountAmount > best.discountAmount ? current : best
  );
}
