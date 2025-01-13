// my-react-app/src/pages/autoRouting/:username.jsx
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useModal } from '../../context/ModalManager.jsx';
import { Button } from '../../components/ui/button.jsx';
import CoinIcon from '../../components/ui/CoinIcon.jsx';
import Badge from '@/components/ui/badge.jsx';
import api from '../../utils/api.js';

const ProductList = ({ username, products }) => {
  const { openModal } = useModal();

  const handleProductClick = (productId) =>
    openModal('product', { username, productId });

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="cursor-pointer bg-secondary p-4 rounded-lg shadow-sm border border-border hover:bg-muted-light hover:rounded"
          onClick={() => handleProductClick(product._id)}>
          {/* Existing product card content */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              {product.name}
            </h3>
            <span
              className={`px-2 py-1 text-sm rounded-full ${
                product.isLocked
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
              {product.isLocked ? 'مقفل' : 'مفتوح'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {product.description}
          </p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-foreground">
              السعر: <span className="font-semibold">{product.price}</span>
            </span>
            <span className="text-sm text-foreground">
              الصفقات المفتوحة:{' '}
              <span className="font-semibold">{product.openTrades}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      openTrades: PropTypes.number.isRequired,
      isLocked: PropTypes.bool.isRequired,
    })
  ).isRequired,
  username: PropTypes.string.isRequired,
  isModal: PropTypes.bool.isRequired,
};

const ProfilePage = ({ username: usernameProp, closeWidget }) => {
  const { username: usernameParam } = useParams();
  const username = usernameProp || usernameParam;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState({
    username,
    wallet: null,
    profile: {},
    products: [],
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await api.userData.profile(username);
        setData((prevData) => ({ ...prevData, profile }));
        loadProducts();
        loadWallet();
      } catch (error) {
        console.error(error);
        setErr(error?.data?.error || 'حدث خطأ أثناء تحميل البيانات الشخصية');
      } finally {
        setLoading(false);
      }
    };

    const loadWallet = async () => {
      try {
        const wallet = await api.userData.wallet(username);
        setData((prevData) => ({ ...prevData, wallet }));
      } catch (error) {
        console.error(error);
      }
    };

    const loadProducts = async () => {
      try {
        const products = await api.userData.products(username);
        setData((prevData) => ({ ...prevData, products: products || [] }));
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [username]); // Only depend on `username`

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-xl text-blue-600">جارٍ التحميل...</div>
      </div>
    );

  if (err)
    return (
      <div className="flex justify-center items-center bg-background h-screen p-6 rounded-lg shadow-md">
        <div className="text-xl text-red-500 bg-red-100/30">{err}</div>
      </div>
    );

  const {
    profile: { profile, online, badges },
    wallet,
    products,
  } = data;

  const handleBack = () => {
    if (usernameProp) closeWidget();
    else if (window.history && window.history.length > 1) window.history.back(); // Go back in history
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex items-center justify-center p-4"
      dir="ltr">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-border">
        {/* Header Section */}
        <div
          className="h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${profile?.wallpaper || '/wallpaper.jpg'})`,
          }}>
          <div className="absolute inset-0 bg-black bg-opacity-60">
            {/* Badges container moved to top left */}
            <div className="absolute sm:top-4 sm:right-4 top-2 right-2 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-1rem)]">
              {badges?.map((badge) => (
                <Badge
                  key={badge.name}
                  name={badge.name}
                  icon={badge.icon}
                  tooltipMessage={badge.msg}
                  isPremium={badge.isPremium}
                />
              ))}
            </div>

            {/* Profile info container */}
            <div className="absolute bottom-6 left-6 flex items-center">
              <img
                src={profile?.profilePicture || '/avatar.jpg'}
                alt={`${profile?.username}'s profile`}
                className="w-24 h-24 rounded-full border-4 border-card shadow-lg"
              />
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">
                  {profile?.username}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">
                {profile?.description}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                online
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {online ? 'متصل' : 'غير متصل'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-foreground">
            <div>
              <span className="font-semibold">العمر:</span> {profile?.age}
            </div>
            <div>
              <span className="font-semibold">الجنس:</span> {profile?.sex}
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        {wallet && (
          <div className="bg-secondary p-6 border-t border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">المحفظة</h2>
            <div className="space-y-2 text-sm text-foreground">
              <div className="flex justify-between">
                <span>الرصيد:</span>
                <span className="font-semibold">
                  <CoinIcon amount={wallet?.balance} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>الرسوم:</span>
                <span className="font-semibold">{wallet?.fee || '0'}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="p-6 border-t border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">المنتجات</h2>
          <ProductList
            products={products}
            username={username}
            isModal={Boolean(closeWidget)}
          />
        </div>

        {/* Back Button */}
        <div className="p-6 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="w-full hover:bg-accent hover:text-accent-foreground"
            onClick={handleBack}>
            العودة للوراء
          </Button>
        </div>
      </div>
    </div>
  );
};

// Define prop types
ProfilePage.propTypes = {
  username: PropTypes.string,
  closeWidget: PropTypes.func,
};

export default ProfilePage;
