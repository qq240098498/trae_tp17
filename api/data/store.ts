import type { Demand, Product, Expense, DemandStatus, ProductStatus, ExpenseType, Statistics, SalesTrendItem, ProductRankItem, Promotion, PromotionStatus, ProductCostStat, Refund, RefundStatus, RefundType } from '../../shared/types.js';

const generateId = (): string => Math.random().toString(36).substring(2, 15);

const now = new Date();
const daysAgo = (days: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const mockDemands: Demand[] = [
  {
    id: generateId(),
    customerName: '张三',
    customerPhone: '13800138001',
    productName: 'iPhone 15 Pro Max',
    quantity: 1,
    budget: 9999,
    description: '需要256GB 原色钛金属',
    deadline: formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
    status: 'purchasing',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: generateId(),
    customerName: '李四',
    customerPhone: '13800138002',
    productName: 'SK-II神仙水230ml',
    quantity: 2,
    budget: 2800,
    description: '要日本本土版',
    deadline: formatDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
    status: 'pending',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: generateId(),
    customerName: '王五',
    customerPhone: '13800138003',
    productName: 'Nike Air Max 270',
    quantity: 1,
    budget: 1200,
    description: '黑色 42码',
    deadline: formatDate(new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)),
    status: 'shipping',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(8),
  },
  {
    id: generateId(),
    customerName: '赵六',
    customerPhone: '13800138004',
    productName: '澳洲爱他美奶粉3段',
    quantity: 6,
    budget: 1800,
    description: '金装版本',
    deadline: formatDate(new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000)),
    status: 'completed',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(25),
  },
  {
    id: generateId(),
    customerName: '钱七',
    customerPhone: '13800138005',
    productName: '戴森吹风机HD15',
    quantity: 1,
    budget: 3500,
    description: '紫红色',
    deadline: formatDate(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)),
    status: 'pending',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: generateId(),
    customerName: '孙八',
    customerPhone: '13800138006',
    productName: '兰蔻小黑瓶精华100ml',
    quantity: 3,
    budget: 3600,
    description: '圣诞节礼盒装',
    deadline: formatDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
    status: 'completed',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(40),
  },
  {
    id: generateId(),
    customerName: '周九',
    customerPhone: '13800138007',
    productName: 'iPad Pro 12.9寸',
    quantity: 1,
    budget: 8999,
    description: '256GB WiFi版 深空灰',
    deadline: formatDate(new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000)),
    status: 'cancelled',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
  },
  {
    id: generateId(),
    customerName: '吴十',
    customerPhone: '13800138008',
    productName: 'Swisse钙片150粒',
    quantity: 4,
    budget: 600,
    description: '维生素D款',
    deadline: formatDate(new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000)),
    status: 'purchasing',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(7),
  },
  {
    id: generateId(),
    customerName: '郑十一',
    customerPhone: '13800138009',
    productName: 'Levi\'s 501牛仔裤',
    quantity: 2,
    budget: 1600,
    description: '经典蓝色 W32 L32',
    deadline: formatDate(new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)),
    status: 'pending',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: generateId(),
    customerName: '王十二',
    customerPhone: '13800138010',
    productName: '雅诗兰黛小棕瓶50ml',
    quantity: 2,
    budget: 2200,
    description: '抗蓝光眼霜套装',
    deadline: formatDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)),
    status: 'shipping',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(12),
  },
];

const demandIds = mockDemands.map(d => d.id);

