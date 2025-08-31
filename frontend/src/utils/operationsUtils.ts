import {
  TaskPriority,
  HousekeepingTaskStatus,
  MaintenanceTaskStatus,
  HousekeepingTaskType,
  MaintenanceTaskType,
  UserRole,
  ShiftType
} from '../types/operations';

// Priority helpers
export const getPriorityColor = (priority: TaskPriority): 'error' | 'warning' | 'info' | 'success' => {
  switch (priority) {
    case TaskPriority.URGENT:
    case TaskPriority.CRITICAL:
      return 'error';
    case TaskPriority.HIGH:
      return 'warning';
    case TaskPriority.NORMAL:
      return 'info';
    case TaskPriority.LOW:
      return 'success';
    default:
      return 'info';
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.URGENT:
      return 'Urgent';
    case TaskPriority.CRITICAL:
      return 'Critical';
    case TaskPriority.HIGH:
      return 'High';
    case TaskPriority.NORMAL:
      return 'Normal';
    case TaskPriority.LOW:
      return 'Low';
    default:
      return 'Normal';
  }
};

export const getPriorityWeight = (priority: TaskPriority): number => {
  switch (priority) {
    case TaskPriority.URGENT:
      return 5;
    case TaskPriority.CRITICAL:
      return 5;
    case TaskPriority.HIGH:
      return 4;
    case TaskPriority.NORMAL:
      return 3;
    case TaskPriority.LOW:
      return 2;
    default:
      return 3;
  }
};

// Status helpers
export const getHousekeepingStatusColor = (status: HousekeepingTaskStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case HousekeepingTaskStatus.PENDING:
      return 'default';
    case HousekeepingTaskStatus.ASSIGNED:
      return 'info';
    case HousekeepingTaskStatus.IN_PROGRESS:
      return 'primary';
    case HousekeepingTaskStatus.COMPLETED:
      return 'success';
    case HousekeepingTaskStatus.CANCELLED:
      return 'error';
    case HousekeepingTaskStatus.ON_HOLD:
      return 'warning';
    default:
      return 'default';
  }
};

export const getMaintenanceStatusColor = (status: MaintenanceTaskStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case MaintenanceTaskStatus.OPEN:
      return 'default';
    case MaintenanceTaskStatus.ASSIGNED:
      return 'info';
    case MaintenanceTaskStatus.IN_PROGRESS:
      return 'primary';
    case MaintenanceTaskStatus.WAITING_FOR_PARTS:
      return 'warning';
    case MaintenanceTaskStatus.COMPLETED:
      return 'success';
    case MaintenanceTaskStatus.CANCELLED:
      return 'error';
    case MaintenanceTaskStatus.ON_HOLD:
      return 'secondary';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: HousekeepingTaskStatus | MaintenanceTaskStatus): string => {
  switch (status) {
    case HousekeepingTaskStatus.PENDING:
    case MaintenanceTaskStatus.OPEN:
      return 'Open';
    case HousekeepingTaskStatus.ASSIGNED:
    case MaintenanceTaskStatus.ASSIGNED:
      return 'Assigned';
    case HousekeepingTaskStatus.IN_PROGRESS:
    case MaintenanceTaskStatus.IN_PROGRESS:
      return 'In Progress';
    case HousekeepingTaskStatus.COMPLETED:
    case MaintenanceTaskStatus.COMPLETED:
      return 'Completed';
    case HousekeepingTaskStatus.CANCELLED:
    case MaintenanceTaskStatus.CANCELLED:
      return 'Cancelled';
    case HousekeepingTaskStatus.ON_HOLD:
    case MaintenanceTaskStatus.ON_HOLD:
      return 'On Hold';
    case MaintenanceTaskStatus.WAITING_FOR_PARTS:
      return 'Waiting for Parts';
    default:
      return 'Unknown';
  }
};

// Task Type helpers
export const getHousekeepingTaskTypeLabel = (type: HousekeepingTaskType): string => {
  switch (type) {
    case HousekeepingTaskType.ROOM_CLEANING:
      return 'Room Cleaning';
    case HousekeepingTaskType.DEEP_CLEANING:
      return 'Deep Cleaning';
    case HousekeepingTaskType.LAUNDRY:
      return 'Laundry';
    case HousekeepingTaskType.PUBLIC_AREA_CLEANING:
      return 'Public Area Cleaning';
    case HousekeepingTaskType.INVENTORY_CHECK:
      return 'Inventory Check';
    case HousekeepingTaskType.MAINTENANCE_REQUEST:
      return 'Maintenance Request';
    default:
      return 'Unknown';
  }
};

