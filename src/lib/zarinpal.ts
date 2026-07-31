// Zarinpal payment gateway helper (v4 API).
// merchant_id is read from the environment and never hardcoded.

// Read an env var safely: trims whitespace and strips accidental surrounding
// quotes (e.g. VALUE="x") so comparisons like === 'YOUR_MERCHANT_ID' or
// === 'true' work regardless of how the .env value was quoted.
function readEnv(name: string): string {
  const raw = process.env[name];
  if (raw == null) return '';
  return raw.trim().replace(/^["']|["']$/g, '').trim();
}

const SANDBOX = readEnv('ZARINPAL_SANDBOX') === 'true';

const BASE = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment';

export const ZARINPAL_STARTPAY = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/StartPay/'
  : 'https://www.zarinpal.com/pg/StartPay/';

export function getMerchantId(): string {
  // Configured manually later via NEXT_PUBLIC_ZARINPAL_MERCHANT_ID
  // Quotes/whitespace are stripped so the placeholder check is reliable.
  return readEnv('NEXT_PUBLIC_ZARINPAL_MERCHANT_ID');
}

interface RequestArgs {
  amount: number;
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}

export interface ZarinpalRequestResult {
  ok: boolean;
  authority?: string;
  error?: string;
}

export async function requestPayment(args: RequestArgs): Promise<ZarinpalRequestResult> {
  const merchant_id = getMerchantId();
  if (!merchant_id) {
    return { ok: false, error: 'merchant_id تنظیم نشده است (NEXT_PUBLIC_ZARINPAL_MERCHANT_ID).' };
  }

  try {
    const res = await fetch(`${BASE}/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id,
        amount: Math.round(args.amount),
        currency: 'IRT', // amounts are in Toman
        description: args.description,
        callback_url: args.callbackUrl,
        metadata: { email: args.email, mobile: args.mobile },
      }),
    });
    const json = await res.json();
    const authority = json?.data?.authority;
    const code = json?.data?.code;
    if (authority && (code === 100 || code === 101)) {
      return { ok: true, authority };
    }
    const errMsg =
      (Array.isArray(json?.errors) ? json.errors?.[0]?.message : json?.errors?.message) ||
      'درخواست پرداخت ناموفق بود';
    return { ok: false, error: String(errMsg) };
  } catch (e) {
    return { ok: false, error: 'خطای شبکه هنگام اتصال به درگاه پرداخت' };
  }
}

export interface ZarinpalVerifyResult {
  ok: boolean;
  refId?: string;
  error?: string;
}

export async function verifyPayment(amount: number, authority: string): Promise<ZarinpalVerifyResult> {
  const merchant_id = getMerchantId();
  if (!merchant_id) {
    return { ok: false, error: 'merchant_id تنظیم نشده است.' };
  }

  try {
    const res = await fetch(`${BASE}/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ merchant_id, amount: Math.round(amount), authority }),
    });
    const json = await res.json();
    const code = json?.data?.code;
    // 100 = verified now, 101 = already verified
    if (code === 100 || code === 101) {
      return { ok: true, refId: String(json?.data?.ref_id ?? '') };
    }
    const errMsg =
      (Array.isArray(json?.errors) ? json.errors?.[0]?.message : json?.errors?.message) ||
      'تایید پرداخت ناموفق بود';
    return { ok: false, error: String(errMsg) };
  } catch (e) {
    return { ok: false, error: 'خطای شبکه هنگام تایید پرداخت' };
  }
}
