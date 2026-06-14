import type { Demand, Product, Expense, Statistics, SalesTrendItem, ProductRankItem, Promotion, ProductCostStat, Refund } from '../../shared/types.js';

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
    getProducts: (id: string) => request<Product[]>(`/demands/${id}/products`),
    bindProducts: (id: string, productIds: string[]) =>
      request<{ bound: Product[]; errors: string[] }>(`/demands/${id}/bind-products`, {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      }),
    unbindProducts: (id: string, productIds?: string[]) =>
      request<void>(`/demands/${id}/unbind-products`, {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      }),
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
    getProductCostStats: (params?: { keyword?: string; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.category) query.append('category', params.category);
      return request<ProductCostStat[]>(`/statistics/product-cost-stats${query.toString() ? `?${query.toString()}` : ''}`);
    },
    getCostStatsSummary: () => request<any>('/statistics/cost-stats-summary'),
  },

  promotions: {
    getAll: (params?: { status?: string; active?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.active) query.append('active', 'true');
      return request<Promotion[]>(`/promotions${query.toString() ? `?${query.toString()}` : ''}`);
    },
    getApplicable: (amount: number) =>
      request<Promotion[]>(`/promotions/applicable?amount=${amount}`),
    getById: (id: string) => request<Promotion>(`/promotions/${id}`),
    create: (data: Omit<Promotion, 'id' | 'createdAt' | 'usedCount'>) =>
      request<Promotion>('/promotions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Promotion>) =>
      request<Promotion>(`/promotions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/promotions/${id}`, {
        method: 'DELETE',
      }),
  },

  refunds: {
    getAll: (params?: { status?: string; type?: string; demandId?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.type) query.append('type', params.type);
      if (params?.demandId) query.append('demandId', params.demandId);
      return request<Refund[]>(`/refunds${query.toString() ? `?${query.toString()}` : ''}`);
    },
    getById: (id: string) => request<any>(`/refunds/${id}`),
    create: (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Refund>('/refunds', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Refund>) =>
      request<Refund>(`/refunds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/refunds/${id}`, {
        method: 'DELETE',
      }),
    approve: (id: string) =>
      request<Refund>(`/refunds/${id}/approve`, {
        method: 'POST',
      }),
    reject: (id: string, rejectReason: string) =>
      request<Refund>(`/refunds/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectReason }),
      }),
    completeRefund: (id: string) =>
      request<Refund>(`/refunds/${id}/complete-refund`, {
        method: 'POST',
      }),
    receiveReturn: (id: string, receivedBy?: string) =>
      request<Refund>(`/refunds/${id}/receive-return`, {
        method: 'POST',
        body: JSON.stringify({ receivedBy }),
      }),
  },
};
