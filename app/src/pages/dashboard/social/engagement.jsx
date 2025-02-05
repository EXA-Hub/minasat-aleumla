import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Loader2, Eye, TrendingUp, Users, TrendingDown } from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { PageTitle, SectionTitle } from '../../../components/ui/shared-styles';
import api from '../../../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-background rounded-lg border p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium">{label}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-sm" style={{ color: item.color }}>
          {item.name}: {item.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
  label: PropTypes.string,
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, trend = 0, color }) => (
  <div className={`rounded-xl p-4 bg-${color}-50 dark:bg-${color}-900/10`}>
    <div className="flex items-center justify-between">
      <Icon className={`h-5 w-5 text-${color}-600`} />
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-2xl font-bold">{value}</span>
      {trend !== 0 && (
        <span className={`text-sm text-${trend >= 0 ? 'green' : 'red'}-600`}>
          {Math.abs(trend)}%{trend > 0 ? '+' : trend < 0 && '-'}
        </span>
      )}
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
  color: PropTypes.string.isRequired,
};

// EngagementPage Component
const EngagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewersPerPage] = useState(10); // Number of viewers per page
  const [viewsData, setViewsData] = useState([]);
  const [error, setError] = useState(null);
  const [uniqueViewers, setUniqueViewers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.engagement.me(); // Fetch engagement data from the API
        if (response) {
          setViewsData(response.viewsData);
          setUniqueViewers(response.viewerIds);
        } else {
          setViewsData([]); // Set to empty array if no data is returned
          setUniqueViewers([]);
        }
      } catch (error) {
        console.error('Error fetching engagement data:', error);
        setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا.');
        setViewsData([]); // Set viewsData to an empty array in case of error
        setUniqueViewers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Calculate total views and growth only if viewsData is not empty
  const totalViews =
    viewsData.length > 0
      ? viewsData.reduce((acc, curr) => acc + curr.views, 0)
      : 0;

  const growthMonth =
    viewsData.length > 1
      ? Math.floor(
          ((viewsData[0].views - viewsData[viewsData.length - 1].views) /
            viewsData[viewsData.length - 1].views) *
            100
        )
      : 0;

  const growthDay =
    viewsData.length > 1
      ? Math.floor(
          ((viewsData[0].views - viewsData[1].views) / viewsData[1].views) * 100
        )
      : 0;

  // Pagination logic
  const indexOfLastViewer = currentPage * viewersPerPage;
  const indexOfFirstViewer = indexOfLastViewer - viewersPerPage;
  const currentViewers = uniqueViewers.slice(
    indexOfFirstViewer,
    indexOfLastViewer
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <PageTitle>تحليلات المشاركة</PageTitle>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          icon={Eye}
          label="إجمالي المشاهدات"
          value={totalViews}
          trend={growthMonth}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="إجمالي الزيارات"
          value={uniqueViewers.length} // Use the number of unique viewers
          color="yellow"
        />
        <StatCard
          icon={growthDay > 0 ? TrendingUp : TrendingDown}
          label="معدل النمو اليومي"
          value={`${Math.abs(growthDay)}%${growthDay > 0 ? '+' : growthDay < 0 ? '-' : '⋅'}`} // Show growth percentage
          color={growthDay > 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="col-span-2 p-6">
          <SectionTitle>تحليل المشاهدات</SectionTitle>
          <div className="h-[400px]">
            <ResponsiveContainer>
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient
                    id="viewsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="المشاهدات"
                  stroke="#2563eb"
                  fill="url(#viewsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* List of Unique Viewers with Pagination */}
      <Card className="p-6">
        <SectionTitle>قائمة الزوار</SectionTitle>
        <div className="mt-4">
          {uniqueViewers.length > 0 ? (
            <div dir="rtl">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow dir="rtl">
                    <TableHead>#</TableHead>
                    <TableHead>الزائر</TableHead>
                    <TableHead>الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentViewers.map((viewerId, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-50muted transition-colors">
                      <TableCell className="font-medium">
                        {indexOfFirstViewer + index + 1}
                      </TableCell>
                      <TableCell>{viewerId}</TableCell>
                      <TableCell>
                        <Link
                          to={`/@${viewerId}`}
                          className="text-primary hover:text-primary dark:hover:text-primary flex items-center gap-2 hover:underline">
                          <span>عرض الملف</span>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="mt-6 flex justify-center">
                <nav className="inline-flex rounded-md shadow-xs">
                  {Array.from({
                    length: Math.ceil(uniqueViewers.length / viewersPerPage),
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 text-sm font-medium ${
                        currentPage === index + 1
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      } mx-1 rounded-md border border-gray-300 dark:border-gray-700`}>
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              لا توجد بيانات للزوار.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EngagementPage;
