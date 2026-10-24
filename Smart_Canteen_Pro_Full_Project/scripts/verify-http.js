const http = require('http');

async function testHttpEndpoints() {
  console.log('Testing live HTTP endpoints against http://localhost:3000...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  // Helper fetch with cookie jar
  let studentCookie = '';
  let staffCookie = '';
  let adminCookie = '';

  // 1. Homepage
  try {
    const res = await fetch('http://localhost:3000/');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    console.log('[PASS] HTTP Test 1: Homepage (/) renders with 200 OK');
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 1:', e.message);
    failed++;
  }

  // 2. Menu Page
  try {
    const res = await fetch('http://localhost:3000/menu');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    console.log('[PASS] HTTP Test 2: Menu page (/menu) renders with 200 OK');
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 2:', e.message);
    failed++;
  }

  // 3. API Categories
  try {
    const res = await fetch('http://localhost:3000/api/categories');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.categories && data.categories.length >= 10, 'Expected at least 10 categories');
    console.log(`[PASS] HTTP Test 3: /api/categories returned ${data.categories.length} categories`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 3:', e.message);
    failed++;
  }

  // 4. API Crowd Indicator & Smart Wait Estimation
  try {
    const res = await fetch('http://localhost:3000/api/crowd');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.prediction && data.prediction.estimatedWaitMinutes > 0, 'Wait estimate should be positive');
    console.log(`[PASS] HTTP Test 4: /api/crowd returned prediction (${data.prediction.crowdLabel}, ~${data.prediction.estimatedWaitMinutes}m wait)`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 4:', e.message);
    failed++;
  }

  // 5. Student Login
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@rscoe.edu', password: 'Student@123' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.user && data.user.role === 'STUDENT', 'User role should be STUDENT');
    studentCookie = res.headers.get('set-cookie') || `scp_token=${data.token}`;
    console.log(`[PASS] HTTP Test 5: Student login successful (${data.user.name}, Roll: ${data.user.studentId})`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 5:', e.message);
    failed++;
  }

  // 6. Validate Coupon API
  try {
    const res = await fetch('http://localhost:3000/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME20', subtotal: 150 })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.valid === true, 'Coupon should be valid');
    assert(data.coupon.discountAmount === 30, `Expected discount 30, got ${data.coupon.discountAmount}`);
    console.log(`[PASS] HTTP Test 6: /api/coupons correctly validated WELCOME20 (Discount: ₹${data.coupon.discountAmount})`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 6:', e.message);
    failed++;
  }

  // 7. Staff Login & Verification Test
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@canteen.rscoe.edu', password: 'Staff@123' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.user && data.user.role === 'STAFF', 'Role should be STAFF');
    staffCookie = res.headers.get('set-cookie') || `scp_token=${data.token}`;
    console.log(`[PASS] HTTP Test 7: Staff login successful (${data.user.name})`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 7:', e.message);
    failed++;
  }

  // 8. Staff Token Verification API (Reject invalid token)
  try {
    const res = await fetch('http://localhost:3000/api/orders/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': staffCookie,
      },
      body: JSON.stringify({ tokenNumber: 'SC-INVALID-9999' })
    });
    assert(res.status === 404, `Expected 404 for invalid token, got ${res.status}`);
    console.log('[PASS] HTTP Test 8: Staff /api/orders/verify-token correctly rejected non-existent token');
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 8:', e.message);
    failed++;
  }

  // 9. Admin Login
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@canteen.rscoe.edu', password: 'Admin@123' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.user && data.user.role === 'ADMIN', 'Role should be ADMIN');
    adminCookie = res.headers.get('set-cookie') || `scp_token=${data.token}`;
    console.log(`[PASS] HTTP Test 9: Admin login successful (${data.user.name})`);
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 9:', e.message);
    failed++;
  }

  // 10. Admin Export Sales CSV
  try {
    const res = await fetch('http://localhost:3000/api/reports/export-csv', {
      headers: { 'Cookie': adminCookie }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('Smart Canteen Pro report'), 'CSV must contain title header');
    assert(text.includes('Gross sales (₹)'), 'CSV must contain financial metrics');
    assert(text.includes('Masala Chai'), 'CSV must list ordered items');
    console.log('[PASS] HTTP Test 10: /api/reports/export-csv successfully generated matching sales report CSV');
    passed++;
  } catch (e) {
    console.error('[FAIL] HTTP Test 10:', e.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`Live HTTP Verification: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

testHttpEndpoints().catch(e => {
  console.error(e);
  process.exit(1);
});
