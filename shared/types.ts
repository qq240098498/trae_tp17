export type DemandStatus = 'pending' | 'purchasing' | 'shipping' | 'completed' | 'cancelled';

export type ProductStatus = 'pending' | 'purchased' | 'shipped' | 'delivered';

export type ExpenseType = 'purchase' | 'shipping' | 'service' | 'tax' | 'other';

export type PromotionStatus = 'active' | 'inactive' | 'expired';

export type PromotionType = 'new_user' | 'full_reduction' | 'festival' | 'vip' | 'other';

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

export const statusLabels: Record<DemandStatus, string> = {
  pending: '待处理',
  purchasing: '采购中',
  shipping: '运输中',
  completed: '已完成',
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
  pending: ['purchasing', 'cancelled'],
  purchasing: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const productStatusTransitions: Record<ProductStatus, ProductStatus[]> = {
  pending: ['purchased'],
  purchased: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
};

export const demandStatusTransitionLabels: Record<string, string> = {
  'pending->purchasing': '开始采购',
  'purchasing->shipping': '发货',
  'shipping->completed': '确认完成',
  'pending->cancelled': '取消订单',
  'purchasing->cancelled': '取消订单',
  'shipping->cancelled': '取消订单',
};

export const productStatusTransitionLabels: Record<string, string> = {
  'pending->purchased': '确认采购',
  'purchased->shipped': '发货',
  'shipped->delivered': '确认送达',
};

export function canTransitionDemandStatus(from: DemandStatus, to: DemandStatus): boolean {
  return demandStatusTransitions[from].includes(to);
}

export function canTransitionProductStatus(from: ProductStatus, to: ProductStatus): boolean {
  return productStatusTransitions[from].includes(to);
}

export function getNextDemandStatuses(current: DemandStatus): DemandStatus[] {
  return demandStatusTransitions[current];
}

export function getNextProductStatuses(current: ProductStatus): ProductStatus[] {
  return productStatusTransitions[current];
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
