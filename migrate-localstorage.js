// Emergency localStorage cleanup and migration script
// Run this in browser console to fix token inconsistencies

console.log('🔧 Starting localStorage cleanup and migration...');

// Step 1: Debug current state
console.log('📊 Current localStorage state:');
console.log('- auth_token:', !!localStorage.getItem('auth_token'));
console.log('- auth_user:', !!localStorage.getItem('auth_user'));
console.log('- token (legacy):', !!localStorage.getItem('token'));
console.log('- authToken (legacy):', !!localStorage.getItem('authToken'));

// Step 2: Get current user info
let currentUser = null;
try {
  const authUserData = localStorage.getItem('auth_user');
  if (authUserData) {
    currentUser = JSON.parse(authUserData);
    console.log('👤 Current user:', currentUser.email, 'Hotel ID:', currentUser.hotelId);
  }
} catch (e) {
  console.error('❌ Failed to parse auth_user data');
}

// Step 3: Get current valid token
const currentToken = localStorage.getItem('auth_token');
if (currentToken) {
  try {
    const payload = JSON.parse(atob(currentToken.split('.')[1]));
    console.log('🎫 Current token info:');
    console.log('- Email:', payload.email);
    console.log('- Tenant:', payload.tenantId);
    console.log('- User ID:', payload.userId);
    console.log('- Expires:', new Date(payload.exp * 1000));
    
    // Step 4: Verify token matches user
    if (currentUser && currentUser.email !== payload.email) {
      console.log('⚠️ Token/User mismatch detected!');
      console.log('Token email:', payload.email);
      console.log('User email:', currentUser.email);
    }
  } catch (e) {
    console.error('❌ Failed to decode current token');
  }
}

// Step 5: Clean up legacy tokens
console.log('🧹 Cleaning up legacy token storage...');
localStorage.removeItem('token');        // Legacy from old debug scripts
localStorage.removeItem('authToken');    // Legacy from operations modules

// Step 6: Validate consistency
console.log('✅ Cleanup complete. Final state:');
console.log('- auth_token:', !!localStorage.getItem('auth_token'));
console.log('- auth_user:', !!localStorage.getItem('auth_user'));
console.log('- Legacy tokens removed');

// Step 7: Test API call with correct token
if (currentToken) {
  console.log('🧪 Testing API with cleaned up token...');
  fetch('http://localhost:8080/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API test result:', response.status);
    if (response.ok) {
      console.log('✅ API authentication working correctly');
    } else {
      console.log('❌ API authentication failed');
    }
  })
  .catch(error => {
    console.log('❌ API test failed:', error.message);
  });
}

console.log('🎉 Migration completed! Refresh the page to see changes.');

// Step 8: Force storage events to notify React components
window.dispatchEvent(new StorageEvent('storage', {
  key: 'auth_token',
  newValue: currentToken,
  storageArea: localStorage
}));

if (currentUser) {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'auth_user',
    newValue: JSON.stringify(currentUser),
    storageArea: localStorage
  }));
}
