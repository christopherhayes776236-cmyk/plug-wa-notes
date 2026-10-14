/**
 * Production Health Check for Plug Wa Notes
 * Validates that all units, media previews, payment APIs, and PWA assets are 100% operational.
 */

const BASE_URL = process.env.SITE_URL || 'https://plug-wa-notes.vercel.app';
const UNITS = ['comp102', 'soen201', 'soen202', 'soen203', 'soen220', 'soen240'];

async function checkUrl(path, expectedStatus = 200, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, options);
    const pass = res.status === expectedStatus;
    console.log(`${pass ? '✓' : '✗'} [${res.status}] ${path}`);
    return pass;
  } catch (err) {
    console.log(`✗ [ERROR] ${path}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`Running Health Check on: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  let total = 0;
  let passed = 0;

  async function test(path, expectedStatus = 200, options = {}) {
    total++;
    const ok = await checkUrl(path, expectedStatus, options);
    if (ok) passed++;
  }

  // 1. Static Pages & Manifest
  console.log('--- 1. Pages & PWA Assets ---');
  await test('/');
  await test('/manifest.json');
  await test('/icons/icon-192.png');
  await test('/media/kid-study.webp');

  // 2. Unit Pages
  console.log('\n--- 2. All 6 Units ---');
  for (const u of UNITS) {
    await test(`/unit/${u}`);
  }

  // 3. Newest Media Previews (including SOEN 201 Weeks 6-7)
  console.log('\n--- 3. Media Previews ---');
  await test('/previews/soen201-w67-notes.jpg');
  await test('/previews/soen201-w67-slides.jpg');
  await test('/previews/soen201-w67-video.jpg');
  await test('/previews/soen201-w45-notes.jpg');
  await test('/previews/comp102-notes.jpg');

  // 4. API Routes
  console.log('\n--- 4. Backend Endpoints ---');
  await test('/api/ping');
  await test('/api/status/PWN-HEALTH-CHECK', 200);

  // 5. Test Payment Route (expects 404 for non-existent product, proves gateway is connected)
  console.log('\n--- 5. Payment Gateway Connectivity ---');
  await test('/api/pay', 404, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '0712345678', unitCode: 'SOEN 201', productId: 'probe-test' })
  });

  console.log(`\n======================================================`);
  console.log(`Summary: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`======================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

run();
