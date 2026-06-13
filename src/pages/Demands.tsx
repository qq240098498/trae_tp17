import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ArrowRight, Ban, Tag, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import Modal from '../components/Modal.js';
import StatusBadge from '../components/StatusBadge.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import type { Demand, DemandStatus, Promotion } from '../../shared/types.js';
import {
  statusLabels,
  getNextDemandStatuses,
  demandStatusTransitions,
  demandStatusTransitionLabels,
  getApplicablePromotions,
} from '../../shared/types.js';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

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
  const { demands, promotions, fetchDemands, fetchPromotions, createDemand, updateDemand, deleteDemand, loading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'all'>('all');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

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
    fetchPromotions({ active: true });
  }, [fetchDemands, fetchPromotions]);

  const applicablePromotions = getApplicablePromotions(promotions, formData.budget);
  const selectedPromotion = promotions.find(p => p.id === selectedPromotionId) || null;

  const filteredDemands = demands.filter((demand) => {
    const matchesSearch =
      demand.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const availableStatuses = editingDemand
    ? [editingDemand.status, ...demandStatusTransitions[editingDemand.status]]
    : Object.keys(statusLabels) as DemandStatus[];

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
          <p className="text-gray-500 mt-1">管理所有客户的代购需求订单</p>
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量/预算
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优惠信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  截止日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态操作
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDemands.map((demand) => {
                const nextStatuses = getNextDemandStatuses(demand.status);
                const isTerminal = nextStatuses.length === 0;

                return (
                  <tr key={demand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{demand.customerName}</div>
                      <div className="text-sm text-gray-500">{demand.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{demand.productName}</div>
                      {demand.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[200px]" title={demand.description}>
                          {demand.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">x{demand.quantity}</div>
                      <div className="text-sm text-gray-500">¥{demand.budget.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {demand.discountAmount && demand.discountAmount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            已优惠 ¥{demand.discountAmount.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">无优惠</span>
                      )}
                      {demand.discountAmount && demand.discountAmount > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          实收: ¥{(demand.budget - demand.discountAmount).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(demand.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={demand.status} type="demand" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isTerminal ? (
                        <span className="text-xs text-gray-400">流程已结束</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {nextStatuses.map((nextStatus) => {
                            const key = getTransitionKey(demand.status, nextStatus);
                            const label = demandStatusTransitionLabels[key] || statusLabels[nextStatus];
                            const isCancel = nextStatus === 'cancelled';
                            return (
                              <button
                                key={nextStatus}
                                onClick={() => handleStatusTransition(demand, nextStatus)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                  isCancel
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                                }`}
                                title={`${statusLabels[demand.status]} → ${statusLabels[nextStatus]}`}
                              >
                                {isCancel ? <Ban className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(demand.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                );
              })}
              {filteredDemands.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  当前预算: <span className="font-semibold text-gray-700">¥{formData.budget.toLocaleString()}</span>
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

                {applicablePromotions.map((promotion) => (
                  <label
                    key={promotion.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPromotionId === promotion.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="promotion"
                        value={promotion.id}
                        checked={selectedPromotionId === promotion.id}
                        onChange={() => handlePromotionSelect(promotion.id)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{promotion.name}</span>
                          {selectedPromotionId === promotion.id && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {promotion.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-500">
                        减 ¥{promotion.discountAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        满 ¥{promotion.minAmount.toLocaleString()} 可用
                      </div>
                    </div>
                  </label>
                ))}
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
                      原价: <span className="line-through">¥{formData.budget.toLocaleString()}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      优惠后: ¥{(formData.budget - selectedPromotion.discountAmount).toLocaleString()}
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这条代购需求吗？此操作无法撤销。"
        confirmText="删除"
        variant="danger"
      />
    </div>
  );
}
