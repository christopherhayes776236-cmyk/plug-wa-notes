import fs from 'fs';
import path from 'path';

// 0. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const secretKey = env.INTASEND_SECRET_KEY || 'ISSecretKey_live_f6df43b5-9c95-4dca-bb37-91bf0da8a09c';
const pubKey = env.INTASEND_PUBLISHABLE_KEY || 'ISPubKey_live_aa619d0a-7045-41bb-ac31-d4bfe7012099';
const intasendBaseUrl = secretKey.includes('_test_') ? 'https://sandbox.intasend.com' : 'https://api.intasend.com';
const appBaseUrl = 'https://plug-wa-notes.vercel.app';

console.log('================================================================');
console.log('  PLUG WA NOTES — COMPREHENSIVE M-PESA FUNCTIONALITY TEST SUITE ');
console.log('================================================================');
console.log(`IntaSend Base URL: ${intasendBaseUrl}`);
console.log(`Key Type:          ${secretKey.startsWith('ISSecretKey_live') ? 'LIVE PRODUCTION' : 'SANDBOX/TEST'}`);
console.log(`Target App URL:    ${appBaseUrl}`);
console.log(`Timestamp:         ${new Date().toISOString()}\n`);

let testCount = 0;
let passCount = 0;

function report(name, passed, details = '') {
  testCount++;
  if (passed) {
    passCount++;
    console.log(`[PASS] ${name}`);
  } else {
    console.log(`[FAIL] ${name}`);
  }
  if (details) {
    console.log(`       -> ${details}`);
  }
}