export const mockProducts: Product[] = [
  {
    id: generateId(),
    name: 'iPhone 15 Pro Max 256GB',
    category: '电子产品',
    brand: 'Apple',
    purchasePrice: 8999,
    sellingPrice: 9999,
    quantity: 1,
    demandId: demandIds[0],
    status: 'purchased',
    purchaseDate: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    name: 'SK-II神仙水230ml',
    category: '美妆护肤',
    brand: 'SK-II',
    purchasePrice: 1280,
    sellingPrice: 1580,
    quantity: 2,
    demandId: demandIds[1],
    status: 'pending',
    createdAt: daysAgo(5),
  },
  {
    id: generateId(),
    name: 'Nike Air Max 270',
    category: '服装鞋包',
    brand: 'Nike',
    purchasePrice: 980,
    sellingPrice: 1200,
    quantity: 1,
    demandId: demandIds[2],
    status: 'shipped',
    purchaseDate: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(10),
  },
  {
    id: generateId(),
    name: '澳洲爱他美奶粉3段',
    category: '母婴用品',
    brand: '爱他美',
    purchasePrice: 250,
    sellingPrice: 300,
    quantity: 6,
    demandId: demandIds[3],
    status: 'delivered',
    purchaseDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(30),
  },
  {
    id: generateId(),
    name: '戴森吹风机HD15',
    category: '电子产品',
    brand: 'Dyson',
    purchasePrice: 3000,
    sellingPrice: 3500,
    quantity: 1,
    demandId: demandIds[4],
    status: 'pending',
    createdAt: daysAgo(1),
  },
  {
    id: generateId(),
    name: '兰蔻小黑瓶精华100ml',
    category: '美妆护肤',
    brand: 'Lancome',
    purchasePrice: 1080,
    sellingPrice: 1280,
    quantity: 3,
    demandId: demandIds[5],
    status: 'delivered',
    purchaseDate: formatDate(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(45),
  },
  {
    id: generateId(),
    name: 'Swisse钙片150粒',
    category: '食品保健品',
    brand: 'Swisse',
    purchasePrice: 120,
    sellingPrice: 150,
    quantity: 4,
    demandId: demandIds[7],
    status: 'purchased',
    purchaseDate: formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(7),
  },
  {
    id: generateId(),
    name: 'Levi\'s 501牛仔裤',
    category: '服装鞋包',
    brand: 'Levi\'s',
    purchasePrice: 680,
    sellingPrice: 800,
    quantity: 2,
    demandId: demandIds[8],
    status: 'pending',
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    name: '雅诗兰黛小棕瓶50ml',
    category: '美妆护肤',
    brand: 'Estee Lauder',
    purchasePrice: 900,
    sellingPrice: 1100,
    quantity: 2,
    demandId: demandIds[9],
    status: 'shipped',
    purchaseDate: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(15),
  },
  {
    id: generateId(),
    name: 'Apple AirPods Pro 2',
    category: '电子产品',
    brand: 'Apple',
    purchasePrice: 1580,
    sellingPrice: 1899,
    quantity: 1,
    status: 'pending',
    createdAt: daysAgo(4),
  },
];

const productIds = mockProducts.map(p => p.id);

export const mockExpenses: Expense[] = [
  {
    id: generateId(),
    type: 'purchase',
    amount: 8999,
    description: 'iPhone 15 Pro Max 采购成本',
    demandId: demandIds[0],
    productId: productIds[0],
    date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    type: 'shipping',
    amount: 50,
    description: '顺丰快递费',
    demandId: demandIds[0],
    date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    type: 'service',
    amount: 100,
    description: '代购服务费',
    demandId: demandIds[0],
    date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 2560,
    description: 'SK-II神仙水230ml x2 采购',
    demandId: demandIds[1],
    productId: productIds[1],
    date: formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(5),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 980,
    description: 'Nike Air Max 270 采购',
    demandId: demandIds[2],
    productId: productIds[2],
    date: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(10),
  },
  {
    id: generateId(),
    type: 'shipping',
    amount: 30,
    description: '国际运费',
    demandId: demandIds[2],
    date: formatDate(new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(9),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 1500,
    description: '爱他美奶粉x6 采购',
    demandId: demandIds[3],
    productId: productIds[3],
    date: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(30),
  },
  {
    id: generateId(),
    type: 'tax',
    amount: 150,
    description: '海关税费',
    demandId: demandIds[3],
    date: formatDate(new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(28),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 3240,
    description: '兰蔻小黑瓶x3 采购',
    demandId: demandIds[5],
    productId: productIds[5],
    date: formatDate(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(45),
  },
  {
    id: generateId(),
    type: 'service',
    amount: 200,
    description: '代购服务费',
    demandId: demandIds[5],
    date: formatDate(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(45),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 480,
    description: 'Swisse钙片x4 采购',
    demandId: demandIds[7],
    productId: productIds[6],
    date: formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(7),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 1360,
    description: 'Levi\'s牛仔裤x2 采购',
    demandId: demandIds[8],
    productId: productIds[7],
    date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(2),
  },
  {
    id: generateId(),
    type: 'purchase',
    amount: 1800,
    description: '雅诗兰黛小棕瓶x2 采购',
    demandId: demandIds[9],
    productId: productIds[8],
    date: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(15),
  },
  {
    id: generateId(),
    type: 'shipping',
    amount: 45,
    description: '物流运费',
    demandId: demandIds[9],
    date: formatDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(14),
  },
  {
    id: generateId(),
    type: 'other',
    amount: 200,
    description: '其他杂费',
    date: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
    createdAt: daysAgo(20),
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: generateId(),
    name: '新人专享满减',
    description: '新用户首单满500减50',
    type: 'new_user',
    minAmount: 500,
    discountAmount: 50,
    startDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)),
    status: 'active',
    usageLimit: 100,
    usedCount: 12,
    createdAt: daysAgo(30),
  },
  {
    id: generateId(),
    name: '满1000减100',
    description: '订单满1000元立减100元',
    type: 'full_reduction',
    minAmount: 1000,
    discountAmount: 100,
    startDate: formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)),
    status: 'active',
    usageLimit: 500,
    usedCount: 45,
    createdAt: daysAgo(7),
  },
  {
    id: generateId(),
    name: '满2000减250',
    description: '大额订单优惠，满2000减250',
    type: 'full_reduction',
    minAmount: 2000,
    discountAmount: 250,
    startDate: formatDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
    status: 'active',
    usageLimit: 200,
    usedCount: 8,
    createdAt: daysAgo(1),
  },
  {
    id: generateId(),
    name: '满5000减800',
    description: '超值大优惠，满5000减800',
    type: 'full_reduction',
    minAmount: 5000,
    discountAmount: 800,
    startDate: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)),
    status: 'active',
    usageLimit: 50,
    usedCount: 2,
    createdAt: daysAgo(1),
  },
  {
    id: generateId(),
    name: '双十一特惠',
    description: '双十一专属满3000减500',
    type: 'festival',
    minAmount: 3000,
    discountAmount: 500,
    startDate: formatDate(new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000)),
    endDate: formatDate(new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)),
    status: 'expired',
    usageLimit: 1000,
    usedCount: 658,
    createdAt: daysAgo(210),
  },
];

