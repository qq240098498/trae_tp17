import type { DemandStatus, ProductStatus, ExpenseType, RefundStatus, RefundType } from '../../shared/types.js';
import { statusLabels, productStatusLabels, expenseTypeLabels, refundStatusLabels, refundTypeLabels } from '../../shared/types.js';

interface StatusBadgeProps {
  status: DemandStatus | ProductStatus | ExpenseType | RefundStatus | RefundType;
  type?: 'demand' | 'product' | 'expense' | 'refund' | 'refund_type';
}

export default function StatusBadge({ status, type = 'demand' }: StatusBadgeProps) {
  const getLabel = () => {
    if (type === 'demand') return statusLabels[status as DemandStatus];
    if (type === 'product') return productStatusLabels[status as ProductStatus];
    if (type === 'expense') return expenseTypeLabels[status as ExpenseType];
    if (type === 'refund') return refundStatusLabels[status as RefundStatus];
    if (type === 'refund_type') return refundTypeLabels[status as RefundType];
    return status;
  };

  const getColor = () => {
    if (type === 'demand') {
      const colors: Record<DemandStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        purchasing: 'bg-blue-100 text-blue-700',
        shipping: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-gray-100 text-gray-700',
        refunded: 'bg-teal-100 text-teal-700',
      };
      return colors[status as DemandStatus];
    }
    if (type === 'product') {
      const colors: Record<ProductStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        purchased: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
      };
      return colors[status as ProductStatus];
    }
    if (type === 'expense') {
      const colors: Record<ExpenseType, string> = {
        purchase: 'bg-red-100 text-red-700',
        shipping: 'bg-purple-100 text-purple-700',
        service: 'bg-blue-100 text-blue-700',
        tax: 'bg-orange-100 text-orange-700',
        other: 'bg-gray-100 text-gray-700',
      };
      return colors[status as ExpenseType];
    }
    if (type === 'refund') {
      const colors: Record<RefundStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-blue-100 text-blue-700',
        rejected: 'bg-gray-100 text-gray-700',
        return_shipped: 'bg-purple-100 text-purple-700',
        return_received: 'bg-indigo-100 text-indigo-700',
        refunded: 'bg-green-100 text-green-700',
        cancelled: 'bg-gray-100 text-gray-500',
      };
      return colors[status as RefundStatus];
    }
    if (type === 'refund_type') {
      const colors: Record<RefundType, string> = {
        before_delivery: 'bg-blue-50 text-blue-600 border border-blue-200',
        after_delivery: 'bg-orange-50 text-orange-600 border border-orange-200',
      };
      return colors[status as RefundType];
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor()}`}
    >
      {getLabel()}
    </span>
  );
}
