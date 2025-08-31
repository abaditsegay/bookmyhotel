export const enTranslations = {
  hotelSearch: {
    title: "Hotel Search",
    subtitle: "Find and book your perfect stay worldwide",
    form: {
      destination: "Destination",
      destinationPlaceholder: "Where are you going?",
      checkin: "Check-in Date",
      checkout: "Check-out Date",
      guests: "Guests",
      guestsPlaceholder: "Number of guests",
      rooms: "Rooms",
      roomsPlaceholder: "Number of rooms",
      searchButton: "Search Hotels",
      searching: "Searching..."
    },
    alreadyHaveBooking: {
      title: "📋 Already Have a Booking?",
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
