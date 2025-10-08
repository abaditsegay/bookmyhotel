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
      housekeeping: "የቤት ጽዳት",
      
      // Dashboard Statistics
      stats: {
        arrivalsToday: "ዛሬ የመጡ እንግዶች",
        departuresToday: "ዛሬ የሄዱ እንግዶች",
        currentOccupancy: "አሁን ያሉ እንግዶች",
        outOfOrder: "ከአገልግሎት ውጭ",
        underMaintenance: "በጥገና ላይ",
        availableRooms: "ያሉ ክፍሎች"
      },
      
      // Tab Labels
      tabs: {
        bookings: "ቦታ ማስያዝ",
        rooms: "ክፍሎች",
        housekeeping: "የቤት ጽዳት",
        offlineBookings: "ኦፍላይን ቦታ ማስያዝ"
      },
      
      // Housekeeping Module
      housekeepingModule: {
        title: "የቤት ጽዳት ሞጁል",
        description: "የቤት ጽዳት ባህሪዎች በወደፊት እትሞች ይኖራሉ።\nአሁን፣ የክፍል ሁኔታ ለውጦች በክፍል አስተዳደር ትር ውስጥ ማስተዳደር ይችላሉ።"
      },
      
      // Success Messages
      success: {
        title: "ተሳክቷል",
        walkInBookingCreated: "የእንግዳ ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጠረ! ማረጋገጫ: {{confirmationNumber}}",
        offlineBookingCreated: "ኦፍላይን ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጠረ {{guestName}}",
        okButton: "እሺ"
      },
      
      // Room Management
      roomManagement: {
        tabs: {
          roomList: "ክፍሎች ዝርዝር",
          pricing: "የክፍል አይነት ዋጋ",
          bulkUpload: "በጅምላ መስቀል"
        },
        actions: {
          refresh: "አደስ",
          addRoom: "ክፍል ጨምር",
          viewDetails: "ዝርዝሮች ተመልከት",
          editStatus: "ሁኔታ ቀይር"
        },
        searchRooms: "ክፍሎችን ፈልግ",
        statusFilter: "የሁኔታ ማጣሪያ",
        allStatuses: "ሁሉም ሁኔታዎች",
        guestPresent: "እንግዳ አለ",
        tableHeaders: {
          roomNumber: "የክፍል ቁጥር",
          type: "አይነት",
          status: "ሁኔታ",
          currentGuest: "አሁን ያለ እንግዳ",
          capacity: "አቅም",
          price: "በሌሊት ዋጋ",
          available: "ይገኛል",
          actions: "ድርጊቶች"
        },
        noGuest: "እንግዳ የለም",
        guests: "እንግዶች",
        available: "ይገኛል",
        unavailable: "አይገኝም",
        updateStatus: "ሁኔታ አዘምን",
        updateRoomStatus: "የክፍል ሁኔታ አዘምን",
        roomInfo: "ክፍል: {{roomNumber}} ({{roomType}})",
        status: "ሁኔታ",
        cancel: "ሰርዝ",
        update: "አዘምን",
        roomStatuses: {
          available: "ይገኛል",
          occupied: "ተያዟል",
          outOfOrder: "ከአገልግሎት ውጭ",
          maintenance: "በጥገና ላይ",
          cleaning: "በጽዳት ላይ",
          dirty: "ቆሻሻ"
        },
        editRoom: {
          title: "ክፍል ቀይር",
          roomNumber: "የክፍል ቁጥር",
          status: "ሁኔታ",
          available: "ይገኛል",
          cancel: "ሰርዝ",
          save: "አስቀምጥ"
        }
      }
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
        currentOccupancyRate: "የአሁኑ ተሳፋሪነት መጠን",
        confirmedBookings: "የተረጋገጡ ቦታ ማስያዞች"
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
        totalBookings: 'አጠቃላይ ቦታ ማስያዝ',
        
        // Distribution and Analysis
        roomTypeDistribution: 'የክፍል አይነት ስርጭት',
        upcomingActivity: 'መጪ እንቅስቃሴዎች',
        upcomingCheckInsWeek: 'መጪ ገቢዎች (ቀጣይ 7 ቀናት)',
        upcomingCheckOutsWeek: 'መጪ መውጫዎች (ቀጣይ 7 ቀናት)',
        dailyOperationsSummary: 'የዕለት ተዕለት ስራዎች ማጠቃለያ',
        todaysCheckIns: 'የዛሬ ገቢዎች',
        todaysCheckOuts: 'የዛሬ መውጫዎች',
        weeklyActivityTrends: 'የሳምንት እንቅስቃሴ አዝማሚያዎች',
        checkInsNext7Days: 'ገቢዎች (ቀጣይ 7 ቀናት)',
        checkOutsNext7Days: 'መውጫዎች (ቀጣይ 7 ቀናት)',
        
        // Quick Actions
        quickActionsNavigation: 'ፈጣን እርምጃዎች እና አሰሳ',
        viewAllBookings: 'ሁሉንም ቦታ ማስያዝ ተመልከት',
        manageRooms: 'ክፍሎችን አስተዳድር',
        manageStaff: 'ሰራተኞችን አስተዳድር',
        staffSchedules: 'የሰራተኞች መርሐ ግብሮች',
        
        // Units and counts
        roomsCount: '{{count}} ክፍሎች',
        staffCount: '{{count}} ሰራተኞች',
        guestsCount: '{{count}} እንግዶች',
        expectedCount: '{{count}} የሚጠበቁ',
        
        // Revenue and financial
        yearRevenue: 'የዓመት ገቢ',
        yearToDateRevenue: 'የዓመት-እስከ-ዛሬ ገቢ',
        
        // Activity summaries
        thisMonthBookings: 'በዚህ ወር: {{count}} ቦታ ማስያዝ',
        bookingsThisMonth: 'በዚህ ወር ቦታ ማስያዝ',
        checkInsToday: 'የዛሬ ገቢዎች: {{checkIns}} • መውጫዎች: {{checkOuts}}',
        totalStaffCount: 'አጠቃላይ ሰራተኞች: {{count}}',
        thisMonth: 'በዚህ ወር: {{count}}',
        pendingCheckIns: 'በመጠባበቅ ላይ ያሉ ገቢዎች: {{count}}',
        thisMonthShort: 'በዚህ ወር: {{count}}'
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
      hotelInfoNotAvailable: "የሆቴል መረጃ አይገኝም",
      
      // Pricing Configuration
      pricingConfiguration: {
        title: 'የዋጋ እና ግብር ማዋቀሪያ',
        pricingPolicy: 'የዋጋ ፖሊሲ: የክፍል ዋጋዎች ያለግብር ይታያሉ። ሁሉም ተገቢ ግብሮች (ተ.እ.ግ፣ የአገልግሎት ግብር፣ የከተማ ግብር) በቦታ ማስያዝ ሂደት ውስጥ ይሰላሉ እና ይጨመራሉ። ይህ ለደንበኞች ግልጽ ዋጋ ሰጪነትን በማረጋገጥ ከግብር ደንቦች ጋር መስማማትን ያረጋግጣል።',
        
        // General Settings
        generalSettings: {
          title: 'አጠቃላይ ቅንብሮች',
          description: 'መሰረታዊ የዋጋ ፖሊሲዎችን እና ቅንብሮችን ያዋቅሩ',
          pricingStrategy: 'የዋጋ ስትራቴጂ',
          currencyCode: 'የገንዘብ ምልክት',
          fixedPricing: 'ቋሚ ዋጋ',
          seasonalPricing: 'ሰራዊ ዋጋ (ድጋፍ ያግኙ)',
          dynamicPricing: 'ተለዋዋጭ ዋጋ (ድጋፍ ያግኙ)',
          taxInclusivePricing: 'ግብር ያካተተ ዋጋ (ዋጋዎች ግብር ያካትታሉ)',
          taxInclusivePricingDescription: 'ተቦዝሟል: ግብሮች በቦታ ማስያዝ ሂደት ውስጥ ይሰላሉ እና ይጨመራሉ',
          enableDynamicPricing: 'ተለዋዋጭ ዋጋን አንቃ (ዋጋዎችን በፍላጎት መሰረት አስተካክል)',
          dynamicPricingDisabled: 'ተቦዝሟል: ቋሚ የዋጋ ስትራቴጂ ብቻ በመጠቀም ላይ'
        },
        
        // Tax Configuration
        taxConfiguration: {
          title: 'የግብር ማዋቀሪያ',
          description: 'ለቦታ ማስያዝ ስሌቶች ተግባራዊ የሚሆኑ የግብር መጠኖችን ያዋቅሩ',
          taxAlert: 'እነዚህ የግብር መጠኖች በቦታ ማስያዝ ሂደት ውስጥ በአውቶማቲክ ይተገበራሉ። ለደንበኞች የሚታዩ የክፍል ዋጋዎች እነዚህን ግብሮች አያካትቱም።',
          vatRate: 'የተ.እ.ግ መጠን (%)',
          vatRateHelper: 'አሁን ያለው ተ.እ.ግ: {{rate}} (የኢትዮጵያ ደረጃ: 15%)',
          serviceTaxRate: 'የአገልግሎት ግብር መጠን (%)',
          serviceTaxRateHelper: 'አሁን ያለው የአገልግሎት ግብር: {{rate}} (የኢትዮጵያ ደረጃ: 5%)',
          cityTaxRate: 'የከተማ ግብር መጠን (%)',
          cityTaxRateHelper: 'አሁን ያለው የከተማ ግብር: {{rate}} (በኢትዮጵያ ውስጥ ብዙውን ጊዜ 0%)'
        },
        
        // Booking Policies
        bookingPolicies: {
          title: 'የቦታ ማስያዝ ፖሊሲዎች',
          description: 'ዝቅተኛ የቆይታ መስፈርቶችን እና የቅድመ ቦታ ማስያዝ ገደቦችን ያስቀምጡ',
          minimumStayNights: 'ዝቅተኛ ቆይታ (ማታዎች)',
          minimumAdvanceBookingHours: 'ዝቅተኛ ቅድመ ቦታ ማስያዝ (ሰዓታት)',
          maximumAdvanceBookingDays: 'ከፍተኛ ቅድመ ቦታ ማስያዝ (ቀናት)'
        },
        
        // Discount Configuration
        discountConfiguration: {
          title: 'የቅናሽ ማዋቀሪያ',
          description: 'የቀደመ ቦታ ማስያዝ እና የታማኝነት ቅናሾችን ያዋቅሩ',
          earlyBookingDaysThreshold: 'የቀደመ ቦታ ማስያዝ ደረጃ (ቀናት)',
          earlyBookingDiscountRate: 'የቀደመ ቦታ ማስያዝ ቅናሽ (%)',
          loyaltyDiscountRate: 'የታማኝነት ቅናሽ (%)'
        },
        
        // Fee Configuration
        feeConfiguration: {
          title: 'የክፍያ ማዋቀሪያ',
          description: 'የሰረዝ፣ የለውጥ እና የቅጣት ክፍያዎችን ያዋቅሩ',
          cancellationFeeRate: 'የሰረዝ ክፍያ (%)',
          modificationFeeRate: 'የለውጥ ክፍያ (%)',
          noShowPenaltyRate: 'ያለመምጣት ቅጣት (%)'
        },
        
        // Seasonal Pricing Multipliers
        seasonalMultipliers: {
          title: 'የወቅታዊ ዋጋ ማባዛት',
          description: 'ለከፍተኛ እና ዝቅተኛ ወቅቶች የዋጋ ማስተካከያዎችን ያዋቅሩ',
          note: 'የወቅታዊ ማባዛት ወደ 1.0 (ምንም ለውጥ) በነባሪ ተዘጋጅተዋል። በከፍተኛ ወይም ዝቅተኛ ወቅቶች ዋጋዎችን መቀየር ከፈለጉ እነዚህን እሴቶች ማስተካከል ይችላሉ።',
          peakSeasonMultiplier: 'የከፍተኛ ወቅት ማባዛት',
          offSeasonMultiplier: 'የዝቅተኛ ወቅት ማባዛት',
          peakSeasonHelper: '{{value}} = {{percentage}} በከፍተኛ ወቅት',
          offSeasonHelper: '{{value}} = {{percentage}} በዝቅተኛ ወቅት'
        },
        
        // Booking Rules
        bookingRules: {
          title: 'የቦታ ማስያዝ ደንቦች',
          description: 'የቦታ ማስያዝ ገደቦች እና መስፈርቶችን ያዋቅሩ',
          minimumStayNights: 'ዝቅተኛ ቆይታ (ማታዎች)',
          minimumAdvanceBookingHours: 'ዝቅተኛ ቅድመ ቦታ ማስያዝ (ሰአቶች)',
          maximumAdvanceBookingDays: 'ከፍተኛ ቅድመ ቦታ ማስያዝ (ቀናት)'
        },
        
        // Discounts & Fees
        discountsFees: {
          title: 'ቅናሾች እና ክፍያዎች',
          description: 'የቅናሽ መጠኖች እና የቅጣት ክፍያዎችን ያዋቅሩ',
          earlyBookingDaysThreshold: 'የቅድመ ቦታ ማስያዝ ቀናት ማስታወሻ',
          earlyBookingDaysHelperText: 'ለቅድመ ቦታ ማስያዝ ቅናሽ ለማግኘት በቅድሚያ ቀናት',
          earlyBookingDiscountRate: 'የቅድመ ቦታ ማስያዝ ቅናሽ መጠን (%)',
          loyaltyDiscountRate: 'የታማኝነት ቅናሽ መጠን (%)',
          cancellationFeeRate: 'የሰረዝ ክፍያ መጠን (%)',
          modificationFeeRate: 'የለውጥ ክፍያ መጠን (%)',
          noShowPenaltyRate: 'የአለመጣት ቅጣት መጠን (%)',
          discountHelper: '{{value}} = {{percentage}}',
          feeHelper: '{{value}} = {{percentage}}',
          penaltyHelper: '{{value}} = {{percentage}} ቅጣት'
        },
        
        // Cancellation Refund Policies
        cancellationRefundPolicies: {
          title: 'የሰረዝ መመለሻ ፖሊሲዎች',
          description: 'በሰረዝ ጊዜ ላይ ተመስርተው የመመለሻ መጠኖችን ያዋቅሩ',
          alertDescription: 'ደንበኞች ቦታ ማስያዝዎቻቸውን ከመግቢያ በፊት በተለያዩ ጊዜ ወቅቶች ሲሰርዙ የሚቀበሉትን የመመለሻ መጠኖብ ያስቀምጡ። እነዚህ ፖሊሲዎች ሰረዛዎችን በሚያስተናግዱበት ጊዜ በራሳቸው ይተገበራሉ።',
          refund7PlusDays: 'ከ7+ ቀናት በፊት ከመግቢያ',
          refund3To7Days: 'ከ3-7 ቀናት በፊት ከመግቢያ',
          refund1To2Days: 'ከ1-2 ቀናት በፊት ከመግቢያ',
          refundSameDay: 'በተመሳሳይ ቀን ሰረዝ',
          refundHelper7Plus: 'አሁን: {{value}}% መመለሻ (የሚመከር: 100%)',
          refundHelper3To7: 'አሁን: {{value}}% መመለሻ (የሚመከር: 50%)',
          refundHelper1To2: 'አሁን: {{value}}% መመለሻ (የሚመከር: 25%)',
          refundHelperSameDay: 'አሁን: {{value}}% መመለሻ (የሚመከር: 0%)'
        },
        
        // Additional Notes
        additionalNotes: {
          title: 'ተጨማሪ ማስታወሻዎች',
          description: 'ማንኛውም ተጨማሪ የማዋቀሪያ ማስታወሻዎች ወይም አስተያየቶች ያክሉ',
          configurationNotes: 'የማዋቀሪያ ማስታወሻዎች',
          placeholder: 'ስለዚህ የዋጋ ማዋቀሪያ ማንኛውም ማስታወሻዎች ያክሉ...'
        },
        
        // Refund Policy
        refundPolicy: {
          title: 'የመመለሻ ፖሊሲ',
          description: 'በሰረዝ ጊዜ ላይ በመመርኮዝ የመመለሻ መጠኖችን ያዋቅሩ',
          refundPolicy7PlusDays: 'የመመለሻ መጠን (ከ7+ ቀናት በፊት) (%)',
          refundPolicy3To7Days: 'የመመለሻ መጠን (ከ3-7 ቀናት በፊት) (%)',
          refundPolicy1To2Days: 'የመመለሻ መጠን (ከ1-2 ቀናት በፊት) (%)',
          refundPolicySameDay: 'የመመለሻ መጠን (በተመሳሳይ ቀን) (%)'
        },
        
        // Actions
        actions: {
          saveConfiguration: 'ማዋቀሪያን አስቀምጥ',
          refreshConfiguration: 'ማዋቀሪያን አድስ',
          saving: 'በመቀመጥ ላይ...',
          loading: 'በመጫን ላይ...'
        },
        
        // Refund Policy Note
        refundPolicyNote: {
          title: 'ማስታወሻ:',
          description: 'እነዚህ የመመለሻ ፖሊሲዎች የነበሩትን ግትር የስረዛ ደንቦች ይተካላሉ። ከእርስዎ የንግድ መስፈርቶች እና የአካባቢ ደንቦች ጋር የሚጣጣሙ ፖሊሲዎችን ማስተካከል እንዲያረጋግጡ።'
        },
        
        // Messages
        messages: {
          loadingConfiguration: 'የዋጋ ማዋቀሪያ በመጫን ላይ...',
          savingConfiguration: 'ማዋቀሪያ በመቀመጥ ላይ...',
          configurationSaved: 'የዋጋ ማዋቀሪያ በተሳካ ሁኔታ ተቀምጧል!',
          failedToLoad: 'የዋጋ ማዋቀሪያ መጫን አልተሳካም። እባክዎ ገጹን ማደስ ይሞክሩ።',
          failedToSave: 'የዋጋ ማዋቀሪያ ማስቀመጥ አልተሳካም',
          taxInfo: 'እነዚህ የግብር መጠኖች በቦታ ማስያዝ ሂደት ውስጥ በአውቶማቲክ ይተገበራሉ። ለደንበኞች የሚታዩ የክፍል ዋጋዎች እነዚህን ግብሮች አያካትቱም።'
        }
      },
      
      // Offline Booking
      offlineBooking: {
        title: 'ከመስመር ውጭ የእንግዳ ቦታ ማስያዝ',
        description: 'የእንግዳ ቦታ ማስያዝ ሂደትን ደረጃ በደረጃ ያጠናቁ',
        offlineMode: 'ከመስመር ውጭ ሁኔታ',
        pendingSync: '{{count}} በመመሳሰል ላይ',
        
        // Steps
        steps: {
          guestInformation: 'የእንግዳ መረጃ',
          roomSelection: 'ክፍል ምርጫ',
          confirmation: 'ማረጋገጫ'
        },
        
        // Guest Information
        guestInformation: {
          title: 'የእንግዳ መረጃ',
          description: 'ለቦታ ማስያዝ የእንግዳ ዝርዝሮችን ያስገቡ',
          firstName: 'የመጀመሪያ ስም',
          lastName: 'የመጨረሻ ስም',
          email: 'ኢሜል አድራሻ',
          phone: 'ስልክ ቁጥር',
          required: 'ይህ መስክ ያስፈልጋል'
        },
        
        // Booking Details
        bookingDetails: {
          title: 'የቦታ ማስያዝ ዝርዝሮች',
          stayDetailsTitle: 'የመቆየት ዝርዝሮች',
          checkInDate: 'የመግቢያ ቀን',
          checkOutDate: 'የመውጫ ቀን',
          numberOfGuests: 'የእንግዶች ቁጥር',
          specialRequests: 'ልዩ ጥያቄዎች (አማራጭ)',
          availableRoomsTitle: 'ያሉ ክፍሎች'
        },        // Guest Search Dialog
        guestSearchDialog: {
          title: 'የበፍታ እንግዶችን መፍተሽ',
          searchPlaceholder: 'በስም፣ ኢሜል ወይም ስልክ ተፍተሽ',
          searchButton: 'መፍተሽ',
          close: 'ዝጋ',
          noGuestsFound: 'እንግዶች አልተገኙም',
          selectGuest: 'እንግዳ ይምረጡ'
        },
        
        // Actions
        actions: {
          back: 'ወደ ሕላ',
          next: 'ወደ ፍርጽ',
          loading: 'በመጫን ላይ...',
          createBooking: 'ቦታ ማስያዝ ፍጠር',
          creatingBooking: 'ቦታ ማስያዝ በፍጠር ላይ...',
          confirmBooking: 'ቦታ ማስያዝ ማረጋገጫ',
          backToRoomSelection: 'ወደ ክፍል ምርጫ መለስ'
        },
        
        // Validation Errors
        validationErrors: {
          fillGuestInfo: 'እባክዎ ሁሉንም የእንግዳ ምሪጫ ሜዳኖችን ይሞሉ',
          selectRoom: 'እባክዎ ክፍል ይምረጡ',
          invalidEmail: 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ',
          selectDatesAndGuests: 'ቀናትን እና የእንግዶች ቁጥር ይምረጡ',
          noRoomsAvailable: 'ለ{{guests}} እንግዳ{{plural}} ከ{{checkIn}} እስከ {{checkOut}} ክፍሎች አይገኙም። እባክዎ ሌሎች ቀናት ይሞክሩ ወይም የእንግዶች ቁጥር ይቀንሱ።'
        },
        
        // Messages
        messages: {
          startOver: 'እንደገና ይጀምሩ',
          bookingCreated: 'ቦታ ማስያዝ በተሳካ ሁኔታ ተፍጠረ!',
          confirmationNumber: 'የማረጋገጫ ቁጥር: {{number}}',
          willSyncWhenOnline: 'የኢንተርነት ክብር ስይፎረ ይህ ቦታ ማስያዝ ይመሳሰል።',
          bookingFailed: 'ቦታ ማስያዝ ፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
          invalidDates: 'የመውጫ ቀን ከመግቢያ ቀን በሐላ ሞሆን አለበት',
          fillAllFields: 'እባክዎ ሁሉንም አስፈላጊ ሜዳኖች ይሞሉ'
        },
        
        // Room Selection
        roomSelection: {
          title: 'ክፍል ምርጫ',
          description: 'ለእንግዳው የሚገኝ ክፍል ይምረጡ',
          numberOfGuests: 'የእንግዶች ቁጥር',
          roomNumber: 'ክፍል {{number}}',
          roomType: 'የክፍል አይነት: {{type}}',
          capacity: 'አቅም: {{capacity}} እንግዶች',
          pricePerNight: 'ዋጋ: {{price}} በማታ',
          pricePerNightShort: '/ማታ',
          pricingCalculation: '{{pricePerNight}}/ማታ × {{nights}} ማታ',
          selectRoom: 'ክፍል ይምረጡ',
          noRoomsAvailable: 'ለተመረጡት ቀናት ክፍሎች አይገኙም',
          loadingRooms: 'የሚገኙ ክፍሎች በመጫን ላይ...'
        },
        
        // Confirmation
        confirmation: {
          title: 'የቦታ ማስያዝ ማረጋገጫ',
          description: 'የቦታ ማስያዝ ዝርዝሮችን ይገምግሙ እና ያረጋግጡ',
          bookingSummary: 'የቦታ ማስያዝ ማጠቃለያ',
          guestInformationTitle: 'የእንግዳ መረጃ',
          roomDetailsTitle: 'የክፍል ዝርዝሮች',
          guestName: 'እንግዳ: {{firstName}} {{lastName}}',
          contactInfo: 'ዕውቅና: {{email}} | {{phone}}',
          stayDuration: 'ቆይታ: {{checkIn}} እስከ {{checkOut}} ({{nights}} ማታዎች)',
          selectedRoom: 'ክፍል: {{roomNumber}} ({{roomType}})',
          totalCost: 'አጠቃላይ ወጪ: {{total}}',
          confirmBooking: 'ቦታ ማስያዝን አረጋግጥ',
          backToRoomSelection: 'ወደ ክፍል ምርጫ ተመለስ',
          // Additional labels for confirmation section
          emailLabel: 'ኢሜል:',
          phoneLabel: 'ስልክ:',
          roomLabel: 'ክፍል:',
          checkInLabel: 'መግቢያ:',
          checkOutLabel: 'መውጫ:',
          guestsLabel: 'እንግዶች:',
          specialRequestsLabel: 'ልዩ ጥያቄዎች:',
          pricingSummaryTitle: 'የዋጋ ማጠቃለያ',
          totalAmountTitle: 'አጠቃላይ መጠን',
          paymentNote: 'ክፍያ በሪሴፕሽን ይከናወናል (ኦፍላይን ሁነታ)'
        },
        
        // Actions
        nextStep: 'ቀጣይ ደረጃ',
        previousStep: 'ቀደም ያለ ደረጃ',
        startOver: 'እንደገና ጀምር',
        
        // Messages
        bookingCreated: 'ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጠረ!',
        confirmationNumber: 'የማረጋገጫ ቁጥር: {{number}}',
        willSyncWhenOnline: 'ይህ ቦታ ማስያዝ የበይነመረብ ግንኙነት ሲመለስ ይመሳሰላል።',
        bookingFailed: 'ቦታ ማስያዝ መፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
        invalidDates: 'የመውጫ ቀን ከመግቢያ ቀን በኋላ መሆን አለበት',
        fillAllFields: 'እባክዎ ሁሉንም የሚያስፈልጉ መስኮች ይሙሉ',
        creatingBooking: 'የእንግዳ ቦታ ማስያዝ በመፍጠር ላይ...'
      },

      // Room Management
      roomManagement: {
        tabs: {
          roomList: "ክፍሎች ዝርዝር",
          pricing: "የክፍል አይነት ዋጋ",
          bulkUpload: "በጅምላ መስቀል"
        },
        actions: {
          refresh: "አደስ",
          addRoom: "ክፍል ጨምር",
          viewDetails: "ዝርዝሮች ተመልከት",
          editStatus: "ሁኔታ ቀይር"
        },
        tableHeaders: {
          roomNumber: "የክፍል ቁጥር",
          type: "አይነት",
          status: "ሁኔታ",
          currentGuest: "አሁን ያለ እንግዳ",
          capacity: "አቅም",
          price: "ዋጋ/ሌሊት",
          available: "ይገኛል",
          actions: "ተግባራት"
        },
        searchRooms: "ክፍሎችን ፈልግ...",
        statusFilter: "የሁኔታ ማጣሪያ",
        allStatuses: "ሁሉም ሁኔታዎች",
        guestPresent: "እንግዳ አለ",
        roomStatuses: {
          available: "ይገኛል",
          occupied: "ተይዞ",
          outOfOrder: "ከስራ ወጪ",
          maintenance: "ጥገና",
          cleaning: "ንፅህና",
          dirty: "የቆሸሸ"
        },
        noGuest: "እንግዳ የለም",
        guests: "እንግዶች",
        available: "ይገኛል",
        unavailable: "አይገኝም",
        updateStatus: "ሁኔታ አዘምን",
        updateRoomStatus: "የክፍል ሁኔታ አዘምን",
        roomInfo: "ክፍል: {{roomNumber}} ({{roomType}})",
        status: "ሁኔታ",
        cancel: "ሰርዝ",
        update: "አዘምን",
        editRoom: {
          title: "ክፍል ቀይር",
          roomNumber: "የክፍል ቁጥር",
          status: "ሁኔታ",
          available: "ይገኛል",
          cancel: "ሰርዝ",
          save: "አስቀምጥ"
        },
        createRoom: {
          title: "አዲስ ክፍል ጨምር",
          roomNumber: "የክፍል ቁጥር",
          roomType: "የክፍል አይነት",
          pricePerNight: "ዋጋ በሌሊት",
          capacity: "አቅም",
          description: "መግለጫ",
          cancel: "ሰርዝ",
          create: "ክፍል ፍጠር"
        }
      }
    }
  },

  // Booking Management
  booking: {
    find: {
      title: "የመያዣ ዝርዝሮችዎን ያስገቡ",
      subtitle: "መያዣዎን ለማግኘት ሁለቱም መስኮች ያስፈልጋሉ",
      fields: {
        confirmationNumber: "ማጣቀሻ ቁጥር",
        email: "ኢሜይል አድራሻ",
        confirmationNumberPlaceholder: "የማረጋገጫ ቁጥር ያስገቡ",
        emailPlaceholder: "ኢሜይል አድራሻ ያስገቡ"
      },
      buttons: {
        findBooking: "መያዣ ይፈልጉ",
        searching: "በመፈለግ ላይ..."
      },
      errors: {
        bothFieldsRequired: "የማረጋገጫ ቁጥር እና ኢሜይል ሁለቱም ያስፈልጋሉ",
        bookingNotFound: "መያዣ አልተገኘም። እባክዎ የማረጋገጫ ቁጥርዎን እና ኢሜይል አድራሻዎን ይፈትሹ።"
      },
      found: {
        title: "መያዣ ተገኝቷል!",
        confirmation: "ማረጋገጫ: {{confirmationNumber}}",
        manageBooking: "መያዣ ያስተዳድሩ",
        labels: {
          guestName: "የእንግዳ ስም",
          roomType: "የክፍል አይነት",
          checkIn: "መግቢያ",
          checkOut: "መውጫ",
          totalAmount: "ጠቅላላ መጠን",
          status: "ሁኔታ",
          paymentStatus: "የክፍያ ሁኔታ",
          paymentReference: "የክፍያ ማጣቀሻ"
        }
      },
      help: {
        title: "እርዳታ ይፈልጋሉ?",
        description: "መያዣዎን ለማግኘት የማጣቀሻ ቁጥርዎ እና ማስያዝ ሲያደርጉ የተጠቀሙበት ኢሜይል አድራሻ ሁለቱም ያስፈልግዎታል። የማጣቀሻ ቁጥሩ በመያዣ ማረጋገጫ ኢሜይልዎ ውስጥ ሊገኝ ይችላል። መያዣዎን ማግኘት ካልቻሉ እባክዎ ሆቴሉን በቀጥታ ያግኙ።"
      }
    },
    manage: {
      title: "መያዣዎን ያስተዳድሩ",
      confirmationLabel: "ማረጋገጫ",
      sendingEmail: "ኢሜይል በመላክ ላይ...",
      modifyBooking: "መያዣ ይቀይሩ",
      cancelBooking: "መያዣ ይሰርዙ",
      bookingDetails: "የመያዣ ዝርዝሮች",
      stayDetails: "የመቆያ ዝርዝሮች",
      checkIn: "መግቢያ",
      checkOut: "መውጫ", 
      duration: "ጊዜ",
      totalAmount: "ጠቅላላ መጠን",
      hotelAndRoom: "ሆቴል እና የክፍል አይነት",
      hotel: "ሆቴል",
      roomType: "የክፍል አይነት",
      roomAssignment: "የክፍል ምደባ",
      roomAssignmentNote: "ክፍል በመግቢያ ጊዜ ይመደባል",
      rate: "ዋጋ",
      guestInformation: "የእንግዳ መረጃ",
      name: "ስም",
      email: "ኢሜይል",
      numberOfGuests: "የእንግዶች ቁጥር",
      paymentInformation: "የክፍያ መረጃ",
      paymentStatus: "የክፍያ ሁኔታ",
      paymentReference: "የክፍያ ማጣቀሻ",
      modifyDialogTitle: "መያዣዎን ይቀይሩ",
      guestName: "የእንግዳ ስም",
      guestNameHelp: "ለዚህ መያዣ ዋናውን የእንግዳ ስም ያዘምኑ",
      emailAddress: "ኢሜይል አድራሻ",
      emailHelp: "ለማረጋገጫዎች የሚያስፈልግ ከሆነ ኢሜይል አድራሻዎን ያዘምኑ",
      checkInDate: "የመግቢያ ቀን",
      checkOutDate: "የመውጫ ቀን",
      numberOfGuestsHelp: "ለመያዣዎ የእንግዶች ቁጥር ያዘምኑ",
      selectRoomType: "የክፍል አይነት ይምረጡ",
      reasonForModification: "የመቀየሪያ ምክንያት",
      reasonHelp: "አማራጭ: ለምን እየቀየሩ እንደሆነ እንድንረዳ ይርዱን",
      cancel: "ይሰርዙ",
      modifying: "በመቀየር ላይ...",
      modifyBookingAction: "መያዣ ይቀይሩ",
      cancelDialogTitle: "መያዣዎን ይሰርዙ",
      cancellationPolicy: "የሰረዝ ፖሊሲ",
      cancellationPolicyDetails: "• ከመግቢያ ወጣት በላይ ከ7 ቀናት በፊት: 100% ተመላሽ\n• ከ3-7 ቀናት በፊት: 50% ተመላሽ\n• ከ1-2 ቀናት በፊት: 25% ተመላሽ\n• ተመሳሳይ ቀን: ተመላሽ የለም",
      reasonForCancellation: "የሰረዝ ምክንያት",
      cancellationReasonHelp: "አማራጭ: ለምን እየሰረዙ እንደሆነ እንድንረዳ ይርዱን",
      keepBooking: "መያዣ ይቀጥሉ",
      cancelling: "በመሰረዝ ላይ...",
      cancelBookingAction: "መያዣ ይሰርዙ"
    },
    paymentStatus: {
      completed: "ተጠናቅቋል",
      pending: "በመጠባበቅ ላይ", 
      processing: "በሂደት ላይ",
      failed: "ተወዳድሯል"
    },
    guestBooking: "የእንግዳ ቦታ ማስያዝ",
    
    // Guest Booking Page
    page: {
      roomDetails: "የክፍል ዝርዝሮች",
      roomType: "የክፍል አይነት",
      hotel: "ሆቴል",
      pricePerNight: "በማታ ዋጋ",
      totalAmount: "አጠቃላይ መጠን",
      checkInDate: "የመግቢያ ቀን",
      checkOutDate: "የመውጫ ቀን",
      numberOfGuests: "የእንግዶች ቁጥር",
      guestInformation: "የእንግዳ መረጃ",
      guestDetails: "የእንግዳ ዝርዝሮች",
      fullName: "ሙሉ ስም",
      emailAddress: "ኢሜይል አድራሻ",
      phoneNumber: "ስልክ ቁጥር",
      nights: "ሌሊት",
      nightsPlural: "ሌሊቶች",
      hotelInformation: "የሆቴል መረጃ",
      fullNamePlaceholder: "ሙሉ ስምዎን ያስገቡ",
      emailPlaceholder: "ኢሜይል አድራሻዎን ያስገቡ", 
      phonePlaceholder: "ስልክ ቁጥርዎን ያስገቡ (አማራጭ)",
      checkOutAfterCheckIn: "የመውጫ ቀን ከመግቢያ ቀን በኋላ መሆን አለበት",
      
      // Navigation and Breadcrumbs
      hotelSearch: "የሆቴል ፍለጋ",
      searchResults: "የፍለጋ ውጤቶች",
      bookYourStay: "የእርስዎን ቆይታ ያስያዙ",
      backToSearchResults: "← ወደ ፍለጋ ውጤቶች ተመለስ",
      
      // Status and Notices  
      noAccountRequired: "መለያ አያስፈልግም!",
      secureInformation: "🔒 መረጃዎ በደህንነት የተጠበቀ ሲሆን ለዚህ ቦታ ማስያዝ ብቻ ይጠቅማል",
      
      // Payment Methods
      paymentMethod: "የክፍያ ዘዴ",
      creditCard: "ክሬዲት ካርድ", 
      mobileMoney: "ሞባይል ገንዘብ",
      payWithMobile: "በስልክዎ ይክፈሉ",
      payAtFrontDesk: "በሪሴፕሽን ይክፈሉ",
      mBirr: "ኤም-ብር",
      
      // Booking Actions
      bookNow: "አሁን ያስያዙ",
      book: "ያስያዙ",
      booking: "በመያዝ ላይ...",
      bookNowWithAmount: "አሁን ያስያዙ - {{amount}} ብር",
      bookWithAmount: "ያስያዙ - {{amount}} ብር",
      processing: "በሂደት ላይ...",
      
      // Security and Payment Info
      securePayment: "በSSL የተመሰጠረ ደህንነታማ የክፍያ ሂደት። ሁሉም ዋና ካርዶች ይቀበላሉ።",
      paymentInstructions: "የመታወቂያ ካርድ እና የቦታ ማስያዝ ማረጋገጫ ይዘው ይምጡ። የክፍያ ዘዴዎች: ጥሬ ገንዘብ፣ ካርድ፣ ሞባይል።",
      
      // Error Messages
      fillAllRequiredFields: "እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ",
      provideGuestNameAndEmail: "እባክዎ የእንግዳ ስም እና ኢሜይል ያቅርቡ",
      provideValidEmail: "እባክዎ ትክክለኛ ኢሜይል አድራሻ ያቅርቡ",
      fillCreditCardDetails: "እባክዎ ሁሉንም የክሬዲት ካርድ ዝርዝሮች ይሙሉ",
      provideMobileNumber: "እባክዎ የሞባይል ቁጥር ያቅርቡ",
      provideMobileReference: "እባክዎ የሞባይል ማስተላለፊያ ማጣቀሻ ቁጥር ያቅርቡ",
      enterValidMobileNumber: "እባክዎ ትክክለኛ የሞባይል ቁጥር ያስገቡ",
      provideEthiopianMobile: "እባክዎ የኢትዮጵያ ሞባይል ቁጥርዎን ያቅርቡ",
      
      // Payment Component Labels
      creditCardPayment: "የክሬዲት ካርድ ክፍያ",
      cardholderName: "የካርድ ባለቤት ስም",
      cardNumber: "የካርድ ቁጥር",
      expiryDate: "የማለቂያ ቀን",
      cvv: "ሲቪቪ",
      mobileMoneyTransfer: "የሞባይል ገንዘብ ማስተላለፊያ",
      payWithYourMobile: "በስልክዎ ይክፈሉ",
      completeMobileTransfer: "በሚመርጡት የሞባይል ክፍያ መተግበሪያ የሞባይል ገንዘብ ማስተላለፊያውን ይጨርሱ።",
      transferToMobileOnly: "ማስተላለፊያ ወደ (ሞባይል ገንዘብ ብቻ)",
      yourMobileNumber: "የእርስዎ ሞባይል ቁጥር",
      mobileTransferReference: "የሞባይል ማስተላለፊያ ማጣቀሻ ቁጥር",
      enterReferenceNumber: "ከሞባይል ማስተላለፊያዎ የተሰጠዎትን ማጣቀሻ ቁጥር ያስገቡ",
      provideReferenceHelp: "የሞባይል ገንዘብ ማስተላለፊያውን ከጨረሱ በኋላ የተሰጠዎትን ማጣቀሻ ቁጥር ያቅርቡ",
      transferExactAmount: "ትክክለኛውን መጠን ያስተላልፉ:",
      toMobileNumberAbove: "ወደ ላይ ያለው ሞባይል ቁጥር፣ ከዚያም የማስተላለፊያ ማጣቀሻ ቁጥርዎን ያስገቡ።",
      payAtFrontDeskPayment: "በሪሴፕሽን ክፍያ",
      reservationConfirmed: "ቦታ ማስያዝዎ ይረጋገጣል። ወደ ሆቴሉ ሲመጡ ይክፈሉ።",
      bringValidId: "የመታወቂያ ካርድ እና የቦታ ማስያዝ ማረጋገጫ ይዘው ይምጡ። የክፍያ ዘዴዎች: ጥሬ ገንዘብ፣ ካርድ፣ ሞባይል።",
      alternative: "አማራጭ",
      
      // Special Requests
      specialRequests: "ልዩ ጥያቄዎች (አማራጭ)",
      specialRequestsPlaceholder: "ማንኛውም ልዩ አገልግሎት ወይም ጥያቄ?",
      
      // Ethiopian Phone Number (for mobile payments)
      ethiopianPhoneLabel: "የኢትዮጵያ ስልክ ቁጥር",
      ethiopianPhonePlaceholder: "ለሞባይል ክፍያ የኢትዮጵያ ስልክ ቁጥር ያስገቡ"
    },
    
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
    },
    
    // Booking Management Table
    management: {
      title: "የቦታ ማስያዝ አማካሪ",
      searchPlaceholder: "በእንግዳ ስም፣ ማረጋገጫ ቁጥር፣ ክፍል፣ የክፍያ ማመሳከሪያ ወይም የክፍያ ሁኔታ ይፈልጉ...",
      refresh: "አድስ",
      noBookingsFound: "ምንም ቦታ ማስያዝ አልተገኘም",
      loading: "ቦታ ማስያዞች እየተጫኑ ነው...",
      
      // Table Headers
      headers: {
        confirmationNumber: "ማረጋገጫ ቁጥር",
        guest: "እንግዳ",
        room: "ክፍል",
        checkIn: "መግባት",
        checkOut: "መውጣት",
        paymentRef: "የክፍያ ማመሳከሪያ",
        paymentStatus: "የክፍያ ሁኔታ",
        status: "ሁኔታ",
        actions: "ድርጊቶች"
      },
      
      // Actions
      actions: {
        view: "እይ",
        edit: "አርም",
        delete: "ሰርዝ",
        checkIn: "ገባ",
        checkOut: "ውጣ",
        receipt: "ደረሰኝ",
        cancel: "ሰርዝ",
        addGuest: "እንግዳ ጨምር"
      },
      
      // Status Filter
      statusFilter: {
        all: "ሁሉም ሁኔታዎች",
        confirmed: "ተረጋግጧል",
        checkedIn: "ወደ ሆቴል ገብቷል",
        checkedOut: "ከሆቴል ወጥቷል",
        cancelled: "ተሰርዟል",
        pending: "በመጠባበቅ ላይ",
        noShow: "አልመጣም"
      },
      
      // Dialogs
      dialogs: {
        deleteConfirm: {
          title: "መሰረዝን አረጋግጥ",
          message: "የ{{guestName}}ን ቦታ ማስያዝ መሰረዝ እርግጠኛ ነዎት? ይህ ድርጊት መመለስ አይቻልም።",
          cancel: "ሰርዝ",
          delete: "ሰርዝ"
        },
        checkoutConfirm: {
          title: "የእንግዳ መውጣትን አረጋግጥ",
          message: "{{guestName}}ን ከክፍል {{roomNumber}} ማውጣት እርግጠኛ ነዎት?",
          subtitle: "ይህ እንግዳውን እንደወጣ ይምዘገዝ እና የመጨረሻ ደረሰኝ ይሰጣል።",
          cancel: "ሰርዝ",
          checkOut: "ውጣ"
        }
      }
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
    },
    
    // Room Details
    details: {
      title: "የክፍል ዝርዝሮች",
      edit: "ቀይር",
      
      // Basic Information
      basicInformation: "መሠረታዊ መረጃ",
      roomNumber: "የክፍል ቁጥር",
      roomType: "የክፍል አይነት",
      roomId: "የክፍል መለያ",
      capacity: "አቅም",
      
      // Pricing & Availability
      pricingAndAvailability: "ዋጋ እና ተገኝነት",
      pricePerNight: "ለአንድ ሌሊት ዋጋ",
      availabilityStatus: "የተገኝነት ሁኔታ",
      available: "ክፍት",
      unavailable: "ክፍት አይደለም",
      currentRate: "አሁን ያለው ዋጋ",
      
      // Description
      description: "መግለጫ",
      roomDescription: "የክፍል መግለጫ",
      
      // Hotel Information
      hotelInformation: "የሆቴል መረጃ",
      hotelName: "የሆቴል ስም",
      hotelId: "የሆቴል መለያ",
      
      // Actions
      cancel: "ሰርዝ",
      save: "ወደ ፋይል አስቀምጥ",
      loading: "በመጫን ላይ...",
      
      // Error Messages
      errors: {
        invalidRoomId: "ልክ ያልሆነ የክፍል መለያ",
        failedToLoad: "የክፍል ዝርዝሮች መጫን አልተሳካም",
        failedToUpdate: "ክፍሉን ማዘመን አልተሳካም",
        roomNotFound: "ክፍሉ አልተገኘም",
        apiNotSupported: "የክፍል ተገኝነት መቀያየር በአሁኑ API አይደገፍም",
        failedToUpdateStatus: "የክፍል ሁኔታ ማዘመን አልተሳካም"
      },
      
      // Success Messages
      success: {
        roomUpdated: "ክፍሉ በተሳካ ሁኔታ ዘምኗል"
      }
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
  walkInBooking: {
    title: 'የእንግዳ ቦታ ማስያዝ',
    subtitle: 'የእንግዳ ቦታ ማስያዝ ሂደትን ደረጃ በደረጃ ያጠናቅቁ',
    steps: {
      guestInformation: 'የእንግዳ መረጃ',
      roomSelection: 'ክፍል ምርጫ',
      confirmation: 'ማረጋገጫ'
    },
    guestInformation: {
      title: 'የእንግዳ መረጃ',
      firstName: 'የመጀመሪያ ስም',
      lastName: 'የአባት ስም',
      email: 'የኢሜይል አድራሻ',
      phone: 'ስልክ ቁጥር',
      description: 'እባክዎ የእንግዳው የመገናኛ መረጃ ያቅርቡ'
    },
    stayDetails: {
      title: 'የመቆያ ዝርዝሮች',
      checkIn: 'የመግቢያ ቀን',
      checkOut: 'የመውጫ ቀን',
      nights: 'ሌሊቶች',
      guests: 'የእንግዶች ቁጥር',
      checkInDate: 'የመግቢያ ቀን',
      checkOutDate: 'የመውጫ ቀን',
      numberOfGuests: 'የእንግዶች ቁጥር',
      description: 'የመግቢያ እና የመውጫ ቀናትዎን ይምረጡ'
    },
    roomSelection: {
      title: 'ክፍል ምርጫ',
      selectRoom: 'ክፍል ምረጥ',
      roomType: 'የክፍል አይነት',
      pricePerNight: 'በአንድ ሌሊት ዋጋ',
      totalAmount: 'ጠቅላላ ዋጋ',
      noRoomsAvailable: 'ለተመረጡት ቀናት ክፍሎች የሉም',
      description: 'ለ{{guests}} እንግዳ{{guestsPlural}} ከ{{checkIn}} እስከ {{checkOut}} ያሉ ክፍሎች',
      loadingRooms: 'የሚገኙ ክፍሎች በመጫን ላይ...',
      specialRequests: 'ልዩ ጥያቄዎች (አማራጭ)',
      specialRequestsPlaceholder: 'ለእንግዳው መቆያ ማንኛውም ልዩ ጥያቄዎች ወይም ማስታወሻዎች...',
      roomNumber: 'ክፍል',
      capacity: 'አቅም',
      capacityText: '{{count}} እንግዳ',
      capacityTextPlural: '{{count}} እንግዶች',
      perNightShort: '/ሌሊት'
    },
    confirmation: {
      title: 'የቦታ ማስያዝ ማረጋገጫ',
      guestDetails: 'የእንግዳ ዝርዝሮች',
      stayDetails: 'የመቆያ ዝርዝሮች',
      roomDetails: 'የክፍል ዝርዝሮች',
      totalCost: 'ጠቅላላ ወጪ',
      paymentMethod: 'የመክፈያ መንገድ',
      bookingConfirmationTitle: 'የቦታ ማስያዝ ማረጋገጫ',
      reviewDetails: 'እባክዎ ከማረጋገጥዎ በፊት የቦታ ማስያዝ ዝርዝሮችዎን ይገምግሙ',
      guestInformation: 'የእንግዳ መረጃ',
      fullName: 'ሙሉ ስም',
      emailAddress: 'የኢሜይል አድራሻ',
      phoneNumber: 'ስልክ ቁጥር',
      checkInDate: 'የመግቢያ ቀን',
      checkOutDate: 'የመውጫ ቀን',
      numberOfGuests: 'የእንግዶች ቁጥር',
      numberOfNights: 'የሌሊቶች ቁጥር',
      roomType: 'የክፍል አይነት',
      roomNumber: 'የክፍል ቁጥር',
      pricePerNight: 'በአንድ ሌሊት ዋጋ',
      totalAmount: 'ጠቅላላ ዋጋ',
      nights: 'ሌሊቶች',
      room: 'ክፍል',
      checkInCheckOut: 'የመግቢያ / የመውጫ',
      guests: 'እንግዶች',
      specialRequests: 'ልዩ ጥያቄዎች',
      guest: 'እንግዳ',
      guestPlural: 'እንግዶች',
      pricingSummary: 'የዋጋ ማጠቃለያ',
      perNight: '/ሌሊት',
      night: 'ሌሊት',
      nightPlural: 'ሌሊቶች'
    },
    actions: {
      next: 'ቀጣይ',
      previous: 'ቀዳሚ',
      confirm: 'ቦታ ማስያዝ አረጋግጥ',
      cancel: 'ሰርዝ',
      startOver: 'እንደገና ጀምር',
      back: 'ተመለስ',
      loadingRooms: 'ክፍሎች በመጫን ላይ...'
    },
    validationErrors: {
      firstNameRequired: 'የመጀመሪያ ስም ያስፈልጋል',
      lastNameRequired: 'የአባት ስም ያስፈልጋል',
      emailRequired: 'ኢሜይል ያስፈልጋል',
      emailInvalid: 'ኢሜይል ትክክል አይደለም',
      phoneRequired: 'ስልክ ቁጥር ያስፈልጋል',
      checkInRequired: 'የመግቢያ ቀን ያስፈልጋል',
      checkOutRequired: 'የመውጫ ቀን ያስፈልጋል',
      invalidDateRange: 'የመውጫ ቀን ከመግቢያ ቀን በኋላ መሆን አለበት',
      guestsRequired: 'የእንግዶች ቁጥር ያስፈልጋል',
      roomRequired: 'እባክዎ ክፍል ይምረጡ'
    },
    messages: {
      bookingCreated: 'ቦታ ማስያዝ በተሳካ ሁኔታ ተፈጥሯል!',
      confirmationNumber: 'የማረጋገጫ ቁጥር: {{number}}',
      willSyncWhenOnline: 'ይህ ቦታ ማስያዝ የበይነመረብ ግንኙነት ሲመለስ ይመሳሰላል።',
      bookingFailed: 'ቦታ ማስያዝ መፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
      creatingBooking: 'የእንግዳ ቦታ ማስያዝ በመፍጠር ላይ...',
      failedToLoadHotel: 'የሆቴል መረጃ መጫን አልተሳካም',
      failedToLoadHotelPermissions: 'የሆቴል መረጃ መጫን አልተሳካም። እባክዎ ተገቢ ፈቃዶች ኖሯዎት መግባትዎን ያረጋግጡ።',
      failedToLoadRooms: 'የሚገኙ ክፍሎች መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
    }
  },
  shop: {
    dashboard: {
      title: "የሱቅ አስተዳደር",
      subtitle: "ምርቶችን፣ ትዕዛዞችን እና የሱቅ ስራዎችን ያስተዳድሩ",
      tabs: {
        newOrder: "አዲስ ትዕዛዝ",
        products: "ምርቶች",
        lowStock: "ዝቅተኛ መጋዘን",
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
        outOfStock: "ከመጋዘን ወጥቷል",
        inStock: "በመጋዘን ውስጥ",
        lowStock: "ዝቅተኛ መጋዘን",
        unknown: "አይታወቅም"
      },
      messages: {
        created: "ምርት በተሳካ ሁኔታ ተፈጥሯል",
        updated: "ምርት በተሳካ ሁኔታ ተዘምኗል",
        deleted: "ምርት በተሳካ ሁኔታ ተሰርዟል",
        loadError: "ምርቶችን መሸከም አልተሳካም",
        saveError: "ምርትን ማስቀመጥ አልተሳካም",
        outOfStockError: "\"{{productName}}\" ከመጋዘን ውጥቷል እና ወደ ትዕዛዝ ሊጨመር አይችልም።"
      }
    },
    lowStock: {
      title: "ዝቅተኛ መጋዘን ምርቶች",
      subtitle: "ከአነስተኛ መጋዘን መጠን በታች ወይም እኩል የሆኑ ምርቶች",
      refresh: "አድስ",
      noProducts: "ዝቅተኛ መጋዘን ምርቶች አልተገኙም። ሁሉም ምርቶች በቂ መጋዘን አላቸው!",
      noSearchResults: "ከፍለጋዎ መስፈርት ጋር የሚመሳሰሉ ምርቶች የሉም",
      table: {
        category: "ምድብ",
        sku: "የምርት ኮድ",
        currentStock: "የአሁን መጋዘን",
        minStock: "አነስተኛ መጋዘን",
        reorderQty: "እንደገና ማዘዝ ብዛት",
        status: "ሁኔታ",
        product: "ምርት"
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
      },
      creation: {
        orderSummary: "የትዕዛዝ ማጠቃለያ",
        purchaseType: "የግዢ አይነት",
        deliveryOptions: "የመላኪያ አማራጮች",
        deliveryRequired: "መላኪያ ያስፈልጋል",
        orderItems: "የትዕዛዝ እቃዎች",
        noItems: "ምንም እቃዎች አልተመረጡም",
        total: "ጠቅላላ:",
        createOrder: "ትዕዛዝ ፍጠር",
        processing: "በሂደት ላይ...",
        chargeToRoom: "ለክፍል ክፍያ",
        
        // Purchase types
        anonymousSale: "የማንነት ሽያጭ (ጥሬ ገንዘብ/ካርድ)",
        roomCharge: "ለክፍል ክፍያ",
        
        // Table headers
        item: "እቃ",
        qty: "ብዛት",
        price: "ዋጋ",
        action: "ድርጊት",
        
        // Form fields
        roomNumber: "የክፍል ቁጥር",
        roomNumberPlaceholder: "የክፍል ቁጥር አስገባ",
        deliveryType: "የመላኪያ አይነት",
        deliveryAddress: "የመላኪያ አድራሻ",
        
        // Payment status
        paymentCompleted: "ክፍያ በ{{method}} ተጠናቅቋል",
        paymentReference: "ማመሳከሪያ: {{reference}}",
        
        // Filters and search
        searchProducts: "ምርቶችን ፈልግ",
        category: "ምድብ",
        allCategories: "ሁሉም ምድቦች",
        
        // Stock status legend
        stockStatus: "የእቃ ሁኔታ:",
        inStock: "በመጋዘን ውስጥ",
        lowStock: "ዝቅተኛ መጋዘን",
        outOfStock: "ከመጋዘን ወጥቷል",
        
        // Product details
        stock: "መጋዘን:",
        min: "ዝቅተኛ:",
        selected: "የተመረጠ:",
        itemSingular: "እቃ",
        itemPlural: "እቃዎች",
        unavailable: "አሁን አይገኝም",
        
        // Error messages
        cartIsEmpty: "ጋሪ ባዶ ነው",
        failedToLoadProducts: "ምርቶችን መሸከም አልተሳካም",
        failedToCreateOrder: "ትዕዛዝ መፍጠር አልተሳካም"
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
  // Shop Payment Dialog
  shopPayment: {
    completePayment: "ክፍያ ይጨርሱ",
    selectPaymentMethod: "የክፍያ ዘዴ ይምረጡ",
    paymentSuccessful: "ክፍያ ተሳክቷል!",
    paymentProcessedSuccessfully: "ክፍያው በተሳካ ሁኔታ ተሰራ",
    referenceNumber: "ማጣቀሻ ቁጥር:",
    completingYourOrder: "ትዕዛዝዎን እያጠናቀቅን ነው...",
    processing: "በሂደት ላይ...",
    cancel: "ሰርዝ",
    pay: "ክፈል",
    
    // Payment Methods
    cashPayment: "የጥሬ ገንዘብ ክፍያ",
    cashDescription: "በሆቴል ሪሴፕሽን በጥሬ ገንዘብ ይክፈሉ",
    creditDebitCard: "ክሬዲት/ዴቢት ካርድ",
    cardDescription: "በካርድዎ በደህንነት ይክፈሉ",
    mobileMoney: "ሞባይል ገንዘብ",
    mobileDescription: "የሞባይል ገንዘብ ክፍያ",
    
    // Card Payment
    secureCardPayment: "ደህንነታማ የካርድ ክፍያ",
    sslEncrypted: "በSSL የተመሰጠረ የክፍያ ሂደት",
    amountLabel: "መጠን:",
    cardholderNamePlaceholder: "የካርድ ባለቤት ስም (ምሳሌ፣ ጆን ዶ)",
    cardNumberPlaceholder: "የካርድ ቁጥር (1234 5678 9012 3456)",
    expiryPlaceholder: "የማለቂያ ቀን (ወ/ዓ)",
    cvvPlaceholder: "ሲቪቪ (123)",
    
    // Mobile Money Payment
    mobileMoneyPayment: "የሞባይል ገንዘብ ክፍያ",
    paySecurelyMobile: "በሞባይል ገንዘብ መለያዎ በደህንነት ይክፈሉ",
    selectMobileProvider: "የሞባይል ገንዘብ አቅራቢ ይምረጡ",
    phoneNumberPlaceholder: "የስልክ ቁጥር (+251 9XX XXX XXX)",
    
    // Cash Payment
    collectCashPayment: "እባክዎ ከደንበኛው የጥሬ ገንዘብ ክፍያ በሰሌዳው ላይ ይሰብስቡ።",
    amountToCollect: "የሚሰበሰብ መጠን",
    
    // Pay at Front Desk
    payAtFrontDesk: "በሪሴፕሽን ክፍያ",
    customerPaysFrontDesk: "ደንበኛው ክፍያውን በሪሴፕሽን ይፈጽማል።",
    totalAmount: "ጠቅላላ መጠን",
    
    // Validation Messages
    fillAllCardDetails: "እባክዎ ሁሉንም የካርድ ዝርዝሮች ይሙሉ",
    enterValidCardNumber: "እባክዎ ትክክለኛ የካርድ ቁጥር ያስገቡ",
    fillMobileDetails: "እባክዎ የሞባይል ገንዘብ ዝርዝሮች ይሙሉ",
    paymentProcessingFailed: "የክፍያ ሂደቱ አልተሳካም",
  },
  // Shop Receipt Dialog
  shopReceipt: {
    title: "የሱቅ ግዢ ደረሰኝ",
    anonymousCustomer: "ማንነታቸው ያልታወቀ ደንበኛ",
    printReceipt: "ደረሰኝ አተምም",
    downloadReceipt: "ደረሰኝ አውርድ",
    close: "ዝጋ",
    hotelName: "ግራንድ ፕላዛ ሆቴል",
    taxId: "የታክስ መታወቂያ:",
    receiptNumber: "የሱቅ ግዢ ደረሰኝ #",
    
    // Status labels
    paid: "ተከፍሏል",
    chargedToRoom: "በክፍል ተከፍሏል",
    processing: "በሂደት ላይ",
    completed: "ተጠናቅቋል",
    pending: "በመጠባበቅ ላይ",
    confirmed: "ተረጋግጧል",
    preparing: "በዝግጅት ላይ",
    ready: "ዝግጁ",
    cancelled: "ተሰርዟል",
    
    // Sections
    customerInformation: "የደንበኛ መረጃ",
    orderDetails: "የትዕዛዝ ዝርዝሮች",
    orderSummary: "የትዕዛዝ ማጠቃለያ",
    orderNotes: "የትዕዛዝ ማስታወሻዎች",
    
    // Customer fields
    name: "ስም:",
    email: "ኢሜይል:",
    phone: "ስልክ:",
    room: "ክፍል:",
    
    // Order fields
    orderDate: "የትዕዛዝ ቀን:",
    paymentMethod: "የክፍያ ዘዴ:",
    delivery: "ማድረስ:",
    completedAt: "ተጠናቅቋል:",
    address: "አድራሻ:",
    cash: "ጥሬ ገንዘብ",
    yesDelivery: "አዎ",
    noPickup: "አይ (መውሰድ)",
    
    // Table headers
    product: "ምርት",
    sku: "ምርት ኮድ",
    qty: "ብዛት",
    unitPrice: "የአንድ ዋጋ",
    total: "ጠቅላላ",
    totalLabel: "ጠቅላላ",
    note: "ማስታወሻ:",
    tax: "ታክስ",
    subtotal: "ንዑስ ጠቅላላ",
    
    // Footer
    thankYou: "ለግዢዎ እናመሰግናለን!",
    roomDeliveryMessage: "ትዕዛዝዎ ወደ ክፍልዎ ይደርሳል።",
    pickupMessage: "እባክዎ ትዕዛዝዎን ከሱቁ ይውሰዱ።",
    receiptGenerated: "ደረሰኝ የተፈጠረበት ቀን:",
    frontDeskPerson: "የቅድሚያ ጠረጴዛ ሰራተኛ:",
    
    // Actions
    continueToPayment: "ወደ ክፍያ ቀጥል",
    closeContinue: "ዝጋና ቀጥል",
    closeAndContinue: "ዝጋና ቀጥል",
    download: "አውርድ",
  },
  
  // Booking Confirmation Page
  bookingConfirmation: {
    title: "ማስያዝ ተረጋግጧል!",
    subtitle: "የቦታ ማስያዝዎ በተሳካ ሁኔታ ተፈጥሯል",
    confirmationLabel: "ማረጋገጫ: {{confirmationNumber}}",
    
    // Loading states
    loading: "የማስያዝ ማረጋገጫ በመጫን ላይ...",
    loadingSubtitle: "የቦታ ማስያዝዎን ዝርዝሮች በምናገኝበት ጊዜ እባክዎ ይጠብቁ",
    
    // Error states
    errorNotFound: "ማስያዝ አልተገኘም",
    errorDescription: "የቦታ ማስያዝዎን መረጃ ማግኘት አልቻልንም። እባክዎ የማረጋገጫ ቁጥርዎን ያረጋግጡ ወይም እንደገና ይሞክሩ።",
    
    // Action buttons
    actions: {
      emailConfirmation: "ማረጋገጫ በኢሜይል ላክ",
      emailConfirmationShort: "ኢሜይል",
      print: "አትም",
      downloadPdf: "PDF አውርድ",
      downloadPdfShort: "PDF",
      downloading: "በማውረድ ላይ...",
      returnHome: "ወደ ቤት ተመለስ",
      searchHotels: "ተጨማሪ ሆቴሎችን ፈልግ",
      searchHotelsShort: "ሆቴሎችን ፈልግ"
    },
    
    // Quick info cards
    quickInfo: {
      checkIn: "መግቢያ",
      checkOut: "መውጫ", 
      nights: "ምሽቶች",
      totalAmount: "ጠቅላላ መጠን"
    },
    
    // Detailed sections
    sections: {
      hotelInformation: "የሆቴል መረጃ",
      roomInformation: "የክፍል መረጃ",
      guestInformation: "የእንግዳ መረጃ",
      bookingSummary: "የማስያዝ ማጠቃለያ"
    },
    
    // Room details
    room: {
      roomType: "የክፍል አይነት:",
      rate: "ዋጋ:",
      perNight: "/ለምሽት",
      roomAssignment: "የክፍል ምደባ:",
      roomAssignmentMessage: "ክፍል በመግቢያ ጊዜ ይመደባል"
    },
    
    // Guest details
    guest: {
      name: "ስም:",
      email: "ኢሜይል:",
      numberOfGuests: "የእንግዶች ቁጥር:"
    },
    
    // Booking summary
    summary: {
      bookedOn: "የተያዘበት ቀን:",
      duration: "ጊዜ:",
      nightSingle: "ምሽት",
      nightPlural: "ምሽቶች"
    },
    
    // Status labels
    status: {
      bookingStatus: "የማስያዝ ሁኔታ",
      paymentStatus: "የክፍያ ሁኔታ",
      confirmed: "ተረጋግጧል",
      pending: "በመጠባበቅ ላይ",
      cancelled: "ተሰርዟል",
      checkedIn: "ገብቷል",
      checkedOut: "ወጥቷል",
      paid: "ተከፍሏል",
      payAtFrontDesk: "በሪሴፕሽን ክፈል",
      failed: "አልተሳካም",
      refunded: "ተመልሷል"
    },
    
    // Important information
    importantInfo: {
      title: "አስፈላጊ መረጃ",
      roomAssignment: "የእርስዎ ልዩ የክፍል ቁጥር በመግቢያ ጊዜ ይመደባል",
      bringId: "እባክዎ ለመግቢያ ትክክለኛ መታወቂያ ይዘው ይምጡ",
      checkInTime: "የመግቢያ ጊዜ: 3:00 ከሰዓት | የመውጫ ጊዜ: 11:00 ጠዋት",
      changesContact: "ለማንኛውም ለውጥ ወይም ሰረዝ፣ እባክዎ በቀጥታ ሆቴሉን ያናግሩ",
      keepConfirmation: "የማረጋገጫ ቁጥርዎን ለመመሳከሪያ ያስቀምጡ"
    },
    
    // Email dialog
    emailDialog: {
      title: "የማስያዝ ማረጋገጫ በኢሜይል ላክ",
      emailLabel: "የኢሜይል አድራሻ",
      includeItinerary: "ዝርዝር መርሃ ግብርን አካትት",
      cancel: "ሰርዝ",
      sendEmail: "ኢሜይል ላክ",
      sending: "በመላክ ላይ..."
    },
    
    // Success/Error messages
    messages: {
      emailSuccess: "ኢሜይል በተሳካ ሁኔታ ተልኳል!",
      emailError: "ኢሜይል መላክ አልተሳካም።",
      emailErrorServer: "ሰርቨሩ የውስጥ ስህተት አጋጥሞታል። እባክዎ በኋላ ይሞክሩ።",
      emailErrorInvalid: "ልክ ያልሆነ የኢሜይል አድራሻ።",
      emailErrorRetry: "እባክዎ በኋላ ይሞክሩ።",
      pdfSuccess: "PDF በተሳካ ሁኔታ ተወርዷል!",
      pdfError: "PDF ማውረድ አልተሳካም።",
      pdfErrorServer: "ሰርቨሩ የውስጥ ስህተት አጋጥሞታል። እባክዎ በኋላ ይሞክሩ ወይም ድጋፍን ያናግሩ።",
      pdfErrorNotFound: "ለዚህ ማስያዝ PDF አልተገኘም።",
      pdfErrorAuth: "ይህንን PDF ለማውረድ ፍቃድ የለዎትም።",
      pdfErrorRetry: "እባክዎ በኋላ ይሞክሩ።"
    }
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
    oromo: "Afaan Oromoo",
    changeLanguage: "ቋንቋ ቀይር"
  }
};
