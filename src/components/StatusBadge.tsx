import type { DemandStatus, ProductStatus, ExpenseType } from '../../shared/types.js';
import { statusLabels, productStatusLabels, expenseTypeLabels } from '../../shared/types.js';

interface StatusBadgeProps {
  status: DemandStatus | ProductStatus | ExpenseType;
  type?: 'demand' | 'product' | 'expense';
}

export default function StatusBadge({ status, type = 'demand' }: StatusBadgeProps) {
  const getLabel = () => {
    if (type === 'demand') return statusLabels[status as DemandStatus];
    if (type === 'product') return productStatusLabels[status as ProductStatus];
    if (type === 'expense') return expenseTypeLabels[status as ExpenseType];
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
