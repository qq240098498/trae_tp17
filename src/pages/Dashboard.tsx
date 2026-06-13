import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { expenseTypeLabels, categories } from '../../shared/types.js';
import type { ExpenseType } from '../../shared/types.js';

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const CHART_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

export default function Dashboard() {
  const {
    statistics,
    salesTrend,
    productRanking,
    expenseByType,
    products,
    demands,
    fetchAll,
    loading,
  } = useStore();
  const [trendDays, setTrendDays] = useState(7);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const pieData = expenseByType
    ? Object.entries(expenseByType)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({
          name: expenseTypeLabels[name as ExpenseType] || name,
          value,
        }))
    : [];

  const categoryData = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat && p.status !== 'pending');
    const revenue = catProducts.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
    const profit = catProducts.reduce(
      (sum, p) => sum + (p.sellingPrice - p.purchasePrice) * p.quantity,
      0
    );
    return {
      name: cat,
      revenue,
      profit,
    };
  }).filter((item) => item.revenue > 0);

  const pendingCount = demands.filter((d) => d.status === 'pending').length;
  const purchasingCount = demands.filter((d) => d.status === 'purchasing').length;
  const shippingCount = demands.filter((d) => d.status === 'shipping').length;
  const completedCount = demands.filter((d) => d.status === 'completed').length;

  const statCards = [
    {
      title: '总订单数',
      value: statistics?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: '总销售额',
      value: formatCurrency(statistics?.totalSales || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: '总利润',
      value: formatCurrency(statistics?.totalProfit || 0),
      icon: DollarSign,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: '总支出',
      value: formatCurrency(statistics?.totalExpenses || 0),
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: '待处理需求',
      value: statistics?.pendingDemands || 0,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const statusSummary = [
    { label: '待处理', count: pendingCount, color: 'bg-yellow-100 text-yellow-700' },
    { label: '采购中', count: purchasingCount, color: 'bg-blue-100 text-blue-700' },
    { label: '运输中', count: shippingCount, color: 'bg-purple-100 text-purple-700' },
    { label: '已完成', count: completedCount, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">数据统计</h2>
          <p className="text-gray-500 mt-1">查看代购业务的整体运营数据</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusSummary.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${item.color}`}
              >
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">销售趋势</h3>
              <p className="text-sm text-gray-500">最近 {trendDays} 天的销售和利润情况</p>
            </div>
            <select
              value={trendDays}
              onChange={(e) => setTrendDays(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value={7}>最近7天</option>
              <option value={14}>最近14天</option>
              <option value={30}>最近30天</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value.slice(5)
                  }
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `¥${value / 1000}k`}
                  stroke="#9ca3af"
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `日期: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="销售额"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="利润"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">费用分布</h3>
            <p className="text-sm text-gray-500">各类费用占比分析</p>
          </div>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无费用数据
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">商品销量排行</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">销售额最高的商品 TOP 5</p>
          </div>
          <div className="space-y-4">
            {productRanking.length > 0 ? (
              productRanking.map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-600'
                        : index === 1
                        ? 'bg-gray-100 text-gray-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.product.brand} · 售出 {item.count} 件
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-indigo-600">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                暂无销售数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">分类收入分析</h3>
            <p className="text-sm text-gray-500">各商品分类的收入和利润对比</p>
          </div>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `¥${value / 1000}k`}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={80}
                    stroke="#9ca3af"
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="收入" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="profit" name="利润" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无分类数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
