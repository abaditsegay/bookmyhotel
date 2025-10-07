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
        editRoom: {
          title: "Edit Room",
          roomNumber: "Room Number",
          status: "Status",
          available: "Available",
          cancel: "Cancel",
          save: "Save"
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
        searchRooms: "Search rooms",
        statusFilter: "Status Filter",
        allStatuses: "All Statuses",
        tableHeaders: {
          roomNumber: "Room Number",
          type: "Type",
          status: "Status",
          currentGuest: "Current Guest",
          capacity: "Capacity",
          pricePerNight: "Price/Night",
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
        }
      }
    }
  },

  // Booking Management
  booking: {
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
