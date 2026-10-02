import crypto from 'crypto';

const BASE_URL = process.env.TEST_BASE_URL || 'https://www.inveins.in';
const SUPABASE_URL = 'https://jpbotzytaekgvewyxljl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYm90enl0YWVrZ3Zld3l4bGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTMwNDAsImV4cCI6MjEwMjU2OTA0MH0._NTo0-jHiKIksfnvcbFuaWjJ87dmXUBLjrY-14I6kPY';

const results = [];

function assert(name, condition, details = '') {
  if (condition) {
    results.push({ name, status: 'PASS', details });
    console.log(`  [PASS] ${name}`);
  } else {
    results.push({ name, status: 'FAIL', details });
    console.log(`  [FAIL] ${name}: ${details}`);
  }
}

async function runTests() {
  console.log('============================================================');
  console.log(`STARTING INVEINS PRODUCTION TEST SUITE: ${BASE_URL}`);
  console.log('============================================================\n');

  // TEST SUITE 1: DOMAIN, SSL & CANONICAL BEHAVIOR
  console.log('--- SUITE 1: DOMAIN & HTTPS REDIRECTS ---');
  try {
    const resRedirect = await fetch('https://inveins.in', { redirect: 'manual' });
    const isRedirect = resRedirect.status === 301 || resRedirect.status === 308;
    const location = resRedirect.headers.get('location') || '';
    assert('Apex domain (inveins.in) redirects to canonical www.inveins.in', isRedirect && location.includes('www.inveins.in'), `Status: ${resRedirect.status}, Location: ${location}`);
  } catch (err) {
    assert('Apex domain redirect check', false, err.message);
  }

  // TEST SUITE 2: SECURITY HEADERS
  console.log('\n--- SUITE 2: SECURITY HEADERS ---');
  try {
    const res = await fetch(BASE_URL);
    const headers = res.headers;

    assert('Strict-Transport-Security (HSTS) header present', Boolean(headers.get('strict-transport-security')), headers.get('strict-transport-security') || 'Missing');
    assert('X-Content-Type-Options is nosniff', headers.get('x-content-type-options') === 'nosniff', headers.get('x-content-type-options') || 'Missing');
    assert('X-Frame-Options is DENY or SAMEORIGIN', headers.get('x-frame-options') === 'DENY', headers.get('x-frame-options') || 'Missing');
    assert('Content-Security-Policy header present', Boolean(headers.get('content-security-policy')), 'Present');
    assert('Referrer-Policy header present', Boolean(headers.get('referrer-policy')), headers.get('referrer-policy') || 'Missing');
    assert('Permissions-Policy header present', Boolean(headers.get('permissions-policy')), headers.get('permissions-policy') || 'Missing');
  } catch (err) {
    assert('Security headers check', false, err.message);
  }

  // TEST SUITE 3: SEO INFRASTRUCTURE (robots.txt & sitemap.xml)
  console.log('\n--- SUITE 3: SEO & CRAWLABILITY ---');
  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robotsText = await robotsRes.text();
    assert('robots.txt returns HTTP 200', robotsRes.ok, `Status: ${robotsRes.status}`);
    assert('robots.txt disallows /admin and /api/*', robotsText.includes('Disallow: /admin') && robotsText.includes('Disallow: /api/*'), 'Admin/API properly protected from indexing');
    assert('robots.txt references sitemap.xml', robotsText.includes('sitemap.xml'), 'Sitemap referenced');

    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    assert('sitemap.xml returns HTTP 200', sitemapRes.ok, `Status: ${sitemapRes.status}`);
    assert('sitemap.xml contains canonical domain www.inveins.in', sitemapText.includes('https://www.inveins.in'), 'Canonical domain verified');
    assert('sitemap.xml contains product routes', sitemapText.includes('/product/'), 'Product routes present in sitemap');
  } catch (err) {
    assert('SEO infrastructure check', false, err.message);
  }

  // TEST SUITE 4: DATABASE & RLS ANONYMOUS LEAKAGE
  console.log('\n--- SUITE 4: DATABASE ROW LEVEL SECURITY (RLS) ---');
  try {
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/inveins_orders?select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    const ordersData = await ordersRes.json();
    const isLeaked = Array.isArray(ordersData) && ordersData.length > 0;
    assert(
      'Anon key CANNOT read customer orders from Supabase (RLS check)',
      !isLeaked,
      isLeaked ? `VULNERABILITY: ${ordersData.length} customer order records exposed to public anon key!` : 'Orders table protected by RLS'
    );

    const wsRes = await fetch(`${SUPABASE_URL}/rest/v1/inveins_wholesale_enquiries?select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    const wsData = await wsRes.json();
    const wsLeaked = Array.isArray(wsData) && wsData.length > 0;
    assert(
      'Anon key CANNOT read wholesale enquiries from Supabase (RLS check)',
      !wsLeaked,
      wsLeaked ? `VULNERABILITY: ${wsData.length} wholesale enquiries exposed to public anon key!` : 'Wholesale enquiries protected by RLS'
    );
  } catch (err) {
    assert('Supabase RLS check', false, err.message);
  }

  // TEST SUITE 5: ADMIN AUTHENTICATION & ACCESS CONTROL
  console.log('\n--- SUITE 5: ADMIN ACCESS CONTROL & IDOR ---');
  try {
    // 5.1 Admin routes rejected without session
    const listRes = await fetch(`${BASE_URL}/api/orders/list`);
    assert('GET /api/orders/list rejects unauthenticated guest (HTTP 401)', listRes.status === 401, `Status: ${listRes.status}`);

    const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert('GET /api/admin/dashboard rejects unauthenticated guest (HTTP 401)', dashRes.status === 401, `Status: ${dashRes.status}`);

    const wsListRes = await fetch(`${BASE_URL}/api/wholesale/list`);
    assert('GET /api/wholesale/list rejects unauthenticated guest (HTTP 401)', wsListRes.status === 401, `Status: ${wsListRes.status}`);

    // 5.2 Order IDOR check: accessing an order without verification token or admin session
    const orderIdorRes = await fetch(`${BASE_URL}/api/orders/INV-6EEBFE3B`);
    assert('GET /api/orders/[id] blocks unauthenticated IDOR order access (HTTP 403 or 404)', orderIdorRes.status === 403 || orderIdorRes.status === 404, `Status: ${orderIdorRes.status}`);

    // 5.3 Admin PIN wrong passcode rejected
    const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'wrong-passcode-test-12345' }),
    });
    assert('POST /api/admin/login rejects incorrect PIN (HTTP 401)', badLoginRes.status === 401, `Status: ${badLoginRes.status}`);
  } catch (err) {
    assert('Admin access control check', false, err.message);
  }

  // TEST SUITE 6: CASHFREE PAYMENT & WEBHOOK SECURITY
  console.log('\n--- SUITE 6: PAYMENT & WEBHOOK FORGERY TESTS ---');
  try {
    // 6.1 Forged webhook signature rejection
    const forgedWebhookRes = await fetch(`${BASE_URL}/api/payment/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'forged_fake_signature_abc123',
        'x-webhook-timestamp': String(Date.now()),
      },
      body: JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: { order_id: 'INV-FAKE-ORDER-999' },
          payment: { payment_status: 'SUCCESS', cf_payment_id: 'cf_fake_123' },
        },
      }),
    });
    assert('Cashfree webhook rejects forged signature (HTTP 401)', forgedWebhookRes.status === 401, `Status: ${forgedWebhookRes.status}`);

    // 6.2 Missing signature rejection
    const unsignedWebhookRes = await fetch(`${BASE_URL}/api/payment/cashfree-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: { order: { order_id: 'INV-FAKE-ORDER-999' } },
      }),
    });
    assert('Cashfree webhook rejects unsigned request (HTTP 401)', unsignedWebhookRes.status === 401, `Status: ${unsignedWebhookRes.status}`);

    // 6.3 Fake order verification rejection
    const fakeVerifyRes = await fetch(`${BASE_URL}/api/payment/cashfree-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: 'INV-NONEXISTENT-TEST-ORDER' }),
    });
    assert('Cashfree verify rejects non-existent/unpaid order', !fakeVerifyRes.ok, `Status: ${fakeVerifyRes.status}`);
  } catch (err) {
    assert('Payment security check', false, err.message);
  }

  // TEST SUITE 7: INPUT VALIDATION & HONEYPOT ABUSE PROTECTION
  console.log('\n--- SUITE 7: INPUT VALIDATION & HONEYPOT ---');
  try {
    // 7.1 Honeypot trigger on wholesale submit
    const botWholesaleRes = await fetch(`${BASE_URL}/api/wholesale/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spambot',
        email: 'spambot@example.com',
        phone: '9876543210',
        company_website_hp: 'http://spam-link.com', // Honeypot filled
      }),
    });
    assert('Wholesale submit rejects spambot when honeypot field is filled (HTTP 400)', botWholesaleRes.status === 400, `Status: ${botWholesaleRes.status}`);

    // 7.2 Invalid phone number rejection
    const badPhoneRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Test Customer',
          phone: '12345', // Invalid phone
          address: '123 Main St',
          city: 'Kanpur',
          pincode: '208001',
        },
        items: [{ productId: 'vintage-washed-heavyweight-tee-630', selectedSize: 'M', quantity: 1 }],
        paymentMethod: 'cod',
      }),
    });
    assert('Order create rejects invalid phone number (HTTP 400)', badPhoneRes.status === 400, `Status: ${badPhoneRes.status}`);

    // 7.3 Invalid pincode rejection
    const badPincodeRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Test Customer',
          phone: '9876543210',
          address: '123 Main St',
          city: 'Kanpur',
          pincode: '12', // Invalid pincode
        },
        items: [{ productId: 'vintage-washed-heavyweight-tee-630', selectedSize: 'M', quantity: 1 }],
        paymentMethod: 'cod',
      }),
    });
    assert('Order create rejects invalid pincode (HTTP 400)', badPincodeRes.status === 400, `Status: ${badPincodeRes.status}`);
  } catch (err) {
    assert('Input validation check', false, err.message);
  }

  // SUMMARY REPORT
  console.log('\n============================================================');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL AUDIT CHECKS: ${results.length} | PASS: ${passes} | FAIL: ${fails}`);
  console.log('============================================================\n');
}

runTests().catch(console.error);
