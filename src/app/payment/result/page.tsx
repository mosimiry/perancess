'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Cart key kept in sync with hooks/useCart.ts
const CART_KEY = 'perancess_cart';

interface VerifyState {
  status: 'loading' | 'success' | 'failed';
  message: string;
  refId?: string;
}

function ResultInner() {
  const params = useSearchParams();
  const authority = params.get('Authority') || '';
  const payStatus = params.get('Status') || '';

  const [state, setState] = useState<VerifyState>({ status: 'loading', message: 'در حال بررسی پرداخت...' });

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!authority) {
        setState({ status: 'failed', message: 'اطلاعات پرداخت ناقص است.' });
        return;
      }
      try {
        const res = await fetch(
          `/api/payment/verify?Authority=${encodeURIComponent(authority)}&Status=${encodeURIComponent(payStatus)}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data?.ok) {
          // Clear the cart after a successful purchase
          try { localStorage.removeItem(CART_KEY); } catch {}
          setState({ status: 'success', message: 'پرداخت با موفقیت انجام شد.', refId: data?.refId });
        } else {
          setState({ status: 'failed', message: data?.error || 'پرداخت ناموفق بود.' });
        }
      } catch {
        if (!cancelled) setState({ status: 'failed', message: 'خطای شبکه هنگام بررسی پرداخت.' });
      }
    }
    verify();
    return () => { cancelled = true; };
  }, [authority, payStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 max-w-md w-full p-8 text-center">
        {state.status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-gold mx-auto mb-4 animate-spin" />
            <p className="text-charcoal font-medium">{state.message}</p>
          </>
        )}

        {state.status === 'success' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">پرداخت موفق</h1>
            <p className="text-sm text-muted-foreground mb-2">{state.message}</p>
            {state.refId && (
              <p className="text-xs text-muted-foreground mb-6" dir="ltr">کد پیگیری: {state.refId}</p>
            )}
            <a href="/" className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              بازگشت به فروشگاه
            </a>
          </>
        )}

        {state.status === 'failed' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">پرداخت ناموفق</h1>
            <p className="text-sm text-muted-foreground mb-6">{state.message}</p>
            <a href="/" className="inline-block bg-charcoal hover:bg-charcoal/80 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              بازگشت به فروشگاه
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
