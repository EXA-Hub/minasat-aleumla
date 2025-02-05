// my-react-app/src/pages/autoRouting/:username.jsx
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useModal } from '../../context/ModalManager.jsx';
import { Button } from '../../components/ui/button.jsx';
import CoinIcon from '../../components/ui/CoinIcon.jsx';
import Badges from '@/components/ui/badges.jsx';
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
          className="border-border bg-secondary hover:bg-muted-light cursor-pointer rounded-lg border p-4 shadow-xs hover:rounded-sm"
          onClick={() => handleProductClick(product._id)}>
          {/* Existing product card content */}
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-semibold">
              {product.name}
            </h3>
            <span
              className={`rounded-full px-2 py-1 text-sm ${
                product.isLocked
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
              {product.isLocked ? 'مقفل' : 'مفتوح'}
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {product.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-foreground text-sm">
              السعر: <span className="font-semibold">{product.price}</span>
            </span>
            <span className="text-foreground text-sm">
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

        const setOnline = (BooleanData) =>
          setData((prevData) => ({
            ...prevData,
            profile: {
              ...prevData.profile,
              online: BooleanData,
            },
          }));

        api.axios
          .get(profile.online)
          .then(() => setOnline(true))
          .catch(() => setOnline(false));
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
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-primary text-xl">جارٍ التحميل...</div>
      </div>
    );

  if (err)
    return (
      <div className="bg-background flex h-screen items-center justify-center rounded-lg p-6 shadow-md">
        <div className="bg-red-100/30 text-xl text-red-500">{err}</div>
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
      className="bg-background text-foreground flex min-h-screen items-center justify-center p-4"
      dir="ltr">
      <div className="border-border bg-card w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl">
        {/* Header Section */}
        <div
          className="relative h-64 bg-cover bg-center"
          style={{
            backgroundImage: `url(${profile?.wallpaper || '/wallpaper.jpg'})`,
          }}>
          <div className="absolute inset-0 bg-black/60">
            {/* Badges container moved to top left */}
            <Badges BadgesArray={badges} />

            {/* Profile info container */}
            <div className="absolute bottom-6 left-6 flex items-center">
              <img
                src={profile?.profilePicture || '/avatar.jpg'}
                alt={`${profile?.username}'s profile`}
                className="border-card h-24 w-24 rounded-full border-4 shadow-lg"
              />
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">
                  {profile?.username}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {profile?.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                {profile?.description}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                typeof online === 'string'
                  ? 'bg-gray-100 text-gray-700'
                  : online
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}>
              {typeof online === 'string'
                ? 'جاري التحقق'
                : online
                  ? 'متصل'
                  : 'غير متصل'}
            </span>
          </div>

          <div className="text-foreground mt-6 grid grid-cols-2 gap-4 text-sm">
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
          <div className="border-border bg-secondary border-t p-6">
            <h2 className="text-foreground mb-4 text-lg font-bold">المحفظة</h2>
            <div className="text-foreground flex flex-col gap-y-2 text-sm">
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
        <div className="border-border border-t p-6">
          <h2 className="text-foreground mb-4 text-lg font-bold">المنتجات</h2>
          <ProductList
            products={products}
            username={username}
            isModal={Boolean(closeWidget)}
          />
        </div>

        {/* Back Button */}
        <div className="border-border border-t p-6">
          <Button
            size="sm"
            variant="outline"
            className="hover:bg-accent hover:text-accent-foreground w-full"
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
