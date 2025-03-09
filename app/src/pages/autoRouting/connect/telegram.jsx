import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import api from '../../../utils/api';

export default function TelegramAuth() {
  const [dataSent, setDataSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mfa, setMfa] = useState(false);
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
      if (localStorage.getItem('token'))
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
      else
        api.apps
          .loginWithApp({
            app: 'telegram',
            query: user,
          })
          .then((data) => {
            if (data.requiresMFA) setMfa(user);
            if (data.token) {
              localStorage.setItem('token', data.token);
              window.close();
            }
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

  if (mfa) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="text-primary text-lg font-bold">ادخل كود التحقق</div>
        <Input
          className="mt-4"
          placeholder="كود التحقق"
          onChange={(e) =>
            setMfa((user) => ({
              user,
              tfaCode: e.target.value,
            }))
          }
        />
        <Button
          onClick={() => {
            setMfa(false);
            api.apps
              .loginWithApp({
                app: 'telegram',
                query: mfa.user,
                tfaCode: mfa.tfaCode,
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

  return dataSent ? (
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
  ) : (
    <div id="telegram-login"></div>
  );
}
