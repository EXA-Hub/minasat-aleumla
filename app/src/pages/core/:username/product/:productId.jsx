// my-react-app/src/pages/autoRouting/:username/product/:productId.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Clock,
  Lock,
  Tag,
  Calendar,
  User,
  Info,
  ArrowLeft,
} from 'lucide-react';
import api from '../../../../utils/api.js';
import PropTypes from 'prop-types';

const ProductPage = ({
  username: usernameProp,
  productid: productIdProp,
  closeWidget,
}) => {
  const { username: usernameParam, productid: productIdParam } = useParams();
  const username = usernameProp || usernameParam;
  const productid = productIdProp || productIdParam;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.userData.product(username, productid);
        setData(response);
      } catch (error) {
        setErr(error?.data?.error || 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productid, username]);

  const handleBack = () => {
    if (usernameProp) closeWidget();
    else if (window.history && window.history.length > 1) window.history.back(); // Go back in history
  };

  if (loading || err) {
    const bgClass = err
      ? 'from-red-50 to-pink-50'
      : 'from-primary to-purple-50';
    const content = err ? err : 'جارٍ التحميل...';
    const textClass = err ? 'text-red-500' : 'text-primary';

    return (
      <div
        className={`flex h-screen items-center justify-center bg-gradient-to-br ${bgClass} dark:from-gray-900 dark:to-gray-800`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xl ${textClass} ${err ? 'rounded-lg bg-white/30 p-6 backdrop-blur-lg' : ''}`}>
          {content}
        </motion.div>
      </div>
    );
  }

  const { product, user } = data;

  return (
    <div className="p-4">
      <Card className="border-0 bg-white/20 shadow-xl backdrop-blur-lg">
        <CardHeader>
          <div className="mb-4 flex items-start justify-between">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {!product.isLocked && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() =>
                    (window.location.pathname = `/product/${product._id}`)
                  }
                  className="opacity-60 transition-opacity duration-300 ease-in-out hover:opacity-100">
                  فتح صفقة
                </Button>
              </div>
            )}
          </div>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-purple-500/30">
              <AvatarImage src={user?.profilePicture || '/avatar.jpg'} />
              <AvatarFallback>{user?.username || 'مستخدم'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-2xl font-bold text-transparent">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <User size={14} /> {user.username}
                </span>
                <span>{user.age} سنة</span>
                <span>{user.sex}</span>
              </div>
              {user.title && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.title}
                </p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
            <div className="mb-2 flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Info size={18} />
              <span className="font-semibold">الوصف</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Tag size={18} />
                <span className="font-semibold">السعر</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{product.price}</p>
            </div>

            <div className="rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 text-primary dark:text-primary">
                <Clock size={18} />
                <span className="font-semibold">الصفقات المفتوحة</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{product.openTrades}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              {new Date(product.createdAt).toLocaleDateString('ar-SA')}
            </div>
            {product.isLocked && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Lock size={14} />
                مقفل
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ProductPage.propTypes = {
  username: PropTypes.string,
  productid: PropTypes.string,
  closeWidget: PropTypes.func,
  navigate: PropTypes.func,
};

export default ProductPage;
