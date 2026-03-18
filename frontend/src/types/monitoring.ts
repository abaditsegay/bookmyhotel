// API types for process monitoring and financial audit features

export interface ProcessMonitoringEventDto {
  id: number;
  hotelId: number;
  eventType: EventType;
  guestId?: number;
  guestName?: string;
  guestEmail?: string;
  staffId?: number;
  staffName?: string;
  reservationId?: number;
  confirmationNumber?: string;
  roomNumber?: string;
  timestamp: string;
  description?: string;
  details?: string;
  exception: boolean;
  exceptionType?: string;
  exceptionMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export enum EventType {
  // Guest Events
  GUEST_CHECK_IN = 'GUEST_CHECK_IN',
  GUEST_CHECK_OUT = 'GUEST_CHECK_OUT',
  GUEST_NO_SHOW = 'GUEST_NO_SHOW',
  GUEST_EARLY_CHECKOUT = 'GUEST_EARLY_CHECKOUT',
  GUEST_LATE_ARRIVAL = 'GUEST_LATE_ARRIVAL',
  GUEST_ROOM_CHANGE = 'GUEST_ROOM_CHANGE',
  GUEST_COMPLAINT = 'GUEST_COMPLAINT',
  GUEST_COMPLIMENT = 'GUEST_COMPLIMENT',

  // Booking Events
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_MODIFIED = 'BOOKING_MODIFIED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_PENDING = 'BOOKING_PENDING',

  // Payment Events
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYMENT_PARTIAL = 'PAYMENT_PARTIAL',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',

  // Room Events
  ROOM_ASSIGNED = 'ROOM_ASSIGNED',
  ROOM_CLEANED = 'ROOM_CLEANED',
  ROOM_MAINTENANCE = 'ROOM_MAINTENANCE',
  ROOM_OUT_OF_ORDER = 'ROOM_OUT_OF_ORDER',

  // Staff Events
  STAFF_LOGIN = 'STAFF_LOGIN',
  STAFF_LOGOUT = 'STAFF_LOGOUT',
  STAFF_SHIFT_START = 'STAFF_SHIFT_START',
  STAFF_SHIFT_END = 'STAFF_SHIFT_END',

  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATA_EXPORT = 'DATA_EXPORT',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE'
}

export interface DailyFinancialReconciliationDto {
  id?: number;
  hotelId: number;
  reconciliationDate: string;
  totalRevenue: number;
  totalCashPayments: number;
  totalCardPayments: number;
  totalOnlinePayments: number;
  totalMobilePayments: number;
  totalRefunds: number;
  netRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundTransactions: number;
  totalOutstandingBalance: number;
  reservationsWithOutstandingBalance: number;
  totalTaxCollected: number;
  expectedTax: number;
  taxDiscrepancy: number;
  discrepancies: PaymentDiscrepancyDto[];
  hasDiscrepancies: boolean;
  reconciliationStatus: string;
  reconciliationNotes?: string;
  reconciledBy?: string;
  reconciledAt?: string;
}

export interface PaymentDiscrepancyDto {
  id?: number;
  reservationId: number;
  confirmationNumber?: string;
  guestName?: string;
  discrepancyType: string;
  description: string;
  expectedAmount: number;
  actualAmount: number;
  discrepancyAmount: number;
  paymentMethod?: string;
  severity: string;
  status: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AuditTrailDto {
  id: number;
  hotelId: number;
  tenantId?: string;
  entityType: string;
  entityId: number;
  action: string;
  oldValues?: string;
  newValues?: string;
  changedFields?: string;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  reason?: string;
  details?: string;
  sensitive: boolean;
  complianceCategory?: string;
}

export interface LiveMonitoringData {
  totalEventsToday: number;
  exceptionsToday?: number;
  checkInsToday?: number;
  checkOutsToday?: number;
  lastUpdated: string;
}

export interface StaffActivity {
  staffId: number;
  staffName: string;
  eventCount: number;
  lastActivity: string;
}

export interface PatternDetection {
  exceptionCount: number;
  hasPatterns: boolean;
  period: string;
  multipleNoShows?: boolean;
  noShowCount?: number;
  frequentCancellations?: boolean;
  cancellationCount?: number;
  paymentIssues?: boolean;
  paymentFailureCount?: number;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'ERROR';
  totalEvents: number;
  exceptions: number;
  exceptionRate: number;
  lastChecked: string;
  error?: string;
}

export interface StaffPerformance {
  totalEvents: number;
  exceptions: number;
  exceptionRate: number;
  period: string;
  error?: string;
}

export interface DashboardSummary {
  liveMonitoring: LiveMonitoringData;
  staffActivity: StaffActivity[];
  recentAlerts: ProcessMonitoringEventDto[];
  patterns: PatternDetection;
  todayReconciliation: DailyFinancialReconciliationDto;
}