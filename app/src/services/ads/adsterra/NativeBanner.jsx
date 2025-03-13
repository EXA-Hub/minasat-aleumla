// app/src/services/ads/adsterra/nativeBanner.jsx
import { useEffect } from 'react';

const NativeBanner = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src =
      '//pl26108174.effectiveratecpm.com/c815ebd549c890194b9e3d230e65787a/invoke.js';

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="container-c815ebd549c890194b9e3d230e65787a"></div>;
};

export default NativeBanner;
