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
    <div className="px-6 py-4 max-w-4xl mx-auto">
      {loading ? (
        <div className="text-lg text-yellow-500 font-bold">
          جاري إرسال البيانات... يرجى الانتظار...
        </div>
      ) : responseStatus === 'success' ? (
        <div className="text-lg text-green-500 font-bold">
          تم ربط الحساب بنجاح
        </div>
      ) : (
        <div className="text-lg text-red-500 font-bold">
          حدث خطأ أثناء الاتصال. حاول مرة أخرى لاحقًا.
          <br />
          <span className="text-foreground">{responseStatus}</span>
        </div>
      )}

      {!loading && (
        <Button
          onClick={handleBackToApps}
          className="bg-primary text-primary-foreground rounded-md px-6 py-3 text-lg transition duration-200 hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4">
          العودة للتطبيقات
        </Button>
      )}
    </div>
  );
};

export default ConnectPage;
