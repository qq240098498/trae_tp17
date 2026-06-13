import type { Demand, Product, Expense, Statistics, SalesTrendItem, ProductRankItem } from '../../shared/types.js';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '请求失败',
    };
  }
}

export const api = {
  demands: {
    getAll: (status?: string) =>
      request<Demand[]>(`/demands${status ? `?status=${status}` : ''}`),
    getById: (id: string) => request<Demand>(`/demands/${id}`),
    create: (data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Demand>('/demands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Demand>) =>
      request<Demand>(`/demands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/demands/${id}`, {
        method: 'DELETE',
      }),
  },

  products: {
    getAll: (params?: { status?: string; category?: string; demandId?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.demandId) query.append('demandId', params.demandId);
      return request<Product[]>(`/products${query.toString() ? `?${query.toString()}` : ''}`);
    },
    getById: (id: string) => request<Product>(`/products/${id}`),
    create: (data: Omit<Product, 'id' | 'createdAt'>) =>
      request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  expenses: {
    getAll: (params?: { type?: string; demandId?: string; productId?: string }) => {
      const query = new URLSearchParams();
      if (params?.type) query.append('type', params.type);
      if (params?.demandId) query.append('demandId', params.demandId);
      if (params?.productId) query.append('productId', params.productId);
      return request<Expense[]>(`/expenses${query.toString() ? `?${query.toString()}` : ''}`);
    },
    getById: (id: string) => request<Expense>(`/expenses/${id}`),
    create: (data: Omit<Expense, 'id' | 'createdAt'>) =>
      request<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Expense>) =>
      request<Expense>(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/expenses/${id}`, {
        method: 'DELETE',
      }),
  },

  statistics: {
    getOverview: () => request<Statistics>('/statistics/overview'),
    getSalesTrend: (days?: number) =>
      request<SalesTrendItem[]>(`/statistics/sales-trend${days ? `?days=${days}` : ''}`),
    getProductRanking: (limit?: number) =>
      request<ProductRankItem[]>(`/statistics/product-ranking${limit ? `?limit=${limit}` : ''}`),
    getExpenseByType: () => request<Record<string, number>>('/statistics/expense-by-type'),
  },
};
