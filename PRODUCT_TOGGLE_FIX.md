## Solution for Product Toggle 400 Error

### The Issue
The `PATCH /api/hotels/1/shop/products/20/toggle-active` endpoint is returning a 400 Bad Request error in the frontend, but the same API call works perfectly when tested directly.

### Analysis
- ✅ User has correct role: `HOTEL_ADMIN`
- ✅ API endpoint works correctly  
- ✅ Authorization logic is correct
- ❌ Frontend request fails with 400 error

### Root Cause
The issue is likely in the frontend token or authentication state. The frontend may be:
1. Using an expired token
2. Using a token for a different user
3. Missing the token entirely

### Solution

#### Quick Fix: Re-login in Frontend
1. Log out of the frontend application
2. Log back in with credentials: `bookmyhotel2025+newhotel001@gmail.com` / `password`
3. Try the product toggle again

#### Debug Steps (if needed):
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Check localStorage for `auth_token`
4. If token exists, check if it's valid by decoding the JWT payload
5. If token is missing or expired, clear localStorage and re-login

#### Verify Fix:
```javascript
// Open browser console and run:
const token = localStorage.getItem('auth_token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Current user:', payload);
    console.log('Token expires:', new Date(payload.exp * 1000));
} else {
    console.log('No token found - please login');
}
```

### Technical Details
- User `bookmyhotel2025+newhotel001@gmail.com` has `HOTEL_ADMIN` role
- API endpoint requires `HOTEL_ADMIN` or `SYSTEM_ADMIN` role
- Backend logs show "Access Denied" error, indicating authorization failure
- Same API call works perfectly when tested with fresh token

### Alternative Test
If re-login doesn't work, you can test with the working credentials by running:
```bash
node test-frontend-toggle.js
```

This confirms the API works and will give you a fresh token for debugging.
