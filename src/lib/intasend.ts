/**
 * IntaSend Payment Gateway Helper
 * Direct M-Pesa STK Push and Status Verification
 */

export interface IntasendConfig {
  publishableKey: string;
  secretKey: string;
  baseUrl: string;
}

export function getIntasendConfig(): IntasendConfig {
  const secretKey = process.env.INTASEND_SECRET_KEY || '';
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY || '';
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
    api_ref: params.accountReference || 'Plug wa notes',
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

  const invoiceId = data.invoice?.invoice_id || data.id || `IS-${Date.now()}`;
  const state = data.invoice?.state || 'PENDING';

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

  const state = data.invoice?.state || data.state || 'UNKNOWN';
  const stateUpper = String(state).toUpperCase();

  const completed = stateUpper === 'COMPLETE' || stateUpper === 'SUCCESSFUL' || stateUpper === 'SUCCESS';
  const failed = stateUpper === 'FAILED' || stateUpper === 'CANCELLED' || stateUpper === 'REJECTED';

  return {
    state: stateUpper,
    completed,
    failed,
    raw: data,
  };
}
