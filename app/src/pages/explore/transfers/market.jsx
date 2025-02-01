// app/src/pages/explore/transfers/market.jsx
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserName from '../../../components/explore/widgets/Username';
import { Card, CardContent } from '@/components/ui/card';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../../../utils/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ProductCard({ product, user }) {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6 rtl:flex-row-reverse">
          {/* Left Section: Product Info */}
          <div className="flex-1 space-y-3">
            {/* Product Name */}
            <h3 className="text-lg font-semibold sm:text-xl">{product.name}</h3>

            {/* Price & Open Trades */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <CoinIcon amount={product.price} />
              </span>
              <span className="text-muted-foreground">
                💼 الصفقات المفتوحة: {product.openTrades}
              </span>
            </div>

            {/* Dates Section */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                📅 <strong>تاريخ الإنشاء:</strong>{' '}
                {format(new Date(product.createdAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                🔄 <strong>تاريخ التحديث:</strong>{' '}
                {format(new Date(product.updatedAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <UserName username={user.username} />
            </div>
            <Button
              onClick={() => navigate(`/product/${product._id}`)}
              size="sm"
              className="opacity-60 transition-opacity duration-300 ease-in-out hover:opacity-100">
              فتح صفقة
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export function SearchPanel({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    minCreatedAt: '',
    maxCreatedAt: '',
    minUpdatedAt: '',
    maxUpdatedAt: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    limit: 10,
    offset: 0,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // التحقق من السعر الأدنى
    if (
      searchParams.minPrice &&
      (isNaN(searchParams.minPrice) ||
        Number.parseFloat(searchParams.minPrice) < 0)
    )
      newErrors.minPrice = 'يجب أن يكون السعر الأدنى رقمًا موجبًا';

    // التحقق من السعر الأقصى
    if (
      searchParams.maxPrice &&
      (isNaN(searchParams.maxPrice) ||
        Number.parseFloat(searchParams.maxPrice) < 0)
    )
      newErrors.maxPrice = 'يجب أن يكون السعر الأقصى رقمًا موجبًا';

    // التحقق من أن السعر الأقصى أكبر من السعر الأدنى
    if (
      searchParams.minPrice &&
      searchParams.maxPrice &&
      Number.parseFloat(searchParams.maxPrice) <
        Number.parseFloat(searchParams.minPrice)
    )
      newErrors.maxPrice = 'يجب أن يكون السعر الأقصى أكبر من السعر الأدنى';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Format dates to ISO strings and remove undefined/empty values
    const formattedParams = Object.entries({
      ...searchParams,
      minPrice: searchParams.minPrice
        ? Number.parseFloat(searchParams.minPrice)
        : undefined,
      maxPrice: searchParams.maxPrice
        ? Number.parseFloat(searchParams.maxPrice)
        : undefined,
      searchTerm: searchParams.searchTerm || undefined,
      minCreatedAt: searchParams.minCreatedAt
        ? new Date(searchParams.minCreatedAt).toISOString()
        : undefined,
      maxCreatedAt: searchParams.maxCreatedAt
        ? new Date(searchParams.maxCreatedAt).toISOString()
        : undefined,
      minUpdatedAt: searchParams.minUpdatedAt
        ? new Date(searchParams.minUpdatedAt).toISOString()
        : undefined,
      maxUpdatedAt: searchParams.maxUpdatedAt
        ? new Date(searchParams.maxUpdatedAt).toISOString()
        : undefined,
      limit: Number.parseInt(searchParams.limit),
      offset: Number.parseInt(searchParams.offset),
    })
      .filter(([, value]) => value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    onSearch(formattedParams);
  };

  const handleRangeSelect = (range, fieldPrefix) => {
    setSearchParams((prev) => ({
      ...prev,
      [`min${fieldPrefix}`]: range?.from || undefined,
      [`max${fieldPrefix}`]: range?.to || undefined,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-muted/40 space-y-4 rounded-lg p-4"
      dir="rtl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm">البحث</label>
          <Input
            placeholder="اسم المنتج..."
            value={searchParams.searchTerm}
            onChange={(e) =>
              setSearchParams({ ...searchParams, searchTerm: e.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">السعر الأدنى</label>
          <Input
            type="number"
            min="0"
            placeholder="السعر الأدنى..."
            value={searchParams.minPrice}
            onChange={(e) =>
              setSearchParams({ ...searchParams, minPrice: e.target.value })
            }
          />
          {errors.minPrice && (
            <span className="text-xs text-red-500">{errors.minPrice}</span>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm">السعر الأقصى</label>
          <Input
            type="number"
            min="0"
            placeholder="السعر الأقصى..."
            value={searchParams.maxPrice}
            onChange={(e) =>
              setSearchParams({ ...searchParams, maxPrice: e.target.value })
            }
          />
          {errors.maxPrice && (
            <span className="text-xs text-red-500">{errors.maxPrice}</span>
          )}
        </div>

        {/* Creation Date Range */}
        <div>
          <label className="mb-1 block text-sm">نطاق تاريخ الإنشاء</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-right">
                <CalendarIcon className="ml-2 h-4 w-4" />
                {searchParams.minCreatedAt || searchParams.maxCreatedAt ? (
                  <>
                    {format(new Date(searchParams.minCreatedAt), 'PP', {
                      locale: ar,
                    })}{' '}
                    -{' '}
                    {format(new Date(searchParams.maxCreatedAt), 'PP', {
                      locale: ar,
                    })}
                  </>
                ) : (
                  'اختر النطاق الزمني'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-muted p-0">
              <Calendar
                mode="range"
                selected={{
                  from: searchParams.minCreatedAt
                    ? new Date(searchParams.minCreatedAt)
                    : undefined,
                  to: searchParams.maxCreatedAt
                    ? new Date(searchParams.maxCreatedAt)
                    : undefined,
                }}
                onSelect={(range) => handleRangeSelect(range, 'CreatedAt')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Update Date Range */}
        <div>
          <label className="mb-1 block text-sm">نطاق تاريخ التعديل</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-right">
                <CalendarIcon className="ml-2 h-4 w-4" />
                {searchParams.minUpdatedAt || searchParams.maxUpdatedAt ? (
                  <>
                    {format(new Date(searchParams.minUpdatedAt), 'PP', {
                      locale: ar,
                    })}{' '}
                    -{' '}
                    {format(new Date(searchParams.maxUpdatedAt), 'PP', {
                      locale: ar,
                    })}
                  </>
                ) : (
                  'اختر النطاق الزمني'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-muted p-0">
              <Calendar
                mode="range"
                selected={{
                  from: searchParams.minUpdatedAt
                    ? new Date(searchParams.minUpdatedAt)
                    : undefined,
                  to: searchParams.maxUpdatedAt
                    ? new Date(searchParams.maxUpdatedAt)
                    : undefined,
                }}
                onSelect={(range) => handleRangeSelect(range, 'UpdatedAt')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="mb-1 block text-sm">الترتيب حسب</label>
          <Select
            value={searchParams.sortBy}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, sortBy: value })
            }>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="اختر الترتيب" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="price">السعر</SelectItem>
              <SelectItem value="createdAt">تاريخ الإضافة</SelectItem>
              <SelectItem value="updatedAt">آخر تحديث</SelectItem>
              <SelectItem value="openTrades">التداولات المفتوحة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm">اتجاه الترتيب</label>
          <Select
            value={searchParams.sortOrder}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, sortOrder: value })
            }>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="اختر الاتجاه" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="asc">تصاعدي</SelectItem>
              <SelectItem value="desc">تنازلي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm">عدد النتائج</label>
          <Select
            value={searchParams.limit.toString()}
            onValueChange={(value) =>
              setSearchParams({
                ...searchParams,
                limit: Number.parseInt(value),
              })
            }>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="اختر العدد" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="mt-7 w-full hover:bg-accent">
          بحث
        </Button>
      </div>
    </form>
  );
}

SearchPanel.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default function Market() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await api.market.exploreProducts();
      setProducts(productsData);
      const usersData = [
        ...new Set(productsData.map((product) => product.userId)),
      ];
      const usersMap = {};
      usersData.forEach((user) => {
        usersMap[user._id] = user;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      const productsData = await api.market.searchProducts(searchParams);
      setProducts(productsData);
      const usersData = [
        ...new Set(productsData.map((product) => product.userId)),
      ];
      const usersMap = {};
      usersData.forEach((user) => {
        usersMap[user._id] = user;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="mb-8 text-3xl font-bold">السوق</h1>

      <SearchPanel onSearch={handleSearch} />

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              user={users[product.userId._id]}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              لا توجد منتجات متاحة
            </div>
          )}
        </div>
      )}
    </div>
  );
}
