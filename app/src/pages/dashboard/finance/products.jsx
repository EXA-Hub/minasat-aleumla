// app/src/pages/dashboard/finance/products.jsx
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Loader2,
  Lock,
  Edit,
  Trash2,
  Plus,
  ShoppingBag,
  ArrowUpDown,
  Unlock,
} from 'lucide-react';
import MarkdownDisplay from '@/components/ui/markdown';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Card } from '@/components/ui/card';
import api from '../../../utils/api.js';

const ProductForm = ({ product, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">اسم المنتج</label>
      <input
        type="text"
        name="name"
        defaultValue={product?.name}
        className="w-full p-2 border rounded-md bg-[var(--background)]"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">
        الوصف{' '}
        <Link to="/markdown" className="text-blue-500 hover:underline">
          (Markdown)
        </Link>
      </label>
      <textarea
        name="description"
        defaultValue={product?.description}
        className="w-full p-2 border rounded-md bg-[var(--background)] h-64 font-mono"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">السعر</label>
      <input
        type="number"
        name="price"
        defaultValue={product?.price}
        className="w-full p-2 border rounded-md bg-[var(--background)]"
        required
        min="0"
      />
    </div>
    <div className="flex gap-4">
      <button
        type="submit"
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
        {product?.isNew ? 'إضافة منتج' : 'تحديث المنتج'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
        إلغاء
      </button>
    </div>
  </form>
);

ProductForm.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    isNew: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [plan, setPlan] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data.products);
      setPlan(data.plan);
    } catch (error) {
      toast.error(error.data?.error || 'فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    const sortedProducts = [...products].sort((a, b) => {
      const compareValue =
        newDirection === 'asc' ? a[field] - b[field] : b[field] - a[field];
      return compareValue;
    });
    setProducts(sortedProducts);
  };

  const handleSubmit = async (e, product) => {
    setLoading(true);
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
      };

      if (productData.price > plan.maxCoins) {
        toast.error('السعر يجب ان يكون اقل من او يساوي ' + plan.maxCoins);
        return;
      }

      if (product.isNew) {
        if (plan.slots <= products.length)
          toast.error('تم تخطي الحد الاقصي للمنتجات');
        else {
          await api.products.create(productData);
          toast.success('تم إضافة المنتج بنجاح');
        }
      } else {
        await api.products.update(product._id, productData);
        toast.success('تم تحديث المنتج بنجاح');
      }

      loadProducts();
      setEditingProduct(null);
      setSelectedProduct(null);

      toast('تستغرق التحديثات 10 دقيقة', {
        icon: '⏳',
        duration: 10000,
      });
    } catch (error) {
      toast.error(error.data?.error || 'فشل في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    setLoading(true);
    try {
      await api.products.delete(product._id);
      toast.success('تم حذف المنتج بنجاح');
      loadProducts();
      setSelectedProduct(null);
      toast('تستغرق التحديثات 10 دقيقة', {
        icon: '⏳',
        duration: 10000,
      });
    } catch (error) {
      toast.error(error.data?.error || 'فشل في حذف المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (product) => {
    setLoading(true);
    try {
      await api.products.toggleLock(product._id, !product.isLocked);
      toast.success('تم تغيير حالة المنتج بنجاح');
      loadProducts();
      toast('تستغرق التحديثات 10 دقيقة', {
        icon: '⏳',
        duration: 10000,
      });
    } catch (error) {
      toast.error(error.data?.error || 'فشل في تغيير حالة المنتج');
    } finally {
      setLoading(false);
    }
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
      {children}
      {sortField === field && (
        <ArrowUpDown
          className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  );

  SortButton.propTypes = {
    field: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  if (loading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          منتجاتي ({products.length}/{plan.slots})
        </h2>
        <button
          onClick={() => setSelectedProduct({ isNew: true })}
          disabled={products.length >= plan.slots}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          <Plus className="h-5 w-5" />
          <span>إضافة منتج</span>
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b flex justify-end gap-4">
          <SortButton field="price">السعر</SortButton>
          <SortButton field="openTrades">الصفقات المفتوحة</SortButton>
        </div>

        <div className="divide-y">
          {products.map((product) => (
            <div
              key={product._id}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedProduct?._id === product._id
                  ? 'bg-blue-50 dark:bg-blue-900'
                  : ''
              }`}
              onClick={() => setSelectedProduct(product)}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <button
                    disabled={product.openTrades > 0}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    onClick={() => handleToggleLock(product)}>
                    {product.isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>{product.openTrades}</span>
                </div>
                <div className="w-24 text-right">
                  <CoinIcon amount={product.price} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product._id);
                    }}
                    disabled={!product.isLocked}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product);
                    }}
                    disabled={!product.isLocked}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedProduct && (
        <Card className="p-6">
          {editingProduct === selectedProduct._id || selectedProduct.isNew ? (
            <ProductForm
              product={selectedProduct}
              onSubmit={(e) => handleSubmit(e, selectedProduct)}
              onCancel={() => {
                setEditingProduct(null);
                setSelectedProduct(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {selectedProduct.name}
                  </h3>
                  <div className="text-xl font-bold mt-2">
                    <CoinIcon amount={selectedProduct.price} />
                  </div>
                </div>
              </div>
              <MarkdownDisplay content={selectedProduct.description} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProductsPage;
