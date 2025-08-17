// Helper script to set authentication for testing
// Run this in browser console to authenticate as hotel admin

const token = "eyJhbGciOiJIUzUxMiJ9.eyJmaXJzdE5hbWUiOiJTYXJhaCIsImxhc3ROYW1lIjoiV2lsc29uIiwicm9sZXMiOlsiSE9URUxfQURNSU4iXSwidGVuYW50SWQiOiJkZWZhdWx0IiwidXNlcklkIjo5LCJlbWFpbCI6ImhvdGVsYWRtaW5AYm9va215aG90ZWwuY29tIiwic3ViIjoiaG90ZWxhZG1pbkBib29rbXlob3RlbC5jb20iLCJpYXQiOjE3NTU0NzMzOTUsImV4cCI6MTc1NTU1OTc5NX0.cdZOeZlEFBijavweCpnYZ4npvn7Zlxoqc8W-jbA8f8oPdh_lKi3H9f-QQ_4YUOBODhXSIc8c35mrMVxMW796NA";

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
