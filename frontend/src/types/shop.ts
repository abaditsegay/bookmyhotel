export enum ProductCategory {
  BEVERAGES = 'BEVERAGES',
  SNACKS = 'SNACKS',
  CULTURAL_CLOTHING = 'CULTURAL_CLOTHING',
  SOUVENIRS = 'SOUVENIRS',
  TOILETRIES = 'TOILETRIES',
  OTHER = 'OTHER'
}

export enum ShopOrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  ROOM_DELIVERY = 'ROOM_DELIVERY'
}

export enum PaymentMethod {
  ROOM_CHARGE = 'ROOM_CHARGE',
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  CREDIT_CARD = 'CREDIT_CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
  PAY_AT_FRONTDESK = 'PAY_AT_FRONTDESK'
}

export enum RoomChargeType {
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  MINIBAR = 'MINIBAR',
  LAUNDRY = 'LAUNDRY',
  TELEPHONE = 'TELEPHONE',
  RESTAURANT = 'RESTAURANT',
  SPA = 'SPA',
  ROOM_SERVICE = 'ROOM_SERVICE',
  INTERNET = 'INTERNET',
  PARKING = 'PARKING',
  BUSINESS_CENTER = 'BUSINESS_CENTER',
  FITNESS_CENTER = 'FITNESS_CENTER',
  CONFERENCE_ROOM = 'CONFERENCE_ROOM',
  EARLY_CHECKIN = 'EARLY_CHECKIN',
  LATE_CHECKOUT = 'LATE_CHECKOUT',
  DAMAGE = 'DAMAGE',
  CLEANING = 'CLEANING',
  INCIDENTAL = 'INCIDENTAL',
  OTHER = 'OTHER'
}

export interface Product {
  id: number;
  tenantId: string;
  hotelId: number;
  name: string;
  description?: string;
  sku: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  isActive: boolean;
  isAvailable: boolean;
  weightGrams?: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  sku: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  weightGrams?: number;
  imageUrl?: string;
  notes?: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  isActive?: boolean;
  isAvailable?: boolean;
}

export interface ShopOrderItem {
  id: number;
  tenantId: string;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productDescription?: string;
  productSku: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopOrderItemRequest {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface ShopOrder {
  id: number;
  tenantId: string;
  hotelId: number;
  hotelName?: string;
  hotelAddress?: string;
  hotelTaxId?: string;
  orderNumber: string;
  guestId?: number;
  reservationId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNumber?: string;
  status: ShopOrderStatus;
  totalAmount: number;
  taxAmount: number;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string;
  isPaid: boolean;
  paidAt?: string;
  paymentReference?: string;
  isDelivery: boolean;
  deliveryAddress?: string;
  deliveryTime?: string;
  deliveryType: DeliveryType;
  notes?: string;
  orderDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: ShopOrderItem[];
}

export interface ShopOrderCreateRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNumber?: string;
  reservationId?: number;
  paymentMethod?: PaymentMethod;
  isDelivery: boolean;
  deliveryAddress?: string;
  deliveryTime?: string;
  deliveryType: DeliveryType;
  notes?: string;
  items: ShopOrderItemRequest[];
}

export interface ShopOrderUpdateRequest {
  status?: ShopOrderStatus;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  paymentReference?: string;
  isDelivery?: boolean;
  deliveryAddress?: string;
  deliveryTime?: string;
  deliveryType?: DeliveryType;
  notes?: string;
}

export interface RoomCharge {
  id: number;
  tenantId: string;
  hotelId: number;
  reservationId: number;
  shopOrderId?: number;
  description: string;
  amount: number;
  chargeType: RoomChargeType;
  chargeDate: string;
  isPaid: boolean;
  paidAt?: string;
  paymentReference?: string;
  notes?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  guestName?: string;
  roomNumber?: string;
  reservationConfirmationNumber?: string;
}

export interface RoomChargeCreateRequest {
  reservationId: number;
  shopOrderId?: number;
  description: string;
  amount: number;
  chargeType: RoomChargeType;
  notes?: string;
}

export interface ShopDashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  topSellingProducts: Array<{
    product: Product;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface ProductStock {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minimumLevel: number;
  isLowStock: boolean;
  lastRestocked?: string;
}

// Utility functions for shop orders
export const ShopOrderUtils = {
  /**
   * Checks if an order is from an anonymous customer
   */
  isAnonymousOrder: (order: ShopOrder): boolean => {
    return !order.customerName || order.customerName.trim() === '';
  },

  /**
   * Returns a display-friendly customer name
   */
  getDisplayCustomerName: (order: ShopOrder): string => {
    // For room charges, show only room number instead of "Anonymous Customer"
    if (order.roomNumber && order.roomNumber.trim() !== '') {
      return `Room ${order.roomNumber}`;
    }
    
    if (ShopOrderUtils.isAnonymousOrder(order)) {
      return 'Anonymous Customer';
    }
    return order.customerName!;
  },

  /**
   * Returns order type description for display purposes
   */
  getOrderTypeDescription: (order: ShopOrder): string => {
    if (order.roomNumber && order.roomNumber.trim() !== '') {
      return 'Room Charge';
    } else if (ShopOrderUtils.isAnonymousOrder(order)) {
      return 'Anonymous Sale';
    } else {
      return 'Customer Order';
    }
  },

  /**
   * Formats order amount with currency
   */
  formatOrderAmount: (amount: number, currency: string = 'ETB'): string => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Gets order status color for UI display
   */
  getStatusColor: (status: ShopOrderStatus): string => {
    switch (status) {
      case ShopOrderStatus.PENDING:
        return '#ff9800'; // Orange
      case ShopOrderStatus.PAID:
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  },

  /**
   * Formats payment method for user-friendly display
   */
  formatPaymentMethod: (paymentMethod: string | null | undefined): string => {
    if (!paymentMethod) return 'Not Set';
    
    const formatted = paymentMethod.replace(/_/g, ' ');
    
    // Special cases for better readability
    switch (paymentMethod) {
      case 'ROOM_CHARGE':
        return 'Room Charge';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'PAY_AT_FRONTDESK':
        return 'Pay at Front Desk';
      case 'CASH':
        return 'Cash';
      case 'CARD':
        return 'Card';
      case 'MOBILE':
        return 'Mobile';
      default:
        return formatted;
    }
  }
};
