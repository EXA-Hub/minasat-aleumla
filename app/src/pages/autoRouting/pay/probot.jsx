import { Link } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';
import { Button } from '../../../components/ui/button';

// probot.jsx
export default function ProbotPage() {
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
          <Bot className="h-16 w-16 text-[#5865F2] drop-shadow-sm" />
        </div>

        <h1 className="text-foreground mb-6 text-center text-3xl font-bold">
          الدفع عبر Probot
        </h1>

        <div className="space-y-6">
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4">
            <h2 className="text-foreground mb-3 text-xl font-semibold">
              خطوات الدفع:
            </h2>
            <ol className="text-muted-foreground list-inside list-decimal space-y-2">
              <li>انضم إلى سيرفر Discord الخاص بنا</li>
              <li>وثق حسابك في السيرفر</li>
              <li>إفتح تذكرة بيع أو شراء</li>
              <li>اتبع تعليمات البوت لإتمام عملية الدفع</li>
            </ol>
          </div>

          <div className="bg-muted border-border rounded-lg border p-4 text-center">
            <p className="text-foreground text-lg font-semibold">
              رابط السيرفر
            </p>
            <a
              href="https://discord.gg/P78WYKwXv6"
              className="font-medium text-[#5865F2] transition-colors hover:text-[#4752C4] hover:underline">
              discord.gg/P78WYKwXv6
            </a>
          </div>

          <div className="border-border border-t pt-6">
            <Button
              onClick={() => window.open('https://discord.gg/P78WYKwXv6')}
              className="text-primary-foreground w-full rounded-lg bg-[#5865F2] px-6 py-3 font-medium shadow-sm transition-colors hover:bg-[#4752C4]">
              الانضمام للسيرفر
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
