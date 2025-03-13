// app/src/services/ads/adsterra/popUnder.jsx
import { useEffect } from 'react';

const PopUnder = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      '//pl26108576.effectiveratecpm.com/55/86/70/55867040598aa8354c9d4cfd962c3757.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <></>;
};

export default PopUnder;
