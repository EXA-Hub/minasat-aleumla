// app/src/pages/explore/transfers/market.jsx
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import { Box } from '@/components/ui/box';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Rating } from '@/components/ui/rating';
import {
  Loader2,
  CalendarIcon,
  Search,
  SortAsc,
  SortDesc,
  RotateCcw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserName from '../../../components/explore/widgets/Username';
import { Card, CardContent } from '@/components/ui/card';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function ProductCard({ product, user }) {
  const navigate = useNavigate();
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="group-hover:text-primary text-xl font-semibold tracking-tight transition-colors">
                {product.name}
              </h3>
              {product.avgRating && !Number.isNaN(product.avgRating) && (
                <>
                  <Rating
                    value={product.avgRating}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  {product.avgRating.toFixed(2)}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="bg-10primary text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                <CoinIcon amount={product.price} />
              </span>
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                💼 {product.openTrades} صفقات مفتوحة
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                تاريخ الإنشاء:{' '}
                {format(new Date(product.createdAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                آخر تحديث:{' '}
                {format(new Date(product.updatedAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="border-background h-10 w-10 border-2">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <UserName username={user.username} />
            </div>
            <Button
              onClick={() => navigate(`/product/${product._id}`)}
              variant="ghost"
              className="border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground w-full border transition-all">
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

function SearchPanel({ onSearch, maxPriceAvailable = 100000 }) {
  const defaultSearchParams = {
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
    rating: 5,
  };

  const [searchParams, setSearchParams] = useState(defaultSearchParams);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(
      Object.entries({
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
        rating: searchParams.rating,
      })
        .filter(([, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    );
  };

  const handleRangeSelect = (range, fieldPrefix) => {
    setSearchParams((prev) => ({
      ...prev,
      [`min${fieldPrefix}`]: range?.from || undefined,
      [`max${fieldPrefix}`]: range?.to || undefined,
    }));
  };

  const handleReset = () => {
    setSearchParams(defaultSearchParams);
    onSearch({}); // Trigger search with empty params to reset results
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-lg border p-6 shadow-xs">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-y-2">
          <Label>البحث</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="اسم المنتج..."
              value={searchParams.searchTerm}
              onChange={(e) =>
                setSearchParams({ ...searchParams, searchTerm: e.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>مدى السعر</Label>
          <Box dir="ltr" className="px-3">
            <Slider
              value={[
                searchParams.minPrice || 0,
                searchParams.maxPrice || maxPriceAvailable,
              ]}
              min={1}
              max={maxPriceAvailable}
              step={1}
              onValueChange={(values) =>
                setSearchParams({
                  ...searchParams,
                  minPrice: values[0],
                  maxPrice: values[1],
                })
              }
            />
          </Box>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="السعر الأدنى"
              className="text-right"
              value={searchParams.minPrice || ''}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  minPrice: Number.parseInt(e.target.value),
                })
              }
              min={1}
              max={maxPriceAvailable}
            />
            <Input
              type="number"
              placeholder="السعر الأقصى"
              className="text-right"
              value={searchParams.maxPrice || ''}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  maxPrice: Number.parseInt(e.target.value),
                })
              }
              min={1}
              max={maxPriceAvailable}
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>نطاق تاريخ الإنشاء</Label>
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
            <PopoverContent className="w-auto p-0" align="start">
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
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>نطاق تاريخ التعديل</Label>
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
            <PopoverContent className="w-auto p-0" align="start">
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
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>الترتيب</Label>
          <div className="flex flex-col gap-2">
            <Select
              value={searchParams.sortBy}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, sortBy: value })
              }>
              <SelectTrigger>
                <SelectValue placeholder="اختر الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">السعر</SelectItem>
                <SelectItem value="createdAt">تاريخ الإضافة</SelectItem>
                <SelectItem value="updatedAt">آخر تحديث</SelectItem>
                <SelectItem value="openTrades">الصفقات المفتوحة</SelectItem>
                <SelectItem value="rating">التقييم</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  searchParams.sortOrder === 'asc' ? 'default' : 'outline'
                }
                className="flex-1"
                onClick={() =>
                  setSearchParams({ ...searchParams, sortOrder: 'asc' })
                }>
                <SortAsc className="ml-2 h-4 w-4" />
                تصاعدي
              </Button>
              <Button
                type="button"
                variant={
                  searchParams.sortOrder === 'desc' ? 'default' : 'outline'
                }
                className="flex-1"
                onClick={() =>
                  setSearchParams({ ...searchParams, sortOrder: 'desc' })
                }>
                <SortDesc className="ml-2 h-4 w-4" />
                تنازلي
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>عدد النتائج في الصفحة</Label>
          <Box dir="ltr" className="px-3">
            <Slider
              value={searchParams.limit}
              min={5}
              max={25}
              step={5}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, limit: value[0] })
              }
            />
          </Box>
          <Input
            type="number"
            value={searchParams.limit}
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                limit: Number.parseInt(e.target.value),
              })
            }
            min={5}
            max={25}
            className="text-center"
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="bg-background rounded-md border p-4">
            <div className="flex items-center justify-between">
              <Rating
                name="rating"
                value={searchParams.rating}
                precision={0.5}
                onChange={(_e, newValue) =>
                  setSearchParams({ ...searchParams, rating: newValue })
                }
              />
              <span className="text-muted-foreground text-sm">
                {searchParams.rating} / 5
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              تصفية حسب تقييم المنتج
            </p>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="submit"
            variant="ghost"
            className="border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground flex-1 border transition-all">
            <Search className="ml-2 h-4 w-4" />
            بحث
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="border-border text-muted-foreground border">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}

SearchPanel.propTypes = {
  onSearch: PropTypes.func.isRequired,
  maxPriceAvailable: PropTypes.number,
};

export default function Market() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [maxPriceAvailable, setMaxPriceAvailable] = useState(1000000);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { products, maxPriceAvailable } =
        await api.market.exploreProducts();
      setProducts(products);
      setMaxPriceAvailable(maxPriceAvailable);
      const usersData = [...new Set(products.map((product) => product.userId))];
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
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">السوق</h1>
      </div>

      <SearchPanel
        onSearch={handleSearch}
        maxPriceAvailable={maxPriceAvailable}
      />

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              user={users[product.userId._id]}
            />
          ))}
          {products.length === 0 && (
            <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
              لا توجد منتجات متاحة
            </div>
          )}
        </div>
      )}
    </div>
  );
}
