import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import api from '../../../utils/api';

export default function TelegramAuth() {
  const [dataSent, setDataSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState(null);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'Minasat_Aleumla_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    document.getElementById('telegram-login').appendChild(script);

    window.onTelegramAuth = (user) => {
      setDataSent(true);
      setLoading(true);
      api.apps
        .verifyConnection({
          app: 'telegram',
          user,
        })
        .then(() => {
          setResponseStatus('success');
        })
        .catch((e) => {
          console.log(e);
          setResponseStatus(e.data?.error || 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    return () => {
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
        if (script.src.includes('telegram-widget.js')) {
          script.remove();
        }
      }
      delete window.onTelegramAuth;
    };
  }, []);

  const handleBackToApps = () => window.close();

  return dataSent ? (
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
  ) : (
    <div id="telegram-login"></div>
  );
}
