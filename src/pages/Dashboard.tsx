import { useEffect, useState, useMemo } from 'react';
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
  Search,
  Filter,
  Coins,
  CreditCard,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { expenseTypeLabels, categories, productStatusLabels } from '../../shared/types.js';
import type { ExpenseType, ProductCostStat } from '../../shared/types.js';

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
    productCostStats,
    costStatsSummary,
    fetchAll,
    fetchProductCostStats,
    loading,
  } = useStore();
  const [trendDays, setTrendDays] = useState(7);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsSearch, setStatsSearch] = useState('');
  const [statsCategory, setStatsCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchProductCostStats({ keyword: statsSearch, category: statsCategory });
  }, [statsSearch, statsCategory, fetchProductCostStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredStats = useMemo(() => {
    let result = productCostStats;
    if (statusFilter !== 'all') {
      result = result.filter(s => s.product.status === statusFilter);
    }
    return result;
  }, [productCostStats, statusFilter]);

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

  const costStatCards = costStatsSummary ? [
    {
      title: '商品总数',
      value: `${costStatsSummary.totalProducts} 件 / ${costStatsSummary.totalQuantity} 个`,
      icon: Package,
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-200',
    },
    {
      title: '采购总成本',
      value: formatCurrency(costStatsSummary.totalPurchaseCost),
      icon: CreditCard,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
    },
    {
      title: '销售总收入',
      value: formatCurrency(costStatsSummary.totalSellingRevenue),
      icon: Wallet,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      title: '关联费用',
      value: formatCurrency(costStatsSummary.totalRelatedExpenses),
      icon: PiggyBank,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: '优惠减免总额',
      value: `-${formatCurrency(costStatsSummary.totalDiscountAmount)}`,
      icon: Coins,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-200',
    },
    {
      title: '净利润总额',
      value: formatCurrency(costStatsSummary.totalNetProfit),
      icon: DollarSign,
      bgColor: costStatsSummary.totalNetProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: costStatsSummary.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600',
      borderColor: costStatsSummary.totalNetProfit >= 0 ? 'border-green-200' : 'border-red-200',
    },
  ] : [];

  const statusSummary = [
    { label: '待处理', count: pendingCount, color: 'bg-yellow-100 text-yellow-700' },
    { label: '采购中', count: purchasingCount, color: 'bg-blue-100 text-blue-700' },
    { label: '运输中', count: shippingCount, color: 'bg-purple-100 text-purple-700' },
    { label: '已完成', count: completedCount, color: 'bg-green-100 text-green-700' },
  ];

  const currentFilteredStatsSummary = useMemo(() => {
    const totalPurchaseCost = filteredStats.reduce((sum, s) => sum + s.purchaseCost, 0);
    const totalSellingRevenue = filteredStats.reduce((sum, s) => sum + s.sellingRevenue, 0);
    const totalRelatedExpenses = filteredStats.reduce((sum, s) => sum + s.relatedExpenses, 0);
    const totalNetProfit = filteredStats.reduce((sum, s) => sum + s.netProfit, 0);
    const totalGrossProfit = filteredStats.reduce((sum, s) => sum + s.grossProfit, 0);
    return {
      count: filteredStats.length,
      totalPurchaseCost,
      totalSellingRevenue,
      totalRelatedExpenses,
      totalGrossProfit,
      totalNetProfit,
      profitRate: totalPurchaseCost > 0 ? (totalGrossProfit / totalPurchaseCost) * 100 : 0,
    };
  }, [filteredStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">数据统计</h2>
          <p className="text-gray-500 mt-1">查看代购业务的整体运营数据和成本利润分析</p>
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

      {/* 成本利润统计区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">成本利润统计</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">搜索并分析单品成本、售价和利润情况</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {costStatCards.map((card, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 ${card.bgColor} border ${card.borderColor} hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                  <p className={`text-lg font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/60`}>
                  <card.icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">毛利率</div>
            <div className={`font-semibold ${costStatsSummary?.totalProfitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {costStatsSummary?.totalProfitRate.toFixed(2) || 0}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已发货/送达</div>
            <div className="font-semibold text-indigo-600">
              {costStatsSummary?.delivered.count || 0} 件
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已完成采购成本</div>
            <div className="font-semibold text-gray-800">
              {formatCurrency(costStatsSummary?.delivered.purchaseCost || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已完成销售收入</div>
            <div className="font-semibold text-gray-800">
              {formatCurrency(costStatsSummary?.delivered.sellingRevenue || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已完成利润率</div>
            <div className={`font-semibold ${costStatsSummary?.delivered.profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {costStatsSummary?.delivered.profitRate.toFixed(2) || 0}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已完成净利润</div>
            <div className={`font-semibold ${costStatsSummary?.delivered.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(costStatsSummary?.delivered.netProfit || 0)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商品名称、品牌、分类..."
              value={statsSearch}
              onChange={(e) => setStatsSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statsCategory}
              onChange={(e) => setStatsCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">全部分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">全部状态</option>
              {Object.entries(productStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {filteredStats.length !== productCostStats.length && (
            <div className="text-sm text-gray-500 ml-auto">
              显示 {filteredStats.length} / {productCostStats.length} 条
            </div>
          )}
        </div>

        {filteredStats.length > 0 && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500">筛选后采购成本: </span>
              <span className="font-semibold text-gray-800">{formatCurrency(currentFilteredStatsSummary.totalPurchaseCost)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">筛选后销售收入: </span>
              <span className="font-semibold text-gray-800">{formatCurrency(currentFilteredStatsSummary.totalSellingRevenue)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">筛选后关联费用: </span>
              <span className="font-semibold text-gray-800">{formatCurrency(currentFilteredStatsSummary.totalRelatedExpenses)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">筛选后净利润: </span>
              <span className={`font-semibold ${currentFilteredStatsSummary.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentFilteredStatsSummary.totalNetProfit)}
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品信息
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户/关联
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量/状态
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  采购成本
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  销售收入
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联费用
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优惠减免
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  毛利润
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  净利润
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStats.map((stat: ProductCostStat) => (
                <tr key={stat.product.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]" title={stat.product.name}>
                      {stat.product.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {stat.product.brand} · {stat.product.category}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {stat.demand ? (
                      <div>
                        <div className="text-sm font-medium text-gray-700">{stat.demand.customerName}</div>
                        <div className="text-xs text-gray-500">{stat.demand.customerPhone}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">未绑定</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">x{stat.quantity}</span>
                      <span className="inline-flex">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          stat.product.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          stat.product.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          stat.product.status === 'purchased' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {productStatusLabels[stat.product.status]}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 font-medium">{formatCurrency(stat.purchaseCost)}</div>
                    <div className="text-xs text-gray-500">单价 {formatCurrency(stat.product.purchasePrice)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 font-medium">{formatCurrency(stat.sellingRevenue)}</div>
                    <div className="text-xs text-gray-500">单价 {formatCurrency(stat.product.sellingPrice)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${stat.relatedExpenses > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {formatCurrency(stat.relatedExpenses)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${stat.discountAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {stat.discountAmount > 0 ? `-${formatCurrency(stat.discountAmount)}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${stat.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stat.grossProfit)}
                    </div>
                    <div className={`text-xs ${stat.profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.profitRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${stat.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(stat.netProfit)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStats.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">没有找到匹配的商品</p>
            <p className="text-xs text-gray-400 mt-1">请尝试修改搜索条件或分类筛选</p>
          </div>
        )}
      </div>
    </div>
  );
}
