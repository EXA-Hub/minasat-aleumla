import { ArrowLeft, GoalIcon as PaypalIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// paypal.jsx
export default function PayPalPage() {
  return (
    <div className="bg-background min-h-screen p-6">
      <Link
        to="/dashboard/exchange"
        dir="ltr"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center transition-colors">
        <ArrowLeft className="mr-2 h-5 w-5" />
        العودة
      </Link>

      <div className="bg-card border-border mx-auto max-w-2xl rounded-xl border p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-center">
          <PaypalIcon className="h-16 w-16 text-[#00457C] drop-shadow-sm" />
        </div>

        <h1 className="text-foreground mb-6 text-center text-3xl font-bold">
          الدفع عبر PayPal
        </h1>

        <div className="space-y-6">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <h2 className="text-foreground mb-3 text-xl font-semibold">
              تعليمات الدفع:
            </h2>
            <ol className="text-muted-foreground list-inside list-decimal space-y-2">
              <li>قم بتسجيل الدخول إلى حساب PayPal الخاص بك</li>
              <li>أدخل المبلغ المطلوب للدفع</li>
              <li>تأكد من تفاصيل الدفع</li>
              <li>اضغط على زر &quot;إتمام الدفع&quot;</li>
            </ol>
          </div>

          <div className="border-border border-t pt-6">
            <button className="text-primary-foreground w-full rounded-lg bg-[#00457C] px-6 py-3 font-medium shadow-sm transition-colors hover:bg-[#003660]">
              المتابعة للدفع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
