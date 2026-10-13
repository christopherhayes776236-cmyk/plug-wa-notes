import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const secretKey = env.INTASEND_SECRET_KEY;
const phone = '254795184838'; // 0795184838 formatted
const amount = 10; // 10 KES test
const orderId = `PWN-TEST-${Date.now().toString(36).toUpperCase()}`;

console.log('--- Testing IntaSend Live M-Pesa STK Push ---');
console.log('Endpoint:', 'https://api.intasend.com/api/v1/payment/mpesa-stk-push/');
console.log('Phone:', phone);
console.log('Amount:', amount, 'KES');
console.log('Order ID:', orderId);
console.log('Secret Key starts with:', secretKey ? secretKey.substring(0, 18) + '...' : 'MISSING');

async function testPush() {
  try {
    const res = await fetch('https://api.intasend.com/api/v1/payment/mpesa-stk-push/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        phone_number: phone,
        api_ref: 'Plug wa notes',
        narrative: 'Plug wa notes',
      }),
    });

    const status = res.status;
    const data = await res.json().catch(() => null);

    console.log('\nResponse HTTP Status:', status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log('\n>>> SUCCESS! STK Push was sent to phone 0795184838!');
      console.log('Invoice ID:', data?.invoice?.invoice_id);
      console.log('State:', data?.invoice?.state);
    } else {
      console.log('\n>>> FAILED to send STK Push.');
    }
  } catch (err) {
    console.error('Network/Execution error:', err);
  }
}

testPush();
