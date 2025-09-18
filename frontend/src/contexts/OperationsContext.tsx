import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  HousekeepingTask,
  MaintenanceTask,
  HousekeepingStaff,
  User,
  OperationsStats,
  StaffPerformance,
  RecentActivity,
  CreateHousekeepingTaskRequest,
  CreateMaintenanceTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  TaskFilters
} from '../types/operations';
import operationsApi from '../services/operationsApi';

// State interface
interface OperationsState {
  // Tasks
  housekeepingTasks: HousekeepingTask[];
  maintenanceTasks: MaintenanceTask[];
  
  // Staff
  housekeepingStaff: HousekeepingStaff[];
  maintenanceStaff: User[];
  
  // Dashboard data
  stats: OperationsStats | null;
  staffPerformance: StaffPerformance[];
  recentActivity: RecentActivity[];
  
  // UI state
  loading: {
    tasks: boolean;
    staff: boolean;
    dashboard: boolean;
  };
  error: string | null;
  
  // Filters
  housekeepingFilters: TaskFilters;
  maintenanceFilters: TaskFilters;
  
  // Pagination
  housekeepingPagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
  maintenancePagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

// Action types
type OperationsAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof OperationsState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  
  // Task actions
  | { type: 'SET_HOUSEKEEPING_TASKS'; payload: { tasks: HousekeepingTask[]; pagination: any } }
  | { type: 'SET_MAINTENANCE_TASKS'; payload: { tasks: MaintenanceTask[]; pagination: any } }
  | { type: 'ADD_HOUSEKEEPING_TASK'; payload: HousekeepingTask }
  | { type: 'ADD_MAINTENANCE_TASK'; payload: MaintenanceTask }
  | { type: 'UPDATE_HOUSEKEEPING_TASK'; payload: HousekeepingTask }
  | { type: 'UPDATE_MAINTENANCE_TASK'; payload: MaintenanceTask }
  | { type: 'DELETE_HOUSEKEEPING_TASK'; payload: number }
  | { type: 'DELETE_MAINTENANCE_TASK'; payload: number }
  
  // Staff actions
  | { type: 'SET_HOUSEKEEPING_STAFF'; payload: HousekeepingStaff[] }
  | { type: 'SET_MAINTENANCE_STAFF'; payload: User[] }
  
  // Dashboard actions
  | { type: 'SET_STATS'; payload: OperationsStats }
  | { type: 'SET_STAFF_PERFORMANCE'; payload: StaffPerformance[] }
  | { type: 'SET_RECENT_ACTIVITY'; payload: RecentActivity[] }
  
  // Filter actions
  | { type: 'SET_HOUSEKEEPING_FILTERS'; payload: TaskFilters }
  | { type: 'SET_MAINTENANCE_FILTERS'; payload: TaskFilters }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: OperationsState = {
  housekeepingTasks: [],
  maintenanceTasks: [],
  housekeepingStaff: [],
  maintenanceStaff: [],
  stats: null,
  staffPerformance: [],
  recentActivity: [],
  loading: {
    tasks: false,
    staff: false,
    dashboard: false,
  },
  error: null,
  housekeepingFilters: {},
  maintenanceFilters: {},
  housekeepingPagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20,
  },
  maintenancePagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20,
  },
};

// Reducer
const operationsReducer = (state: OperationsState, action: OperationsAction): OperationsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'SET_HOUSEKEEPING_TASKS':
      return {
        ...state,
        housekeepingTasks: action.payload.tasks,
        housekeepingPagination: action.payload.pagination,
      };
    
    case 'SET_MAINTENANCE_TASKS':
      return {
        ...state,
        maintenanceTasks: action.payload.tasks,
        maintenancePagination: action.payload.pagination,
      };
    
    case 'ADD_HOUSEKEEPING_TASK':
      return {
        ...state,
        housekeepingTasks: [action.payload, ...state.housekeepingTasks],
      };
    
    case 'ADD_MAINTENANCE_TASK':
      return {
        ...state,
        maintenanceTasks: [action.payload, ...state.maintenanceTasks],
      };
    
    case 'UPDATE_HOUSEKEEPING_TASK':
      return {
        ...state,
        housekeepingTasks: state.housekeepingTasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'UPDATE_MAINTENANCE_TASK':
      return {
        ...state,
        maintenanceTasks: state.maintenanceTasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_HOUSEKEEPING_TASK':
      return {
        ...state,
        housekeepingTasks: state.housekeepingTasks.filter(task => task.id !== action.payload),
      };
    
    case 'DELETE_MAINTENANCE_TASK':
      return {
        ...state,
        maintenanceTasks: state.maintenanceTasks.filter(task => task.id !== action.payload),
      };
    
    case 'SET_HOUSEKEEPING_STAFF':
      return {
        ...state,
        housekeepingStaff: action.payload,
      };
    
    case 'SET_MAINTENANCE_STAFF':
      return {
        ...state,
        maintenanceStaff: action.payload,
      };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
      };
    
    case 'SET_STAFF_PERFORMANCE':
      return {
        ...state,
        staffPerformance: action.payload,
      };
    
    case 'SET_RECENT_ACTIVITY':
      return {
        ...state,
        recentActivity: action.payload,
      };
    
    case 'SET_HOUSEKEEPING_FILTERS':
      return {
        ...state,
        housekeepingFilters: action.payload,
      };
    
    case 'SET_MAINTENANCE_FILTERS':
      return {
        ...state,
        maintenanceFilters: action.payload,
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        housekeepingFilters: {},
        maintenanceFilters: {},
      };
    
    default:
      return state;
  }
};

