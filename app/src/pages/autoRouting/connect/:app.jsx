import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import api from '../../../utils/api';

const ConnectPage = () => {
  const [loading, setLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState(null);
  const { app } = useParams();
  const location = useLocation();
  const apiCallMade = useRef(false);

  useEffect(() => {
    const apiCall = async () => {
      if (apiCallMade.current) return;

      apiCallMade.current = true;
      setLoading(true);
      setResponseStatus(null);

      const { origin, pathname } = window.location;
      const queryParams = new URLSearchParams(location.search);
      const query = {};
      queryParams.forEach((value, key) => {
        query[key] = value;
      });

      try {
        await api.apps.verifyConnection({
          app,
          query,
          redirectUrl: origin + pathname,
        });
        setResponseStatus('success');
      } catch (e) {
        console.log(e);
        setResponseStatus(e.data?.error || 'error');
      } finally {
        setLoading(false);
      }
    };

    apiCall();
    // We want this effect to run only once when mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToApps = () => window.close();

  return (
    <div className="mx-auto max-w-4xl px-6 py-4">
      {loading ? (
        <div className="text-lg font-bold text-yellow-500">
          جاري إرسال البيانات... يرجى الانتظار...
        </div>
      ) : responseStatus === 'success' ? (
        <div className="text-lg font-bold text-green-500">
          تم ربط الحساب بنجاح
        </div>
      ) : (
        <div className="text-lg font-bold text-red-500">
          حدث خطأ أثناء الاتصال. حاول مرة أخرى لاحقًا.
          <br />
          <span className="text-foreground">{responseStatus}</span>
        </div>
      )}

      {!loading && (
        <Button
          onClick={handleBackToApps}
          className="mt-4 rounded-md bg-primary px-6 py-3 text-lg text-primary-foreground transition duration-200 hover:bg-90primary disabled:cursor-not-allowed disabled:bg-gray-400">
          العودة للتطبيقات
        </Button>
      )}
    </div>
  );
};

export default ConnectPage;
