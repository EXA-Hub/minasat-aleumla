// app/src/services/ads/adsterra/SocialBar.jsx
import { useEffect } from 'react';

const SocialBar = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      '//pl26108649.effectiveratecpm.com/0f/c4/a4/0fc4a4bef2db260da329814e84320fbc.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <></>;
};

export default SocialBar;
