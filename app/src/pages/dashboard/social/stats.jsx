import { useState, useEffect, lazy } from 'react';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from 'lucide-react';

const BarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart }))
);
const Bar = lazy(() =>
  import('recharts').then((module) => ({ default: module.Bar }))
);
const XAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() =>
  import('recharts').then((module) => ({ default: module.CartesianGrid }))
);
const Tooltip = lazy(() =>
  import('recharts').then((module) => ({ default: module.Tooltip }))
);
const ResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);
const Area = lazy(() =>
  import('recharts').then((module) => ({ default: module.Area }))
);
const AreaChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.AreaChart }))
);
const Legend = lazy(() =>
  import('recharts').then((module) => ({ default: module.Legend }))
);

import {
  PageTitle,
  SectionTitle,
  StatsCard,
  ChartContainer,
  DataTable,
} from '../../../components/ui/shared-styles';
import PropTypes from 'prop-types';
import CoinIcon from '../../../components/ui/CoinIcon';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((item, index) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: {item.value.toLocaleString('ar-EG')}
          </p>
        ))}
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool, // Boolean to indicate if the tooltip is active
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string, // The color of the item in the tooltip
      name: PropTypes.string, // The name of the data point
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // The value of the data point
    })
  ), // Array of objects for the tooltip payload
  label: PropTypes.string, // The label displayed in the tooltip
};

const LoadingState = () => (
  <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-muted-foreground">جاري تحميل البيانات...</p>
  </div>
);

const StatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [productStats, setProductStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSalesData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toLocaleDateString('ar-EG'),
          sales: Math.floor(Math.random() * 1000),
          revenue: Math.floor(Math.random() * 5000),
        };
      });

      const mockProductStats = Array.from({ length: 5 }, (_, i) => ({
        name: `المنتج ${i + 1}`,
        sales: Math.floor(Math.random() * 500),
        revenue: Math.floor(Math.random() * 2500),
        growth: Math.floor(Math.random() * 100),
        status: Math.random() > 0.3 ? 'نشط' : 'غير نشط',
      }));

      console.log(mockSalesData, mockProductStats);

      setSalesData(mockSalesData);
      setProductStats(mockProductStats);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'المنتج',
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: 'المبيعات',
      cell: (row) => row.sales.toLocaleString('ar-EG'),
    },
    {
      header: 'الإيرادات',
      cell: (row) => <CoinIcon className="text-primary" amount={row.revenue} />,
    },
    {
      header: 'النمو',
      cell: (row) => (
        <span
          className={
            row.growth > 50
              ? 'text-green-600'
              : row.growth > 0
                ? 'text-yellow-600'
                : 'text-red-600'
          }>
          {Math.abs(row.growth)}%{row.growth > 0 ? '+' : row.growth < 0 && '-'}
        </span>
      ),
    },
    {
      header: 'الحالة',
      cell: (row) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === 'نشط'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalSales = salesData.reduce((acc, curr) => acc + curr.sales, 0);
  const avgGrowth = Math.floor(
    productStats.reduce((acc, curr) => acc + curr.growth, 0) /
      productStats.length
  );

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <PageTitle>إحصائيات المبيعات</PageTitle>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={<CoinIcon amount={totalRevenue} />}
          color="blue"
        />
        <StatsCard
          icon={ShoppingCart}
          title="إجمالي المبيعات"
          value={totalSales.toLocaleString('ar-EG')}
          color="green"
        />
        <StatsCard
          icon={Package}
          title="المنتجات النشطة"
          value={productStats.filter((p) => p.status === 'نشط').length}
          color="purple"
        />
        <StatsCard
          icon={TrendingUp}
          title="متوسط النمو"
          value={`${Math.abs(avgGrowth)}%${avgGrowth > 0 ? '+' : avgGrowth < 0 && '-'}`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer className="h-full w-full rounded-lg p-4">
          <SectionTitle>تحليل الإيرادات</SectionTitle>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={salesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {/* Gradient for Revenue */}
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
                {/* Gradient for Sales */}
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{
                  value: 'التاريخ',
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#6b7280',
                  fontSize: 12,
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'المبلغ (ر.س)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: '#6b7280',
                  fontSize: 12,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {value}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1d4ed8"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="الإيرادات"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#salesGradient)"
                name="المبيعات"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer className="h-full w-full rounded-lg p-4">
          <SectionTitle>المبيعات حسب المنتج</SectionTitle>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={productStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sales"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
                name="المبيعات"
                opacity={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer className="h-full w-full rounded-lg p-4">
        <SectionTitle>أداء المنتجات</SectionTitle>
        <DataTable columns={columns} data={productStats} />
      </ChartContainer>
    </div>
  );
};

export default StatsPage;