// Context
interface OperationsContextType {
  state: OperationsState;
  
  // Task actions
  loadHousekeepingTasks: (page?: number, filters?: TaskFilters) => Promise<void>;
  loadMaintenanceTasks: (page?: number, filters?: TaskFilters) => Promise<void>;
  createHousekeepingTask: (task: CreateHousekeepingTaskRequest) => Promise<HousekeepingTask>;
  createMaintenanceTask: (task: CreateMaintenanceTaskRequest) => Promise<MaintenanceTask>;
  updateHousekeepingTaskStatus: (id: number, statusUpdate: UpdateTaskStatusRequest) => Promise<void>;
  updateMaintenanceTaskStatus: (id: number, statusUpdate: UpdateTaskStatusRequest) => Promise<void>;
  assignHousekeepingTask: (assignment: AssignTaskRequest) => Promise<void>;
  assignMaintenanceTask: (assignment: AssignTaskRequest) => Promise<void>;
  deleteHousekeepingTask: (id: number) => Promise<void>;
  deleteMaintenanceTask: (id: number) => Promise<void>;
  
  // Staff actions
  loadHousekeepingStaff: () => Promise<void>;
  loadMaintenanceStaff: () => Promise<void>;
  
  // Dashboard actions
  loadDashboardData: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadStaffPerformance: () => Promise<void>;
  loadRecentActivity: () => Promise<void>;
  
  // Filter actions
  setHousekeepingFilters: (filters: TaskFilters) => void;
  setMaintenanceFilters: (filters: TaskFilters) => void;
  resetFilters: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

// Provider component
interface OperationsProviderProps {
  children: ReactNode;
}

export const OperationsProvider: React.FC<OperationsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(operationsReducer, initialState);

