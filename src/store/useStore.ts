import { create } from 'zustand';
import type { Demand, Product, Expense, Statistics, SalesTrendItem, ProductRankItem, ExpenseType, Promotion, PromotionStatus, ProductCostStat, Refund, RefundStatus } from '../../shared/types.js';
import { api } from '../lib/api.js';

interface CostStatsSummary {
  totalProducts: number;
  totalQuantity: number;
  totalPurchaseCost: number;
  totalSellingRevenue: number;
  totalRelatedExpenses: number;
  totalGrossProfit: number;
  totalDiscountAmount: number;
  totalNetProfit: number;
  totalProfitRate: number;
  delivered: {
    count: number;
    purchaseCost: number;
    sellingRevenue: number;
    netProfit: number;
    profitRate: number;
  };
}

interface StoreState {
  demands: Demand[];
  products: Product[];
  expenses: Expense[];
  promotions: Promotion[];
  refunds: Refund[];
  statistics: Statistics | null;
  salesTrend: SalesTrendItem[];
  productRanking: ProductRankItem[];
  expenseByType: Record<ExpenseType, number> | null;
  productCostStats: ProductCostStat[];
  costStatsSummary: CostStatsSummary | null;
  loading: boolean;
  error: string | null;

  fetchDemands: (status?: string) => Promise<void>;
  fetchProducts: (params?: { status?: string; category?: string; demandId?: string }) => Promise<void>;
  fetchExpenses: (params?: { type?: string; demandId?: string; productId?: string }) => Promise<void>;
  fetchPromotions: (params?: { status?: string; active?: boolean }) => Promise<void>;
  fetchRefunds: (params?: { status?: string; type?: string; demandId?: string }) => Promise<void>;
  fetchApplicablePromotions: (amount: number) => Promise<Promotion[]>;
  fetchStatistics: () => Promise<void>;
  fetchSalesTrend: (days?: number) => Promise<void>;
  fetchProductRanking: (limit?: number) => Promise<void>;
  fetchExpenseByType: () => Promise<void>;
  fetchProductCostStats: (params?: { keyword?: string; category?: string }) => Promise<void>;
  fetchCostStatsSummary: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createDemand: (data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDemand: (id: string, data: Partial<Demand>) => Promise<boolean>;
  deleteDemand: (id: string) => Promise<boolean>;
  bindProductsToDemand: (demandId: string, productIds: string[]) => Promise<boolean>;
  unbindProductsFromDemand: (demandId: string, productIds?: string[]) => Promise<boolean>;

  createProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  createExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<boolean>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  createPromotion: (data: Omit<Promotion, 'id' | 'createdAt' | 'usedCount'>) => Promise<boolean>;
  updatePromotion: (id: string, data: Partial<Promotion>) => Promise<boolean>;
  deletePromotion: (id: string) => Promise<boolean>;

  createRefund: (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateRefund: (id: string, data: Partial<Refund>) => Promise<boolean>;
  deleteRefund: (id: string) => Promise<boolean>;
  approveRefund: (id: string) => Promise<boolean>;
  rejectRefund: (id: string, rejectReason: string) => Promise<boolean>;
  completeRefund: (id: string) => Promise<boolean>;
  receiveReturn: (id: string, receivedBy?: string) => Promise<boolean>;

  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  demands: [],
  products: [],
  expenses: [],
  promotions: [],
  refunds: [],
  statistics: null,
  salesTrend: [],
  productRanking: [],
  expenseByType: null,
  productCostStats: [],
  costStatsSummary: null,
  loading: false,
  error: null,

  fetchDemands: async (status?: string) => {
    set({ loading: true, error: null });
    const response = await api.demands.getAll(status);
    if (response.success && response.data) {
      set({ demands: response.data, loading: false });
    } else {
      set({ error: response.error || '获取需求列表失败', loading: false });
    }
  },

  fetchProducts: async (params?: { status?: string; category?: string; demandId?: string }) => {
    set({ loading: true, error: null });
    const response = await api.products.getAll(params);
    if (response.success && response.data) {
      set({ products: response.data, loading: false });
    } else {
      set({ error: response.error || '获取商品列表失败', loading: false });
    }
  },

  fetchExpenses: async (params?: { type?: string; demandId?: string; productId?: string }) => {
    set({ loading: true, error: null });
    const response = await api.expenses.getAll(params);
    if (response.success && response.data) {
      set({ expenses: response.data, loading: false });
    } else {
      set({ error: response.error || '获取费用列表失败', loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ loading: true, error: null });
    const response = await api.statistics.getOverview();
    if (response.success && response.data) {
      set({ statistics: response.data, loading: false });
    } else {
      set({ error: response.error || '获取统计数据失败', loading: false });
    }
  },

  fetchSalesTrend: async (days?: number) => {
    set({ loading: true, error: null });
    const response = await api.statistics.getSalesTrend(days);
    if (response.success && response.data) {
      set({ salesTrend: response.data, loading: false });
    } else {
      set({ error: response.error || '获取销售趋势失败', loading: false });
    }
  },

  fetchProductRanking: async (limit?: number) => {
    set({ loading: true, error: null });
    const response = await api.statistics.getProductRanking(limit);
    if (response.success && response.data) {
      set({ productRanking: response.data, loading: false });
    } else {
      set({ error: response.error || '获取商品排行失败', loading: false });
    }
  },

  fetchExpenseByType: async () => {
    set({ loading: true, error: null });
    const response = await api.statistics.getExpenseByType();
    if (response.success && response.data) {
      set({ expenseByType: response.data as Record<ExpenseType, number>, loading: false });
    } else {
      set({ error: response.error || '获取费用分布失败', loading: false });
    }
  },

  fetchProductCostStats: async (params?: { keyword?: string; category?: string }) => {
    set({ loading: true, error: null });
    const response = await api.statistics.getProductCostStats(params);
    if (response.success && response.data) {
      set({ productCostStats: response.data, loading: false });
    } else {
      set({ error: response.error || '获取商品成本统计失败', loading: false });
    }
  },

  fetchCostStatsSummary: async () => {
    set({ loading: true, error: null });
    const response = await api.statistics.getCostStatsSummary();
    if (response.success && response.data) {
      set({ costStatsSummary: response.data as CostStatsSummary, loading: false });
    } else {
      set({ error: response.error || '获取成本统计摘要失败', loading: false });
    }
  },

  fetchPromotions: async (params?: { status?: string; active?: boolean }) => {
    set({ loading: true, error: null });
    const response = await api.promotions.getAll(params);
    if (response.success && response.data) {
      set({ promotions: response.data, loading: false });
    } else {
      set({ error: response.error || '获取优惠活动列表失败', loading: false });
    }
  },

  fetchApplicablePromotions: async (amount: number): Promise<Promotion[]> => {
    set({ loading: true, error: null });
    const response = await api.promotions.getApplicable(amount);
    if (response.success && response.data) {
      set({ loading: false });
      return response.data;
    } else {
      set({ error: response.error || '获取可用优惠失败', loading: false });
      return [];
    }
  },

  fetchRefunds: async (params?: { status?: string; type?: string; demandId?: string }) => {
    set({ loading: true, error: null });
    const response = await api.refunds.getAll(params);
    if (response.success && response.data) {
      set({ refunds: response.data, loading: false });
    } else {
      set({ error: response.error || '获取退款列表失败', loading: false });
    }
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchDemands(),
      get().fetchProducts(),
      get().fetchExpenses(),
      get().fetchPromotions(),
      get().fetchRefunds(),
      get().fetchStatistics(),
      get().fetchSalesTrend(7),
      get().fetchProductRanking(5),
      get().fetchExpenseByType(),
      get().fetchProductCostStats(),
      get().fetchCostStatsSummary(),
    ]);
  },

  createDemand: async (data) => {
    set({ loading: true, error: null });
    const response = await api.demands.create(data);
    if (response.success && response.data) {
      set((state) => ({
        demands: [response.data!, ...state.demands],
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '创建需求失败', loading: false });
      return false;
    }
  },

  updateDemand: async (id, data) => {
    set({ loading: true, error: null });
    const response = await api.demands.update(id, data);
    if (response.success && response.data) {
      set((state) => ({
        demands: state.demands.map((d) => (d.id === id ? response.data! : d)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '更新需求失败', loading: false });
      return false;
    }
  },

  deleteDemand: async (id) => {
    set({ loading: true, error: null });
    const response = await api.demands.delete(id);
    if (response.success) {
      set((state) => ({
        demands: state.demands.filter((d) => d.id !== id),
        products: state.products.map((p) =>
          p.demandId === id ? { ...p, demandId: undefined } : p
        ),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除需求失败', loading: false });
      return false;
    }
  },

  bindProductsToDemand: async (demandId, productIds) => {
    set({ loading: true, error: null });
    const response = await api.demands.bindProducts(demandId, productIds);
    if (response.success && response.data) {
      const boundProducts = response.data.bound;
      set((state) => ({
        products: state.products.map((p) => {
          const bound = boundProducts.find((bp: Product) => bp.id === p.id);
          return bound || p;
        }),
        loading: false,
      }));
      if (response.data.errors && response.data.errors.length > 0) {
        set({ error: response.data.errors.join('; ') });
      }
      return true;
    } else {
      set({ error: response.error || '绑定商品失败', loading: false });
      return false;
    }
  },

  unbindProductsFromDemand: async (demandId, productIds) => {
    set({ loading: true, error: null });
    const response = await api.demands.unbindProducts(demandId, productIds);
    if (response.success) {
      set((state) => ({
        products: state.products.map((p) => {
          if (p.demandId === demandId) {
            if (!productIds || productIds.includes(p.id)) {
              return { ...p, demandId: undefined };
            }
          }
          return p;
        }),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '解绑商品失败', loading: false });
      return false;
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null });
    const response = await api.products.create(data);
    if (response.success && response.data) {
      set((state) => ({
        products: [response.data!, ...state.products],
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '创建商品失败', loading: false });
      return false;
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null });
    const response = await api.products.update(id, data);
    if (response.success && response.data) {
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? response.data! : p)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '更新商品失败', loading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    const response = await api.products.delete(id);
    if (response.success) {
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除商品失败', loading: false });
      return false;
    }
  },

  createExpense: async (data) => {
    set({ loading: true, error: null });
    const response = await api.expenses.create(data);
    if (response.success && response.data) {
      set((state) => ({
        expenses: [response.data!, ...state.expenses],
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '创建费用失败', loading: false });
      return false;
    }
  },

  updateExpense: async (id, data) => {
    set({ loading: true, error: null });
    const response = await api.expenses.update(id, data);
    if (response.success && response.data) {
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? response.data! : e)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '更新费用失败', loading: false });
      return false;
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    const response = await api.expenses.delete(id);
    if (response.success) {
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除费用失败', loading: false });
      return false;
    }
  },

  createPromotion: async (data) => {
    set({ loading: true, error: null });
    const response = await api.promotions.create(data);
    if (response.success && response.data) {
      set((state) => ({
        promotions: [response.data!, ...state.promotions],
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '创建优惠活动失败', loading: false });
      return false;
    }
  },

  updatePromotion: async (id, data) => {
    set({ loading: true, error: null });
    const response = await api.promotions.update(id, data);
    if (response.success && response.data) {
      set((state) => ({
        promotions: state.promotions.map((p) => (p.id === id ? response.data! : p)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '更新优惠活动失败', loading: false });
      return false;
    }
  },

  deletePromotion: async (id) => {
    set({ loading: true, error: null });
    const response = await api.promotions.delete(id);
    if (response.success) {
      set((state) => ({
        promotions: state.promotions.filter((p) => p.id !== id),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除优惠活动失败', loading: false });
      return false;
    }
  },

  createRefund: async (data) => {
    set({ loading: true, error: null });
    const response = await api.refunds.create(data);
    if (response.success && response.data) {
      set((state) => ({
        refunds: [response.data!, ...state.refunds],
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '创建退款申请失败', loading: false });
      return false;
    }
  },

  updateRefund: async (id, data) => {
    set({ loading: true, error: null });
    const response = await api.refunds.update(id, data);
    if (response.success && response.data) {
      set((state) => ({
        refunds: state.refunds.map((r) => (r.id === id ? response.data! : r)),
        demands: response.data!.status === 'refunded'
          ? state.demands.map((d) => d.id === response.data!.demandId ? { ...d, status: 'refunded' as const } : d)
          : state.demands,
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '更新退款申请失败', loading: false });
      return false;
    }
  },

  deleteRefund: async (id) => {
    set({ loading: true, error: null });
    const response = await api.refunds.delete(id);
    if (response.success) {
      set((state) => ({
        refunds: state.refunds.filter((r) => r.id !== id),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除退款申请失败', loading: false });
      return false;
    }
  },

  approveRefund: async (id) => {
    set({ loading: true, error: null });
    const response = await api.refunds.approve(id);
    if (response.success && response.data) {
      set((state) => ({
        refunds: state.refunds.map((r) => (r.id === id ? response.data! : r)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '批准退款失败', loading: false });
      return false;
    }
  },

  rejectRefund: async (id, rejectReason) => {
    set({ loading: true, error: null });
    const response = await api.refunds.reject(id, rejectReason);
    if (response.success && response.data) {
      set((state) => ({
        refunds: state.refunds.map((r) => (r.id === id ? response.data! : r)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '拒绝退款失败', loading: false });
      return false;
    }
  },

  completeRefund: async (id) => {
    set({ loading: true, error: null });
    const response = await api.refunds.completeRefund(id);
    if (response.success && response.data) {
      set((state) => ({
        refunds: state.refunds.map((r) => (r.id === id ? response.data! : r)),
        demands: state.demands.map((d) =>
          d.id === response.data!.demandId ? { ...d, status: 'refunded' as const } : d
        ),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '完成退款失败', loading: false });
      return false;
    }
  },

  receiveReturn: async (id, receivedBy) => {
    set({ loading: true, error: null });
    const response = await api.refunds.receiveReturn(id, receivedBy);
    if (response.success && response.data) {
      set((state) => ({
        refunds: state.refunds.map((r) => (r.id === id ? response.data! : r)),
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '确认收货失败', loading: false });
      return false;
    }
  },

  setError: (error) => set({ error }),
}));
