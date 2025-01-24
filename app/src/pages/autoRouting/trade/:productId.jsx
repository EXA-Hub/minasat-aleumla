// app/src/pages/autoRouting/trade/:productid.jsx
import { useParams } from 'react-router-dom';

const TradePage = () => {
  const { productid } = useParams();

  if (!productid || !/^[a-f\d]{24}$/i.test(productid)) return <></>;

  return <>{productid}</>;
};

export default TradePage;