export const getMaintenanceTaskTypeLabel = (type: MaintenanceTaskType): string => {
  switch (type) {
    case MaintenanceTaskType.PLUMBING:
      return 'Plumbing';
    case MaintenanceTaskType.ELECTRICAL:
      return 'Electrical';
    case MaintenanceTaskType.HVAC:
      return 'HVAC';
    case MaintenanceTaskType.APPLIANCE_REPAIR:
      return 'Appliance Repair';
    case MaintenanceTaskType.FURNITURE_REPAIR:
      return 'Furniture Repair';
    case MaintenanceTaskType.PAINTING:
      return 'Painting';
    case MaintenanceTaskType.CARPET_REPAIR:
      return 'Carpet Repair';
    case MaintenanceTaskType.PREVENTIVE_MAINTENANCE:
      return 'Preventive Maintenance';
    case MaintenanceTaskType.EMERGENCY_REPAIR:
      return 'Emergency Repair';
    default:
      return 'Unknown';
  }
};

// Role and Permission helpers
export const getUserRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.GUEST:
      return 'Guest';
    case UserRole.STAFF:
      return 'Staff';
    case UserRole.HOTEL_ADMIN:
      return 'Hotel Admin';
    case UserRole.SYSTEM_ADMIN:
      return 'System Admin';
    case UserRole.HOUSEKEEPING:
      return 'Housekeeping';
    case UserRole.MAINTENANCE:
      return 'Maintenance';
    case UserRole.OPERATIONS_SUPERVISOR:
      return 'Operations Supervisor';
    default:
      return 'Unknown';
  }
};

export const canManageTasks = (role: UserRole): boolean => {
  return [
    UserRole.OPERATIONS_SUPERVISOR,
    UserRole.HOTEL_ADMIN,
    UserRole.SYSTEM_ADMIN
  ].includes(role);
};

export const canAssignTasks = (role: UserRole): boolean => {
  return [
    UserRole.OPERATIONS_SUPERVISOR,
    UserRole.HOTEL_ADMIN,
    UserRole.SYSTEM_ADMIN
  ].includes(role);
};

export const canUpdateTaskStatus = (role: UserRole, taskType: 'housekeeping' | 'maintenance'): boolean => {
  if (canManageTasks(role)) {
    return true;
  }
  
  if (taskType === 'housekeeping' && role === UserRole.HOUSEKEEPING) {
    return true;
  }
  
  if (taskType === 'maintenance' && role === UserRole.MAINTENANCE) {
    return true;
  }
  
  return false;
};

export const canCreateTasks = (role: UserRole): boolean => {
  return [
    UserRole.OPERATIONS_SUPERVISOR,
    UserRole.HOTEL_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HOUSEKEEPING,
    UserRole.MAINTENANCE
  ].includes(role);
};

export const canDeleteTasks = (role: UserRole): boolean => {
  return [
    UserRole.OPERATIONS_SUPERVISOR,
    UserRole.HOTEL_ADMIN,
    UserRole.SYSTEM_ADMIN
  ].includes(role);
};

// Shift helpers
export const getShiftTypeLabel = (shift: ShiftType): string => {
  switch (shift) {
    case ShiftType.MORNING:
      return 'Morning (6AM - 2PM)';
    case ShiftType.AFTERNOON:
      return 'Afternoon (2PM - 10PM)';
    case ShiftType.EVENING:
      return 'Evening (6PM - 2AM)';
    case ShiftType.NIGHT:
      return 'Night (10PM - 6AM)';
    default:
      return 'Unknown';
  }
};

export const getShiftColor = (shift: ShiftType): 'primary' | 'secondary' | 'info' | 'warning' => {
  switch (shift) {
    case ShiftType.MORNING:
      return 'primary';
    case ShiftType.AFTERNOON:
      return 'secondary';
    case ShiftType.EVENING:
      return 'info';
    case ShiftType.NIGHT:
      return 'warning';
    default:
      return 'secondary';
  }
};

