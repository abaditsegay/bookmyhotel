# Internationalization (i18n) Text Collection for BookMyHotel Frontend

## Current Status
Currently, the i18n system is set up with English (en) and Amharic (am) translations, but only covers:
- Hotel Search functionality
- Shop management (products, orders, dashboard)
- Common UI elements (buttons, navigation)
- Basic navigation and language switching

## Missing Text Categories

### 1. AUTHENTICATION & USER MANAGEMENT
**Login Page** (`/pages/LoginPage.tsx`):
```typescript
auth: {
  login: {
    title: "Shegeroom Hotel Reservation Management",
    signIn: "Sign In",
    signInSubtitle: "Welcome back! Please sign in to your account",
    createAccount: "Create Account", 
    createAccountSubtitle: "Join us today! Create your account to get started",
    signInToBook: "Sign in to complete your booking for {hotelName}",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    firstNameLabel: "First Name",
    lastNameLabel: "Last Name", 
    phoneLabel: "Phone Number (optional)",
    confirmPasswordLabel: "Confirm Password",
    signingIn: "Signing In...",
    signIn: "Sign In",
    createAccount: "Create Account",
    creating: "Creating Account...",
    alreadyHaveAccount: "Already have an account?",
    needAccount: "Need an account?",
    forgotPassword: "Forgot Password?",
    
    // Sample Users Section
    sampleUsers: "Quick Login (Demo)",
    systemAdmin: "System Admin",
    hotelAdmin: "Hotel Admin", 
    frontDesk: "Front Desk",
    customer: "Customer",
    
    // Validation Messages
    passwordTooShort: "Password must be at least 6 characters long",
    invalidEmail: "Please provide a valid email address",
    passwordsNoMatch: "Passwords do not match",
    registrationSuccess: "Registration successful! Redirecting...",
    loginFailed: "Login failed",
    registrationFailed: "Registration failed"
  }
}
```

### 2. DASHBOARD PAGES
**System Dashboard** (`/pages/SystemDashboardPage.tsx`):
```typescript
dashboard: {
  system: {
    title: "System Dashboard",
    overview: "Overview",
    analytics: "Analytics", 
    totalBookings: "Total Bookings",
    activeHotels: "Active Hotels",
    monthlyRevenue: "Monthly Revenue",
    systemUsers: "System Users",
    recentActivity: "Recent Activity",
    performanceMetrics: "Performance Metrics",
    quickActions: "Quick Actions"
  },
  hotel: {
    title: "Hotel Dashboard",
    todaysCheckIns: "Today's Check-ins",
    todaysCheckOuts: "Today's Check-outs", 
    occupancyRate: "Occupancy Rate",
    availableRooms: "Available Rooms",
    pendingReservations: "Pending Reservations",
    recentBookings: "Recent Bookings"
  },
  frontDesk: {
    title: "Front Desk Dashboard",
    checkinRequests: "Check-in Requests",
    checkoutRequests: "Check-out Requests",
    roomStatus: "Room Status",
    guestRequests: "Guest Requests",
    maintenance: "Maintenance",
    housekeeping: "Housekeeping"
  }
}
```

### 3. BOOKING MANAGEMENT
**Booking Details** (`/pages/frontdesk/FrontDeskBookingDetails.tsx`):
```typescript
booking: {
  details: {
    title: "Booking Details",
    guestInformation: "Guest Information",
    guestName: "Guest Name",
    email: "Email",
    phone: "Phone",
    confirmationNumber: "Confirmation Number",
    
    hotelInformation: "Hotel Information", 
    hotelName: "Hotel Name",
    hotelAddress: "Hotel Address",
    
    roomDetails: "Room Details",
    roomType: "Room Type",
    roomNumber: "Room Number",
    roomNumberPlaceholder: "Enter room number or assign during check-in",
    
    stayDetails: "Stay Details",
    checkInDate: "Check-in Date",
    checkOutDate: "Check-out Date", 
    pricePerNight: "Price per Night",
    totalAmount: "Total Amount",
    guests: "Guests",
    duration: "Duration",
    
    paymentDetails: "Payment Details",
    bookingDate: "Booking Date",
    paymentIntentId: "Payment Intent ID",
    paymentStatus: "Payment Status",
    
    // Actions
    checkIn: "Check In",
    checkOut: "Check Out",
    cancel: "Cancel Booking",
    modify: "Modify Booking",
    sendConfirmation: "Send Confirmation",
    
    // Status
    confirmed: "Confirmed",
    checkedIn: "Checked In", 
    checkedOut: "Checked Out",
    cancelled: "Cancelled",
    pending: "Pending"
  }
}
```

