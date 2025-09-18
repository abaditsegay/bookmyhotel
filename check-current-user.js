// Paste this in browser console to check your current user info
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Current user info:', payload);
    console.log('User email:', payload.email);
    console.log('User roles:', payload.roles);
    console.log('Tenant ID:', payload.tenantId);
    console.log('User ID:', payload.userId);
} else {
    console.log('No token found');
}