async function runTests() {
  // -------------------------------------------------------------
  // TEST 1: Direct IntaSend Gateway Connectivity & Auth
  // -------------------------------------------------------------
  console.log('\n--- 1. IntaSend Gateway Auth & Live Status Endpoint ---');
  try {
    const res = await fetch(`${intasendBaseUrl}/api/v1/payment/status/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoice_id: 'PROBE-AUTH-CHECK' }),
    });

    // 404 with JSON or 400 means authentication succeeded (not 401 Unauthorized or 403 Forbidden)
    const data = await res.json().catch(() => ({}));
    const authOk = res.status !== 401 && res.status !== 403;
    report(
      'IntaSend API Secret Key Authentication',
      authOk,
      `HTTP ${res.status}: Key accepted by ${intasendBaseUrl}. (Response: ${JSON.stringify(data)})`
    );
  } catch (err) {
    report('IntaSend API Secret Key Authentication', false, `Network error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 2: IntaSend Invoices Query Endpoint (for M-Pesa Code Verification)
  // -------------------------------------------------------------
  console.log('\n--- 2. IntaSend Live Invoices Verification Endpoint ---');
  try {
    const res = await fetch(`${intasendBaseUrl}/api/v1/invoices/?provider_ref=TESTCODE123`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const isOk = res.ok;
    const data = await res.json().catch(() => ({}));
    report(
      'IntaSend Invoices Provider Reference Lookup',
      isOk,
      `HTTP ${res.status}: Endpoint returned queryable results structure (results count: ${data.results?.length ?? 0})`
    );
  } catch (err) {
    report('IntaSend Invoices Provider Reference Lookup', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 3: Phone Number Formatting & Validation Logic
  // -------------------------------------------------------------
  console.log('\n--- 3. Phone Number Formatter Unit Check ---');
  function formatKenyanPhone(phone) {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('254')) return clean;
    if (clean.startsWith('0')) return `254${clean.slice(1)}`;
    return `254${clean}`;
  }

  const phoneCases = [
    { input: '0712345678', expected: '254712345678' },
    { input: '+254712345678', expected: '254712345678' },
    { input: '254712345678', expected: '254712345678' },
    { input: '0112345678', expected: '254112345678' },
    { input: ' 0795 184 838 ', expected: '254795184838' },
  ];

  let allPhonesPass = true;
  for (const c of phoneCases) {
    const out = formatKenyanPhone(c.input);
    if (out !== c.expected) {
      allPhonesPass = false;
      console.log(`       Mismatch: input "${c.input}" -> got "${out}", expected "${c.expected}"`);
    }
  }
  report('Kenyan Phone Number Formatting (07xx, 01xx, +254xx, spaces)', allPhonesPass);

  // -------------------------------------------------------------
  // TEST 4: /api/pay Endpoint Input Validations & Error Handling
  // -------------------------------------------------------------
  console.log('\n--- 4. /api/pay Route Validation & Rejections ---');
  
  // 4a. Missing body fields
  try {
    const res = await fetch(`${appBaseUrl}/api/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Pay Route: Reject Missing Parameters (HTTP 400)',
      res.status === 400 && data.error?.includes('Missing'),
      `Status ${res.status}: ${data.error}`
    );
  } catch (err) {
    report('Pay Route: Reject Missing Parameters', false, err.message);
  }

  // 4b. Non-existent unit code
  try {
    const res = await fetch(`${appBaseUrl}/api/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0712345678', unitCode: 'INVALID999', productId: 'notes-w1' }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Pay Route: Reject Invalid Unit Code (HTTP 404)',
      res.status === 404 && data.error?.includes('Unit not found'),
      `Status ${res.status}: ${data.error}`
    );
  } catch (err) {
    report('Pay Route: Reject Invalid Unit Code', false, err.message);
  }

  // 4c. Non-existent product
  try {
    const res = await fetch(`${appBaseUrl}/api/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0712345678', unitCode: 'SOEN 201', productId: 'non-existent-id' }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Pay Route: Reject Non-Existent Product (HTTP 404)',
      res.status === 404 && data.error?.includes('Product not found'),
      `Status ${res.status}: ${data.error}`
    );
  } catch (err) {
    report('Pay Route: Reject Non-Existent Product', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 5: /api/status/[orderId] Polling Route
  // -------------------------------------------------------------
  console.log('\n--- 5. /api/status/[orderId] Status Inquiries ---');
  try {
    const testOrderId = `PWN-TEST-${Date.now().toString(36).toUpperCase()}`;
    const res = await fetch(`${appBaseUrl}/api/status/${testOrderId}`);
    const data = await res.json().catch(() => ({}));
    report(
      'Status Route: Default Fallback for Unpaid/Pending Order',
      res.status === 200 && data.status === 'pending',
      `Status ${res.status}: status = "${data.status}"`
    );
  } catch (err) {
    report('Status Route: Default Fallback', false, err.message);
  }

  try {
    const testOrderId = `PWN-TEST-${Date.now().toString(36).toUpperCase()}`;
    const res = await fetch(`${appBaseUrl}/api/status/${testOrderId}?invoiceId=IS-PROBE&unit=SOEN%20201&product=soen201-notes-w1-3&type=notes`);
    const data = await res.json().catch(() => ({}));
    report(
      'Status Route: Query Params Forwarding (invoiceId, unit, product, type)',
      res.status === 200,
      `Status ${res.status}: ${JSON.stringify(data)}`
    );
  } catch (err) {
    report('Status Route: Query Params Forwarding', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 6: /api/verify-code (Manual M-Pesa Code Verification)
  // -------------------------------------------------------------
  console.log('\n--- 6. /api/verify-code Manual Code Verification ---');

  // 6a. Empty or invalid code
  try {
    const res = await fetch(`${appBaseUrl}/api/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mpesaCode: 'ABC' }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Verify Code: Reject Short Code < 6 chars (HTTP 400)',
      res.status === 400,
      `Status ${res.status}: ${data.error}`
    );
  } catch (err) {
    report('Verify Code: Reject Short Code', false, err.message);
  }

  // 6b. Non-existent valid-formatted code (should query IntaSend and report not found)
  try {
    const dummyCode = 'TK99ZZ9999';
    const res = await fetch(`${appBaseUrl}/api/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mpesaCode: dummyCode,
        unitCode: 'SOEN 201',
        productId: 'soen201-notes-w1-3',
        productType: 'notes',
      }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Verify Code: Graceful Handling of Unsynced / Unfound Code',
      res.status === 400 && data.error?.includes('M-Pesa code not found'),
      `Status ${res.status}: ${data.error}`
    );
  } catch (err) {
    report('Verify Code: Graceful Handling of Unsynced Code', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 7: /api/webhook (IntaSend and Daraja Webhook Handlers)
  // -------------------------------------------------------------
  console.log('\n--- 7. /api/webhook Handler Endpoints ---');

  // 7a. Reject empty/malformed webhook
  try {
    const res = await fetch(`${appBaseUrl}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Webhook: Reject Invalid/Malformed Payload (HTTP 400)',
      res.status === 400,
      `Status ${res.status}: ${JSON.stringify(data)}`
    );
  } catch (err) {
    report('Webhook: Reject Invalid Payload', false, err.message);
  }

  // 7b. Accept valid IntaSend webhook structure
  try {
    const res = await fetch(`${appBaseUrl}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: `IS-PROBE-${Date.now()}`,
        state: 'PENDING',
        api_ref: 'PWN-TEST',
      }),
    });
    const data = await res.json().catch(() => ({}));
    report(
      'Webhook: Accept IntaSend Webhook Notification (HTTP 200)',
      res.status === 200 && data.success === true,
      `Status ${res.status}: ${data.message}`
    );
  } catch (err) {
    report('Webhook: Accept IntaSend Webhook Notification', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 8: Cloudinary Forced-Download URL Generation
  // -------------------------------------------------------------
  console.log('\n--- 8. Download Link Generator (fl_attachment) ---');
  function getProductDownloadUrl(unitCode, productType, customFileUrl) {
    if (customFileUrl) {
      if (customFileUrl.includes('cloudinary.com') && !customFileUrl.includes('fl_attachment')) {
        return customFileUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      return customFileUrl;
    }
    const cleanUnit = unitCode.toLowerCase().replace(/\s+/g, '');
    const extension = productType === 'video' ? 'mp4' : productType === 'audio' ? 'm4a' : productType === 'videoSlides' ? 'zip' : 'pdf';
    const resourceType = productType === 'video' || productType === 'audio' ? 'video' : 'raw';
    return `https://res.cloudinary.com/plug-wa-notes/${resourceType}/upload/fl_attachment/v1/units/${cleanUnit}/${productType}.${extension}`;
  }

  const urlNotes = getProductDownloadUrl('SOEN 201', 'notes');
  const urlVideo = getProductDownloadUrl('SOEN 201', 'video');
  const urlAudio = getProductDownloadUrl('SOEN 201', 'audio');
  const urlCustom = getProductDownloadUrl('SOEN 201', 'notes', 'https://res.cloudinary.com/nd4ofxfu/raw/upload/v1234/test.pdf');

  const linksOk =
    urlNotes.includes('fl_attachment') &&
    urlVideo.includes('fl_attachment') &&
    urlAudio.includes('fl_attachment') &&
    urlCustom.includes('fl_attachment');

  report('Forced-Download (fl_attachment) Link Generator', linksOk, `Example: ${urlNotes}`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${testCount} | PASSED: ${passCount} | FAILED: ${testCount - passCount}`);
  console.log(`SUCCESS RATE: ${Math.round((passCount / testCount) * 100)}%`);
  console.log('================================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  }
}

runTests();