### 4. HOTEL MANAGEMENT 
**Hotel Registration** (`/pages/PublicHotelRegistration.tsx`):
```typescript
hotel: {
  registration: {
    title: "Hotel Registration",
    subtitle: "Register your hotel with our platform",
    
    basicInfo: "Basic Information",
    hotelName: "Hotel Name",
    hotelNamePlaceholder: "Enter your hotel name",
    contactPerson: "Contact Person",
    contactPersonPlaceholder: "Enter contact person name",
    description: "Description",
    descriptionPlaceholder: "Describe your hotel",
    
    location: "Location",
    address: "Address",
    addressPlaceholder: "Enter your hotel address",
    city: "City",
    cityPlaceholder: "Enter city",
    country: "Country", 
    countryPlaceholder: "Enter country",
    
    contact: "Contact Information",
    communicationPhone: "Phone (Communication)",
    communicationPhonePlaceholder: "Enter communication phone number",
    communicationPhoneHelper: "Primary phone for general communication",
    mobilePaymentPhone: "Mobile Payment Phone",
    mobilePaymentPhonePlaceholder: "Enter mobile payment phone number", 
    mobilePaymentPhoneHelper: "Primary mobile money account for payments",
    mobilePaymentPhone2: "Mobile Payment Phone 2 (Optional)",
    mobilePaymentPhone2Placeholder: "Enter secondary mobile payment phone",
    mobilePaymentPhone2Helper: "Optional secondary mobile money account",
    contactEmail: "Contact Email",
    
    pricing: "Pricing Configuration",
    currency: "Currency",
    basePrice: "Base Price per Night",
    taxRate: "Tax Rate (%)",
    
    submitButton: "Register Hotel",
    submitting: "Registering...",
    success: "Hotel registered successfully!",
    error: "Registration failed. Please try again."
  }
}
```

### 5. ROOM MANAGEMENT
```typescript
rooms: {
  management: {
    title: "Room Management",
    addRoom: "Add Room", 
    editRoom: "Edit Room",
    deleteRoom: "Delete Room",
    roomNumber: "Room Number",
    roomType: "Room Type",
    capacity: "Capacity",
    basePrice: "Base Price",
    amenities: "Amenities",
    status: "Status",
    
    // Room Status
    available: "Available",
    occupied: "Occupied", 
    maintenance: "Maintenance",
    outOfOrder: "Out of Order",
    cleaning: "Cleaning",
    
    // Room Types
    standard: "Standard",
    deluxe: "Deluxe",
    suite: "Suite", 
    premium: "Premium",
    
    // Actions
    assignGuest: "Assign Guest",
    markMaintenance: "Mark for Maintenance",
    markCleaning: "Mark for Cleaning",
    markAvailable: "Mark Available"
  }
}
```

### 6. STAFF MANAGEMENT
```typescript
staff: {
  management: {
    title: "Staff Management",
    addStaff: "Add Staff Member",
    editStaff: "Edit Staff",
    deleteStaff: "Delete Staff",
    
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    department: "Department",
    hireDate: "Hire Date",
    
    // Staff Roles
    manager: "Manager",
    frontDesk: "Front Desk",
    housekeeping: "Housekeeping", 
    maintenance: "Maintenance",
    security: "Security",
    
    // Schedule
    schedule: "Schedule",
    shift: "Shift",
    morningShift: "Morning Shift",
    afternoonShift: "Afternoon Shift", 
    nightShift: "Night Shift",
    
    workingHours: "Working Hours",
    startTime: "Start Time",
    endTime: "End Time"
  }
}
```

