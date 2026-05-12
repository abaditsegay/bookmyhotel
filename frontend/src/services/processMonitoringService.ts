import enhancedApi from './enhancedApi';
import {
  ProcessMonitoringEventDto,
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