  const setLoading = useCallback((key: keyof OperationsState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Task actions
  const loadHousekeepingTasks = useCallback(async (page = 0, filters?: TaskFilters) => {
    try {
      setLoading('tasks', true);
      setError(null);
      
      const filtersToUse = filters || state.housekeepingFilters;
      const response = await operationsApi.getHousekeepingTasks(page, state.housekeepingPagination.pageSize, filtersToUse);
      
      dispatch({
        type: 'SET_HOUSEKEEPING_TASKS',
        payload: {
          tasks: response.content,
          pagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            pageSize: response.pageSize,
          },
        },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load housekeeping tasks');
    } finally {
      setLoading('tasks', false);
    }
  }, [state.housekeepingFilters, state.housekeepingPagination.pageSize, setLoading, setError]);

  const loadMaintenanceTasks = useCallback(async (page = 0, filters?: TaskFilters) => {
    try {
      setLoading('tasks', true);
      setError(null);
      
      const filtersToUse = filters || state.maintenanceFilters;
      const response = await operationsApi.getMaintenanceTasks(page, state.maintenancePagination.pageSize, filtersToUse);
      
      dispatch({
        type: 'SET_MAINTENANCE_TASKS',
        payload: {
          tasks: response.content,
          pagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            pageSize: response.pageSize,
          },
        },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load maintenance tasks');
    } finally {
      setLoading('tasks', false);
    }
  }, [state.maintenanceFilters, state.maintenancePagination.pageSize, setLoading, setError]);

  const createHousekeepingTask = useCallback(async (task: CreateHousekeepingTaskRequest): Promise<HousekeepingTask> => {
    try {
      setError(null);
      const newTask = await operationsApi.createHousekeepingTask(task);
      dispatch({ type: 'ADD_HOUSEKEEPING_TASK', payload: newTask });
      return newTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create housekeeping task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const createMaintenanceTask = useCallback(async (task: CreateMaintenanceTaskRequest): Promise<MaintenanceTask> => {
    try {
      setError(null);
      const newTask = await operationsApi.createMaintenanceTask(task);
      dispatch({ type: 'ADD_MAINTENANCE_TASK', payload: newTask });
      return newTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create maintenance task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const updateHousekeepingTaskStatus = useCallback(async (id: number, statusUpdate: UpdateTaskStatusRequest) => {
    try {
      setError(null);
      const updatedTask = await operationsApi.updateHousekeepingTaskStatus(id, statusUpdate);
      dispatch({ type: 'UPDATE_HOUSEKEEPING_TASK', payload: updatedTask });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const updateMaintenanceTaskStatus = useCallback(async (id: number, statusUpdate: UpdateTaskStatusRequest) => {
    try {
      setError(null);
      const updatedTask = await operationsApi.updateMaintenanceTaskStatus(id, statusUpdate);
      dispatch({ type: 'UPDATE_MAINTENANCE_TASK', payload: updatedTask });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const assignHousekeepingTask = useCallback(async (assignment: AssignTaskRequest) => {
    try {
      setError(null);
      const updatedTask = await operationsApi.assignHousekeepingTask(assignment);
      dispatch({ type: 'UPDATE_HOUSEKEEPING_TASK', payload: updatedTask });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const assignMaintenanceTask = useCallback(async (assignment: AssignTaskRequest) => {
    try {
      setError(null);
      const updatedTask = await operationsApi.assignMaintenanceTask(assignment);
      dispatch({ type: 'UPDATE_MAINTENANCE_TASK', payload: updatedTask });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const deleteHousekeepingTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await operationsApi.deleteHousekeepingTask(id);
      dispatch({ type: 'DELETE_HOUSEKEEPING_TASK', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  const deleteMaintenanceTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await operationsApi.deleteMaintenanceTask(id);
      dispatch({ type: 'DELETE_MAINTENANCE_TASK', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);

  // Staff actions
  const loadHousekeepingStaff = useCallback(async () => {
    try {
      setLoading('staff', true);
      setError(null);
      const staff = await operationsApi.getHousekeepingStaff();
      dispatch({ type: 'SET_HOUSEKEEPING_STAFF', payload: staff });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load housekeeping staff');
    } finally {
      setLoading('staff', false);
    }
  }, [setLoading, setError]);

  const loadMaintenanceStaff = useCallback(async () => {
    try {
      setLoading('staff', true);
      setError(null);
      const staff = await operationsApi.getMaintenanceStaff();
      dispatch({ type: 'SET_MAINTENANCE_STAFF', payload: staff });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load maintenance staff');
    } finally {
      setLoading('staff', false);
    }
  }, [setLoading, setError]);

  // Dashboard actions
  const loadStats = useCallback(async () => {
    try {
      setLoading('dashboard', true);
      const stats = await operationsApi.getOperationsStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    }
  }, [setLoading, setError]);

  const loadStaffPerformance = useCallback(async () => {
    try {
      const performance = await operationsApi.getStaffPerformance();
      dispatch({ type: 'SET_STAFF_PERFORMANCE', payload: performance });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load staff performance');
    }
  }, [setError]);

  const loadRecentActivity = useCallback(async () => {
    try {
      const activity = await operationsApi.getRecentActivity();
      dispatch({ type: 'SET_RECENT_ACTIVITY', payload: activity });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load recent activity');
    }
  }, [setError]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading('dashboard', true);
      setError(null);
      await Promise.all([
        loadStats(),
        loadStaffPerformance(),
        loadRecentActivity(),
      ]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading('dashboard', false);
    }
  }, [loadStats, loadStaffPerformance, loadRecentActivity, setLoading, setError]);

  // Filter actions
  const setHousekeepingFilters = useCallback((filters: TaskFilters) => {
    dispatch({ type: 'SET_HOUSEKEEPING_FILTERS', payload: filters });
  }, []);

  const setMaintenanceFilters = useCallback((filters: TaskFilters) => {
    dispatch({ type: 'SET_MAINTENANCE_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const contextValue: OperationsContextType = {
    state,
    
    // Task actions
    loadHousekeepingTasks,
    loadMaintenanceTasks,
    createHousekeepingTask,
    createMaintenanceTask,
    updateHousekeepingTaskStatus,
    updateMaintenanceTaskStatus,
    assignHousekeepingTask,
    assignMaintenanceTask,
    deleteHousekeepingTask,
    deleteMaintenanceTask,
    
    // Staff actions
    loadHousekeepingStaff,
    loadMaintenanceStaff,
    
    // Dashboard actions
    loadDashboardData,
    loadStats,
    loadStaffPerformance,
    loadRecentActivity,
    
    // Filter actions
    setHousekeepingFilters,
    setMaintenanceFilters,
    resetFilters,
    
    // Utility actions
    setError,
  };

  return (
    <OperationsContext.Provider value={contextValue}>
      {children}
    </OperationsContext.Provider>
  );
};

// Hook
export const useOperations = (): OperationsContextType => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

export default OperationsContext;
