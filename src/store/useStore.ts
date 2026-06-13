import { create } from 'zustand';
import type { Demand, Product, Expense, Statistics, SalesTrendItem, ProductRankItem, ExpenseType } from '../../shared/types.js';
import { api } from '../lib/api.js';

interface StoreState {
  demands: Demand[];
  products: Product[];
  expenses: Expense[];
  statistics: Statistics | null;
  salesTrend: SalesTrendItem[];
  productRanking: ProductRankItem[];
  expenseByType: Record<ExpenseType, number> | null;
  loading: boolean;
  error: string | null;

  fetchDemands: (status?: string) => Promise<void>;
  fetchProducts: (params?: { status?: string; category?: string; demandId?: string }) => Promise<void>;
  fetchExpenses: (params?: { type?: string; demandId?: string; productId?: string }) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchSalesTrend: (days?: number) => Promise<void>;
  fetchProductRanking: (limit?: number) => Promise<void>;
  fetchExpenseByType: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createDemand: (data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDemand: (id: string, data: Partial<Demand>) => Promise<boolean>;
  deleteDemand: (id: string) => Promise<boolean>;

  createProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  createExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<boolean>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  demands: [],
  products: [],
  expenses: [],
  statistics: null,
  salesTrend: [],
  productRanking: [],
  expenseByType: null,
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

  fetchAll: async () => {
    await Promise.all([
      get().fetchDemands(),
      get().fetchProducts(),
      get().fetchExpenses(),
      get().fetchStatistics(),
      get().fetchSalesTrend(7),
      get().fetchProductRanking(5),
      get().fetchExpenseByType(),
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
        loading: false,
      }));
      return true;
    } else {
      set({ error: response.error || '删除需求失败', loading: false });
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

  setError: (error) => set({ error }),
}));
