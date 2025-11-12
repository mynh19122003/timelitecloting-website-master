# Admin Dashboard - Test Checklist

## ✅ Testing Steps

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Middleware Protection

**Test A: Access /admin without login**
1. Open browser (incognito mode)
2. Navigate to: `http://localhost:3000/admin`
3. ✅ **Expected:** Redirects to `/admin/login`

**Test B: Access /admin/orders without login**
1. Navigate to: `http://localhost:3000/admin/orders`
2. ✅ **Expected:** Redirects to `/admin/login?redirect=/admin/orders`

**Test C: Login page is accessible**
1. Navigate to: `http://localhost:3000/admin/login`
2. ✅ **Expected:** Shows login form (no redirect)

### 3. Test Login Flow

**Test D: Invalid credentials**
1. Go to `/admin/login`
2. Enter: `test@test.com` / `wrong`
3. Click "Sign In"
4. ✅ **Expected:** Error message "Unable to sign in"

**Test E: Valid credentials**
1. Go to `/admin/login`
2. Enter valid admin credentials
3. Click "Sign In"
4. ✅ **Expected:** 
   - Redirects to `/admin`
   - Shows dashboard with stats
   - Sidebar visible

### 4. Test Authentication Persistence

**Test F: Refresh page**
1. After login, refresh page (F5)
2. ✅ **Expected:** Stays logged in, no redirect

**Test G: Check cookies**
1. Open DevTools (F12)
2. Go to Application > Cookies > localhost
3. ✅ **Expected:** See `adminToken` cookie

**Test H: Check localStorage**
1. Open DevTools > Console
2. Run: `localStorage.getItem('admin:token')`
3. ✅ **Expected:** Returns JWT token string

### 5. Test Navigation

**Test I: Navigate to Orders**
1. Click "Orders" in sidebar
2. ✅ **Expected:** URL changes to `/admin/orders`

**Test J: Navigate to Products**
1. Click "Products" in sidebar
2. ✅ **Expected:** URL changes to `/admin/products`

**Test K: Navigate to Customers**
1. Click "Customers" in sidebar
2. ✅ **Expected:** URL changes to `/admin/customers`

### 6. Test Logout

**Test L: Logout flow**
1. Click profile icon > Logout
2. ✅ **Expected:**
   - Redirects to `/admin/login`
   - Cannot access `/admin` anymore
   - Cookies cleared
   - localStorage cleared

### 7. Test Direct URL Access

**Test M: Access protected route after logout**
1. Logout first
2. Manually navigate to `/admin/orders`
3. ✅ **Expected:** Redirects to `/admin/login`

### 8. Test API Endpoints

**Test N: Check backend connection**
1. Open DevTools > Network tab
2. Login and go to dashboard
3. ✅ **Expected:** See successful API calls (200 status)

**Test O: Check auth headers**
1. In Network tab, click any API request
2. Check Headers > Request Headers
3. ✅ **Expected:** See `Authorization: Bearer <token>`

## 🔧 Debug Commands

### Check if middleware is running

```javascript
// In browser console
console.log('Current URL:', window.location.href);
console.log('Admin Token:', document.cookie.includes('adminToken'));
```

### Check localStorage

```javascript
console.log('LocalStorage admin:token:', localStorage.getItem('admin:token'));
console.log('LocalStorage admin:user:', localStorage.getItem('admin:user'));
```

### Clear all auth data

```javascript
// Clear localStorage
localStorage.clear();

// Clear cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Reload
location.reload();
```

## 🐛 Common Issues

### Issue 1: Redirect loop

**Symptoms:** Page keeps redirecting between `/admin` and `/admin/login`

**Fix:**
```bash
# Clear cookies in DevTools
# Application > Storage > Clear site data
```

### Issue 2: "Cannot read property 'role' of null"

**Symptoms:** Error in console after login

**Fix:** Check backend response includes `user.role` field

### Issue 3: 401 Unauthorized

**Symptoms:** All API calls return 401

**Fix:**
1. Check backend is running on port 3001
2. Verify token in cookies matches localStorage
3. Re-login

### Issue 4: Sidebar not showing

**Symptoms:** After login, only blank page

**Fix:**
1. Check console for errors
2. Verify `DashboardLayout` is loading
3. Check CSS is imported: `src/admin/styles.css`

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Test A: Redirect to login (no auth)
[ ] Test B: Protected route redirect
[ ] Test C: Login page accessible
[ ] Test D: Invalid credentials
[ ] Test E: Valid credentials
[ ] Test F: Refresh persistence
[ ] Test G: Cookies set
[ ] Test H: localStorage set
[ ] Test I: Orders navigation
[ ] Test J: Products navigation
[ ] Test K: Customers navigation
[ ] Test L: Logout flow
[ ] Test M: Protected after logout
[ ] Test N: Backend connection
[ ] Test O: Auth headers

Notes:
___________________________________________
___________________________________________
```

## 🎯 Quick Test Script

```javascript
// Run in browser console after login
(async function testAdmin() {
  const tests = [];
  
  // Test 1: Check token
  const token = localStorage.getItem('admin:token');
  tests.push({ name: 'Token exists', pass: !!token });
  
  // Test 2: Check cookie
  const hasCookie = document.cookie.includes('adminToken');
  tests.push({ name: 'Cookie exists', pass: hasCookie });
  
  // Test 3: Check user
  const user = JSON.parse(localStorage.getItem('admin:user') || 'null');
  tests.push({ name: 'User exists', pass: !!user });
  tests.push({ name: 'User is admin', pass: user?.role === 'admin' });
  
  // Test 4: Check current page
  tests.push({ name: 'On admin page', pass: location.pathname.startsWith('/admin') });
  
  console.table(tests);
  const passed = tests.filter(t => t.pass).length;
  console.log(`✅ Passed: ${passed}/${tests.length}`);
})();
```

