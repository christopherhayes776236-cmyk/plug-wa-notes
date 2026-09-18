/**
 * Safaricom Daraja API Helper
 * Direct integration with Lipa Na M-Pesa Online (STK Push)
 */

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  paybill: string;
  callbackUrl: string;
  env: 'sandbox' | 'production';
}

export function getMpesaConfig(): MpesaConfig {
  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    passkey: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', // Default sandbox passkey
    paybill: process.env.MPESA_PAYBILL || '174379', // Default sandbox paybill
    callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://plug-wa-notes.vercel.app/api/webhook',
    env: (process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  };
}

export function getBaseUrl(env: 'sandbox' | 'production'): string {
  return env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

// In-memory token cache for serverless execution lifecycle
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  const config = getMpesaConfig();

  // If no credentials are configured yet, return a mock token for sandbox dev
  if (!config.consumerKey || !config.consumerSecret) {
    return 'mock_sandbox_access_token';
  }

  // Check valid cache (expires within 5 minutes grace period)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const url = `${getBaseUrl(config.env)}/oauth/v1/generate?grant_type=client_credentials`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Daraja access token: ${errText}`);
  }

  const data = await response.json();
  const expiresIn = parseInt(data.expires_in, 10) || 3599;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return data.access_token;
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

export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

export interface StkPushParams {
  phone: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface StkPushResult {
  checkoutRequestId: string;
  responseCode: string;
  customerMessage: string;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  const config = getMpesaConfig();
  const formattedPhone = formatKenyanPhone(params.phone);
  const timestamp = generateTimestamp();
  const password = generatePassword(config.paybill, config.passkey, timestamp);

  // If no credentials configured, simulate a successful sandbox STK push response
  if (!config.consumerKey || !config.consumerSecret) {
    return {
      checkoutRequestId: `ws_CO_${Date.now()}_mock`,
      responseCode: '0',
      customerMessage: 'Success. Request accepted for processing',
    };
  }

  const token = await getAccessToken();
  const url = `${getBaseUrl(config.env)}/mpesa/stkpush/v1/processrequest`;

  const payload = {
    BusinessShortCode: config.paybill,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: params.amount,
    PartyA: formattedPhone,
    PartyB: config.paybill,
    PhoneNumber: formattedPhone,
    CallBackURL: config.callbackUrl,
    AccountReference: params.orderId.slice(0, 12),
    TransactionDesc: params.description.slice(0, 30),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.ResponseCode !== '0') {
    throw new Error(data.errorMessage || data.ResponseDescription || 'STK Push failed to initiate');
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    responseCode: data.ResponseCode,
    customerMessage: data.CustomerMessage,
  };
}

export async function queryStkStatus(checkoutRequestId: string): Promise<{
  resultCode: string;
  resultDesc: string;
}> {
  const config = getMpesaConfig();
  const timestamp = generateTimestamp();
  const password = generatePassword(config.paybill, config.passkey, timestamp);

  // Mock response for dev when credentials are missing
  if (!config.consumerKey || !config.consumerSecret) {
    return {
      resultCode: '0',
      resultDesc: 'The service request is processed successfully.',
    };
  }

  const token = await getAccessToken();
  const url = `${getBaseUrl(config.env)}/mpesa/stkpushquery/v1/query`;

  const payload = {
    BusinessShortCode: config.paybill,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return {
    resultCode: data.ResultCode,
    resultDesc: data.ResultDesc,
  };
}
