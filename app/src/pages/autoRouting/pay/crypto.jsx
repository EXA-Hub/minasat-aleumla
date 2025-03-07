import { ArrowLeft, Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';

// crypto.jsx
export default function CryptoPage() {
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
          <Bitcoin className="h-16 w-16 text-[#f7931a] drop-shadow-sm" />
        </div>

        <h1 className="text-foreground mb-6 text-center text-3xl font-bold">
          الدفع بالعملات الرقمية
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
              <h3 className="text-foreground mb-2 font-semibold">
                Bitcoin (BTC)
              </h3>
              <p className="text-muted-foreground font-mono text-sm break-all">
                Under Construction
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <h3 className="text-foreground mb-2 font-semibold">
                Ethereum (ETH)
              </h3>
              <p className="text-muted-foreground font-mono text-sm break-all">
                Under Construction
              </p>
            </div>
          </div>

          <div className="bg-muted border-border rounded-lg border p-4">
            <h2 className="text-foreground mb-3 text-xl font-semibold">
              تعليمات مهمة:
            </h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-2">
              <li>تأكد من اختيار الشبكة الصحيحة للعملة</li>
              <li>انتظر تأكيد المعاملة على الشبكة</li>
              <li>احتفظ برقم المعاملة للمراجعة</li>
            </ul>
          </div>

          <div className="border-border border-t pt-6">
            <button className="text-primary-foreground w-full rounded-lg bg-[#f7931a] px-6 py-3 font-medium shadow-sm transition-colors hover:bg-[#e68a19]">
              تأكيد الدفع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
