export const enTranslations = {
  // Authentication & User Management
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
      signInButton: "Sign In",
      createAccountButton: "Create Account",
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
  },

  // Dashboard Pages
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
  },

  // Booking Management
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
  },

  // Hotel Management
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
    },
    management: {
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
  },

  // Room Management
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
      markAvailable: "Mark Available",
      fixStatus: "🤖 Sync Status"
    }
  },

  // Staff Management
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
  },

  // Notifications & Alerts
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
  },

  // Receipts & Billing
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
  },

  // Admin Interfaces
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
  },

  // Error Handling & Messages
  errors: {
    pageNotFound: "Page Not Found",
    sessionExpired: "Session Expired",
    loading: "Loading...",
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
    updateFailed: "Failed to update",
    searchFailed: "Search failed. Please try again.",
    invalidDates: "Please check your dates."
  },

  // Existing sections (shop, hotelSearch, etc.)
  hotelSearch: {
    title: "Find Your Perfect Stay",
    subtitle: "Search and book your ideal hotel room",
    form: {
      destination: "Destination",
      destinationPlaceholder: "Where are you going?",
      destinationHelper: "Enter city, hotel name, or landmark",
      checkin: "Check-in Date",
      checkout: "Check-out Date",
      guests: "Guests",
      guestsPlaceholder: "Number of guests",
      guestsHelper: "Maximum 10 guests per search",
      guestsValidation: "Guests must be between 1 and 10",
      rooms: "Rooms",
      roomsPlaceholder: "Number of rooms",
      searchButton: "Search Hotels",
      searching: "Searching for hotels..."
    },
    alreadyHaveBooking: {
      title: "Already Have a Booking?",
      subtitle: "Manage your existing reservation or view booking details",
      button: "Find My Booking"
    },
    whyChooseUs: {
      title: "🌟 Why Choose BookMyHotel?",
      security: {
        title: "🔒 Bank-Level Security",
        description: "Your personal data and payment information are protected with enterprise-grade encryption and secure payment gateways."
      },
      performance: {
        title: "⚡ Lightning Performance",
        description: "Advanced caching and optimized search algorithms deliver instant results and seamless booking experience."
      },
      modern: {
        title: "📱 Modern Experience",
        description: "Intuitive design that works flawlessly across all devices - mobile, tablet, and desktop with responsive layouts."
      },
      support: {
        title: "🎧 24/7 Support",
        description: "Round-the-clock customer support team ready to assist you with bookings, changes, or any travel concerns."
      },
      trustMessage: "Join thousands of satisfied travelers who trust BookMyHotel for their accommodation needs"
    },
    errors: {
      searchFailed: "Search failed. Please try again.",
      invalidDates: "Please check your dates.",
      networkError: "Network error. Please check your connection."
    }
  },
  shop: {
    dashboard: {
      title: "Shop Management",
      subtitle: "Manage products, orders, and shopping operations",
      tabs: {
        newOrder: "New Order",
        products: "Products",
        orders: "Orders"
      },
      stats: {
        totalProducts: "Total Products",
        activeProducts: "Active Products",
        totalOrders: "Total Orders",
        revenue: "Revenue"
      }
    },
    products: {
      title: "Product Management",
      searchPlaceholder: "Search products...",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteProduct: "Delete Product",
      confirmDelete: "Are you sure you want to delete this product?",
      categories: {
        all: "All Categories",
        food: "Food & Beverages",
        amenities: "Amenities",
        services: "Services",
        souvenirs: "Souvenirs"
      },
      form: {
        name: "Product Name",
        description: "Description",
        price: "Price",
        category: "Category",
        availability: "Available",
        stock: "Stock Quantity"
      },
      table: {
        name: "Name",
        description: "Description",
        price: "Price",
        category: "Category",
        stock: "Stock",
        status: "Status",
        actions: "Actions"
      },
      status: {
        available: "Available",
        unavailable: "Unavailable",
        outOfStock: "Out of Stock"
      },
      messages: {
        created: "Product created successfully",
        updated: "Product updated successfully",
        deleted: "Product deleted successfully",
        loadError: "Failed to load products",
        saveError: "Failed to save product"
      }
    },
    orders: {
      title: "Order Management",
      createOrder: "Create Order",
      orderHistory: "Order History",
      orderDetails: "Order Details",
      form: {
        customerName: "Customer Name",
        roomNumber: "Room Number",
        selectProducts: "Select Products",
        quantity: "Quantity",
        total: "Total Amount"
      },
      table: {
        orderId: "Order ID",
        customer: "Customer",
        room: "Room",
        items: "Items",
        total: "Total",
        status: "Status",
        date: "Date",
        actions: "Actions"
      },
      status: {
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled",
        processing: "Processing"
      },
      messages: {
        created: "Order created successfully",
        updated: "Order updated successfully",
        cancelled: "Order cancelled successfully",
        loadError: "Failed to load orders"
      }
    },
    payment: {
      title: "Payment",
      methods: {
        cash: "Cash",
        card: "Credit/Debit Card",
        roomCharge: "Charge to Room"
      },
      form: {
        method: "Payment Method",
        amount: "Amount",
        reference: "Reference Number"
      },
      messages: {
        success: "Payment processed successfully",
        failed: "Payment failed. Please try again.",
        invalidAmount: "Invalid payment amount"
      }
    },
    receipt: {
      title: "Receipt",
      orderNumber: "Order Number",
      date: "Date",
      customer: "Customer",
      items: "Items",
      subtotal: "Subtotal",
      tax: "Tax",
      total: "Total",
      paymentMethod: "Payment Method",
      print: "Print Receipt",
      email: "Email Receipt"
    }
  },
  productNames: {
    // Beverages
    "Coca Cola": "Coca Cola",
    "Ethiopian Coffee": "Ethiopian Coffee",
    "Dashen Beer": "Dashen Beer",
    "Mineral Water": "Mineral Water",
    // Snacks
    "Roasted Barley": "Roasted Barley",
    "Kolo Mix": "Kolo Mix", 
    "Chocolate Bar": "Chocolate Bar",
    // Cultural Items
    "Traditional Scarf": "Traditional Scarf",
    "Coffee Ceremony Set": "Coffee Ceremony Set",
    "Habesha Kemis": "Habesha Kemis",
    "Wooden Cross": "Wooden Cross",
    // Toiletries
    "Shampoo Travel Size": "Shampoo Travel Size",
    "Toothbrush Set": "Toothbrush Set"
  },
  productDescriptions: {
    "Classic Coca Cola 330ml can": "Classic Coca Cola 330ml can",
    "Authentic Ethiopian coffee beans 250g": "Authentic Ethiopian coffee beans 250g",
    "Local Ethiopian beer 330ml": "Local Ethiopian beer 330ml",
    "Highland Spring water 500ml": "Highland Spring water 500ml",
    "Traditional Ethiopian roasted barley snack": "Traditional Ethiopian roasted barley snack",
    "Mixed roasted grains and nuts": "Mixed roasted grains and nuts",
    "Ethiopian chocolate bar 50g": "Ethiopian chocolate bar 50g",
    "Handwoven Ethiopian cotton scarf": "Handwoven Ethiopian cotton scarf",
    "Traditional Ethiopian coffee ceremony set": "Traditional Ethiopian coffee ceremony set",
    "Traditional Ethiopian dress - Small": "Traditional Ethiopian dress - Small",
    "Hand-carved Ethiopian Orthodox cross": "Hand-carved Ethiopian Orthodox cross",
    "Hotel quality shampoo 50ml": "Hotel quality shampoo 50ml",
    "Toothbrush and toothpaste travel kit": "Toothbrush and toothpaste travel kit"
  },
  categoryNames: {
    "BEVERAGES": "Beverages",
    "SNACKS": "Snacks", 
    "CULTURAL_CLOTHING": "Cultural Clothing",
    "SOUVENIRS": "Souvenirs",
    "TOILETRIES": "Toiletries",
    "OTHER": "Other"
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    close: "Close",
    yes: "Yes",
    no: "No",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    view: "View",
    back: "Back",
    refresh: "Refresh"
  },
  navigation: {
    home: "Home",
    hotels: "Hotels",
    bookings: "Bookings",
    profile: "Profile",
    logout: "Logout",
    dashboard: "Dashboard",
    shop: "Shop",
    products: "Products",
    orders: "Orders"
  },
  language: {
    english: "English",
    amharic: "አማርኛ",
    changeLanguage: "Change Language"
  }
};
