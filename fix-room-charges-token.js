// Run this in the browser console to debug and fix the hotel ID issue

console.log('🔍 Hotel ID Debug for Room Charges');

// 1. Check current token
const currentToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
console.log('Current token exists:', !!currentToken);

if (currentToken) {
    console.log('Current token preview:', currentToken.substring(0, 50) + '...');
    
    // Decode payload
    try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        console.log('Current token info:');
        console.log('- Email:', payload.email);
        console.log('- Hotel ID:', payload.hotelId);
        console.log('- Tenant ID:', payload.tenantId);
        console.log('- Roles:', payload.roles);
        console.log('- Expires:', new Date(payload.exp * 1000));
        console.log('- Is expired?', Date.now() > payload.exp * 1000);
    } catch (e) {
        console.error('❌ Failed to decode current token:', e);
    }
}

// 2. Check auth_user localStorage (used by AuthContext)
const authUser = localStorage.getItem('auth_user');
console.log('AuthContext user exists:', !!authUser);

if (authUser) {
    try {
        const user = JSON.parse(authUser);
        console.log('AuthContext user info:');
        console.log('- Email:', user.email);
        console.log('- Hotel ID:', user.hotelId);
        console.log('- Tenant ID:', user.tenantId);
        console.log('- Roles:', user.roles);
        
        // Check if this is the Sheraton user
        if (user.email === 'hotel.admin@sheraton-addis.et') {
            console.log('✅ Sheraton user detected - checking token match...');
        } else {
            console.log('⚠️ Different user in localStorage');
        }
    } catch (e) {
        console.error('❌ Failed to decode auth_user:', e);
    }
}

// 3. Fix the hotel ID issue for Sheraton user
console.log('🔧 Fixing authentication for Sheraton Addis Ababa...');

// Create the correct user object for Sheraton admin
const correctedUser = {
    id: "118",
    email: "hotel.admin@sheraton-addis.et",
    firstName: "Hawaryat",
    lastName: "Bekele", 
    phone: "",
    role: "HOTEL_ADMIN",
    roles: ["HOTEL_ADMIN"],
    tenantId: "ethiopian-heritage",
    hotelId: "14", // Sheraton Addis Ababa
    hotelName: "Sheraton Addis Ababa",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    isSystemWide: false,
    isTenantBound: true
};

// Set the corrected user in localStorage
localStorage.setItem('auth_user', JSON.stringify(correctedUser));
console.log('✅ Updated auth_user for Sheraton Addis Ababa');

// Set the correct working token for Sheraton user
const workingToken = 'eyJhbGciOiJIUzUxMiJ9.eyJmaXJzdE5hbWUiOiJIYXdhcnlhdCIsImxhc3ROYW1lIjoiQmVrZWxlIiwicm9sZXMiOlsiSE9URUxfQURNSU4iXSwidGVuYW50SWQiOiJldGhpb3BpYW4taGVyaXRhZ2UiLCJ1c2VySWQiOjExOCwiZW1haWwiOiJob3RlbC5hZG1pbkBzaGVyYXRvbi1hZGRpcy5ldCIsInN1YiI6ImhvdGVsLmFkbWluQHNoZXJhdG9uLWFkZGlzLmV0IiwiaWF0IjoxNzU2MzIzNTk0LCJleHAiOjE3NTY0MDk5OTR9.FU7T94Ke3LLO2EM2RYp0TNjA5stj1hMfGMK_gQHRDs7aNVcaBIAZDdqEKF-p1GkRmrdpOX7kPJjFT0rUhbgu6g';

console.log('🔧 Setting correct Sheraton token...');
localStorage.setItem('auth_token', workingToken);

// 4. Test the API with the correct hotel ID
console.log('🧪 Testing Room Charges API for Sheraton (hotel ID 14)...');

fetch('http://localhost:8080/api/room-charges/hotel/14?page=0&size=20', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingToken}`,
    },
    credentials: 'include',
})
.then(response => {
    console.log('✅ API Response Status:', response.status);
    if (response.ok) {
        return response.json();
    } else {
        return response.text().then(text => {
            throw new Error(`HTTP ${response.status}: ${text}`);
        });
    }
})
.then(data => {
    console.log('✅ API Success! Room charges data:', data);
    console.log('📊 Found', data.page?.totalElements || 0, 'room charges for Sheraton');
})
.catch(error => {
    console.error('❌ API Error:', error);
});

console.log('🔄 Now refresh the page to see the room charges for Sheraton!');

// 5. Trigger a storage event to update the app immediately  
window.dispatchEvent(new StorageEvent('storage', {
    key: 'auth_user',
    newValue: JSON.stringify(correctedUser),
    storageArea: localStorage
}));

window.dispatchEvent(new StorageEvent('storage', {
    key: 'auth_token',
    newValue: workingToken,
    storageArea: localStorage
}));
