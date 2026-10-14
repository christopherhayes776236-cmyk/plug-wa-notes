/**
 * IntaSend Payment Gateway Helper
 * Direct M-Pesa STK Push and Status Verification
 */

export interface IntasendConfig {
  publishableKey: string;
  secretKey: string;
  baseUrl: string;
}

const DEFAULT_INTASEND_PUBLISHABLE_KEY = 'ISPubKey_live_aa619d0a-7045-41bb-ac31-d4bfe7012099';
const DEFAULT_INTASEND_SECRET_KEY = 'ISSecretKey_live_f6df43b5-9c95-4dca-bb37-91bf0da8a09c';

export function getIntasendConfig(): IntasendConfig {
  const secretKey = process.env.INTASEND_SECRET_KEY || DEFAULT_INTASEND_SECRET_KEY;
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY || DEFAULT_INTASEND_PUBLISHABLE_KEY;
  const isTest = secretKey.includes('_test_') || process.env.INTASEND_ENV === 'sandbox';

  return {
    publishableKey,
    secretKey,
    baseUrl: isTest ? 'https://sandbox.intasend.com' : 'https://api.intasend.com',
  };
}

export function formatKenyanPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('254')) {
    return clean;
  }
  if (clean.startsWith('0')) {
    return `254${clean.slice(1)}`;
  }
  return `254${clean}`;
}

export interface IntasendStkParams {
  phone: string;
  amount: number;
  orderId: string;
  description: string;
  accountReference?: string;
}

export interface IntasendStkResult {
  invoiceId: string;
  checkoutRequestId: string;
  customerMessage: string;
  state: string;
}

/**
 * Initiates an M-Pesa STK Push prompt to the user's phone via IntaSend
 */
export async function initiateIntasendStkPush(params: IntasendStkParams): Promise<IntasendStkResult> {
  const config = getIntasendConfig();
  if (!config.secretKey) {
    throw new Error('IntaSend Secret Key is not configured in environment variables');
  }

  const formattedPhone = formatKenyanPhone(params.phone);
  const url = `${config.baseUrl}/api/v1/payment/mpesa-stk-push/`;

  const payload = {
    amount: params.amount,
    phone_number: formattedPhone,
    api_ref: params.orderId,
    narrative: 'Plug wa notes',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.detail ||
      data.message ||
      (Array.isArray(data.phone_number) ? data.phone_number.join(', ') : null) ||
      (Array.isArray(data.amount) ? data.amount.join(', ') : null) ||
      'IntaSend STK Push failed to initiate';
    throw new Error(errorMsg);
  }

  const invoiceId = data.invoice?.invoice_id || data.invoice_id || data.id || `IS-${Date.now()}`;
  const state = data.invoice?.state || data.state || 'PENDING';

  return {
    invoiceId,
    checkoutRequestId: invoiceId,
    state,
    customerMessage: 'Please enter your M-Pesa PIN on your phone to complete payment.',
  };
}

/**
 * Queries the invoice payment status on IntaSend
 */
export async function queryIntasendStatus(invoiceId: string): Promise<{
  state: string;
  completed: boolean;
  failed: boolean;
  failedReason?: string | null;
  mpesaReference?: string | null;
  raw: any;
}> {
  const config = getIntasendConfig();
  if (!config.secretKey) {
    throw new Error('IntaSend Secret Key is not configured');
  }

  const url = `${config.baseUrl}/api/v1/payment/status/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });

  const data = await response.json().catch(() => ({}));

  const invoice = data.invoice || data;
  const state = invoice?.state || data.state || 'UNKNOWN';
  const stateUpper = String(state).toUpperCase();

  const completed =
    stateUpper === 'COMPLETE' ||
    stateUpper === 'COMPLETED' ||
    stateUpper === 'SUCCESSFUL' ||
    stateUpper === 'SUCCESS' ||
    stateUpper === 'PAID';

  const failed =
    stateUpper === 'FAILED' ||
    stateUpper === 'CANCELED' ||
    stateUpper === 'CANCELLED' ||
    stateUpper === 'REJECTED';

  const failedReason = invoice?.failed_reason || data.detail || null;
  const mpesaReference = invoice?.mpesa_reference || invoice?.provider_ref || null;

  return {
    state: stateUpper,
    completed,
    failed,
    failedReason,
    mpesaReference,
    raw: data,
  };
}

/**
 * Verifies an M-Pesa confirmation code against IntaSend collections
 */
export async function verifyIntasendMpesaCode(mpesaCode: string): Promise<{
  verified: boolean;
  invoice?: any;
  amount?: number;
  phone?: string;
  error?: string;
}> {
  const config = getIntasendConfig();
  if (!config.secretKey) {
    throw new Error('IntaSend Secret Key is not configured');
  }

  const cleanCode = mpesaCode.trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 6) {
    return {
      verified: false,
      error: 'Please enter a valid M-Pesa transaction code (e.g. UJDHTA150X)',
    };
  }

  const url = `${config.baseUrl}/api/v1/invoices/?provider_ref=${encodeURIComponent(cleanCode)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return {
      verified: false,
      error: 'Could not contact payment verification gateway',
    };
  }

  const data = await response.json().catch(() => ({}));
  const results = data.results || [];
  const invoice =
    results.find((inv: any) => {
      const ref = (inv.provider_ref || inv.mpesa_reference || '').toUpperCase();
      return ref === cleanCode;
    }) || results[0];

  if (!invoice) {
    return {
      verified: false,
      error: 'M-Pesa code not found yet. If you just paid, please wait 30 seconds for Safaricom to sync and try again.',
    };
  }

  const state = String(invoice.state || '').toUpperCase();
  const isComplete =
    state === 'COMPLETE' ||
    state === 'COMPLETED' ||
    state === 'SUCCESSFUL' ||
    state === 'SUCCESS' ||
    state === 'PAID';

  if (!isComplete) {
    return {
      verified: false,
      error: `Transaction was found, but status is currently ${state}.`,
    };
  }

  return {
    verified: true,
    invoice,
    amount: Number(invoice.value || invoice.net_amount || 0),
    phone: invoice.account || '',
  };
}

