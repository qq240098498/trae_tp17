import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  DollarSign,
  Ban,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Calendar,
  FileText,
  Send,
  Trash2,
  Clock,
  MapPin,
  Info,
  Package,
  AlertCircle,
  Tag,
  Copy,
  Check,
  Home,
  Image,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import Modal from '../components/Modal.js';
import StatusBadge from '../components/StatusBadge.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import type {
  Refund,
  RefundStatus,
  RefundType,
  Demand,
  DemandStatus,
  RefundReasonCategory,
} from '../../shared/types.js';
import {
  refundStatusLabels,
  refundTypeLabels,
  getNextRefundStatuses,
  refundStatusTransitionLabels,
  canDemandApplyRefund,
  getRefundTypeForDemand,
  statusLabels,
  refundReasonCategoryLabels,
  defaultReturnAddress,
} from '../../shared/types.js';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const getTransitionKey = (from: RefundStatus, to: RefundStatus) => `${from}->${to}`;

export default function Refunds() {
  const {
    refunds,
    demands,
    fetchRefunds,
    fetchDemands,
    createRefund,
    updateRefund,
    deleteRefund,
    approveRefund,
    rejectRefund,
    completeRefund,
    receiveReturn,
    loading,
  } = useStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isReturnShippedModalOpen, setIsReturnShippedModalOpen] = useState(false);
  const [isReturnAddressModalOpen, setIsReturnAddressModalOpen] = useState(false);
  const [isReceiveReturnModalOpen, setIsReceiveReturnModalOpen] = useState(false);

  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RefundType | 'all'>('all');
  const [expandedRefundId, setExpandedRefundId] = useState<string | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [returnTrackingNumber, setReturnTrackingNumber] = useState('');
  const [returnCarrier, setReturnCarrier] = useState('');
  const [receiveReturnBy, setReceiveReturnBy] = useState('');
  const [copiedAddressField, setCopiedAddressField] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    demandId: '',
    reason: '',
    reasonCategory: '' as RefundReasonCategory | '',
    refundAmount: 0,
  });

  const [createStep, setCreateStep] = useState<1 | 2>(1);

  useEffect(() => {
    fetchRefunds();
    fetchDemands();
  }, [fetchRefunds, fetchDemands]);

  const getDemandById = (demandId: string): Demand | undefined => {
    return demands.find((d) => d.id === demandId);
  };

  const getApplicableDemands = (): Demand[] => {
    return demands.filter((d) => canDemandApplyRefund(d.status));
  };

  const getDemandStatusRefundHint = (status: DemandStatus): { type: RefundType; desc: string; icon: React.ReactNode } => {
    if (['pending', 'purchasing', 'shipping'].includes(status)) {
      return {
        type: 'before_delivery',
        desc: '商品尚未送达，审核通过后将直接退款，无需退回商品',
        icon: <Truck className="w-5 h-5 text-blue-500" />,
      };
    }
    return {
      type: 'after_delivery',
      desc: '客户已收到商品，审核通过后需客户寄回商品，确认收到后再退款',
      icon: <PackageCheck className="w-5 h-5 text-orange-500" />,
    };
  };

  const filteredRefunds = refunds.filter((refund) => {
    const demand = getDemandById(refund.demandId);
    const matchesSearch =
      !searchQuery ||
      (demand &&
        (demand.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demand.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demand.customerPhone.includes(searchQuery) ||
          refund.id.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    const matchesType = typeFilter === 'all' || refund.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenCreateModal = () => {
    setCreateForm({
      demandId: '',
      reason: '',
      reasonCategory: '',
      refundAmount: 0,
    });
    setCreateStep(1);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateStep(1);
  };

  const handleDemandSelect = (demandId: string) => {
    const demand = getDemandById(demandId);
    setCreateForm({
      ...createForm,
      demandId,
      refundAmount: demand ? demand.budget : 0,
    });
  };

  const handleReasonCategorySelect = (category: RefundReasonCategory) => {
    setCreateForm({
      ...createForm,
      reasonCategory: category,
      reason: createForm.reason || refundReasonCategoryLabels[category],
    });
  };

  const handleNextStep = () => {
    if (!createForm.demandId) return;
    setCreateStep(2);
  };

  const handlePrevStep = () => {
    setCreateStep(1);
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.demandId || !createForm.reason || createForm.refundAmount <= 0) {
      return;
    }

    const demand = getDemandById(createForm.demandId);
    if (!demand) return;

    const refundType = getRefundTypeForDemand(demand.status) || 'before_delivery';

    const success = await createRefund({
      demandId: createForm.demandId,
      type: refundType,
      status: 'pending',
      reason: createForm.reason,
      reasonCategory: createForm.reasonCategory || undefined,
      refundAmount: createForm.refundAmount,
    });

    if (success) {
      handleCloseCreateModal();
    }
  };

  const handleOpenDetail = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedRefund(null);
  };

  const handleOpenReturnAddress = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsReturnAddressModalOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddressField(field);
    setTimeout(() => setCopiedAddressField(null), 2000);
  };

  const getStatusButtonStyle = (to: RefundStatus) => {
    switch (to) {
      case 'approved':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'rejected':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'return_shipped':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'return_received':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      case 'refunded':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const handleStatusTransition = async (refund: Refund, newStatus: RefundStatus) => {
    if (newStatus === 'rejected') {
      setSelectedRefund(refund);
      setRejectReason('');
      setIsRejectModalOpen(true);
      return;
    }

    if (newStatus === 'return_shipped') {
      setSelectedRefund(refund);
      setReturnTrackingNumber('');
      setReturnCarrier('');
      setIsReturnShippedModalOpen(true);
      return;
    }

    if (newStatus === 'return_received') {
      setSelectedRefund(refund);
      setReceiveReturnBy('');
      setIsReceiveReturnModalOpen(true);
      return;
    }

    if (newStatus === 'refunded') {
      await completeRefund(refund.id);
      return;
    }

    if (newStatus === 'approved') {
      await approveRefund(refund.id);
      return;
    }

    await updateRefund(refund.id, { status: newStatus });
  };

  const handleReject = async () => {
    if (!selectedRefund || !rejectReason.trim()) return;
    await rejectRefund(selectedRefund.id, rejectReason.trim());
    setIsRejectModalOpen(false);
    setSelectedRefund(null);
    setRejectReason('');
  };

  const handleReturnShipped = async () => {
    if (!selectedRefund || !returnTrackingNumber.trim()) return;
    await updateRefund(selectedRefund.id, {
      status: 'return_shipped',
      returnTrackingNumber: returnTrackingNumber.trim(),
      returnCarrier: returnCarrier.trim() || undefined,
    });
    setIsReturnShippedModalOpen(false);
    setSelectedRefund(null);
    setReturnTrackingNumber('');
    setReturnCarrier('');
  };

  const handleReceiveReturn = async () => {
    if (!selectedRefund) return;
    await receiveReturn(selectedRefund.id, receiveReturnBy.trim() || undefined);
    setIsReceiveReturnModalOpen(false);
    setSelectedRefund(null);
    setReceiveReturnBy('');
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteRefund(deleteId);
      setDeleteId(null);
    }
  };

  const toggleExpand = (refundId: string) => {
    setExpandedRefundId((prev) => (prev === refundId ? null : refundId));
  };

  const getStatusActionIcon = (status: RefundStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      case 'return_shipped':
        return <Truck className="w-3 h-3" />;
      case 'return_received':
        return <PackageCheck className="w-3 h-3" />;
      case 'refunded':
        return <DollarSign className="w-3 h-3" />;
      case 'cancelled':
        return <Ban className="w-3 h-3" />;
      default:
        return <ArrowRight className="w-3 h-3" />;
    }
  };

  const getRefundTimeline = (refund: Refund) => {
    const timeline: { status: RefundStatus; label: string; date?: string; icon: React.ReactNode; done: boolean }[] = [];

    timeline.push({
      status: 'pending',
      label: '提交退款申请',
      date: refund.createdAt,
      icon: <FileText className="w-4 h-4" />,
      done: true,
    });

    if (refund.status !== 'pending') {
      if (refund.status === 'rejected') {
        timeline.push({
          status: 'rejected',
          label: '申请已拒绝',
          date: refund.reviewedAt,
          icon: <XCircle className="w-4 h-4" />,
          done: true,
        });
      } else if (refund.status === 'cancelled') {
        timeline.push({
          status: 'cancelled',
          label: '申请已取消',
          icon: <Ban className="w-4 h-4" />,
          done: true,
        });
      } else {
        if (refund.type === 'before_delivery') {
          timeline.push({
            status: 'approved',
            label: '审核通过',
            date: refund.reviewedAt,
            icon: <CheckCircle2 className="w-4 h-4" />,
            done: ['approved', 'refunded'].includes(refund.status),
          });
          timeline.push({
            status: 'refunded',
            label: '退款已完成',
            date: refund.refundDate,
            icon: <DollarSign className="w-4 h-4" />,
            done: refund.status === 'refunded',
          });
        } else {
          timeline.push({
            status: 'approved',
            label: '审核通过，请寄回商品',
            date: refund.reviewedAt,
            icon: <CheckCircle2 className="w-4 h-4" />,
            done: ['approved', 'return_shipped', 'return_received', 'refunded'].includes(refund.status),
          });
          timeline.push({
            status: 'return_shipped',
            label: '客户已寄出退货',
            date: refund.status === 'return_shipped' || refund.status === 'return_received' || refund.status === 'refunded' ? refund.updatedAt : undefined,
            icon: <Truck className="w-4 h-4" />,
            done: ['return_shipped', 'return_received', 'refunded'].includes(refund.status),
          });
          timeline.push({
            status: 'return_received',
            label: '已收到退货商品',
            date: refund.returnReceivedDate,
            icon: <PackageCheck className="w-4 h-4" />,
            done: ['return_received', 'refunded'].includes(refund.status),
          });
          timeline.push({
            status: 'refunded',
            label: '退款已完成',
            date: refund.refundDate,
            icon: <DollarSign className="w-4 h-4" />,
            done: refund.status === 'refunded',
          });
        }
      }
    }

    return timeline;
  };

  const pendingCount = refunds.filter((r) => r.status === 'pending').length;
  const beforeDeliveryCount = refunds.filter((r) => r.type === 'before_delivery').length;
  const afterDeliveryCount = refunds.filter((r) => r.type === 'after_delivery').length;
  const refundedCount = refunds.filter((r) => r.status === 'refunded').length;
  const totalRefundedAmount = refunds
    .filter((r) => r.status === 'refunded')
    .reduce((sum, r) => sum + r.refundAmount, 0);
  const awaitingReturnCount = refunds.filter((r) => r.type === 'after_delivery' && r.status === 'approved').length;
  const returnShippedCount = refunds.filter((r) => r.type === 'after_delivery' && r.status === 'return_shipped').length;

  const selectedDemand = selectedRefund ? getDemandById(selectedRefund.demandId) : null;
  const createSelectedDemand = createForm.demandId ? getDemandById(createForm.demandId) : null;
  const createRefundType = createSelectedDemand
    ? getRefundTypeForDemand(createSelectedDemand.status) || 'before_delivery'
    : 'before_delivery';
  const demandRefundHint = createSelectedDemand ? getDemandStatusRefundHint(createSelectedDemand.status) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审核</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">未收货退款</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{beforeDeliveryCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已收货退款</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{afterDeliveryCount}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <PackageCheck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待寄回商品</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{awaitingReturnCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">退货运输中</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{returnShippedCount}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Truck className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已退款金额</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalRefundedAmount)}
              </p>
              <p className="text-xs text-gray-400">共 {refundedCount} 笔</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border border-blue-100 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">代购商品退款流程说明</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/70 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-medium text-blue-700">
                  <Truck className="w-4 h-4" />
                  未收货退款流程
                </div>
                <p className="text-gray-600 pl-6">
                  订单状态：待处理 / 采购中 / 运输中
                </p>
                <p className="text-gray-600 pl-6">
                  提交申请 → 审核通过 → 直接完成退款
                </p>
                <p className="text-blue-600 pl-6 text-xs mt-1">
                  （商品尚未送达，无需退回）
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-medium text-orange-700">
                  <PackageCheck className="w-4 h-4" />
                  已收货退款流程
                </div>
                <p className="text-gray-600 pl-6">
                  订单状态：已完成
                </p>
                <p className="text-gray-600 pl-6">
                  提交申请 → 审核通过 → 客户寄回商品 → 确认收货 → 完成退款
                </p>
                <p className="text-orange-600 pl-6 text-xs mt-1">
                  （需确认商品完好退回后再退款）
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">退款管理</h2>
          <p className="text-gray-500 mt-1">管理代购商品的退款申请，支持未收货退款和已收货退货退款</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          申请退款
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户名称、商品、电话或退款单号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RefundType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">全部类型</option>
              {Object.entries(refundTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RefundStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">全部状态</option>
              {Object.entries(refundStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                fetchRefunds();
                fetchDemands();
              }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredRefunds.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>暂无退款申请</p>
            </div>
          ) : (
            filteredRefunds.map((refund) => {
              const demand = getDemandById(refund.demandId);
              const nextStatuses = getNextRefundStatuses(refund.status);
              const isTerminal = nextStatuses.length === 0;
              const isExpanded = expandedRefundId === refund.id;
              const timeline = getRefundTimeline(refund);

              return (
                <div key={refund.id} className="hover:bg-gray-50/50 transition-colors">
                  <div
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer"
                    onClick={() => toggleExpand(refund.id)}
                  >
                    <div className="col-span-12 md:col-span-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                        <span>#{refund.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {demand?.customerName || '未知客户'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {demand?.customerPhone || '-'}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <div className="font-medium text-gray-900 truncate" title={demand?.productName}>
                        {demand?.productName || '未知商品'}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={refund.reason}>
                        {refund.reasonCategory ? refundReasonCategoryLabels[refund.reasonCategory] : refund.reason}
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-1">
                      <StatusBadge status={refund.type} type="refund_type" />
                    </div>
                    <div className="col-span-6 md:col-span-1">
                      <StatusBadge status={refund.status} type="refund" />
                    </div>
                    <div className="col-span-6 md:col-span-1">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(refund.refundAmount)}
                      </div>
                      {demand && (
                        <div className="text-xs text-gray-400">
                          订单: {formatCurrency(demand.budget)}
                        </div>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        申请: {formatDate(refund.createdAt)}
                      </div>
                      {refund.refundDate && (
                        <div className="flex items-center gap-1 text-green-600 mt-0.5">
                          <DollarSign className="w-3 h-3" />
                          退款: {formatDate(refund.refundDate)}
                        </div>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {refund.type === 'after_delivery' && refund.status === 'approved' && (
                        <button
                          onClick={() => handleOpenReturnAddress(refund)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          <MapPin className="w-3 h-3" />
                          退货地址
                        </button>
                      )}
                      {!isTerminal && nextStatuses.map((nextStatus) => {
                        const label = refundStatusTransitionLabels[getTransitionKey(refund.status, nextStatus)];
                        if (!label) return null;
                        return (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusTransition(refund, nextStatus)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${getStatusButtonStyle(nextStatus)}`}
                          >
                            {getStatusActionIcon(nextStatus)}
                            {label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleOpenDetail(refund)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        详情
                      </button>
                      {['pending', 'rejected'].includes(refund.status) && (
                        <button
                          onClick={() => handleDelete(refund.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      )}
                      <div className="ml-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-4 border-t border-gray-100 pt-4 bg-gray-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            客户信息
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">客户姓名</span>
                              <span className="font-medium">{demand?.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">联系电话</span>
                              <span className="font-medium">{demand?.customerPhone}</span>
                            </div>
                            {demand && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">订单状态</span>
                                <StatusBadge status={demand.status} type="demand" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            退款信息
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">退款类型</span>
                              <StatusBadge status={refund.type} type="refund_type" />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">退款状态</span>
                              <StatusBadge status={refund.status} type="refund" />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">退款金额</span>
                              <span className="font-semibold text-red-600">{formatCurrency(refund.refundAmount)}</span>
                            </div>
                            {refund.reasonCategory && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">原因分类</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                                  <Tag className="w-3 h-3" />
                                  {refundReasonCategoryLabels[refund.reasonCategory]}
                                </span>
                              </div>
                            )}
                            {refund.rejectReason && (
                              <div className="pt-2 border-t border-gray-100">
                                <span className="text-gray-500 block mb-1">拒绝原因</span>
                                <p className="text-gray-700">{refund.rejectReason}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            退货物流信息
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2 text-sm">
                            {refund.type === 'after_delivery' && refund.returnAddress && (
                              <div className="pb-2 mb-2 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                  <span className="text-gray-500">退货地址</span>
                                  <button
                                    onClick={() => handleOpenReturnAddress(refund)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700"
                                  >
                                    查看详情
                                  </button>
                                </div>
                                <p className="text-gray-700 text-xs mt-1 leading-relaxed">
                                  {refund.returnAddress.name} · {refund.returnAddress.phone}<br/>
                                  {refund.returnAddress.address}
                                </p>
                              </div>
                            )}
                            {refund.type === 'after_delivery' && refund.returnTrackingNumber ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">物流公司</span>
                                  <span className="font-medium">{refund.returnCarrier || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">物流单号</span>
                                  <span className="font-medium font-mono">{refund.returnTrackingNumber}</span>
                                </div>
                                {refund.returnReceivedDate && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">收货日期</span>
                                    <span className="font-medium text-green-600">{formatDate(refund.returnReceivedDate)}</span>
                                  </div>
                                )}
                                {refund.returnReceivedBy && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">签收人</span>
                                    <span className="font-medium">{refund.returnReceivedBy}</span>
                                  </div>
                                )}
                              </>
                            ) : refund.type === 'after_delivery' ? (
                              <div className="text-center py-2">
                                <p className="text-gray-400 text-xs">暂无退货物流信息</p>
                                {refund.status === 'approved' && (
                                  <p className="text-orange-600 text-xs mt-1">请通知客户按退货地址寄回商品</p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                  未收货退款无需退回商品
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            退款原因说明
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                            <p className="text-gray-700 leading-relaxed">{refund.reason}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          退款进度
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-start">
                            {timeline.map((step, index) => (
                              <div key={step.status} className="flex-1 flex items-start relative">
                                <div className="flex flex-col items-center z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step.icon}
                                  </div>
                                  <p className={`text-xs mt-2 text-center max-w-[100px] ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                                    {step.label}
                                  </p>
                                  {step.date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDateTime(step.date)}
                                    </p>
                                  )}
                                </div>
                                {index < timeline.length - 1 && (
                                  <div className={`absolute top-4 left-8 right-0 h-0.5 -mt-[1px] ${timeline[index + 1].done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} title="申请退款" size="xl">
        <form onSubmit={handleCreateRefund} className="space-y-5">
          <div className="flex items-center gap-4 mb-2">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${createStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step}
                </div>
                <span className={`text-sm ${createStep >= step ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {step === 1 ? '选择订单' : '填写退款信息'}
                </span>
                {step < 2 && <div className={`w-16 h-0.5 ${createStep > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {createStep === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择代购订单 <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.demandId}
                  onChange={(e) => handleDemandSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">请选择订单</option>
                  {getApplicableDemands().map((demand) => {
                    const refundType = getRefundTypeForDemand(demand.status);
                    return (
                      <option key={demand.id} value={demand.id}>
                        [{statusLabels[demand.status]}] {demand.customerName} - {demand.productName} ({formatCurrency(demand.budget)})
                      </option>
                    );
                  })}
                </select>
                {getApplicableDemands().length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">暂无可申请退款的订单</p>
                )}
              </div>

              {createSelectedDemand && demandRefundHint && (
                <div className={`rounded-lg p-4 border ${createRefundType === 'before_delivery' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-start gap-3">
                    {demandRefundHint.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">退款类型：</span>
                        <StatusBadge status={createRefundType} type="refund_type" />
                      </div>
                      <p className={`text-sm ${createRefundType === 'before_delivery' ? 'text-blue-700' : 'text-orange-700'}`}>
                        {demandRefundHint.desc}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/50">
                        <p className="text-xs text-gray-600 mb-1 font-medium">流程步骤：</p>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {createRefundType === 'before_delivery' ? (
                            <>
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">1. 提交申请</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">2. 审核通过</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className={`px-2 py-1 rounded-full text-white ${createStep > 2 ? 'bg-green-600' : 'bg-green-500'}`}>3. 完成退款</span>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">1. 提交申请</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">2. 审核通过</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">3. 客户寄回</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-1 bg-white rounded-full text-gray-700">4. 确认收货</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-1 rounded-full bg-green-500 text-white">5. 完成退款</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {createSelectedDemand && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">客户姓名：</span>
                      <span className="font-medium">{createSelectedDemand.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">联系电话：</span>
                      <span className="font-medium">{createSelectedDemand.customerPhone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">商品名称：</span>
                      <span className="font-medium">{createSelectedDemand.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">订单金额：</span>
                      <span className="font-medium">{formatCurrency(createSelectedDemand.budget)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">订单状态：</span>
                      <StatusBadge status={createSelectedDemand.status} type="demand" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!createForm.demandId}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  下一步
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-500">已选订单：</span>
                  <span className="font-medium">{createSelectedDemand?.customerName} - {createSelectedDemand?.productName}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="text-indigo-600 hover:text-indigo-700 text-xs"
                >
                  重新选择
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  退款原因分类 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(refundReasonCategoryLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleReasonCategorySelect(value as RefundReasonCategory)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                        createForm.reasonCategory === value
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  退款金额 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    min={0}
                    max={createSelectedDemand?.budget}
                    value={createForm.refundAmount}
                    onChange={(e) => setCreateForm({ ...createForm, refundAmount: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="请输入退款金额"
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  {createSelectedDemand && createForm.refundAmount > createSelectedDemand.budget && (
                    <p className="text-xs text-red-600">退款金额不能超过订单金额 {formatCurrency(createSelectedDemand.budget)}</p>
                  )}
                  {createSelectedDemand && (
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, refundAmount: createSelectedDemand.budget })}
                      className="text-xs text-indigo-600 hover:text-indigo-700 ml-auto"
                    >
                      全额退款 ({formatCurrency(createSelectedDemand.budget)})
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  详细退款原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  placeholder="请详细说明退款原因，如商品问题描述、原因等..."
                />
                <p className="text-xs text-gray-400 mt-1">请尽可能详细描述，以便审核人员快速处理</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!createForm.demandId || !createForm.reason || createForm.refundAmount <= 0 || (createSelectedDemand && createForm.refundAmount > createSelectedDemand.budget)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  提交申请
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetail} title="退款详情" size="xl">
        {selectedRefund && selectedDemand && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400">退款单号 #{selectedRefund.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{formatDateTime(selectedRefund.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedRefund.type} type="refund_type" />
                <StatusBadge status={selectedRefund.status} type="refund" />
              </div>
            </div>

            <div className={`rounded-lg p-4 border ${selectedRefund.type === 'before_delivery' ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className={`w-4 h-4 ${selectedRefund.type === 'before_delivery' ? 'text-blue-600' : 'text-orange-600'}`} />
                <div>
                  <p className={`font-medium text-sm ${selectedRefund.type === 'before_delivery' ? 'text-blue-700' : 'text-orange-700'}`}>
                    {selectedRefund.type === 'before_delivery' ? '未收货退款 - 审核通过后直接退款' : '已收货退款 - 需退回商品后再退款'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">客户信息</h4>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  {selectedDemand.customerName}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedDemand.customerPhone}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">商品信息</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-400" />
                  {selectedDemand.productName}
                </div>
                <div className="text-sm text-gray-500">
                  订单金额: {formatCurrency(selectedDemand.budget)}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">退款信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 text-sm">退款金额:</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(selectedRefund.refundAmount)}</span>
                </div>
                {selectedRefund.reasonCategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">原因分类:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                      <Tag className="w-3 h-3" />
                      {refundReasonCategoryLabels[selectedRefund.reasonCategory]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-gray-500 text-sm">退款原因:</span>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">{selectedRefund.reason}</p>
              </div>
              {selectedRefund.rejectReason && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">拒绝原因:</span>
                  <p className="text-red-600 text-sm mt-1">{selectedRefund.rejectReason}</p>
                </div>
              )}
            </div>

            {selectedRefund.type === 'after_delivery' && selectedRefund.returnAddress && (
              <div className="bg-orange-50 rounded-lg p-4 space-y-2 border border-orange-100">
                <h4 className="font-medium text-orange-800 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  退货地址信息
                </h4>
                <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">收件人</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedRefund.returnAddress.name}</span>
                      <button
                        onClick={() => copyToClipboard(selectedRefund.returnAddress!.name, 'r-name')}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="复制"
                      >
                        {copiedAddressField === 'r-name' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">联系电话</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedRefund.returnAddress.phone}</span>
                      <button
                        onClick={() => copyToClipboard(selectedRefund.returnAddress!.phone, 'r-phone')}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="复制"
                      >
                        {copiedAddressField === 'r-phone' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 pt-0.5">详细地址</span>
                    <div className="flex items-start gap-2 flex-1 max-w-[70%]">
                      <span className="font-medium text-right">{selectedRefund.returnAddress.address}</span>
                      <button
                        onClick={() => copyToClipboard(selectedRefund.returnAddress!.address, 'r-addr')}
                        className="text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0 mt-0.5"
                        title="复制"
                      >
                        {copiedAddressField === 'r-addr' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {selectedRefund.returnAddress.zipCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">邮政编码</span>
                      <span className="font-medium">{selectedRefund.returnAddress.zipCode}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  请通知客户按照以上地址寄回商品，寄出后请填写物流信息
                </p>
              </div>
            )}

            {selectedRefund.type === 'after_delivery' && (selectedRefund.returnTrackingNumber || selectedRefund.returnCarrier) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  退货物流信息
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">物流公司:</span>
                    <span className="ml-2 font-medium">{selectedRefund.returnCarrier || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">物流单号:</span>
                    <span className="ml-2 font-medium font-mono">{selectedRefund.returnTrackingNumber || '-'}</span>
                  </div>
                </div>
                {selectedRefund.returnReceivedDate && (
                  <div className="text-sm text-green-600 pt-2 border-t border-gray-200">
                    已确认收货: {formatDateTime(selectedRefund.returnReceivedDate)}
                    {selectedRefund.returnReceivedBy && ` (签收人: ${selectedRefund.returnReceivedBy})`}
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                处理进度
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  {getRefundTimeline(selectedRefund).map((step, index, arr) => (
                    <div key={step.status} className="flex-1 flex items-start relative min-w-0">
                      <div className="flex flex-col items-center z-10 px-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {step.icon}
                        </div>
                        <p className={`text-xs mt-2 text-center max-w-[110px] ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                            {formatDateTime(step.date)}
                          </p>
                        )}
                      </div>
                      {index < arr.length - 1 && (
                        <div className={`absolute top-[18px] left-9 right-0 h-0.5 ${arr[index + 1].done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 flex-wrap">
              {selectedRefund.type === 'after_delivery' && selectedRefund.status === 'approved' && (
                <button
                  onClick={() => {
                    handleOpenReturnAddress(selectedRefund);
                    handleCloseDetail();
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  查看退货地址
                </button>
              )}
              {getNextRefundStatuses(selectedRefund.status).map((nextStatus) => {
                const label = refundStatusTransitionLabels[getTransitionKey(selectedRefund.status, nextStatus)];
                if (!label) return null;
                return (
                  <button
                    key={nextStatus}
                    onClick={() => {
                      handleStatusTransition(selectedRefund, nextStatus);
                      handleCloseDetail();
                    }}
                    className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getStatusButtonStyle(nextStatus)}`}
                  >
                    {getStatusActionIcon(nextStatus)}
                    {label}
                  </button>
                );
              })}
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="拒绝退款申请" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">请填写拒绝退款的原因：</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            placeholder="请详细说明拒绝原因..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              确认拒绝
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isReturnShippedModalOpen} onClose={() => setIsReturnShippedModalOpen(false)} title="客户已寄出退货" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">请填写退货物流信息：</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">物流公司</label>
            <input
              type="text"
              value={returnCarrier}
              onChange={(e) => setReturnCarrier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="例如：顺丰、圆通等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              物流单号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={returnTrackingNumber}
              onChange={(e) => setReturnTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono"
              placeholder="请输入物流单号"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsReturnShippedModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReturnShipped}
              disabled={!returnTrackingNumber.trim()}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              确认已寄出
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isReceiveReturnModalOpen} onClose={() => setIsReceiveReturnModalOpen(false)} title="确认收到退货" size="sm">
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-start gap-2">
              <PackageCheck className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium">请确认已收到客户退回的商品</p>
                <p className="text-green-600 mt-1">确认商品完好无损后，即可进行下一步退款操作</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">签收人（可选）</label>
            <input
              type="text"
              value={receiveReturnBy}
              onChange={(e) => setReceiveReturnBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="请输入签收人姓名"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsReceiveReturnModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReceiveReturn}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              确认已收货
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isReturnAddressModalOpen} onClose={() => setIsReturnAddressModalOpen(false)} title="退货地址信息" size="md">
        {selectedRefund?.returnAddress && (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">请将以下地址信息提供给客户</p>
                  <p className="text-orange-600 mt-1">客户需按照此地址寄回商品，寄出后请录入物流单号</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">收件人</p>
                    <p className="font-medium text-gray-900">{selectedRefund.returnAddress.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedRefund.returnAddress!.name, 'addr-name')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="复制"
                >
                  {copiedAddressField === 'addr-name' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">联系电话</p>
                    <p className="font-medium text-gray-900">{selectedRefund.returnAddress.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedRefund.returnAddress!.phone, 'addr-phone')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="复制"
                >
                  {copiedAddressField === 'addr-phone' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>

              <div className="flex justify-between items-start p-3 bg-white rounded-lg">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">详细地址</p>
                    <p className="font-medium text-gray-900 leading-relaxed">{selectedRefund.returnAddress.address}</p>
                    {selectedRefund.returnAddress.zipCode && (
                      <p className="text-xs text-gray-500 mt-1">邮编：{selectedRefund.returnAddress.zipCode}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(`${selectedRefund.returnAddress!.name} ${selectedRefund.returnAddress!.phone} ${selectedRefund.returnAddress!.address}`, 'addr-full')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  title="复制全部信息"
                >
                  {copiedAddressField === 'addr-full' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsReturnAddressModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="删除退款申请"
        message="确认删除该退款申请吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  );
}