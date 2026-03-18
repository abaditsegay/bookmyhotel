import enhancedApi from './enhancedApi';
import {
  ProcessMonitoringEventDto,
  DailyFinancialReconciliationDto,
  AuditTrailDto,
  LiveMonitoringData,
  StaffActivity,
  PatternDetection,
  SystemHealth,
  StaffPerformance,
  DashboardSummary
} from '../types/monitoring';

const api = enhancedApi;

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Helper function to build query string
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

class ProcessMonitoringService {
  private baseUrl = 'hotel-admin'; // Updated to match backend endpoint

  // ========== Real-time Process Monitoring ==========

  /**
   * Get live monitoring data for hotel dashboard
   */
  async getLiveMonitoringData(hotelId: number): Promise<LiveMonitoringData> {
    const endpoint = `${this.baseUrl}/hotels/${hotelId}/monitoring/live`;
    const response = await api.get<LiveMonitoringData>(endpoint);
    return response.data;
  }

  /**
   * Get current staff activity
   */
  async getCurrentStaffActivity(hotelId: number): Promise<StaffActivity[]> {
    const response = await api.get<StaffActivity[]>(`${this.baseUrl}/hotels/${hotelId}/monitoring/staff-activity`);
    return response.data;
  }

  /**
   * Get exception alerts
   */
  async getExceptionAlerts(hotelId: number): Promise<ProcessMonitoringEventDto[]> {
    const response = await api.get<ProcessMonitoringEventDto[]>(`${this.baseUrl}/hotels/${hotelId}/monitoring/alerts`);
    return response.data;
  }

  /**
   * Get pattern detection results
   */
  async getPatternDetection(hotelId: number, hours: number = 24): Promise<PatternDetection> {
    const query = buildQueryString({ hours });
    const response = await api.get<PatternDetection>(`${this.baseUrl}/hotels/${hotelId}/monitoring/patterns?${query}`);
    return response.data;
  }

  /**
   * Get process monitoring events with pagination
   */
  async getMonitoringEvents(
    hotelId: number,
    options: {
      eventType?: string;
      exceptionsOnly?: boolean;
      startTime?: string;
      endTime?: string;
      page?: number;
      size?: number;
      sort?: string;
    } = {}
  ): Promise<PaginatedResponse<ProcessMonitoringEventDto>> {
    const params = {
      ...options,
      page: options.page || 0,
      size: options.size || 20
    };
    const query = buildQueryString(params);
    const response = await api.get<PaginatedResponse<ProcessMonitoringEventDto>>(
      `${this.baseUrl}/hotels/${hotelId}/monitoring/events?${query}`
    );
    return response.data;
  }

  /**
   * Log custom monitoring event
   */
  async logMonitoringEvent(
    hotelId: number,
    event: Partial<ProcessMonitoringEventDto>
  ): Promise<ProcessMonitoringEventDto> {
    const response = await api.post<ProcessMonitoringEventDto>(`${this.baseUrl}/hotels/${hotelId}/monitoring/events`, event);
    return response.data;
  }

  /**
   * Get staff performance summary
   */
  async getStaffPerformance(
    hotelId: number,
    staffId: number,
    days: number = 7
  ): Promise<StaffPerformance> {
    const query = buildQueryString({ days });
    const response = await api.get<StaffPerformance>(
      `${this.baseUrl}/hotels/${hotelId}/monitoring/staff/${staffId}/performance?${query}`
    );
    return response.data;
  }

  // ========== Financial Audit ==========

  /**
   * Generate daily financial reconciliation
   */
  async getDailyReconciliation(
    hotelId: number,
    date: string
  ): Promise<DailyFinancialReconciliationDto> {
    const query = buildQueryString({ date });
    const response = await api.get<DailyFinancialReconciliationDto>(
      `${this.baseUrl}/hotels/${hotelId}/audit/reconciliation?${query}`
    );
    return response.data;
  }

  /**
   * Get audit trail for specific entity
   */
  async getAuditTrail(
    hotelId: number,
    entityType: string,
    entityId: number
  ): Promise<AuditTrailDto[]> {
    const query = buildQueryString({ entityType, entityId });
    const response = await api.get<AuditTrailDto[]>(`${this.baseUrl}/hotels/${hotelId}/audit/trail?${query}`);
    return response.data;
  }

  /**
   * Get all audit logs with pagination
   */
  async getAuditLogs(
    hotelId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'timestamp,desc'
  ): Promise<PaginatedResponse<AuditTrailDto>> {
    const query = buildQueryString({ page, size, sort });
    const response = await api.get<PaginatedResponse<AuditTrailDto>>(
      `${this.baseUrl}/hotels/${hotelId}/audit/logs?${query}`
    );
    return response.data;
  }

  /**
   * Get sensitive audit logs (admin only)
   */
  async getSensitiveAuditLogs(
    hotelId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<AuditTrailDto>> {
    const query = buildQueryString({ page, size });
    const response = await api.get<PaginatedResponse<AuditTrailDto>>(
      `${this.baseUrl}/hotels/${hotelId}/audit/logs/sensitive?${query}`
    );
    return response.data;
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(
    hotelId: number,
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<AuditTrailDto>> {
    const query = buildQueryString({ page, size });
    const response = await api.get<PaginatedResponse<AuditTrailDto>>(
      `${this.baseUrl}/hotels/${hotelId}/audit/compliance/${category}?${query}`
    );
    return response.data;
  }

  /**
   * Create manual audit log entry
   */
  async createAuditLog(
    hotelId: number,
    auditData: {
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
      reason?: string;
      isSensitive?: boolean;
      complianceCategory?: string;
    }
  ): Promise<AuditTrailDto> {
    const query = buildQueryString(auditData);
    const response = await api.post<AuditTrailDto>(`${this.baseUrl}/hotels/${hotelId}/audit/logs?${query}`, null);
    return response.data;
  }

  // ========== Dashboard Summary ==========

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardSummary(hotelId: number): Promise<DashboardSummary> {
    const endpoint = `${this.baseUrl}/hotels/${hotelId}/dashboard/summary`;
    const response = await api.get<DashboardSummary>(endpoint);
    return response.data;
  }

  /**
   * Get system health status
   */
  async getSystemHealth(hotelId: number): Promise<SystemHealth> {
    const endpoint = `${this.baseUrl}/hotels/${hotelId}/monitoring/health`;
    const response = await api.get<SystemHealth>(endpoint);
    return response.data;
  }
}

const processMonitoringService = new ProcessMonitoringService();
export default processMonitoringService;