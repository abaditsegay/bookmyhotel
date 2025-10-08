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
      title: "System Administration Dashboard",
      overview: "Overview",
      analytics: "Analytics",
      analyticsTitle: "Tenant Analytics",
      analyticsVisualization: "System Analytics & Data Visualization",
      totalBookings: "Total Bookings",
      activeHotels: "Active Hotels",
      monthlyRevenue: "Monthly Revenue",
      systemUsers: "System Users",
      recentActivity: "Recent Activity",
      performanceMetrics: "Performance Metrics",
      quickActions: "Quick Actions",
      loadingStats: "Loading statistics...",
      systemOverview: "System Overview",
      monthlyRevenueChart: "Monthly Revenue Trend (ETB)",
      bookingStatusChart: "Booking Status Distribution",
      
      // Management Actions
      manageTenants: "Create and manage tenant organizations",
      activeTenants: "Active Tenants",
      manageHotels: "Review and approve hotel registrations",
      totalHotels: "Total Hotels",
      manageUsers: "Manage system users and permissions",
      totalUsers: "Total Users",
      
      // System Overview Items
      tenantManagement: "Tenant Management",
      tenantManagementDesc: "Create and manage tenant organizations",
      hotelApproval: "Hotel Registration Approval",
      hotelApprovalDesc: "Review and approve/reject hotel registrations",
      userAdministration: "User Administration",
      userAdministrationDesc: "Manage system users and permissions",
      globalConfiguration: "Global Configuration",
      globalConfigurationDesc: "Configure system-wide settings and parameters",
      
      // Recent Activity
      systemAdminLogin: "System Administration Login",
      accountLogin: "Account Login",
      accessedAt: "Accessed at {time}",
      hotelRegistrationReview: "Hotel Registration Review",
      hotelRegistrationReviewDesc: "Available hotel registrations pending approval",
      tenantManagementActivity: "Tenant Management",
      tenantManagementActivityDesc: "Active tenant organizations available for management",
      systemConfiguration: "System Configuration",
      systemConfigurationDesc: "Global settings and user permissions ready for review",
      hotelSearchAvailable: "Hotel Search Available",
      hotelSearchAvailableDesc: "Browse our network of partner hotels",
      bookingManagement: "Booking Management",
      bookingManagementDesc: "View and manage your reservation history"
    },
    customer: {
      title: "User Dashboard",
      searchHotels: "Search Hotels",
      myBookings: "My Bookings",
      profile: "Profile"
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
    hotelAdmin: {
      title: "Hotel Management Dashboard",
      subtitle: "Hotel Administration",
      editHotelDetails: "Edit Hotel Details",
      loadingHotelInfo: "Loading hotel information...",
      unableToLoadHotel: "Unable to Load Hotel Information",
      accessRestricted: "Access Restricted",
      needHotelAdminRole: "You need HOTEL_ADMIN role to access the hotel administration dashboard.",
      currentRole: "Your current role is:",
      goToHome: "Go to Home",
      goToOperations: "Go to Operations Dashboard",
      goToFrontDesk: "Go to Front Desk Dashboard",
      
      // Main Tabs
      tabs: {
        hotelDetail: "Hotel Detail",
        staff: "Staff",
        rooms: "Rooms",
        bookings: "Bookings",
        staffSchedules: "Staff Schedules",
        reports: "Reports",
        pricingTax: "Pricing & Tax",
        offlineBookings: "Offline Bookings"
      },
      
      // Hotel Details Sub-tabs
      hotelDetails: {
        hotelDetails: "Hotel Details",
        hotelImages: "Hotel Images",
        hotelName: 'Hotel Name',
        description: 'Description',
        address: 'Address',
        status: 'Status',
        addressNotSet: 'Address not set'
      },
      
      // Status
      status: {
        active: "Active",
        inactive: "Inactive"
      },
      
      // Metrics
      metrics: {
        totalRooms: "Total Rooms",
        availableRooms: "Available Rooms",
        totalStaff: "Total Staff",
        activeStaff: "Active Staff",
        available: "Available",
        occupied: "Occupied",
        managedProperties: "Managed properties",
        readyForBooking: "Ready for booking",
        currentlyBooked: "Currently booked",
        totalMembers: "Total: {{count}} members",
        roomsOccupied: "{{occupied}} of {{total}} rooms occupied",
        roomCapacity: "Room Capacity",
        staffCount: "Staff Count",
        teamMembers: "Team Members",
        occupancyRate: "Occupancy Rate",
        currentOccupancyRate: "Current Occupancy Rate",
        confirmedBookings: "Confirmed Bookings"
      },
      
      // Sections
      sections: {
        hotelInformation: "Hotel Information",
        contactOperations: "Contact & Operations"
      },
      
      // Contact Information
      contact: {
        communicationPhone: "Communication Phone",
        primaryPaymentPhone: "Primary Payment Phone",
        secondaryPaymentPhone: "Secondary Payment Phone",
        emailAddress: "Email Address",
        phoneNotSet: "Phone not set",
        paymentPhoneNotSet: "Payment phone not set",
        secondaryPaymentPhoneNotSet: "Secondary payment phone not set",
        emailNotSet: "Email not set"
      },
      
      // Form Fields
      form: {
        hotelName: 'Hotel Name',
        description: 'Description',
        address: 'Address',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        addressNotSet: 'Address not set'
      },
      
      // Reports
      reports: {
        title: 'Hotel Reports & Analytics',
        refreshData: 'Refresh Data',
        loadingAnalytics: 'Loading analytics data...',
        bookingStatusOverview: 'Booking Status Overview',
        currentBookingStatus: 'Current booking status distribution',
        staffByRole: 'Staff by Role',
        currentStaffDistribution: 'Current staff distribution by role',
        todaysOperations: "Today's Operations Summary",
        occupancyRate: 'Occupancy Rate',
        expectedCheckins: 'Expected Check-ins',
        expectedCheckouts: 'Expected Check-outs',
        currentMonthPerformance: 'Current Month Performance',
        monthToDateMetrics: 'Month-to-date metrics',
        totalRevenue: 'Total revenue for current year',
        generatedFromBookings: 'Generated from bookings',
        monthlyAverage: 'Monthly Average',
        bookingAnalytics: 'Booking Analytics',
        comprehensiveBookingMetrics: 'Comprehensive booking metrics',
        totalBookings: 'Total bookings',
        
        // Distribution and Analysis
        roomTypeDistribution: 'Room Type Distribution',
        upcomingActivity: 'Upcoming Activity',
        upcomingCheckInsWeek: 'Upcoming Check-ins (Next 7 days)',
        upcomingCheckOutsWeek: 'Upcoming Check-outs (Next 7 days)',
        dailyOperationsSummary: 'Daily Operations Summary',
        todaysCheckIns: "Today's Check-ins",
        todaysCheckOuts: "Today's Check-outs",
        weeklyActivityTrends: 'Weekly Activity Trends',
        checkInsNext7Days: 'Check-ins (Next 7 days)',
        checkOutsNext7Days: 'Check-outs (Next 7 days)',
        
        // Quick Actions
        quickActionsNavigation: 'Quick Actions & Navigation',
        viewAllBookings: 'View All Bookings',
        manageRooms: 'Manage Rooms',
        manageStaff: 'Manage Staff',
        staffSchedules: 'Staff Schedules',
        
        // Units and counts
        roomsCount: '{{count}} rooms',
        staffCount: '{{count}} staff',
        guestsCount: '{{count}} guests',
        expectedCount: '{{count}} expected',
        
        // Revenue and financial
        yearRevenue: 'Year Revenue',
        yearToDateRevenue: 'Year-to-Date Revenue',
        
        // Activity summaries
        thisMonthBookings: 'This Month: {{count}} bookings',
        bookingsThisMonth: 'Bookings this month',
        checkInsToday: 'Check-ins today: {{checkIns}} • Check-outs: {{checkOuts}}',
        totalStaffCount: 'Total Staff: {{count}}',
        thisMonth: 'This Month: {{count}}',
        pendingCheckIns: 'Pending Check-ins: {{count}}',
        thisMonthShort: 'This month: {{count}}'
      },
      
      // Success Messages
      messages: {
        offlineBookingSuccess: 'Offline booking created successfully for {{guestName}}',
        walkInBookingSuccess: 'Walk-in booking created successfully! Confirmation: {{confirmationNumber}}'
      },
      
      // Messages
      noDescriptionAvailable: "No description available",
      noStaffRoleData: "No staff role data available",
      loadingHotel: "Loading hotel...",
      hotelInfoNotAvailable: "Hotel information not available",
      
      // Pricing Configuration
      pricingConfiguration: {
        title: 'Pricing & Tax Configuration',
        pricingPolicy: 'Pricing Policy: Room prices are displayed without taxes. All applicable taxes (VAT, service tax, city tax) will be calculated and added during the booking process. This ensures transparent pricing for customers while maintaining compliance with tax regulations.',
        
        // General Settings
        generalSettings: {
          title: 'General Settings',
          description: 'Configure basic pricing policies and settings',
          pricingStrategy: 'Pricing Strategy',
          currencyCode: 'Currency Code',
          fixedPricing: 'Fixed Pricing',
          seasonalPricing: 'Seasonal Pricing (Contact Support)',
          dynamicPricing: 'Dynamic Pricing (Contact Support)',
          taxInclusivePricing: 'Tax Inclusive Pricing (prices shown include taxes)',
          taxInclusivePricingDescription: 'Disabled: Taxes will be calculated and added during the booking process',
          enableDynamicPricing: 'Enable Dynamic Pricing (adjust prices based on demand)',
          dynamicPricingDisabled: 'Disabled: Using fixed pricing strategy only'
        },
        
        // Tax Configuration
        taxConfiguration: {
          title: 'Tax Configuration',
          description: 'Configure applicable tax rates for booking calculations',
          taxAlert: 'These tax rates will be automatically applied during the booking process. Room prices displayed to customers will not include these taxes.',
          vatRate: 'VAT Rate (%)',
          vatRateHelper: 'Current VAT: {{rate}} (Ethiopian standard: 15%)',
          serviceTaxRate: 'Service Tax Rate (%)',
          serviceTaxRateHelper: 'Current service tax: {{rate}} (Ethiopian standard: 5%)',
          cityTaxRate: 'City Tax Rate (%)',
          cityTaxRateHelper: 'Current city tax: {{rate}} (Usually 0% in Ethiopia)'
        },
        
        // Booking Policies
        bookingPolicies: {
          title: 'Booking Policies',
          description: 'Set minimum stay requirements and advance booking limits',
          minimumStayNights: 'Minimum Stay (nights)',
          minimumAdvanceBookingHours: 'Minimum Advance Booking (hours)',
          maximumAdvanceBookingDays: 'Maximum Advance Booking (days)'
        },
        
        // Discount Configuration
        discountConfiguration: {
          title: 'Discount Configuration',
          description: 'Configure early booking and loyalty discounts',
          earlyBookingDaysThreshold: 'Early Booking Threshold (days)',
          earlyBookingDiscountRate: 'Early Booking Discount (%)',
          loyaltyDiscountRate: 'Loyalty Discount (%)'
        },
        
        // Fee Configuration
        feeConfiguration: {
          title: 'Fee Configuration',
          description: 'Configure cancellation, modification, and penalty fees',
          cancellationFeeRate: 'Cancellation Fee (%)',
          modificationFeeRate: 'Modification Fee (%)',
          noShowPenaltyRate: 'No-Show Penalty (%)'
        },
        
        // Seasonal Pricing Multipliers
        seasonalMultipliers: {
          title: 'Seasonal Pricing Multipliers',
          description: 'Configure pricing adjustments for peak and off seasons',
          note: 'Seasonal multipliers are set to 1.0 (no change) by default. Adjust these values if you want to modify prices during peak or off seasons.',
          peakSeasonMultiplier: 'Peak Season Multiplier',
          offSeasonMultiplier: 'Off Season Multiplier',
          peakSeasonHelper: '{{value}} = {{percentage}} during peak season',
          offSeasonHelper: '{{value}} = {{percentage}} during off season'
        },
        
        // Booking Rules
        bookingRules: {
          title: 'Booking Rules',
          description: 'Configure booking restrictions and requirements',
          minimumStayNights: 'Minimum Stay (nights)',
          minimumAdvanceBookingHours: 'Minimum Advance Booking (hours)',
          maximumAdvanceBookingDays: 'Maximum Advance Booking (days)'
        },
        
        // Discounts & Fees
        discountsFees: {
          title: 'Discounts & Fees',
          description: 'Configure discount rates and penalty fees',
          earlyBookingDaysThreshold: 'Early Booking Days Threshold',
          earlyBookingDaysHelperText: 'Days in advance to qualify for early booking discount',
          earlyBookingDiscountRate: 'Early Booking Discount Rate (%)',
          loyaltyDiscountRate: 'Loyalty Discount Rate (%)',
          cancellationFeeRate: 'Cancellation Fee Rate (%)',
          modificationFeeRate: 'Modification Fee Rate (%)',
          noShowPenaltyRate: 'No-Show Penalty Rate (%)',
          discountHelper: '{{value}} = {{percentage}}',
          feeHelper: '{{value}} = {{percentage}}',
          penaltyHelper: '{{value}} = {{percentage}} penalty'
        },
        
        // Cancellation Refund Policies
        cancellationRefundPolicies: {
          title: 'Cancellation Refund Policies',
          description: 'Configure refund percentages based on cancellation timing',
          alertDescription: 'Set the refund percentage customers receive when they cancel their booking at different time periods before check-in. These policies will be automatically applied when processing cancellations.',
          refund7PlusDays: '7+ Days Before Check-in',
          refund3To7Days: '3-7 Days Before Check-in',
          refund1To2Days: '1-2 Days Before Check-in',
          refundSameDay: 'Same Day Cancellation',
          refundHelper7Plus: 'Current: {{value}}% refund (recommended: 100%)',
          refundHelper3To7: 'Current: {{value}}% refund (recommended: 50%)',
          refundHelper1To2: 'Current: {{value}}% refund (recommended: 25%)',
          refundHelperSameDay: 'Current: {{value}}% refund (recommended: 0%)'
        },
        
        // Additional Notes
        additionalNotes: {
          title: 'Additional Notes',
          description: 'Add any additional configuration notes or comments',
          configurationNotes: 'Configuration Notes',
          placeholder: 'Add any notes about this pricing configuration...'
        },
        
        // Refund Policy
        refundPolicy: {
          title: 'Refund Policy',
          description: 'Configure refund percentages based on cancellation timing',
          refundPolicy7PlusDays: 'Refund Rate (7+ days before) (%)',
          refundPolicy3To7Days: 'Refund Rate (3-7 days before) (%)',
          refundPolicy1To2Days: 'Refund Rate (1-2 days before) (%)',
          refundPolicySameDay: 'Refund Rate (same day) (%)'
        },
        
        // Actions
        actions: {
          saveChanges: 'Save Changes',
          reset: 'Reset to Default',
          exportConfig: 'Export Configuration',
          importConfig: 'Import Configuration',
          refreshConfiguration: 'Refresh Configuration'
        },
        
        refundPolicyNote: {
          title: 'Note:',
          description: 'These refund policies will replace the existing hardcoded cancellation rules. Make sure to set policies that align with your business requirements and local regulations.'
        },
        
        // Messages
        messages: {
          loadingConfiguration: 'Loading pricing configuration...',
          savingConfiguration: 'Saving configuration...',
          configurationSaved: 'Pricing configuration saved successfully!',
          failedToLoad: 'Failed to load pricing configuration. Please try refreshing the page.',
          failedToSave: 'Failed to save pricing configuration',
          taxInfo: 'These tax rates will be automatically applied during the booking process. Room prices displayed to customers will not include these taxes.'
        }
      },
      
      // Offline Booking
      offlineBooking: {
        title: 'Offline Guest Booking',
        description: 'Complete the guest booking process step by step',
        offlineMode: 'Offline Mode',
        pendingSync: '{{count}} pending sync',
        
        // Steps
        steps: {
          guestInformation: 'Guest Information',
          roomSelection: 'Room Selection',
          confirmation: 'Confirmation'
        },
        
        // Guest Information
        guestInformation: {
          title: 'Guest Information',
          description: 'Enter guest details for the booking',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          phone: 'Phone Number',
          required: 'This field is required'
        },
        
        // Booking Details
        bookingDetails: {
          title: 'Booking Details',
          stayDetailsTitle: 'Stay Details',
          checkInDate: 'Check-in Date',
          checkOutDate: 'Check-out Date',
          numberOfGuests: 'Number of Guests',
          specialRequests: 'Special Requests (Optional)',
          availableRoomsTitle: 'Available Rooms'
        },
        
        // Room Selection
        roomSelection: {
          title: 'Room Selection',
          description: 'Choose an available room for the guest',
          numberOfGuests: 'Number of Guests',
          roomNumber: 'Room {{number}}',
          roomType: 'Room Type: {{type}}',
          capacity: 'Capacity: {{capacity}} guest{{plural}}',
          pricePerNight: 'Price: {{price}} per night',
          pricePerNightShort: '/night',
          pricingCalculation: '{{pricePerNight}}/night × {{nights}} night{{nightsPlural}}',
          selectRoom: 'Select Room',
          noRoomsAvailable: 'No rooms available for selected dates',
          loadingRooms: 'Loading available rooms...'
        },
        
        // Confirmation
        confirmation: {
          title: 'Booking Confirmation',
          description: 'Review and confirm the booking details',
          bookingSummary: 'Booking Summary',
          guestInformationTitle: 'Guest Information',
          guestName: 'Name: {{firstName}} {{lastName}}',
          contactInfo: 'Contact: {{email}} | {{phone}}',
          stayDuration: 'Stay: {{checkIn}} to {{checkOut}} ({{nights}} nights)',
          selectedRoom: 'Room: {{roomNumber}} ({{roomType}})',
          totalCost: 'Total Cost: {{total}}',
          roomDetailsTitle: 'Room Details',
          roomNumber: 'Room Number: {{number}}',
          roomType: 'Room Type: {{type}}',
          pricePerNight: 'Price per night: {{price}}',
          totalNights: 'Total nights: {{nights}}',
          subtotal: 'Subtotal: {{amount}}',
          // Additional labels for confirmation section
          emailLabel: 'Email:',
          phoneLabel: 'Phone:',
          roomLabel: 'Room:',
          checkInLabel: 'Check-in:',
          checkOutLabel: 'Check-out:',
          guestsLabel: 'Guests:',
          specialRequestsLabel: 'Special Requests:',
          pricingSummaryTitle: 'Pricing Summary',
          totalAmountTitle: 'Total Amount',
          paymentNote: 'Payment will be processed at the front desk (Offline Mode)'
        },
        
        // Guest Search Dialog
        guestSearchDialog: {
          title: 'Search Previous Guests',
          searchPlaceholder: 'Search by name, email, or phone',
          searchButton: 'Search',
          close: 'Close',
          noGuestsFound: 'No guests found',
          selectGuest: 'Select Guest'
        },
        
        // Actions
        actions: {
          back: 'Back',
          next: 'Next',
          loading: 'Loading...',
          createBooking: 'Create Booking',
          creatingBooking: 'Creating Booking...',
          confirmBooking: 'Confirm Booking',
          backToRoomSelection: 'Back to Room Selection'
        },
        
        // Validation Errors
        validationErrors: {
          fillGuestInfo: 'Please fill in all guest information fields',
          selectRoom: 'Please select a room',
          invalidEmail: 'Please enter a valid email address',
          selectDatesAndGuests: 'Select dates and number of guests',
          noRoomsAvailable: 'No rooms available for {{guests}} guest{{plural}} from {{checkIn}} to {{checkOut}}. Please try different dates or reduce the number of guests.'
        },
        
        // Messages
        messages: {
          startOver: 'Start Over',
          bookingCreated: 'Booking created successfully!',
          confirmationNumber: 'Confirmation Number: {{number}}',
          willSyncWhenOnline: 'This booking will be synced when internet connection is restored.',
          bookingFailed: 'Failed to create booking. Please try again.',
          invalidDates: 'Check-out date must be after check-in date',
          fillAllFields: 'Please fill in all required fields',
          creatingBooking: 'Creating walk-in booking...'
        }
      },

      // Room Management
      roomManagement: {
        tabs: {
          roomList: "Room List",
          pricing: "Room Type Pricing",
          bulkUpload: "Bulk Upload"
        },
        actions: {
          refresh: "Refresh",
          addRoom: "Add Room",
          viewDetails: "View Details",
          editStatus: "Edit Status"
        },
        tableHeaders: {
          roomNumber: "Room Number",
          type: "Type",
          status: "Status",
          currentGuest: "Current Guest",
          capacity: "Capacity",
          price: "Price/Night",
          available: "Available",
          actions: "Actions"
        },
        searchRooms: "Search rooms...",
        statusFilter: "Status Filter",
        allStatuses: "All Statuses",
        guestPresent: "Guest Present",
        roomStatuses: {
          available: "Available",
          occupied: "Occupied",
          outOfOrder: "Out of Order",
          maintenance: "Maintenance",
          cleaning: "Cleaning",
          dirty: "Dirty"
        },
        noGuest: "No guest",
        guests: "guests",
        available: "Available",
        unavailable: "Unavailable",
        updateStatus: "Update Status",
        updateRoomStatus: "Update Room Status",
        roomInfo: "Room: {{roomNumber}} ({{roomType}})",
        status: "Status",
        cancel: "Cancel",
        update: "Update",
        editRoom: {
          title: "Edit Room",
          roomNumber: "Room Number",
          status: "Status",
          available: "Available",
          cancel: "Cancel",
          save: "Save"
        },
        createRoom: {
          title: "Add New Room",
          roomNumber: "Room Number",
          roomType: "Room Type",
          pricePerNight: "Price per Night",
          capacity: "Capacity",
          description: "Description",
          cancel: "Cancel",
          create: "Create Room"
        }
      }
    },
    frontDesk: {
      title: "Front Desk Dashboard",
      checkinRequests: "Check-in Requests",
      checkoutRequests: "Check-out Requests",
      roomStatus: "Room Status",
      guestRequests: "Guest Requests",
      maintenance: "Maintenance",
      housekeeping: "Housekeeping",
      
      // Dashboard Statistics
      stats: {
        arrivalsToday: "Arrivals Today",
        departuresToday: "Departures Today",
        currentOccupancy: "Current Occupancy",
        outOfOrder: "Out of Order",
        underMaintenance: "Under Maintenance",
        availableRooms: "Available Rooms"
      },
      
      // Tab Labels
      tabs: {
        bookings: "Bookings",
        rooms: "Rooms",
        housekeeping: "Housekeeping",
        offlineBookings: "Offline Bookings"
      },
      
      // Housekeeping Module
      housekeepingModule: {
        title: "Housekeeping Module",
        description: "Housekeeping features will be available in future releases.\nCurrently, room status changes can be managed through the Room Management tab."
      },
      
      // Success Messages
      success: {
        title: "Success",
        walkInBookingCreated: "Walk-in booking created successfully! Confirmation: {{confirmationNumber}}",
        offlineBookingCreated: "Offline booking created successfully for {{guestName}}",
        okButton: "OK"
      },
      
      // Room Management
      roomManagement: {
        tabs: {
          roomList: "Room List",
          pricing: "Room Type Pricing",
          bulkUpload: "Bulk Upload"
        },
        actions: {
          refresh: "Refresh",
          addRoom: "Add Room",
          viewDetails: "View Details",
          editStatus: "Edit Status"
        },
        searchRooms: "Search rooms",
        statusFilter: "Status Filter",
        allStatuses: "All Statuses",
        guestPresent: "Guest Present",
        tableHeaders: {
          roomNumber: "Room Number",
          type: "Type",
          status: "Status",
          currentGuest: "Current Guest",
          capacity: "Capacity",
          price: "Price/Night",
          available: "Available",
          actions: "Actions"
        },
        noGuest: "No guest",
        guests: "guests",
        available: "Available",
        unavailable: "Unavailable",
        updateStatus: "Update Status",
        updateRoomStatus: "Update Room Status",
        roomInfo: "Room: {{roomNumber}} ({{roomType}})",
        status: "Status",
        cancel: "Cancel",
        update: "Update",
        roomStatuses: {
          available: "Available",
          occupied: "Occupied",
          outOfOrder: "Out of Order",
          maintenance: "Maintenance", 
          cleaning: "Cleaning",
          dirty: "Dirty"
        },
        editRoom: {
          title: "Edit Room",
          roomNumber: "Room Number",
          status: "Status",
          available: "Available",
          cancel: "Cancel",
          save: "Save"
        }
      }
    }
  },

  // Booking Management
  booking: {
    find: {
      title: "Enter Your Booking Details",
      subtitle: "Both fields are required to find your booking",
      fields: {
        confirmationNumber: "Reference Number",
        email: "Email Address",
        confirmationNumberPlaceholder: "Enter confirmation number",
        emailPlaceholder: "Enter email address"
      },
      buttons: {
        findBooking: "Find Booking",
        searching: "Searching..."
      },
      errors: {
        bothFieldsRequired: "Both confirmation number and email are required",
        bookingNotFound: "Booking not found. Please check your confirmation number and email address."
      },
      found: {
        title: "Booking Found!",
        confirmation: "Confirmation: {{confirmationNumber}}",
        manageBooking: "Manage Booking",
        labels: {
          guestName: "Guest Name",
          roomType: "Room Type",
          checkIn: "Check-in",
          checkOut: "Check-out",
          totalAmount: "Total Amount",
          status: "Status",
          paymentStatus: "Payment Status",
          paymentReference: "Payment Reference"
        }
      },
      help: {
        title: "Need Help?",
        description: "To find your booking, you'll need both your reference number and the email address used when making the booking. The reference number can be found in your booking confirmation email. If you can't find your booking, please contact the hotel directly."
      }
    },
    manage: {
      title: "Manage Your Booking",
      confirmationLabel: "Confirmation",
      sendingEmail: "Sending Email...",
      modifyBooking: "Modify Booking",
      cancelBooking: "Cancel Booking",
      bookingDetails: "Booking Details",
      stayDetails: "Stay Details",
      checkIn: "Check-in",
      checkOut: "Check-out", 
      duration: "Duration",
      totalAmount: "Total Amount",
      hotelAndRoom: "Hotel & Room Type",
      hotel: "Hotel",
      roomType: "Room Type",
      roomAssignment: "Room Assignment",
      roomAssignmentNote: "Room will be assigned at check-in",
      rate: "Rate",
      guestInformation: "Guest Information",
      name: "Name",
      email: "Email",
      numberOfGuests: "Number of Guests",
      paymentInformation: "Payment Information",
      paymentStatus: "Payment Status",
      paymentReference: "Payment Reference",
      modifyDialogTitle: "Modify Your Booking",
      guestName: "Guest Name",
      guestNameHelp: "Update the primary guest name for this booking",
      emailAddress: "Email Address",
      emailHelp: "Update your email address if needed for confirmations",
      checkInDate: "Check-in Date",
      checkOutDate: "Check-out Date",
      numberOfGuestsHelp: "Update the number of guests for your booking",
      selectRoomType: "Select Room Type",
      reasonForModification: "Reason for Modification",
      reasonHelp: "Optional: Help us understand why you're making changes",
      cancel: "Cancel",
      modifying: "Modifying...",
      modifyBookingAction: "Modify Booking",
      cancelDialogTitle: "Cancel Your Booking",
      cancellationPolicy: "Cancellation Policy",
      cancellationPolicyDetails: "• More than 7 days before check-in: 100% refund\n• 3-7 days before: 50% refund\n• 1-2 days before: 25% refund\n• Same day: No refund",
      reasonForCancellation: "Reason for Cancellation",
      cancellationReasonHelp: "Optional: Help us understand why you're cancelling",
      keepBooking: "Keep Booking",
      cancelling: "Cancelling...",
      cancelBookingAction: "Cancel Booking"
    },
    paymentStatus: {
      completed: "COMPLETED",
      pending: "PENDING", 
      processing: "PROCESSING",
      failed: "FAILED"
    },

    guestBooking: "Guest Booking",
    
    // Guest Booking Page
    page: {
      roomDetails: "Room Details",
      roomType: "Room Type",
      hotel: "Hotel",
      pricePerNight: "Price per Night", 
      totalAmount: "Total Amount",
      checkInDate: "Check-in Date",
      checkOutDate: "Check-out Date",
      numberOfGuests: "Number of Guests",
      guestInformation: "Guest Information",
      guestDetails: "Guest Details",
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      nights: "night",
      nightsPlural: "nights",
      hotelInformation: "Hotel Information",
      fullNamePlaceholder: "Enter your full name",
      emailPlaceholder: "Enter your email address",
      phonePlaceholder: "Enter your phone number (optional)",
      checkOutAfterCheckIn: "Check-out date must be after check-in date",
      
      // Navigation and Breadcrumbs
      hotelSearch: "Hotel Search",
      searchResults: "Search Results", 
      bookYourStay: "Book Your Stay",
      backToSearchResults: "← Back to search results",
      
      // Status and Notices
      noAccountRequired: "No account required!",
      secureInformation: "🔒 Your information is secure and will only be used for this booking",
      
      // Payment Methods
      paymentMethod: "Payment Method",
      creditCard: "Credit Card",
      mobileMoney: "Mobile Money",
      payWithMobile: "Pay with your Mobile", 
      payAtFrontDesk: "Pay at Front Desk",
      mBirr: "M-Birr",
      
      // Booking Actions
      bookNow: "Book Now",
      book: "Book",
      booking: "Booking...",
      bookNowWithAmount: "Book Now - ETB {{amount}}",
      bookWithAmount: "Book - ETB {{amount}}",
      processing: "Processing...",
      
      // Security and Payment Info
      securePayment: "Secure SSL encrypted payment processing. All major cards accepted.",
      paymentInstructions: "Bring valid ID and booking confirmation. Payment methods: Cash, Card, Mobile.",
      
      // Error Messages
      fillAllRequiredFields: "Please fill in all required fields",
      provideGuestNameAndEmail: "Please provide guest name and email",
      provideValidEmail: "Please provide a valid email address",
      fillCreditCardDetails: "Please fill in all credit card details",
      provideMobileNumber: "Please provide mobile number",
      provideMobileReference: "Please provide mobile transfer reference number",
      enterValidMobileNumber: "Please enter a valid mobile number",
      provideEthiopianMobile: "Please provide your Ethiopian mobile number",
      
      // Payment Component Labels
      creditCardPayment: "Credit Card Payment",
      cardholderName: "Cardholder Name",
      cardNumber: "Card Number",
      expiryDate: "Expiry Date",
      cvv: "CVV",
      mobileMoneyTransfer: "Mobile Money Transfer",
      payWithYourMobile: "Pay with your Mobile",
      completeMobileTransfer: "Complete mobile money transfer using your preferred mobile payment app.",
      transferToMobileOnly: "Transfer To (Mobile Money Only)",
      yourMobileNumber: "Your Mobile Number",
      mobileTransferReference: "Mobile Transfer Reference Number",
      enterReferenceNumber: "Enter reference number from your mobile transfer",
      provideReferenceHelp: "Provide the reference number you received after completing the mobile money transfer",
      transferExactAmount: "Transfer exact amount:",
      toMobileNumberAbove: "to the mobile number above, then enter your transfer reference number.",
      payAtFrontDeskPayment: "Pay at Front Desk",
      reservationConfirmed: "Your reservation will be confirmed. Pay when you arrive at the hotel.",
      bringValidId: "Bring valid ID and booking confirmation. Payment methods: Cash, Card, Mobile.",
      alternative: "Alternative",
      
      // Special Requests
      specialRequests: "Special Requests (Optional)",
      specialRequestsPlaceholder: "Any special accommodations or requests?",
      
      // Ethiopian Phone Number (for mobile payments)
      ethiopianPhoneLabel: "Ethiopian Phone Number",
      ethiopianPhonePlaceholder: "Enter Ethiopian phone number for mobile payment"
    },
    
    details: {
      title: "Booking Details",
      hotelAdminTitle: "Hotel Admin - Booking Details",
      frontDeskTitle: "Front Desk - Booking Details",
      
      // Section Headers
      guestInformation: "Guest Information",
      bookingDetails: "Booking Details",
      hotelRoomInformation: "Hotel & Room Information",
      stayInformation: "Stay Information",
      additionalInformation: "Additional Information",
      
      // Guest Information Fields
      guestName: "Guest Name",
      email: "Email",
      phone: "Phone",
      
      // Booking Details Fields
      confirmationNumber: "Confirmation Number",
      status: "Status",
      paymentStatus: "Payment Status",
      
      // Hotel & Room Information Fields
      hotelName: "Hotel Name",
      hotelAddress: "Hotel Address",
      roomType: "Room Type",
      roomNumber: "Room Number",
      roomNumberPlaceholder: "Enter room number or use 'Select Room' button above",
      roomNumberHelperText: "You can either type a room number or use the 'Select Room' button to choose from available rooms",
      roomNumberTBA: "TBA (To Be Assigned)",
      
      // Stay Information Fields
      checkInDate: "Check-in Date",
      checkOutDate: "Check-out Date",
      pricePerNight: "Price per Night",
      totalAmount: "Total Amount",
      guests: "Guests",
      duration: "Duration",
      
      // Additional Information Fields
      bookingDate: "Booking Date",
      paymentIntentId: "Payment Intent ID",
      
      // Actions
      edit: "Edit",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      selectRoom: "Select Room",
      checkIn: "Check In",
      checkOut: "Check Out",
      cancelBooking: "Cancel Booking",
      modify: "Modify Booking",
      sendConfirmation: "Send Confirmation",
      
      // Status Values
      confirmed: "Confirmed",
      checkedIn: "Checked In",
      checkedOut: "Checked Out",
      cancelled: "Cancelled",
      pending: "Pending",
      
      // Loading and Error States
      loading: "Loading booking details...",
      authenticationRequired: "Authentication required",
      bookingNotFound: "Booking not found",
      bookingNotFoundForId: "Booking not found for ID: {{id}}",
      error: "Error",
      
      // Room Selection Dialog
      selectRoomDialog: {
        title: "Select Room",
        warningTitle: "Important:",
        warningMessage: "Rooms shown are generally available but may not be available for the specific dates ({{checkIn}} to {{checkOut}}). The system will verify availability when you save the assignment.",
        noRoomsFound: "No available rooms found for the selected dates and room type.",
        loadingRooms: "Loading available rooms...",
        roomInfo: "Room {{roomNumber}} - {{roomType}}",
        perNight: "/night",
        capacity: "Capacity: {{capacity}} guests",
        cancel: "Cancel"
      },
      
      // Success Messages
      success: {
        statusUpdated: "Booking status updated successfully",
        roomAssignmentUpdated: "Room assignment updated successfully",
        roomDetailsUpdated: "Room details updated successfully",
        statusAndRoomUpdated: "Booking status and room details updated successfully",
        bookingUpdated: "Booking updated successfully",
        noChanges: "No changes detected",
        roomTypeAndDatesAndGuestUpdated: "Room type, booking dates, and guest information updated successfully",
        roomTypeAndDatesUpdated: "Room type and booking dates updated successfully",
        roomTypeAndGuestUpdated: "Room type and guest information updated successfully",
        datesAndGuestUpdated: "Booking dates and guest information updated successfully",
        roomTypeUpdated: "Room type updated successfully",
        datesUpdated: "Booking dates updated successfully",
        guestInfoUpdated: "Guest information updated successfully"
      },
      
      // Error Messages
      errors: {
        cannotModifyStatus: "Cannot modify booking with status: {{status}}. Only confirmed, pending, or checked-in bookings can be modified.",
        selectRoomTypeFirst: "Please select a room type first",
        roomNotAvailable: "The selected room is not available for the booking dates ({{checkIn}} to {{checkOut}}). Please select a different room.",
        hotelIdNotAvailable: "Hotel ID not available in user context. Please ensure you are properly logged in as a hotel user.",
        failedToLoad: "Failed to load booking details",
        failedToUpdate: "Failed to update booking",
        failedToLoadRooms: "Failed to load available rooms"
      },
      
      // Alerts
      alerts: {
        roomSelectionPending: "Room selection will be applied when you save the booking.",
        calculatingPrice: "Calculating price changes...",
        calculatingPricing: "Calculating new pricing for room type...",
        pricesModified: "💰 Pricing has been modified during this editing session. Changes will be applied when you save."
      }
    },
    
    // Booking Management Table
    management: {
      title: "Booking Management",
      searchPlaceholder: "Search by guest name, confirmation number, room, payment reference, or payment status...",
      refresh: "Refresh",
      noBookingsFound: "No bookings found",
      loading: "Loading bookings...",
      
      // Table Headers
      headers: {
        confirmationNumber: "Confirmation #",
        guest: "Guest",
        room: "Room",
        checkIn: "Check-in",
        checkOut: "Check-out",
        paymentRef: "Payment Ref",
        paymentStatus: "Payment Status",
        status: "Status",
        actions: "Actions"
      },
      
      // Actions
      actions: {
        view: "View",
        edit: "Edit",
        delete: "Delete",
        checkIn: "Check In",
        checkOut: "Check Out",
        receipt: "Receipt",
        cancel: "Cancel",
        addGuest: "Add Guest"
      },
      
      // Status Filter
      statusFilter: {
        all: "All Statuses",
        confirmed: "Confirmed",
        checkedIn: "Checked In",
        checkedOut: "Checked Out",
        cancelled: "Cancelled",
        pending: "Pending",
        noShow: "No Show"
      },
      
      // Dialogs
      dialogs: {
        deleteConfirm: {
          title: "Confirm Delete",
          message: "Are you sure you want to delete the booking for {{guestName}}? This action cannot be undone.",
          cancel: "Cancel",
          delete: "Delete"
        },
        checkoutConfirm: {
          title: "Confirm Guest Checkout",
          message: "Are you sure you want to check out {{guestName}} from room {{roomNumber}}?",
          subtitle: "This will mark the guest as checked out and generate a final receipt.",
          cancel: "Cancel",
          checkOut: "Check Out"
        }
      }
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
    },
    
    // Room Details
    details: {
      title: "Room Details",
      edit: "Edit",
      
      // Basic Information
      basicInformation: "Basic Information",
      roomNumber: "Room Number",
      roomType: "Room Type",
      roomId: "Room ID",
      capacity: "Capacity",
      
      // Pricing & Availability
      pricingAndAvailability: "Pricing & Availability",
      pricePerNight: "Price per Night",
      availabilityStatus: "Availability Status",
      available: "Available",
      unavailable: "Unavailable",
      currentRate: "Current Rate",
      
      // Description
      description: "Description",
      roomDescription: "Room Description",
      
      // Hotel Information
      hotelInformation: "Hotel Information",
      hotelName: "Hotel Name",
      hotelId: "Hotel ID",
      
      // Actions
      cancel: "Cancel",
      save: "Save",
      loading: "Loading...",
      
      // Error Messages
      errors: {
        invalidRoomId: "Invalid room ID",
        failedToLoad: "Failed to load room details",
        failedToUpdate: "Failed to update room",
        roomNotFound: "Room not found",
        apiNotSupported: "Room availability toggle is not supported by the current API",
        failedToUpdateStatus: "Failed to update room status"
      },
      
      // Success Messages
      success: {
        roomUpdated: "Room updated successfully"
      }
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
      viewTenants: "Manage Tenants",
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
      viewUsers: "Manage Users",
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
      viewHotels: "Manage Hotels",
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
  walkInBooking: {
    title: 'Walk-in Guest Booking',
    subtitle: 'Complete the guest booking process step by step',
    steps: {
      guestInformation: 'Guest Information',
      roomSelection: 'Room Selection', 
      confirmation: 'Confirmation'
    },
    guestInformation: {
      title: 'Guest Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      description: 'Please provide the guest contact information'
    },
    stayDetails: {
      title: 'Stay Details',
      checkIn: 'Check-in Date',
      checkOut: 'Check-out Date',
      nights: 'Nights',
      guests: 'Number of Guests',
      checkInDate: 'Check-in Date',
      checkOutDate: 'Check-out Date',
      numberOfGuests: 'Number of Guests',
      description: 'Select your check-in and check-out dates'
    },
    roomSelection: {
      title: 'Room Selection',
      selectRoom: 'Select Room',
      roomType: 'Room Type',
      pricePerNight: 'Price per Night',
      totalAmount: 'Total Amount',
      noRoomsAvailable: 'No rooms available for selected dates',
      description: 'Available rooms for {{guests}} guest{{guestsPlural}} from {{checkIn}} to {{checkOut}}',
      loadingRooms: 'Loading available rooms...',
      specialRequests: 'Special Requests (Optional)',
      specialRequestsPlaceholder: 'Any special requests or notes for the guest stay...',
      roomNumber: 'Room',
      capacity: 'Capacity',
      capacityText: '{{count}} guest',
      capacityTextPlural: '{{count}} guests',
      perNightShort: '/night'
    },
    confirmation: {
      title: 'Booking Confirmation',
      guestDetails: 'Guest Details',
      stayDetails: 'Stay Details',
      roomDetails: 'Room Details',
      totalCost: 'Total Cost',
      paymentMethod: 'Payment Method',
      bookingConfirmationTitle: 'Booking Confirmation',
      reviewDetails: 'Please review your booking details before confirming',
      guestInformation: 'Guest Information',
      fullName: 'FULL NAME',
      emailAddress: 'EMAIL ADDRESS',
      phoneNumber: 'PHONE NUMBER',
      checkInDate: 'CHECK-IN DATE',
      checkOutDate: 'CHECK-OUT DATE',
      numberOfGuests: 'NUMBER OF GUESTS',
      numberOfNights: 'NUMBER OF NIGHTS',
      roomType: 'ROOM TYPE',
      roomNumber: 'ROOM NUMBER',
      pricePerNight: 'PRICE PER NIGHT',
      totalAmount: 'TOTAL AMOUNT',
      nights: 'nights',
      room: 'ROOM',
      checkInCheckOut: 'CHECK-IN / CHECK-OUT',
      guests: 'GUESTS',
      specialRequests: 'SPECIAL REQUESTS',
      guest: 'guest',
      guestPlural: 'guests',
      pricingSummary: 'Pricing Summary',
      perNight: '/night',
      night: 'night',
      nightPlural: 'nights'
    },
    actions: {
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm Booking',
      cancel: 'Cancel',
      startOver: 'Start Over',
      back: 'Back',
      loadingRooms: 'Loading Rooms...'
    },
    validationErrors: {
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      phoneRequired: 'Phone number is required',
      checkInRequired: 'Check-in date is required',
      checkOutRequired: 'Check-out date is required',
      invalidDateRange: 'Check-out date must be after check-in date',
      guestsRequired: 'Number of guests is required',
      roomRequired: 'Please select a room'
    },
    messages: {
      bookingCreated: 'Booking created successfully!',
      confirmationNumber: 'Confirmation Number: {{number}}',
      willSyncWhenOnline: 'This booking will be synced when internet connection is restored.',
      bookingFailed: 'Failed to create booking. Please try again.',
      creatingBooking: 'Creating walk-in booking...',
      failedToLoadHotel: 'Failed to load hotel information',
      failedToLoadHotelPermissions: 'Failed to load hotel information. Please ensure you are logged in with appropriate permissions.',
      failedToLoadRooms: 'Failed to load available rooms. Please try again.'
    }
  },
  shop: {
    dashboard: {
      title: "Shop Management",
      subtitle: "Manage products, orders, and shopping operations",
      tabs: {
        newOrder: "New Order",
        products: "Products",
        lowStock: "Low Stock",
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
        outOfStock: "Out of Stock",
        inStock: "In Stock",
        lowStock: "Low Stock",
        unknown: "Unknown"
      },
      messages: {
        created: "Product created successfully",
        updated: "Product updated successfully",
        deleted: "Product deleted successfully",
        loadError: "Failed to load products",
        saveError: "Failed to save product",
        outOfStockError: "\"{{productName}}\" is out of stock and cannot be added to the order."
      }
    },
    lowStock: {
      title: "Low Stock Products",
      subtitle: "Products at or below minimum stock level",
      refresh: "Refresh",
      noProducts: "No low stock products found. All products are well stocked!",
      noSearchResults: "No products match your search criteria",
      table: {
        category: "Category",
        sku: "SKU",
        currentStock: "Current Stock",
        minStock: "Min Stock",
        reorderQty: "Reorder Qty",
        status: "Status",
        product: "Product"
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
      },
      creation: {
        orderSummary: "Order Summary",
        purchaseType: "Purchase Type",
        deliveryOptions: "Delivery Options",
        deliveryRequired: "Delivery Required",
        orderItems: "Order Items",
        noItems: "No items selected",
        total: "Total:",
        createOrder: "Create Order",
        processing: "Processing...",
        chargeToRoom: "Charge to Room",
        
        // Purchase types
        anonymousSale: "Anonymous Sale (Cash/Card)",
        roomCharge: "Charge to Room",
        
        // Table headers
        item: "Item",
        qty: "Qty", 
        price: "Price",
        action: "Action",
        
        // Form fields
        roomNumber: "Room Number",
        roomNumberPlaceholder: "Enter room number",
        deliveryType: "Delivery Type",
        deliveryAddress: "Delivery Address",
        
        // Payment status
        paymentCompleted: "Payment completed via {{method}}",
        paymentReference: "Ref: {{reference}}",
        
        // Filters and search
        searchProducts: "Search Products",
        category: "Category", 
        allCategories: "All Categories",
        
        // Stock status legend
        stockStatus: "Stock Status:",
        inStock: "In Stock",
        lowStock: "Low Stock", 
        outOfStock: "Out of Stock",
        
        // Product details
        stock: "Stock:",
        min: "Min:",
        selected: "Selected:",
        itemSingular: "item",
        itemPlural: "items",
        unavailable: "Currently unavailable",
        
        // Error messages
        cartIsEmpty: "Cart is empty",
        failedToLoadProducts: "Failed to load products",
        failedToCreateOrder: "Failed to create order"
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
    refresh: "Refresh",
    
    // Months
    months: {
      jan: "January",
      feb: "February",
      mar: "March",
      apr: "April",
      may: "May",
      jun: "June",
      jul: "July",
      aug: "August",
      sep: "September",
      oct: "October",
      nov: "November",
      dec: "December"
    }
  },
  // Shop Payment Dialog
  shopPayment: {
    completePayment: "Complete Payment",
    selectPaymentMethod: "Select Payment Method",
    paymentSuccessful: "Payment Successful!",
    paymentProcessedSuccessfully: "Payment has been processed successfully",
    referenceNumber: "Reference Number:",
    completingYourOrder: "Completing your order...",
    processing: "Processing...",
    cancel: "Cancel",
    pay: "Pay",
    
    // Payment Methods
    cashPayment: "Cash Payment",
    cashDescription: "Pay with cash at the hotel reception",
    creditDebitCard: "Credit/Debit Card",
    cardDescription: "Pay securely with your card",
    mobileMoney: "Mobile Money",
    mobileDescription: "Mobile money payment",
    
    // Card Payment
    secureCardPayment: "Secure Card Payment",
    sslEncrypted: "SSL encrypted payment processing",
    amountLabel: "Amount:",
    cardholderNamePlaceholder: "Cardholder Name (e.g., John Doe)",
    cardNumberPlaceholder: "Card Number (1234 5678 9012 3456)",
    expiryPlaceholder: "Expiry (MM/YY)",
    cvvPlaceholder: "CVV (123)",
    
    // Mobile Money Payment
    mobileMoneyPayment: "Mobile Money Payment",
    paySecurelyMobile: "Pay securely with your mobile money account",
    selectMobileProvider: "Select Mobile Money Provider",
    phoneNumberPlaceholder: "Phone Number (+251 9XX XXX XXX)",
    
    // Cash Payment
    collectCashPayment: "Please collect cash payment from customer at the counter.",
    amountToCollect: "Amount to collect",
    
    // Pay at Front Desk
    payAtFrontDesk: "Pay at Front Desk",
    customerPaysFrontDesk: "Customer will complete payment at the front desk.",
    totalAmount: "Total amount",
    
    // Validation Messages
    fillAllCardDetails: "Please fill in all card details",
    enterValidCardNumber: "Please enter a valid card number",
    fillMobileDetails: "Please fill in mobile money details",
    paymentProcessingFailed: "Payment processing failed",
  },
  // Shop Receipt Dialog
  shopReceipt: {
    title: "Shop Purchase Receipt",
    anonymousCustomer: "Anonymous Customer",
    printReceipt: "Print Receipt",
    downloadReceipt: "Download Receipt",
    close: "Close",
    hotelName: "Grand Plaza Hotel",
    taxId: "Tax ID:",
    receiptNumber: "Shop Purchase Receipt #",
    
    // Status labels
    paid: "PAID",
    chargedToRoom: "CHARGED TO ROOM",
    processing: "PROCESSING",
    completed: "COMPLETED",
    pending: "PENDING",
    confirmed: "CONFIRMED",
    preparing: "PREPARING",
    ready: "READY",
    cancelled: "CANCELLED",
    
    // Sections
    customerInformation: "Customer Information",
    orderDetails: "Order Details",
    orderSummary: "Order Summary",
    orderNotes: "Order Notes",
    
    // Customer fields
    name: "Name:",
    email: "Email:",
    phone: "Phone:",
    room: "Room:",
    
    // Order fields
    orderDate: "Order Date:",
    paymentMethod: "Payment Method:",
    delivery: "Delivery:",
    completedAt: "Completed:",
    address: "Address:",
    cash: "CASH",
    yesDelivery: "Yes",
    noPickup: "No (Pickup)",
    
    // Table headers
    product: "Product",
    sku: "SKU",
    qty: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    totalLabel: "Total",
    note: "Note:",
    tax: "Tax",
    subtotal: "Subtotal",
    
    // Footer
    thankYou: "Thank You for Your Purchase!",
    roomDeliveryMessage: "Your order will be delivered to your room.",
    pickupMessage: "Please collect your order from the shop.",
    receiptGenerated: "Receipt generated on:",
    frontDeskPerson: "Front Desk Person:",
    
    // Actions
    continueToPayment: "Continue to Payment",
    closeContinue: "Close & Continue",
    closeAndContinue: "Close & Continue",
    download: "Download",
  },
  
  // Booking Confirmation Page
  bookingConfirmation: {
    title: "Booking Confirmed!",
    subtitle: "Your reservation has been successfully created",
    confirmationLabel: "Confirmation: {{confirmationNumber}}",
    
    // Loading states
    loading: "Loading booking confirmation...",
    loadingSubtitle: "Please wait while we retrieve your booking details",
    
    // Error states
    errorNotFound: "Booking not found",
    errorDescription: "We couldn't find your booking information. Please check your confirmation number or try again.",
    
    // Action buttons
    actions: {
      emailConfirmation: "EMAIL CONFIRMATION",
      emailConfirmationShort: "EMAIL",
      print: "PRINT",
      downloadPdf: "DOWNLOAD PDF",
      downloadPdfShort: "PDF",
      downloading: "DOWNLOADING...",
      returnHome: "Return Home",
      searchHotels: "Search More Hotels",
      searchHotelsShort: "Search Hotels"
    },
    
    // Quick info cards
    quickInfo: {
      checkIn: "Check-in",
      checkOut: "Check-out", 
      nights: "Nights",
      totalAmount: "Total Amount"
    },
    
    // Detailed sections
    sections: {
      hotelInformation: "Hotel Information",
      roomInformation: "Room Information",
      guestInformation: "Guest Information",
      bookingSummary: "Booking Summary"
    },
    
    // Room details
    room: {
      roomType: "Room Type:",
      rate: "Rate:",
      perNight: "/night",
      roomAssignment: "Room Assignment:",
      roomAssignmentMessage: "Room will be assigned at check-in"
    },
    
    // Guest details
    guest: {
      name: "Name:",
      email: "Email:",
      numberOfGuests: "Number of Guests:"
    },
    
    // Booking summary
    summary: {
      bookedOn: "Booked on:",
      duration: "Duration:",
      nightSingle: "night",
      nightPlural: "nights"
    },
    
    // Status labels
    status: {
      bookingStatus: "BOOKING STATUS",
      paymentStatus: "PAYMENT STATUS",
      confirmed: "CONFIRMED",
      pending: "PENDING",
      cancelled: "CANCELLED",
      checkedIn: "CHECKED IN",
      checkedOut: "CHECKED OUT",
      paid: "Paid",
      payAtFrontDesk: "Pay at Front Desk",
      failed: "Failed",
      refunded: "Refunded"
    },
    
    // Important information
    importantInfo: {
      title: "Important Information",
      roomAssignment: "Your specific room number will be assigned at check-in",
      bringId: "Please bring a valid ID for check-in",
      checkInTime: "Check-in time: 3:00 PM | Check-out time: 11:00 AM",
      changesContact: "For any changes or cancellations, please contact the hotel directly",
      keepConfirmation: "Keep your confirmation number for reference"
    },
    
    // Email dialog
    emailDialog: {
      title: "Email Booking Confirmation",
      emailLabel: "Email Address",
      includeItinerary: "Include detailed itinerary",
      cancel: "Cancel",
      sendEmail: "Send Email",
      sending: "Sending..."
    },
    
    // Success/Error messages
    messages: {
      emailSuccess: "Email sent successfully!",
      emailError: "Failed to send email.",
      emailErrorServer: "The server encountered an internal error. Please try again later.",
      emailErrorInvalid: "Invalid email address.",
      emailErrorRetry: "Please try again later.",
      pdfSuccess: "PDF downloaded successfully!",
      pdfError: "Failed to download PDF.",
      pdfErrorServer: "The server encountered an internal error. Please try again later or contact support.",
      pdfErrorNotFound: "PDF not found for this booking.",
      pdfErrorAuth: "You are not authorized to download this PDF.",
      pdfErrorRetry: "Please try again later."
    }
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
    oromo: "Afaan Oromoo",
    changeLanguage: "Change Language"
  }
};
