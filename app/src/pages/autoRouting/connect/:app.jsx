import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import api from '../../../utils/api';

const ConnectPage = () => {
  const [loading, setLoading] = useState(true);
  const [mfa, setMfa] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const { app } = useParams();
  const location = useLocation();
  const apiCallMade = useRef(false);

  const { origin, pathname } = window.location;

  const queryParams = new URLSearchParams(location.search);
  const query = {};
  queryParams.forEach((value, key) => {
    query[key] = value;
  });

  useEffect(() => {
    const apiCall = async () => {
      if (apiCallMade.current) return;

      apiCallMade.current = true;
      setLoading(true);
      setResponseStatus(null);

      try {
        const response = await api.apps[
          localStorage.getItem('token') ? 'verifyConnection' : 'loginWithApp'
        ]({
          app,
          query,
          redirectUrl: origin + pathname,
        });
        setResponseStatus('success');
        if (response.token) {
          localStorage.setItem('token', response.token);
          window.close();
        } else if (response.requiresMFA) setMfa(true);
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

  if (mfa) {
    // add mfa otp code
    return (
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="text-primary text-lg font-bold">ادخل كود التحقق</div>
        <Input
          className="mt-4"
          placeholder="كود التحقق"
          onChange={(e) => setMfa(e.target.value)}
        />
        <Button
          onClick={() => {
            setMfa(false);
            api.apps
              .loginWithApp({
                app,
                query,
                redirectUrl: origin + pathname,
                tfaCode: mfa,
              })
              .catch((e) => {
                console.log(e);
                setResponseStatus(e.data?.error || 'error');
              })
              .then((data) => {
                if (data.token) {
                  localStorage.setItem('token', data.token);
                  window.close();
                } else if (data.requiresMFA) setMfa(true);
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          className="mt-4 rounded-md px-6 py-3 text-lg">
          تأكيد
        </Button>
      </div>
    );
  }

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
          className="bg-primary text-primary-foreground hover:bg-90primary mt-4 rounded-md px-6 py-3 text-lg transition duration-200 disabled:cursor-not-allowed disabled:bg-gray-400">
          العودة للتطبيقات
        </Button>
      )}
    </div>
  );
};

export default ConnectPage;
