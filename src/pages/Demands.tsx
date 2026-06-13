import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ArrowRight, Ban, Tag, CheckCircle2, Package, Link2, Unlink, X } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import Modal from '../components/Modal.js';
import StatusBadge from '../components/StatusBadge.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import type { Demand, DemandStatus, Promotion, Product } from '../../shared/types.js';
import {
  statusLabels,
  getNextDemandStatuses,
  demandStatusTransitions,
  demandStatusTransitionLabels,
  getApplicablePromotions,
  hasUserUsedPromotionTypeThisMonth,
  promotionTypeLabels,
  productStatusLabels,
} from '../../shared/types.js';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

const getTransitionKey = (from: DemandStatus, to: DemandStatus) => `${from}->${to}`;

export default function Demands() {
  const {
    demands,
    products,
    promotions,
    fetchDemands,
    fetchProducts,
    fetchPromotions,
    createDemand,
    updateDemand,
    deleteDemand,
    bindProductsToDemand,
    unbindProductsFromDemand,
    loading,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [bindingDemand, setBindingDemand] = useState<Demand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'all'>('all');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [expandedDemandId, setExpandedDemandId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productName: '',
    quantity: 1,
    budget: 0,
    description: '',
    deadline: getDefaultDeadline(),
    status: 'pending' as DemandStatus,
    promotionId: undefined as string | undefined,
    discountAmount: 0,
  });

  useEffect(() => {
    fetchDemands();
    fetchProducts();
    fetchPromotions({ active: true });
  }, [fetchDemands, fetchProducts, fetchPromotions]);

  useEffect(() => {
    if (selectedPromotionId) {
      const promotion = promotions.find(p => p.id === selectedPromotionId);
      if (promotion && isPromotionDisabled(promotion)) {
        handlePromotionSelect(null);
      }
    }
  }, [formData.customerPhone, formData.budget, promotions, selectedPromotionId]);

  const applicablePromotions = getApplicablePromotions(promotions, formData.budget);
  const selectedPromotion = promotions.find(p => p.id === selectedPromotionId) || null;

  const getUsedTypesThisMonth = (phone: string): Set<string> => {
    if (!phone) return new Set();
    const usedTypes = new Set<string>();
    applicablePromotions.forEach(p => {
      if (hasUserUsedPromotionTypeThisMonth(demands, promotions, phone, p.type)) {
        usedTypes.add(p.type);
      }
    });
    return usedTypes;
  };

  const usedTypesThisMonth = getUsedTypesThisMonth(formData.customerPhone);

  const isPromotionDisabled = (promotion: Promotion): boolean => {
    if (!formData.customerPhone) return false;
    if (editingDemand && editingDemand.promotionId === promotion.id) return false;
    return usedTypesThisMonth.has(promotion.type);
  };

  const filteredDemands = demands.filter((demand) => {
    const matchesSearch =
      demand.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDemandProducts = (demandId: string) =>
    products.filter(p => p.demandId === demandId);

  const getUnboundProducts = () =>
    products.filter(p => !p.demandId || p.demandId === '');

  const handleOpenModal = (demand?: Demand) => {
    setStatusError(null);
    if (demand) {
      setEditingDemand(demand);
      setSelectedPromotionId(demand.promotionId || null);
      setFormData({
        customerName: demand.customerName,
        customerPhone: demand.customerPhone,
        productName: demand.productName,
        quantity: demand.quantity,
        budget: demand.budget,
        description: demand.description,
        deadline: demand.deadline,
        status: demand.status,
        promotionId: demand.promotionId,
        discountAmount: demand.discountAmount || 0,
      });
    } else {
      setEditingDemand(null);
      setSelectedPromotionId(null);
      setFormData({
        customerName: '',
        customerPhone: '',
        productName: '',
        quantity: 1,
        budget: 0,
        description: '',
        deadline: getDefaultDeadline(),
        status: 'pending',
        promotionId: undefined,
        discountAmount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDemand(null);
    setStatusError(null);
    setSelectedPromotionId(null);
  };

  const handleOpenBindModal = (demand: Demand) => {
    setBindingDemand(demand);
    setSelectedProductIds([]);
    setIsBindModalOpen(true);
  };

  const handleCloseBindModal = () => {
    setIsBindModalOpen(false);
    setBindingDemand(null);
    setSelectedProductIds([]);
  };

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBindProducts = async () => {
    if (!bindingDemand || selectedProductIds.length === 0) return;
    const success = await bindProductsToDemand(bindingDemand.id, selectedProductIds);
    if (success) {
      handleCloseBindModal();
    }
  };

  const handleUnbindProduct = async (demandId: string, productId: string) => {
    await unbindProductsFromDemand(demandId, [productId]);
  };

  const handlePromotionSelect = (promotionId: string | null) => {
    setSelectedPromotionId(promotionId);
    if (promotionId) {
      const promotion = promotions.find(p => p.id === promotionId);
      if (promotion) {
        setFormData({
          ...formData,
          promotionId,
          discountAmount: promotion.discountAmount,
        });
      }
    } else {
      setFormData({
        ...formData,
        promotionId: undefined,
        discountAmount: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);

    let success = false;
    if (editingDemand) {
      success = await updateDemand(editingDemand.id, formData);
      if (!success) {
        setStatusError('状态流转不合法，请按流程操作');
      }
    } else {
      success = await createDemand(formData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleStatusTransition = async (demand: Demand, newStatus: DemandStatus) => {
    const success = await updateDemand(demand.id, { status: newStatus });
    if (!success) {
      setStatusError('状态流转失败');
      setTimeout(() => setStatusError(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDemand(deleteId);
      setDeleteId(null);
    }
  };

  const toggleExpand = (demandId: string) => {
    setExpandedDemandId(prev => prev === demandId ? null : demandId);
  };

  const availableStatuses = editingDemand
    ? [editingDemand.status, ...demandStatusTransitions[editingDemand.status]]
    : Object.keys(statusLabels) as DemandStatus[];

  const unboundProducts = getUnboundProducts();

  return (
    <div className="space-y-6">
      {statusError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {statusError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">代购需求管理</h2>
          <p className="text-gray-500 mt-1">管理所有客户的代购需求订单，支持商品绑定</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增需求
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户名称、商品名称或电话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DemandStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">全部状态</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredDemands.map((demand) => {
            const nextStatuses = getNextDemandStatuses(demand.status);
            const isTerminal = nextStatuses.length === 0;
            const demandProducts = getDemandProducts(demand.id);
            const isExpanded = expandedDemandId === demand.id;

            const totalProductCost = demandProducts.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
            const totalProductRevenue = demandProducts.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
            const totalProfit = totalProductRevenue - totalProductCost - (demand.discountAmount || 0);

            return (
              <div key={demand.id} className="hover:bg-gray-50/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer" onClick={() => toggleExpand(demand.id)}>
                  <div className="col-span-12 md:col-span-2">
                    <div className="font-medium text-gray-900">{demand.customerName}</div>
                    <div className="text-sm text-gray-500">{demand.customerPhone}</div>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <div className="font-medium text-gray-900 truncate" title={demand.productName}>{demand.productName}</div>
                    {demand.description && (
                      <div className="text-sm text-gray-500 truncate" title={demand.description}>
                        {demand.description}
                      </div>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    <div className="text-gray-900">x{demand.quantity}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(demand.budget)}</div>
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    {demand.discountAmount && demand.discountAmount > 0 ? (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600">
                          减{formatCurrency(demand.discountAmount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">无优惠</span>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-1 text-sm text-gray-600">
                    {formatDate(demand.deadline)}
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <StatusBadge status={demand.status} type="demand" />
                  </div>
                  <div className="col-span-4 md:col-span-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      <Package className="w-3 h-3" />
                      {demandProducts.length} 件商品
                    </div>
                    {demandProducts.length > 0 && (
                      <div className={`text-xs font-medium px-2 py-1 rounded-md ${totalProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        利润: {formatCurrency(totalProfit)}
                      </div>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {isTerminal ? (
                      <span className="text-xs text-gray-400">已结束</span>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        {nextStatuses.map((nextStatus) => {
                          const key = getTransitionKey(demand.status, nextStatus);
                          const label = demandStatusTransitionLabels[key] || statusLabels[nextStatus];
                          const isCancel = nextStatus === 'cancelled';
                          return (
                            <button
                              key={nextStatus}
                              onClick={() => handleStatusTransition(demand, nextStatus)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                                isCancel
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                            >
                              {isCancel ? <Ban className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-800">绑定商品</span>
                        <span className="text-sm text-gray-500">({demandProducts.length} 件)</span>
                      </div>
                      <button
                        onClick={() => handleOpenBindModal(demand)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        绑定商品
                      </button>
                    </div>

                    {demandProducts.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm bg-white rounded-lg border border-dashed border-gray-200">
                        暂无绑定商品，点击"绑定商品"按钮进行关联
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {demandProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{product.name}</div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>{product.brand}</span>
                                <span>x{product.quantity}</span>
                                <span>采购: {formatCurrency(product.purchasePrice)}</span>
                                <span>售价: {formatCurrency(product.sellingPrice)}</span>
                                <StatusBadge status={product.status} type="product" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="text-right mr-3">
                                <div className={`text-sm font-semibold ${(product.sellingPrice - product.purchasePrice) * product.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  利润: {formatCurrency((product.sellingPrice - product.purchasePrice) * product.quantity)}
                                </div>
                              </div>
                              <button
                                onClick={() => handleUnbindProduct(demand.id, product.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="解绑"
                              >
                                <Unlink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {demandProducts.length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">采购总成本</div>
                          <div className="font-semibold text-gray-800">{formatCurrency(totalProductCost)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">销售总收入</div>
                          <div className="font-semibold text-gray-800">{formatCurrency(totalProductRevenue)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">优惠减免</div>
                          <div className="font-semibold text-red-600">-{formatCurrency(demand.discountAmount || 0)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">预估净利润</div>
                          <div className={`font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalProfit)}</div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenModal(demand)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(demand.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredDemands.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">需求状态流转规则</h3>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {(['pending', 'purchasing', 'shipping', 'completed'] as DemandStatus[]).map((status, idx) => (
            <span key={status} className="flex items-center gap-2">
              <StatusBadge status={status} type="demand" />
              {idx < 3 && <ArrowRight className="w-4 h-4 text-gray-400" />}
            </span>
          ))}
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-xs text-gray-500">待处理/采购中/运输中 可</span>
          <StatusBadge status="cancelled" type="demand" />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDemand ? '编辑代购需求' : '新增代购需求'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              {editingDemand ? (
                <div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DemandStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    {availableStatuses.map((value) => (
                      <option key={value} value={value}>
                        {statusLabels[value]}
                        {value === editingDemand.status ? '（当前）' : ''}
                      </option>
                    ))}
                  </select>
                  {editingDemand.status !== 'pending' && (
                    <p className="mt-1 text-xs text-gray-500">
                      状态只能按流程流转，当前可流转至：{demandStatusTransitions[editingDemand.status].map(s => statusLabels[s]).join('、') || '无'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                  新建需求默认为「待处理」状态
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预算 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                截止日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={getTodayDate()}
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品描述
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="规格、颜色等备注信息"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                选择优惠活动
                <span className="text-xs font-normal text-gray-400">（仅可选择一张）</span>
              </h4>
              {formData.budget > 0 && (
                <span className="text-sm text-gray-500">
                  当前预算: <span className="font-semibold text-gray-700">{formatCurrency(formData.budget)}</span>
                </span>
              )}
            </div>

            {formData.budget <= 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                请先填写预算金额以查看可用优惠
              </div>
            ) : applicablePromotions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                暂无满足条件的优惠活动
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPromotionId === null
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="promotion"
                      value=""
                      checked={selectedPromotionId === null}
                      onChange={() => handlePromotionSelect(null)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700">不使用优惠</span>
                  </div>
                </label>

                {applicablePromotions.map((promotion) => {
                  const disabled = isPromotionDisabled(promotion);
                  return (
                    <label
                      key={promotion.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                        selectedPromotionId === promotion.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : disabled
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 hover:border-indigo-200 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        if (disabled) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="promotion"
                          value={promotion.id}
                          checked={selectedPromotionId === promotion.id}
                          onChange={() => handlePromotionSelect(promotion.id)}
                          disabled={disabled}
                          className="w-4 h-4 text-indigo-600 disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                              {promotion.name}
                            </span>
                            {selectedPromotionId === promotion.id && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {promotion.description}
                          </div>
                          {disabled && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              本月已使用「{promotionTypeLabels[promotion.type]}」类型优惠
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${disabled ? 'text-gray-400' : 'text-red-500'}`}>
                          减 {formatCurrency(promotion.discountAmount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          满 {formatCurrency(promotion.minAmount)} 可用
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {selectedPromotion && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700">
                    <span className="font-medium">优惠已选择:</span> {selectedPromotion.name}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      原价: <span className="line-through">{formatCurrency(formData.budget)}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      优惠后: {formatCurrency(formData.budget - selectedPromotion.discountAmount)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : (editingDemand ? '保存修改' : '创建需求')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBindModalOpen}
        onClose={handleCloseBindModal}
        title={bindingDemand ? `为「${bindingDemand.customerName} - ${bindingDemand.productName}」绑定商品` : '绑定商品'}
        size="lg"
      >
        {bindingDemand && (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-sm text-indigo-700">
                <span className="font-medium">已选 {selectedProductIds.length} 件商品</span>
                <span className="text-indigo-500 ml-2">（可多选绑定）</span>
              </div>
            </div>

            {unboundProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无可绑定的商品</p>
                <p className="text-xs text-gray-400 mt-1">所有商品均已绑定到需求，或请先创建商品</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                {unboundProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const productProfit = (product.sellingPrice - product.purchasePrice) * product.quantity;
                  return (
                    <label
                      key={product.id}
                      className={`flex items-start justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProductSelection(product.id)}
                          className="w-4 h-4 mt-0.5 text-indigo-600 rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{product.brand}</span>
                            <span>{product.category}</span>
                            <span>x{product.quantity}</span>
                            <StatusBadge status={product.status} type="product" />
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-2">
                            <span className="text-gray-600">采购: {formatCurrency(product.purchasePrice)}</span>
                            <span className="text-gray-600">售价: {formatCurrency(product.sellingPrice)}</span>
                            <span className={`font-medium ${productProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              利润: {formatCurrency(productProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseBindModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={handleBindProducts}
                disabled={selectedProductIds.length === 0 || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link2 className="w-4 h-4" />
                确认绑定 ({selectedProductIds.length})
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这条代购需求吗？绑定的商品将自动解绑，此操作无法撤销。"
        confirmText="删除"
        variant="danger"
      />
    </div>
  );
}