### 7. NOTIFICATIONS & ALERTS
```typescript
notifications: {
  title: "Notifications",
  markAllRead: "Mark All as Read",
  noNotifications: "No new notifications",
  
  types: {
    booking: "New Booking",
    checkin: "Check-in Ready",
    checkout: "Check-out Request", 
    payment: "Payment Received",
    maintenance: "Maintenance Required",
    system: "System Alert"
  },
  
  actions: {
    view: "View",
    dismiss: "Dismiss",
    markRead: "Mark as Read"
  }
}
```

### 8. RECEIPTS & BILLING
```typescript
receipts: {
  official: "Official Receipt",
  guestInformation: "Guest Information",
  fullName: "Full Name",
  email: "Email", 
  phone: "Phone",
  confirmation: "Confirmation",
  guests: "Guests",
  
  stayDetails: "Stay Details",
  room: "Room",
  checkIn: "Check-in",
  checkOut: "Check-out", 
  duration: "Duration",
  ratePerNight: "Rate per Night",
  
  billing: {
    description: "DESCRIPTION",
    qty: "QTY",
    unitPrice: "UNIT PRICE", 
    amount: "AMOUNT",
    subtotal: "Subtotal",
    taxesAndFees: "Taxes & Fees Subtotal",
    totalAmount: "TOTAL AMOUNT",
    officialReceipt: "This is an official receipt for your stay."
  }
}
```

### 9. ERROR HANDLING & MESSAGES
```typescript
errors: {
  pageNotFound: "Page Not Found",
  sessionExpired: "Session Expired", 
  networkError: "Network Error",
  serverError: "Server Error",
  unauthorized: "Unauthorized Access",
  accessDenied: "Access Denied",
  
  // Form Validation
  required: "This field is required",
  invalidEmail: "Please enter a valid email address",
  invalidPhone: "Please enter a valid phone number",
  passwordTooShort: "Password must be at least {min} characters",
  passwordsNoMatch: "Passwords do not match",
  
  // API Errors
  loadFailed: "Failed to load data",
  saveFailed: "Failed to save",
  deleteFailed: "Failed to delete",
  updateFailed: "Failed to update"
}
```

### 10. ADMIN INTERFACES
```typescript
admin: {
  tenant: {
    title: "Tenant Management",
    addTenant: "Add Tenant",
    editTenant: "Edit Tenant",
    deleteTenant: "Delete Tenant",
    tenantName: "Tenant Name",
    subdomain: "Subdomain", 
    description: "Description",
    status: "Status",
    active: "Active",
    inactive: "Inactive"
  },
  
  user: {
    title: "User Management", 
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    createUser: "Create User",
    userDetails: "User Details",
    role: "Role",
    permissions: "Permissions",
    lastLogin: "Last Login",
    activateUser: "Activate User",
    deactivateUser: "Deactivate User"
  },
  
  hotel: {
    title: "Hotel Management",
    addHotel: "Add Hotel",
    editHotel: "Edit Hotel", 
    deleteHotel: "Delete Hotel",
    viewHotel: "View Hotel",
    hotelDetails: "Hotel Details",
    totalRooms: "Total Rooms",
    activateHotel: "Activate Hotel",
    deactivateHotel: "Deactivate Hotel"
  }
}
```

## Priority Implementation Order

1. **HIGH PRIORITY** - User-facing pages:
   - Login/Authentication
   - Booking flows
   - Dashboard summaries
   - Error messages

2. **MEDIUM PRIORITY** - Admin interfaces:
   - Hotel management
   - User management
   - Room management
   
3. **LOW PRIORITY** - Advanced features:
   - Staff scheduling
   - Detailed analytics
   - System configurations

## Implementation Plan

1. **Expand existing translation files** with the above categories
2. **Replace hardcoded strings** with `useTranslation()` hooks
3. **Add translation keys** to all component files
4. **Test language switching** across all interfaces
5. **Add RTL support** for languages that require it
6. **Implement pluralization** for count-based messages
7. **Add date/time localization** for different regions

## Next Steps

Would you like me to:
1. Start implementing specific sections?
2. Update the translation files with these new keys?
3. Begin replacing hardcoded strings in priority components?
4. Create helper utilities for translation management?