export const mockRefunds: Refund[] = [
  {
    id: generateId(),
    demandId: demandIds[3],
    type: 'after_delivery',
    status: 'pending',
    reason: '商品与描述不符，客户要求退货退款',
    refundAmount: 1800,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: generateId(),
    demandId: demandIds[0],
    type: 'before_delivery',
    status: 'approved',
    reason: '客户临时改变主意，不需要了',
    refundAmount: 9999,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

let demands: Demand[] = [...mockDemands];
let products: Product[] = [...mockProducts];
let expenses: Expense[] = [...mockExpenses];
let promotions: Promotion[] = [...mockPromotions];
let refunds: Refund[] = [...mockRefunds];

export const store = {
  demands: {
    findAll: (): Demand[] => demands,
    findById: (id: string): Demand | undefined => demands.find(d => d.id === id),
    create: (data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>): Demand => {
      const newDemand: Demand = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demands.unshift(newDemand);
      return newDemand;
    },
    update: (id: string, data: Partial<Demand>): Demand | undefined => {
      const index = demands.findIndex(d => d.id === id);
      if (index !== -1) {
        demands[index] = { ...demands[index], ...data, updatedAt: new Date().toISOString() };
        return demands[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      const index = demands.findIndex(d => d.id === id);
      if (index !== -1) {
        demands.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  products: {
    findAll: (): Product[] => products,
    findById: (id: string): Product | undefined => products.find(p => p.id === id),
    findByDemandId: (demandId: string): Product[] => products.filter(p => p.demandId === demandId),
    create: (data: Omit<Product, 'id' | 'createdAt'>): Product => {
      const newProduct: Product = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      products.unshift(newProduct);
      return newProduct;
    },
    update: (id: string, data: Partial<Product>): Product | undefined => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...data };
        return products[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  expenses: {
    findAll: (): Expense[] => expenses,
    findById: (id: string): Expense | undefined => expenses.find(e => e.id === id),
    findByDemandId: (demandId: string): Expense[] => expenses.filter(e => e.demandId === demandId),
    findByProductId: (productId: string): Expense[] => expenses.filter(e => e.productId === productId),
    create: (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
      const newExpense: Expense = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      expenses.unshift(newExpense);
      return newExpense;
    },
    update: (id: string, data: Partial<Expense>): Expense | undefined => {
      const index = expenses.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...data };
        return expenses[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      const index = expenses.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  promotions: {
    findAll: (): Promotion[] => promotions,
    findById: (id: string): Promotion | undefined => promotions.find(p => p.id === id),
    findActive: (): Promotion[] => {
      const now = new Date();
      return promotions.filter(p => {
        if (p.status !== 'active') return false;
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        end.setHours(23, 59, 59, 999);
        return now >= start && now <= end;
      });
    },
    create: (data: Omit<Promotion, 'id' | 'createdAt' | 'usedCount'>): Promotion => {
      const newPromotion: Promotion = {
        ...data,
        type: data.type || 'other',
        usedCount: 0,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      promotions.unshift(newPromotion);
      return newPromotion;
    },
    update: (id: string, data: Partial<Promotion>): Promotion | undefined => {
      const index = promotions.findIndex(p => p.id === id);
      if (index !== -1) {
        promotions[index] = { ...promotions[index], ...data };
        return promotions[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      const index = promotions.findIndex(p => p.id === id);
      if (index !== -1) {
        promotions.splice(index, 1);
        return true;
      }
      return false;
    },
    incrementUsedCount: (id: string): Promotion | undefined => {
      const index = promotions.findIndex(p => p.id === id);
      if (index !== -1) {
        promotions[index] = { ...promotions[index], usedCount: promotions[index].usedCount + 1 };
        return promotions[index];
      }
      return undefined;
    },
    decrementUsedCount: (id: string): Promotion | undefined => {
      const index = promotions.findIndex(p => p.id === id);
      if (index !== -1 && promotions[index].usedCount > 0) {
        promotions[index] = { ...promotions[index], usedCount: promotions[index].usedCount - 1 };
        return promotions[index];
      }
      return undefined;
    },
    hasUserUsedTypeThisMonth: (customerPhone: string, promotionType: string, referenceDate: Date = new Date()): boolean => {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      return demands.some(demand => {
        if (demand.customerPhone !== customerPhone) return false;
        if (!demand.promotionId) return false;
        const demandDate = new Date(demand.createdAt);
        if (demandDate.getFullYear() !== year || demandDate.getMonth() !== month) return false;
        const promotion = promotions.find(p => p.id === demand.promotionId);
        if (!promotion) return false;
        return promotion.type === promotionType;
      });
    },
  },

  refunds: {
    findAll: (): Refund[] => refunds,
    findById: (id: string): Refund | undefined => refunds.find(r => r.id === id),
    findByDemandId: (demandId: string): Refund[] => refunds.filter(r => r.demandId === demandId),
    findByStatus: (status: RefundStatus): Refund[] => refunds.filter(r => r.status === status),
    findByType: (type: RefundType): Refund[] => refunds.filter(r => r.type === type),
    hasActiveRefundForDemand: (demandId: string): boolean => {
      return refunds.some(r =>
        r.demandId === demandId &&
        ['pending', 'approved', 'return_shipped', 'return_received'].includes(r.status)
      );
    },
    create: (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>): Refund => {
      const newRefund: Refund = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      refunds.unshift(newRefund);
      return newRefund;
    },
    update: (id: string, data: Partial<Refund>): Refund | undefined => {
      const index = refunds.findIndex(r => r.id === id);
      if (index !== -1) {
        refunds[index] = { ...refunds[index], ...data, updatedAt: new Date().toISOString() };
        return refunds[index];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      const index = refunds.findIndex(r => r.id === id);
      if (index !== -1) {
        refunds.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  statistics: {
    getOverview: (): Statistics => {
      const completedDemands = demands.filter(d => d.status === 'completed');
      const totalSales = products
        .filter(p => p.status === 'delivered')
        .reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
      const totalPurchaseCost = products
        .filter(p => p.status === 'delivered')
        .reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const pendingDemands = demands.filter(d => d.status === 'pending' || d.status === 'purchasing').length;

      return {
        totalOrders: completedDemands.length,
        totalSales,
        totalProfit: totalSales - totalPurchaseCost - totalExpenses,
        totalExpenses,
        pendingDemands,
      };
    },

    getSalesTrend: (days: number = 7): SalesTrendItem[] => {
      const trend: SalesTrendItem[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);

        const dayProducts = products.filter(p => {
          if (!p.purchaseDate) return false;
          return p.purchaseDate === dateStr && (p.status === 'delivered' || p.status === 'shipped');
        });

        const sales = dayProducts.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
        const cost = dayProducts.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
        const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);

        trend.push({
          date: dateStr,
          sales,
          profit: sales - cost - dayExpenses,
        });
      }

      return trend;
    },

    getProductRanking: (limit: number = 5): ProductRankItem[] => {
      const productMap = new Map<string, { product: Product; count: number; revenue: number }>();

      products
        .filter(p => p.status === 'delivered' || p.status === 'shipped')
        .forEach(p => {
          const existing = productMap.get(p.name);
          if (existing) {
            existing.count += p.quantity;
            existing.revenue += p.sellingPrice * p.quantity;
          } else {
            productMap.set(p.name, {
              product: p,
              count: p.quantity,
              revenue: p.sellingPrice * p.quantity,
            });
          }
        });

      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    },

    getExpenseByType: (): Record<ExpenseType, number> => {
      const result: Record<ExpenseType, number> = {
        purchase: 0,
        shipping: 0,
        service: 0,
        tax: 0,
        other: 0,
      };

      expenses.forEach(e => {
        result[e.type] += e.amount;
      });

      return result;
    },

    getProductCostStats: (searchKeyword?: string, category?: string): ProductCostStat[] => {
      let filteredProducts = products;

      if (searchKeyword && searchKeyword.trim()) {
        const keyword = searchKeyword.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(keyword) ||
          p.brand.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword)
        );
      }

      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      return filteredProducts.map(product => {
        const demand = product.demandId ? demands.find(d => d.id === product.demandId) : undefined;
        const productRelatedExpenses = expenses.filter(e =>
          e.productId === product.id ||
          (product.demandId && e.demandId === product.demandId && !e.productId)
        );
        const relatedExpenses = productRelatedExpenses.reduce((sum, e) => sum + e.amount, 0);

        const quantity = product.quantity;
        const purchaseCost = product.purchasePrice * quantity;
        const sellingRevenue = product.sellingPrice * quantity;
        const discountAmount = demand?.discountAmount || 0;
        const grossProfit = sellingRevenue - purchaseCost;
        const profitRate = purchaseCost > 0 ? (grossProfit / purchaseCost) * 100 : 0;
        const netRevenue = sellingRevenue - discountAmount;
        const netProfit = netRevenue - purchaseCost - relatedExpenses + discountAmount;

        return {
          product,
          demand,
          quantity,
          purchaseCost,
          sellingRevenue,
          relatedExpenses,
          grossProfit,
          profitRate,
          discountAmount,
          netRevenue,
          netProfit,
        };
      }).sort((a, b) => b.netProfit - a.netProfit);
    },

    getCostStatsSummary: () => {
      const stats = store.statistics.getProductCostStats();

      const totalPurchaseCost = stats.reduce((sum, s) => sum + s.purchaseCost, 0);
      const totalSellingRevenue = stats.reduce((sum, s) => sum + s.sellingRevenue, 0);
      const totalRelatedExpenses = stats.reduce((sum, s) => sum + s.relatedExpenses, 0);
      const totalGrossProfit = stats.reduce((sum, s) => sum + s.grossProfit, 0);
      const totalDiscountAmount = stats.reduce((sum, s) => sum + s.discountAmount, 0);
      const totalNetProfit = stats.reduce((sum, s) => sum + s.netProfit, 0);
      const totalQuantity = stats.reduce((sum, s) => sum + s.quantity, 0);

      const deliveredStats = stats.filter(s =>
        s.product.status === 'delivered' || s.product.status === 'shipped'
      );
      const deliveredPurchaseCost = deliveredStats.reduce((sum, s) => sum + s.purchaseCost, 0);
      const deliveredSellingRevenue = deliveredStats.reduce((sum, s) => sum + s.sellingRevenue, 0);
      const deliveredNetProfit = deliveredStats.reduce((sum, s) => sum + s.netProfit, 0);

      return {
        totalProducts: stats.length,
        totalQuantity,
        totalPurchaseCost,
        totalSellingRevenue,
        totalRelatedExpenses,
        totalGrossProfit,
        totalDiscountAmount,
        totalNetProfit,
        totalProfitRate: totalPurchaseCost > 0 ? (totalGrossProfit / totalPurchaseCost) * 100 : 0,
        delivered: {
          count: deliveredStats.length,
          purchaseCost: deliveredPurchaseCost,
          sellingRevenue: deliveredSellingRevenue,
          netProfit: deliveredNetProfit,
          profitRate: deliveredPurchaseCost > 0 ? (deliveredNetProfit / deliveredPurchaseCost) * 100 : 0,
        },
      };
    },
  },
};
