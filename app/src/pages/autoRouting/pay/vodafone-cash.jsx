import { ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

// vodafone-cash.jsx (updated with theme variables)
export default function VodafoneCashPage() {
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e60000] shadow-sm">
            <Phone className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-foreground mb-4 text-center text-3xl font-bold">
          الدفع عبر Vodafone Cash
        </h1>

        <div className="space-y-6">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              خطوات الدفع:
            </h2>
            <ol className="text-foreground/90 list-inside list-decimal space-y-2">
              <li>افتح تطبيق Vodafone Cash</li>
              <li>اختر &quot;تحويل الأموال&quot;</li>
              <li>أدخل رقم الهاتف: غير متوفر</li>
              <li>أدخل المبلغ المطلوب</li>
              <li>أكد العملية برقمك السري</li>
            </ol>
          </div>

          <div className="bg-muted border-border rounded-lg border p-4 text-center">
            <p className="text-foreground text-lg font-semibold">رقم المحفظة</p>
            <p className="text-2xl font-bold text-[#e60000]">غير متوفر</p>
          </div>

          <div className="border-border border-t pt-6">
            <button className="w-full rounded-lg bg-[#e60000] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#cc0000]">
              تأكيد الدفع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
