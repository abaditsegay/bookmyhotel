// User and Role Types
export enum UserRole {
  GUEST = 'GUEST',
  STAFF = 'STAFF',
  HOTEL_ADMIN = 'HOTEL_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  HOUSEKEEPING = 'HOUSEKEEPING',
  MAINTENANCE = 'MAINTENANCE',
  OPERATIONS_SUPERVISOR = 'OPERATIONS_SUPERVISOR'
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// Housekeeping Types
export enum HousekeepingTaskType {
  ROOM_CLEANING = 'ROOM_CLEANING',
  DEEP_CLEANING = 'DEEP_CLEANING',
  LAUNDRY = 'LAUNDRY',
  PUBLIC_AREA_CLEANING = 'PUBLIC_AREA_CLEANING',
  INVENTORY_CHECK = 'INVENTORY_CHECK',
  MAINTENANCE_REQUEST = 'MAINTENANCE_REQUEST'
}

export enum HousekeepingTaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}

export interface HousekeepingTask {
  id: number;
  title: string;
  description: string;
  taskType: HousekeepingTaskType;
  status: HousekeepingTaskStatus;
  priority: TaskPriority;
  roomNumber?: string;
  floorNumber?: number;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  assignedStaffId?: number;
  assignedStaff?: HousekeepingStaff;
  supervisorId?: number;
  supervisor?: User;
  dueDate: string;
  startTime?: string;
  completionTime?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface HousekeepingStaff {
  id: number;
  userId: number;
  user: User;
  employeeId: string;
  shiftType: ShiftType;
  specializations: HousekeepingTaskType[];
  isActive: boolean;
  averageRating: number;
  totalTasksCompleted: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// Maintenance Types
export enum MaintenanceTaskType {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  APPLIANCE_REPAIR = 'APPLIANCE_REPAIR',
  FURNITURE_REPAIR = 'FURNITURE_REPAIR',
  PAINTING = 'PAINTING',
  CARPET_REPAIR = 'CARPET_REPAIR',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  EMERGENCY_REPAIR = 'EMERGENCY_REPAIR'
}

export enum MaintenanceTaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export interface MaintenanceTask {
  id: number;
  title: string;
  description: string;
  taskType: MaintenanceTaskType;
  status: MaintenanceTaskStatus;
  priority: TaskPriority;
  roomNumber?: string;
  floorNumber?: number;
  equipmentType?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  assignedStaffId?: number;
  assignedStaff?: User;
  supervisorId?: number;
  supervisor?: User;
  dueDate: string;
  startTime?: string;
  completionTime?: string;
  notes?: string;
  partsUsed?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// Maintenance Request (separate from Task)
export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roomNumber?: string;
  assignedStaff?: HousekeepingStaff;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  tenantId: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Dashboard Types
export interface OperationsStats {
  housekeeping: {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    activeStaff: number;
    averageTaskTime: number;
    completionRate: number;
  };
  maintenance: {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    activeStaff: number;
    totalCost: number;
    averageCost: number;
    completionRate: number;
  };
}

// Dashboard stats alias
export type DashboardStats = OperationsStats;

export interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  tasksCompleted: number;
  averageRating: number;
  efficiency: number;
  totalHours: number;
}

export interface RecentActivity {
  id: number;
  type: 'housekeeping' | 'maintenance';
  action: string;
  description: string;
  timestamp: string;
  priority: TaskPriority;
  staffName?: string;
  roomNumber?: string;
}

// Form Types
export interface CreateHousekeepingTaskRequest {
  title: string;
  description: string;
  taskType: HousekeepingTaskType;
  priority: TaskPriority;
  roomNumber?: string;
  floorNumber?: number;
  estimatedDuration: number;
  dueDate: string;
  assignedStaffId?: number;
  notes?: string;
}

export interface CreateMaintenanceTaskRequest {
  title: string;
  description: string;
  taskType: MaintenanceTaskType;
  priority: TaskPriority;
  roomNumber?: string;
  floorNumber?: number;
  equipmentType?: string;
  estimatedCost: number;
  estimatedDuration: number;
  dueDate: string;
  assignedStaffId?: number;
  notes?: string;
}

export interface CreateMaintenanceRequestRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  roomNumber?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateTaskStatusRequest {
  status: HousekeepingTaskStatus | MaintenanceTaskStatus;
  notes?: string;
  actualDuration?: number;
  actualCost?: number;
  partsUsed?: string;
  rating?: number;
}

export interface AssignTaskRequest {
  taskId: number;
  staffId: number;
  notes?: string;
}

// Filter Types
export interface TaskFilters {
  status?: string[];
  priority?: string[];
  taskType?: string[];
  assignedStaffId?: number;
  dateFrom?: string;
  dateTo?: string;
  roomNumber?: string;
  floorNumber?: number;
}

export interface StaffFilters {
  role?: UserRole[];
  shiftType?: ShiftType[];
  isActive?: boolean;
  specialization?: HousekeepingTaskType[];
}

// Component Props Types
export interface TaskCardProps {
  task: HousekeepingTask | MaintenanceTask;
  onStatusUpdate: (taskId: number, status: HousekeepingTaskStatus | MaintenanceTaskStatus, notes?: string) => void;
  onAssign: (taskId: number, staffId: number) => void;
  onEdit?: (task: HousekeepingTask | MaintenanceTask) => void;
  onDelete?: (taskId: number) => void;
  showActions?: boolean;
  userRole: UserRole;
}

export interface DashboardProps {
  userRole: UserRole;
  userId: number;
  onTaskCreate?: (task: CreateHousekeepingTaskRequest | CreateMaintenanceTaskRequest) => void;
  onTaskUpdate?: (taskId: number, updates: Partial<HousekeepingTask | MaintenanceTask>) => void;
}

// Utility Types
export type TaskType = HousekeepingTask | MaintenanceTask;
export type TaskStatusType = HousekeepingTaskStatus | MaintenanceTaskStatus;
export type CreateTaskRequest = CreateHousekeepingTaskRequest | CreateMaintenanceTaskRequest;