// Date and Time helpers
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
};

// Validation helpers
export const isTaskOverdue = (dueDate: string): boolean => {
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
};

export const getTaskUrgency = (dueDate: string, priority: TaskPriority): 'low' | 'medium' | 'high' | 'critical' => {
  const isOverdue = isTaskOverdue(dueDate);
  const priorityWeight = getPriorityWeight(priority);

  if (isOverdue && priorityWeight >= 3) {
    return 'critical';
  } else if (isOverdue || priorityWeight === 4) {
    return 'high';
  } else if (priorityWeight === 3) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Sorting helpers
export const sortTasksByPriority = <T extends { priority: TaskPriority; dueDate: string }>(tasks: T[]): T[] => {
  return [...tasks].sort((a, b) => {
    const aUrgency = getTaskUrgency(a.dueDate, a.priority);
    const bUrgency = getTaskUrgency(b.dueDate, b.priority);
    
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    const urgencyDiff = urgencyOrder[bUrgency] - urgencyOrder[aUrgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // If urgency is the same, sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

export const sortTasksByDueDate = <T extends { dueDate: string }>(tasks: T[]): T[] => {
  return [...tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
};

export const sortTasksByStatus = <T extends { status: HousekeepingTaskStatus | MaintenanceTaskStatus }>(tasks: T[]): T[] => {
  const getStatusOrder = (status: HousekeepingTaskStatus | MaintenanceTaskStatus): number => {
    switch (status) {
      case HousekeepingTaskStatus.PENDING:
      case MaintenanceTaskStatus.OPEN:
        return 1;
      case HousekeepingTaskStatus.ASSIGNED:
      case MaintenanceTaskStatus.ASSIGNED:
        return 2;
      case HousekeepingTaskStatus.IN_PROGRESS:
      case MaintenanceTaskStatus.IN_PROGRESS:
        return 3;
      case MaintenanceTaskStatus.WAITING_FOR_PARTS:
        return 4;
      case HousekeepingTaskStatus.ON_HOLD:
      case MaintenanceTaskStatus.ON_HOLD:
        return 5;
      case HousekeepingTaskStatus.COMPLETED:
      case MaintenanceTaskStatus.COMPLETED:
        return 6;
      case HousekeepingTaskStatus.CANCELLED:
      case MaintenanceTaskStatus.CANCELLED:
        return 7;
      default:
        return 8;
    }
  };

  return [...tasks].sort((a, b) => 
    getStatusOrder(a.status) - getStatusOrder(b.status)
  );
};

// Filter helpers
export const filterTasksByStatus = <T extends { status: HousekeepingTaskStatus | MaintenanceTaskStatus }>(
  tasks: T[],
  statuses: string[]
): T[] => {
  if (statuses.length === 0) return tasks;
  return tasks.filter(task => statuses.includes(task.status));
};

export const filterTasksByPriority = <T extends { priority: TaskPriority }>(
  tasks: T[],
  priorities: string[]
): T[] => {
  if (priorities.length === 0) return tasks;
  return tasks.filter(task => priorities.includes(task.priority));
};

export const filterTasksByAssignee = <T extends { assignedStaffId?: number }>(
  tasks: T[],
  staffId?: number
): T[] => {
  if (staffId === undefined) return tasks;
  return tasks.filter(task => task.assignedStaffId === staffId);
};

export const filterTasksByRoom = <T extends { roomNumber?: string }>(
  tasks: T[],
  roomNumber?: string
): T[] => {
  if (!roomNumber) return tasks;
  return tasks.filter(task => 
    task.roomNumber?.toLowerCase().includes(roomNumber.toLowerCase())
  );
};

export const filterTasksByDateRange = <T extends { dueDate: string }>(
  tasks: T[],
  startDate?: string,
  endDate?: string
): T[] => {
  if (!startDate && !endDate) return tasks;
  
  return tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && taskDate < start) return false;
    if (end && taskDate > end) return false;
    
    return true;
  });
};

// Statistics helpers
export const calculateCompletionRate = (completed: number, total: number): number => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

export const calculateEfficiency = (tasksCompleted: number, totalHours: number): number => {
  if (totalHours === 0) return 0;
  const tasksPerHour = tasksCompleted / totalHours;
  return Math.round(tasksPerHour * 100) / 100;
};
