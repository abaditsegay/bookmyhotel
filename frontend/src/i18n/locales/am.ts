export const amTranslations = {
  // Authentication & User Management
  auth: {
    login: {
      title: "ሸገሮም ሆቴል ቦታ ማስያዝ አስተዳደር",
      signIn: "ግባ",
      signInSubtitle: "እንኳን ደህና መጣህ! እባክህ ወደ መለያህ ግባ",
      createAccount: "መለያ ፍጠር",
      createAccountSubtitle: "ዛሬ ከእኛ ጋር ተቀላቀል! መለያህን ፍጠር ለመጀመር",
      signInToBook: "ለ {hotelName} ቦታ ማስያዝህን ለማጠናቀቅ ግባ",
      emailLabel: "የኢሜል አድራሻ",
      passwordLabel: "የይለፍ ቃል",
      firstNameLabel: "የመጀመሪያ ስም",
      lastNameLabel: "የአባት ስም",
      phoneLabel: "ስልክ ቁጥር (አማራጭ)",
      confirmPasswordLabel: "የይለፍ ቃል አረጋግጥ",
      signingIn: "በመግባት ላይ...",
      signInButton: "ግባ",
      createAccountButton: "መለያ ፍጠር",
      creating: "መለያ በመፍጠር ላይ...",
      alreadyHaveAccount: "ቀደም ሲል መለያ አለህ?",
      needAccount: "መለያ ይጠፈልግሃል?",
      forgotPassword: "የይለፍ ቃል ረሳህ?",
      
      // Sample Users Section
      sampleUsers: "ፈጣን መግቢያ (ቅድመ ዕይታ)",
      systemAdmin: "የስርዓት አስተዳዳሪ",
      hotelAdmin: "የሆቴል አስተዳዳሪ",
      frontDesk: "የመቀበያ ዴስክ",
      customer: "ደንበኛ",
      
      // Validation Messages
      passwordTooShort: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ሊኖረው ይገባል",
      invalidEmail: "እባክህ ትክክለኛ ኢሜል አድራሻ ስጥ",
      passwordsNoMatch: "የይለፍ ቃሎች አይመሳሰሉም",
      registrationSuccess: "መመዝገብ በተሳካ ሁኔታ ተጠናቋል! በማዞር ላይ...",
      loginFailed: "መግባት አልተሳካም",
      registrationFailed: "መመዝገብ አልተሳካም"
    }
  },

  // Dashboard Pages
  dashboard: {
    system: {
      title: "የስርዓት ዳሽቦርድ",
      overview: "አጠቃላይ እይታ",
      analytics: "ትንታኔ",
      totalBookings: "ጠቅላላ ቦታ ማስያዞች",
      activeHotels: "ንቁ ሆቴሎች",
      monthlyRevenue: "ወርሃዊ ገቢ",
      systemUsers: "የስርዓት ተጠቃሚዎች",
      recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
      performanceMetrics: "የአፈጻጸም መለኪያዎች",
      quickActions: "ፈጣን እርምጃዎች"
    },
    hotel: {
      title: "የሆቴል ዳሽቦርድ",
      todaysCheckIns: "የዛሬ ወደ ሆቴል መግቢያዎች",
      todaysCheckOuts: "የዛሬ ከሆቴል መውጫዎች",
      occupancyRate: "የመኖሪያ መጠን",
      availableRooms: "ክፍት ክፍሎች",
      pendingReservations: "በመጠባበቅ ላይ ያሉ ማስያዝ",
      recentBookings: "የቅርብ ጊዜ ቦታ ማስያዞች"
    },
    frontDesk: {
      title: "የመቀበያ ዴስክ ዳሽቦርድ",
      checkinRequests: "የወደ ሆቴል መግቢያ ጥያቄዎች",
      checkoutRequests: "የከሆቴል መውጫ ጥያቄዎች",
      roomStatus: "የክፍል ሁኔታ",
      guestRequests: "የእንግዳ ጥያቄዎች",
      maintenance: "ጥገና",
      housekeeping: "የቤት ጽዳት"
    },
    hotelAdmin: {
      title: "የሆቴል አስተዳደር ዳሽቦርድ",
      subtitle: "የሆቴል አስተዳደር",
      editHotelDetails: "የሆቴል ዝርዝሮች ያርሙ",
      loadingHotelInfo: "የሆቴል መረጃ በመጫን ላይ...",
      unableToLoadHotel: "የሆቴል መረጃ መጫን አልተሳካም",
      accessRestricted: "መዳረሻ ተከልክሏል",
      needHotelAdminRole: "የሆቴል አስተዳደር ዳሽቦርድ ለመድረስ HOTEL_ADMIN ሚና ያስፈልግዎታል።",
      currentRole: "የአሁኑ ሚናዎ:",
      goToHome: "ወደ ቤት ይሂዱ",
      goToOperations: "ወደ ኦፕሬሽን ዳሽቦርድ ይሂዱ",
      goToFrontDesk: "ወደ ፊት ዴስክ ዳሽቦርድ ይሂዱ",
      
      // Main Tabs
      tabs: {
        hotelDetail: "የሆቴል ዝርዝር",
        staff: "ሰራተኞች",
        rooms: "ክፍሎች",
        bookings: "ቦታ ማስያዞች",
        staffSchedules: "የሰራተኞች መርሐ ግብር",
        reports: "ሪፖርቶች",
        pricingTax: "ዋጋ እና ግብር",
        offlineBookings: "ከመስመር ውጭ ማስያዞች"
      },
      
      // Hotel Details Sub-tabs
      hotelDetails: {
        hotelDetails: "የሆቴል ዝርዝሮች",
        hotelImages: "የሆቴል ምስሎች"
      },
      
      // Status
      status: {
        active: "ንቁ",
        inactive: "ንቁ ያልሆነ"
      },
      
      // Metrics
      metrics: {
        totalRooms: "የአጠቃላይ ክፍሎች",
        availableRooms: "የተዘጋጁ ክፍሎች", 
        totalStaff: "የአጠቃላይ ሰራተኞች",
        activeStaff: "ንቁ ሰራተኞች",
        available: "የተዘጋጁ",
        occupied: "የተይዘ",
        managedProperties: "የተተዳደሩ ሕንፃዎች",
        readyForBooking: "ለቦታ ማስያዝ የተዘጋጁ",
        currentlyBooked: "በአሁኑ ጊዜ የተይዙ",
        totalMembers: "አጠቃላይ: {{count}} አባላት",
        roomsOccupied: "{{occupied}} ከ{{total}} ክፍሎች የተይዙ",
        roomCapacity: "የክፍል አቅም",
        staffCount: "የሰራተኞች ቁጥር",
        teamMembers: "የቡድን አባላት",
        occupancyRate: "ተሳፋሪነት መጠን",
        currentOccupancyRate: "የአሁኑ ተሳፋሪነት መጠን"
      },
      
      // Sections
      sections: {
        hotelInformation: "የሆቴል መረጃ",
        contactOperations: "የመገናኛ እና ኦፕሬሽን"
      },
      
      // Contact Information
      contact: {
        communicationPhone: "የመገናኛ ስልክ",
        primaryPaymentPhone: "መጀመሪያ የክፍያ ስልክ",
        secondaryPaymentPhone: "ሁለተኛ የክፍያ ስልክ",
        emailAddress: "የኢሜይል አድራሻ",
        phoneNotSet: "ስልክ አልተቀመጠም",
        paymentPhoneNotSet: "የክፍያ ስልክ አልተቀመጠም",
        secondaryPaymentPhoneNotSet: "ሁለተኛ የክፍያ ስልክ አልተቀመጠም",
        emailNotSet: "ኢሜይል አልተቀመጠም"
      },
      
      // Form Fields
      form: {
        hotelName: 'የሆቴል ስም',
        description: 'መግለጫ',
        address: 'አድራሻ',
        status: 'ሁኔታ',
        active: 'ንቁ',
        inactive: 'ንቁ ያልሆነ'
      },
      
      // Reports
      reports: {
        title: 'የሆቴል ሪፖርቶች እና ትንታኔዎች',
        refreshData: 'መረጃ አድስ',
        loadingAnalytics: 'የትንታኔ መረጃ እየተጫነ ነው...',
        bookingStatusOverview: 'የቦታ ማስያዝ ሁኔታ አጠቃላይ እይታ',
        currentBookingStatus: 'የአሁኑ የቦታ ማስያዝ ሁኔታ ስርጭት',
        staffByRole: 'በሚና ሰራተኞች',
        currentStaffDistribution: 'አሁን ያለ የሰራተኞች በሚና ስርጭት',
        todaysOperations: 'የዛሬ ስራዎች ማጠቃለያ',
        occupancyRate: 'ተሳፋሪነት መጠን',
        expectedCheckins: 'የሚጠበቁ ገቢዎች',
        expectedCheckouts: 'የሚጠበቁ መውጫዎች',
        currentMonthPerformance: 'የአሁኑ ወር አፈጻጸም',
        monthToDateMetrics: 'ወር-እስከ-ዛሬ መለኪያዎች',
        totalRevenue: 'ለአሁኑ ዓመት አጠቃላይ ገቢ',
        generatedFromBookings: 'ከቦታ ማስያዝ የተፈጠረ',
        monthlyAverage: 'ወራዊ አማካይ',
        bookingAnalytics: 'የቦታ ማስያዝ ትንታኔዎች',
        comprehensiveBookingMetrics: 'የሁሉን አቀፍ የቦታ ማስያዝ መለኪያዎች',
        totalBookings: 'አጠቃላይ ቦታ ማስያዝ'
      },
      
      // Success Messages
      messages: {
        offlineBookingSuccess: 'ለ{{guestName}} የከመስመር ውጭ ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጠረ',
        walkInBookingSuccess: 'የእግረኛ ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጠረ! ማረጋገጫ: {{confirmationNumber}}'
      },
      
      // Messages
      noDescriptionAvailable: "ምንም መግለጫ አይገኝም",
      noStaffRoleData: "የሰራተኞች ሚና መረጃ አይገኝም",
      loadingHotel: "ሆቴል በመጫን ላይ...",
      hotelInfoNotAvailable: "የሆቴል መረጃ አይገኝም"
    }
  },

  // Booking Management
  booking: {
    details: {
      title: "የቦታ ማስያዝ ዝርዝሮች",
      guestInformation: "የእንግዳ መረጃ",
      guestName: "የእንግዳ ስም",
      email: "ኢሜል",
      phone: "ስልክ",
      confirmationNumber: "የማረጋገጫ ቁጥር",
      
      hotelInformation: "የሆቴል መረጃ",
      hotelName: "የሆቴል ስም",
      hotelAddress: "የሆቴል አድራሻ",
      
      roomDetails: "የክፍል ዝርዝሮች",
      roomType: "የክፍል አይነት",
      roomNumber: "የክፍል ቁጥር",
      roomNumberPlaceholder: "የክፍል ቁጥር ያስገቡ ወይም በመግቢያ ጊዜ ይመድቡ",
      
      stayDetails: "የመቆየት ዝርዝሮች",
      checkInDate: "የመግቢያ ቀን",
      checkOutDate: "የመውጫ ቀን",
      pricePerNight: "በሌሊት ዋጋ",
      totalAmount: "ጠቅላላ መጠን",
      guests: "እንግዶች",
      duration: "ጊዜ",
      
      paymentDetails: "የክፍያ ዝርዝሮች",
      bookingDate: "የቦታ ማስያዝ ቀን",
      paymentIntentId: "የክፍያ ማንነት ID",
      paymentStatus: "የክፍያ ሁኔታ",
      
      // Actions
      checkIn: "ወደ ሆቴል ግባ",
      checkOut: "ከሆቴል ውጣ",
      cancel: "ቦታ ማስያዙን ሰርዝ",
      modify: "ቦታ ማስያዙን ቀይር",
      sendConfirmation: "ማረጋገጫ ላክ",
      
      // Status
      confirmed: "ተረጋግጧል",
      checkedIn: "ወደ ሆቴል ገብቷል",
      checkedOut: "ከሆቴል ወጥቷል",
      cancelled: "ተሰርዟል",
      pending: "በመጠባበቅ ላይ"
    }
  },

  // Hotel Management
  hotel: {
    registration: {
      title: "የሆቴል መመዝገቢያ",
      subtitle: "ሆቴልዎን በእኛ መድረክ ይመዝግቡ",
      
      basicInfo: "መሠረታዊ መረጃ",
      hotelName: "የሆቴል ስም",
      hotelNamePlaceholder: "የሆቴልዎን ስም ያስገቡ",
      contactPerson: "የመገናኛ ሰው",
      contactPersonPlaceholder: "የመገናኛ ሰው ስም ያስገቡ",
      description: "መግለጫ",
      descriptionPlaceholder: "ሆቴልዎን ይግለጹ",
      
      location: "አካባቢ",
      address: "አድራሻ",
      addressPlaceholder: "የሆቴልዎን አድራሻ ያስገቡ",
      city: "ከተማ",
      cityPlaceholder: "ከተማ ያስገቡ",
      country: "ሀገር",
      countryPlaceholder: "ሀገር ያስገቡ",
      
      contact: "የመገናኛ መረጃ",
      communicationPhone: "ስልክ (መገናኛ)",
      communicationPhonePlaceholder: "የመገናኛ ስልክ ቁጥር ያስገቡ",
      communicationPhoneHelper: "ለአጠቃላይ መገናኛ ዋና ስልክ",
      mobilePaymentPhone: "የሞባይል ክፍያ ስልክ",
      mobilePaymentPhonePlaceholder: "የሞባይል ክፍያ ስልክ ቁጥር ያስገቡ",
      mobilePaymentPhoneHelper: "ለክፍያዎች ዋና የሞባይል ገንዘብ መለያ",
      mobilePaymentPhone2: "የሞባይል ክፍያ ስልክ 2 (አማራጭ)",
      mobilePaymentPhone2Placeholder: "ሁለተኛ የሞባይል ክፍያ ስልክ ያስገቡ",
      mobilePaymentPhone2Helper: "አማራጭ ሁለተኛ የሞባይል ገንዘብ መለያ",
      contactEmail: "የመገናኛ ኢሜል",
      
      pricing: "የዋጋ አወጣጥ",
      currency: "ምንዛሬ",
      basePrice: "መሠረታዊ ዋጋ በሌሊት",
      taxRate: "የግብር መጠን (%)",
      
      submitButton: "ሆቴል መዝግብ",
      submitting: "በመመዝገብ ላይ...",
      success: "ሆቴል በተሳካ ሁኔታ ተመዝግቧል!",
      error: "መመዝገብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
    },
    management: {
      title: "የሆቴል አስተዳደር",
      addHotel: "ሆቴል ጨምር",
      editHotel: "ሆቴል ቀይር",
      deleteHotel: "ሆቴል ሰርዝ",
      viewHotel: "ሆቴል ተመልከት",
      hotelDetails: "የሆቴል ዝርዝሮች",
      totalRooms: "ጠቅላላ ክፍሎች",
      activateHotel: "ሆቴል አንቃ",
      deactivateHotel: "ሆቴል አቦዝ"
    }
  },

  // Room Management
  rooms: {
    management: {
      title: "የክፍል አስተዳደር",
      addRoom: "ክፍል ጨምር",
      editRoom: "ክፍል ቀይር",
      deleteRoom: "ክፍል ሰርዝ",
      roomNumber: "የክፍል ቁጥር",
      roomType: "የክፍል አይነት",
      capacity: "አቅም",
      basePrice: "መሠረታዊ ዋጋ",
      amenities: "አገልግሎቶች",
      status: "ሁኔታ",
      
      // Room Status
      available: "ክፍት",
      occupied: "ተይዟል",
      maintenance: "ጥገና",
      outOfOrder: "ከሥራ ውጪ",
      cleaning: "ጽዳት",
      
      // Room Types
      standard: "መደበኛ",
      deluxe: "ዴሉክስ",
      suite: "ስዊት",
      premium: "ፕሪሚየም",
      
      // Actions
      assignGuest: "እንግዳ መድብ",
      markMaintenance: "ለጥገና ምልክት አድርግ",
      markCleaning: "ለጽዳት ምልክት አድርግ",
      markAvailable: "ክፍት ምልክት አድርግ",
      fixStatus: "🤖 ሁኔታ አስተሳስር"
    }
  },

  // Staff Management
  staff: {
    management: {
      title: "የሰራተኛ አስተዳደር",
      addStaff: "ሰራተኛ ጨምር",
      editStaff: "ሰራተኛ ቀይር",
      deleteStaff: "ሰራተኛ ሰርዝ",
      
      personalInfo: "ግላዊ መረጃ",
      firstName: "የመጀመሪያ ስም",
      lastName: "የአባት ስም",
      email: "ኢሜል",
      phone: "ስልክ",
      role: "ሚና",
      department: "ክፍል",
      hireDate: "የመቅጠር ቀን",
      
      // Staff Roles
      manager: "አስተዳዳሪ",
      frontDesk: "የመቀበያ ዴስክ",
      housekeeping: "የቤት ጽዳት",
      maintenance: "ጥገና",
      security: "ደህንነት",
      
      // Schedule
      schedule: "መርሃ ግብር",
      shift: "ዘለት",
      morningShift: "የጥዋት ዘለት",
      afternoonShift: "የከሰዓት ዘለት",
      nightShift: "የሌሊት ዘለት",
      
      workingHours: "የሥራ ሰዓቶች",
      startTime: "የመጀመሪያ ሰዓት",
      endTime: "የመጨረሻ ሰዓት"
    }
  },

  // Notifications & Alerts
  notifications: {
    title: "ማሳወቂያዎች",
    markAllRead: "ሁሉንም እንደተነበበ ምልክት አድርግ",
    noNotifications: "አዲስ ማሳወቂያ የለም",
    
    types: {
      booking: "አዲስ ቦታ ማስያዝ",
      checkin: "መግቢያ ዝግጁ",
      checkout: "መውጫ ጥያቄ",
      payment: "ክፍያ ተቀብሏል",
      maintenance: "ጥገና ያስፈልጋል",
      system: "የስርዓት ማንቂያ"
    },
    
    actions: {
      view: "ተመልከት",
      dismiss: "አስወግድ",
      markRead: "እንደተነበበ ምልክት አድርግ"
    }
  },

  // Receipts & Billing
  receipts: {
    official: "ይፋዊ ደረሰኝ",
    guestInformation: "የእንግዳ መረጃ",
    fullName: "ሙሉ ስም",
    email: "ኢሜል",
    phone: "ስልክ",
    confirmation: "ማረጋገጫ",
    guests: "እንግዶች",
    
    stayDetails: "የመቆየት ዝርዝሮች",
    room: "ክፍል",
    checkIn: "መግቢያ",
    checkOut: "መውጫ",
    duration: "ጊዜ",
    ratePerNight: "በሌሊት ተመን",
    
    billing: {
      description: "መግለጫ",
      qty: "ብዛት",
      unitPrice: "የአንድ ዋጋ",
      amount: "መጠን",
      subtotal: "ንዑስ ድምር",
      taxesAndFees: "ግብሮች እና ክፍያዎች ንዑስ ድምር",
      totalAmount: "ጠቅላላ መጠን",
      officialReceipt: "ይህ ለመቆየትዎ ይፋዊ ደረሰኝ ነው።"
    }
  },

  // Admin Interfaces
  admin: {
    tenant: {
      title: "የተከራይ አስተዳደር",
      addTenant: "ተከራይ ጨምር",
      editTenant: "ተከራይ ቀይር",
      deleteTenant: "ተከራይ ሰርዝ",
      tenantName: "የተከራይ ስም",
      subdomain: "ንዑስ ዶሜይን",
      description: "መግለጫ",
      status: "ሁኔታ",
      active: "ንቁ",
      inactive: "ንቁ ያልሆነ"
    },
    
    user: {
      title: "የተጠቃሚ አስተዳደር",
      addUser: "ተጠቃሚ ጨምር",
      editUser: "ተጠቃሚ ቀይር",
      deleteUser: "ተጠቃሚ ሰርዝ",
      createUser: "ተጠቃሚ ፍጠር",
      userDetails: "የተጠቃሚ ዝርዝሮች",
      role: "ሚና",
      permissions: "ፈቃዶች",
      lastLogin: "የመጨረሻ መግቢያ",
      activateUser: "ተጠቃሚ አንቃ",
      deactivateUser: "ተጠቃሚ አቦዝ"
    },
    
    hotel: {
      title: "የሆቴል አስተዳደር",
      addHotel: "ሆቴል ጨምር",
      editHotel: "ሆቴል ቀይር",
      deleteHotel: "ሆቴል ሰርዝ",
      viewHotel: "ሆቴል ተመልከት",
      hotelDetails: "የሆቴል ዝርዝሮች",
      totalRooms: "ጠቅላላ ክፍሎች",
      activateHotel: "ሆቴል አንቃ",
      deactivateHotel: "ሆቴል አቦዝ"
    }
  },

  // Error Handling & Messages
  errors: {
    pageNotFound: "ገጽ አልተገኘም",
    sessionExpired: "ክፍለ ጊዜ አልቋል",
    loading: "በመጫን ላይ...",
    networkError: "የአውታረ መረብ ስህተት",
    serverError: "የአገልጋይ ስህተት",
    unauthorized: "ያልተፈቀደ መዳረሻ",
    accessDenied: "መዳረሻ ተከልክሏል",
    
    // Form Validation
    required: "ይህ መስክ ያስፈልጋል",
    invalidEmail: "እባክዎ ትክክለኛ ኢሜል አድራሻ ያስገቡ",
    invalidPhone: "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ",
    passwordTooShort: "የይለፍ ቃል ቢያንስ {min} ቁምፊዎች ሊኖረው ይገባል",
    passwordsNoMatch: "የይለፍ ቃሎች አይመሳሰሉም",
    
    // API Errors
    loadFailed: "መረጃ መጫን አልተሳካም",
    saveFailed: "ማስቀመጥ አልተሳካም",
    deleteFailed: "ማጥፋት አልተሳካም",
    updateFailed: "ማዘመን አልተሳካም",
    searchFailed: "ፍለጋ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
    invalidDates: "እባክዎ ቀኖችዎን ይፈትሹ።"
  },
  hotelSearch: {
    title: "የሚፈልጉትን ፍጹም መቆየት ያግኙ",
    subtitle: "ፍለጋ እና የምትፈልጉትን ተስማሚ የሆቴል ክፍል ይቦዩ",
    form: {
      destination: "መዳረሻ",
      destinationPlaceholder: "የት ትሄዳለህ?",
      destinationHelper: "ከተማ፣ የሆቴል ስም፣ ወይም መርሃግብር ያስገቡ",
      checkin: "የመግቢያ ቀን",
      checkout: "የመውጫ ቀን",
      guests: "እንግዶች",
      guestsPlaceholder: "የእንግዶች ቁጥር",
      guestsHelper: "ከፍተኛው 10 እንግዶች በፍለጋ",
      guestsValidation: "እንግዶች ከ1 እስከ 10 መሆን አለባቸው",
      rooms: "ክፍሎች",
      roomsPlaceholder: "የክፍሎች ቁጥር",
      searchButton: "ሆቴሎች ፈልግ",
      searching: "ሆቴሎችን በመፈለግ ላይ..."
    },
    alreadyHaveBooking: {
      title: "ቀደም ሲል ያስያዝ ነበር?",
      subtitle: "ያለዎትን ቦታ አስያዝ ያስተዳድሩ ወይም የመያዣ ዝርዝሮችን ይመልከቱ",
      button: "ማስያዣዬን ፈልግ"
    },
    whyChooseUs: {
      title: "🌟 ለምን BookMyHotel ይምረጡ?",
      security: {
        title: "🔒 የባንክ-ደረጃ ደህንነት",
        description: "የእርስዎ የግል መረጃ እና የክፍያ መረጃ በኢንተርፕራይዝ-ደረጃ ምስጠራ እና የተረጋገጡ የክፍያ መተላለፊያዎች ተጠብቀዋል።"
      },
      performance: {
        title: "⚡ የመብረቅ አፈፃፀም",
        description: "የላቀ ማስቀመጫ እና የተመቻቹ የፍለጋ ስልተ ቀመሮች ፈጣን ውጤቶችን እና ቀላል የመተላለፊያ ተሞክሮን ያቀርባሉ។"
      },
      modern: {
        title: "📱 ዘመናዊ ተሞክሮ",
        description: "በሁሉም መሳሪያዎች ላይ ያለችግር የሚሰራ ቀላል ዲዛይን - ሞባይል፣ ታብሌት እና ዴስክቶፕ የሚያነሳ አቀማመጦች።"
      },
      support: {
        title: "🎧 24/7 ድጋፍ",
        description: "ለ24 ሰዓት የደንበኞች ድጋፍ ቡድን በማስያዝ፣ ለውጦች ወይም ማንኛውም የጉዞ ጉዳዮች ለመርዳት ዝግጁ ነው።"
      },
      trustMessage: "BookMyHotel ን ለመጠለያ ፍላጎታቸው በሺዎች የሚቆጠሩ የተደሰቱ ተጓዦች ይቀላቀሉ"
    },
    errors: {
      searchFailed: "ፍለጋ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
      invalidDates: "እባክዎ ቀናቶቻችንን ይመልከቱ።",
      networkError: "የኔትወርክ ስህተት። እባክዎ ግንኙነትዎን ይመልከቱ።"
    }
  },
  shop: {
    dashboard: {
      title: "የሱቅ አስተዳደር",
      subtitle: "ምርቶችን፣ ትዕዛዞችን እና የሱቅ ስራዎችን ያስተዳድሩ",
      tabs: {
        newOrder: "አዲስ ትዕዛዝ",
        products: "ምርቶች",
        orders: "ትዕዛዞች"
      },
      stats: {
        totalProducts: "ጠቅላላ ምርቶች",
        activeProducts: "ንቁ ምርቶች",
        totalOrders: "ጠቅላላ ትዕዛዞች",
        revenue: "ገቢ"
      }
    },
    products: {
      title: "የምርት አስተዳደር",
      searchPlaceholder: "ምርቶችን ፈልግ...",
      addProduct: "ምርት ጨምር",
      editProduct: "ምርት አርም",
      deleteProduct: "ምርት ሰርዝ",
      confirmDelete: "እርግጠኛ ነዎት ይህንን ምርት መሰረዝ ይፈልጋሉ?",
      categories: {
        all: "ሁሉም ምድቦች",
        food: "ምግብ እና መጠጦች",
        amenities: "ምቹነቶች",
        services: "አገልግሎቶች",
        souvenirs: "መታሰቢያዎች"
      },
      form: {
        name: "የምርት ስም",
        description: "መግለጫ",
        price: "ዋጋ",
        category: "ምድብ",
        availability: "ይገኛል",
        stock: "የመጋዘን ብዛት"
      },
      table: {
        name: "ስም",
        description: "መግለጫ",
        price: "ዋጋ",
        category: "ምድብ",
        stock: "መጋዘን",
        status: "ሁኔታ",
        actions: "ድርጊቶች"
      },
      status: {
        available: "ይገኛል",
        unavailable: "አይገኝም",
        outOfStock: "ከመጋዘን ወጥቷል"
      },
      messages: {
        created: "ምርት በተሳካ ሁኔታ ተፈጥሯል",
        updated: "ምርት በተሳካ ሁኔታ ተዘምኗል",
        deleted: "ምርት በተሳካ ሁኔታ ተሰርዟል",
        loadError: "ምርቶችን መሸከም አልተሳካም",
        saveError: "ምርትን ማስቀመጥ አልተሳካም"
      }
    },
    orders: {
      title: "የትዕዛዝ አስተዳደር",
      createOrder: "ትዕዛዝ ፍጠር",
      orderHistory: "የትዕዛዝ ታሪክ",
      orderDetails: "የትዕዛዝ ዝርዝሮች",
      form: {
        customerName: "የደንበኛ ስም",
        roomNumber: "የክፍል ቁጥር",
        selectProducts: "ምርቶችን ምረጥ",
        quantity: "ብዛት",
        total: "ጠቅላላ መጠን"
      },
      table: {
        orderId: "የትዕዛዝ መለያ",
        customer: "ደንበኛ",
        room: "ክፍል",
        items: "እቃዎች",
        total: "ጠቅላላ",
        status: "ሁኔታ",
        date: "ቀን",
        actions: "ድርጊቶች"
      },
      status: {
        pending: "በመጠባበቅ ላይ",
        completed: "ተጠናቅቋል",
        cancelled: "ተሰርዟል",
        processing: "በሂደት ላይ"
      },
      messages: {
        created: "ትዕዛዝ በተሳካ ሁኔታ ተፈጥሯል",
        updated: "ትዕዛዝ በተሳካ ሁኔታ ተዘምኗል",
        cancelled: "ትዕዛዝ በተሳካ ሁኔታ ተሰርዟል",
        loadError: "ትዕዛዞችን መሸከም አልተሳካም"
      }
    },
    payment: {
      title: "ክፍያ",
      methods: {
        cash: "ጥሬ ገንዘብ",
        card: "ክሬዲት/ዴቢት ካርድ",
        roomCharge: "ለክፍል ክፍያ"
      },
      form: {
        method: "የክፍያ ዘዴ",
        amount: "መጠን",
        reference: "የማመሳከሪያ ቁጥር"
      },
      messages: {
        success: "ክፍያ በተሳካ ሁኔታ ተከናውኗል",
        failed: "ክፍያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
        invalidAmount: "ልክ ያልሆነ የክፍያ መጠን"
      }
    },
    receipt: {
      title: "ደረሰኝ",
      orderNumber: "የትዕዛዝ ቁጥር",
      date: "ቀን",
      customer: "ደንበኛ",
      items: "እቃዎች",
      subtotal: "ንዑስ ጠቅላላ",
      tax: "ግብር",
      total: "ጠቅላላ",
      paymentMethod: "የክፍያ ዘዴ",
      print: "ደረሰኝ አትም",
      email: "ደረሰኝ ኢሜይል ላክ"
    }
  },
  productNames: {
    // Beverages
    "Coca Cola": "ኮካ ኮላ",
    "Ethiopian Coffee": "የኢትዮጵያ ቡና",
    "Dashen Beer": "ዳሸን ቢራ",
    "Mineral Water": "የማዕድን ውሃ",
    // Snacks
    "Roasted Barley": "የጠበሰ ገብስ",
    "Kolo Mix": "ቆሎ ድብልቅ",
    "Chocolate Bar": "ቸኮሌት",
    // Cultural Items
    "Traditional Scarf": "ባህላዊ ሻሽ",
    "Coffee Ceremony Set": "የቡና ሥነ ሥርዓት ስብስብ",
    "Habesha Kemis": "ሀበሻ ቀሚስ",
    "Wooden Cross": "የእንጨት መስቀል",
    // Toiletries
    "Shampoo Travel Size": "የጉዞ መጠን ሻምፖ",
    "Toothbrush Set": "የጥርስ ብሩሽ ስብስብ"
  },
  productDescriptions: {
    "Classic Coca Cola 330ml can": "ክላሲክ ኮካ ኮላ 330ሚሊ ሊትር ጣሳ",
    "Authentic Ethiopian coffee beans 250g": "ትክክለኛ የኢትዮጵያ ቡና ፍሬ 250 ግራም",
    "Local Ethiopian beer 330ml": "የአገር ውስጥ ኢትዮጵያዊ ቢራ 330ሚሊ ሊትር",
    "Highland Spring water 500ml": "ሀይላንድ ስፕሪንግ ውሃ 500ሚሊ ሊትር",
    "Traditional Ethiopian roasted barley snack": "ባህላዊ የኢትዮጵያ የጠበሰ ገብስ መክሰስ",
    "Mixed roasted grains and nuts": "የተቀላቀለ የጠበሰ እህል እና ፍሬ ፍሬዎች",
    "Ethiopian chocolate bar 50g": "የኢትዮጵያ ቸኮሌት 50 ግራም",
    "Handwoven Ethiopian cotton scarf": "በእጅ የተሰራ የኢትዮጵያ ጥጥ ሻሽ",
    "Traditional Ethiopian coffee ceremony set": "ባህላዊ የኢትዮጵያ የቡና ሥነ ሥርዓት ስብስብ",
    "Traditional Ethiopian dress - Small": "ባህላዊ የኢትዮጵያ ልብስ - ትንሽ",
    "Hand-carved Ethiopian Orthodox cross": "በእጅ የተቀረፀ የኢትዮጵያ ኦርቶዶክስ መስቀል",
    "Hotel quality shampoo 50ml": "የሆቴል ጥራት ሻምፖ 50ሚሊ ሊትር",
    "Toothbrush and toothpaste travel kit": "የጥርስ ብሩሽ እና የጥርስ ሳሙና የጉዞ ስብስብ"
  },
  categoryNames: {
    "BEVERAGES": "መጠጦች",
    "SNACKS": "መክሰሶች",
    "CULTURAL_CLOTHING": "ባህላዊ ልብሶች",
    "SOUVENIRS": "መታሰቢያዎች",
    "TOILETRIES": "የግል ንፅህና እቃዎች",
    "OTHER": "ሌላ"
  },
  common: {
    loading: "እየጫነ...",
    error: "ስህተት",
    success: "ተሳክቷል",
    cancel: "ሰርዝ",
    confirm: "አረጋግጥ",
    save: "አስቀምጥ",
    close: "ዝጋ",
    yes: "አዎ",
    no: "አይ",
    next: "ቀጣይ",
    previous: "ቀደምት",
    submit: "አስገባ",
    search: "ፈልግ",
    filter: "ማጣሪያ",
    edit: "አርም",
    delete: "ሰርዝ",
    add: "ጨምር",
    view: "ተመልከት",
    back: "ተመለስ",
    refresh: "አድስ"
  },
  navigation: {
    home: "ቤት",
    hotels: "ሆቴሎች",
    bookings: "ማስያዞች",
    profile: "መገለጫ",
    logout: "ውጣ",
    dashboard: "ዳሽቦርድ",
    shop: "ሱቅ",
    products: "ምርቶች",
    orders: "ትዕዛዞች"
  },
  language: {
    english: "English",
    amharic: "አማርኛ",
    changeLanguage: "ቋንቋ ቀይር"
  }
};
