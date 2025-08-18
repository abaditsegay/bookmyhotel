// Helper script to set authentication for testing
// Run this in browser console to authenticate as hotel admin

// For debugging purposes, use proper authentication instead of hardcoded tokens
const token = localStorage.getItem('auth_token') || prompt('Enter your JWT token:');

const user = {
  id: "9",
  email: "hoteladmin@bookmyhotel.com",
  firstName: "Sarah",
  lastName: "Wilson",
  phone: "",
  role: "HOTEL_ADMIN",
  roles: ["HOTEL_ADMIN"],
  hotelId: "1",
  hotelName: "Grand Plaza Hotel",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true
};

localStorage.setItem('auth_token', token);
localStorage.setItem('auth_user', JSON.stringify(user));

console.log('Authentication set! Refresh the page.');
