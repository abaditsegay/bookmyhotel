package com.bookmyhotel.service;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.enums.*;
import com.bookmyhotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Collections;
import java.util.stream.Collectors;

/**
 * Simplified service for task assignment to fix the 500 error
 */
@Service("housekeepingServiceSimple")
@Transactional
public class HousekeepingServiceSimple {
    
    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;
    
    @Autowired
    private HousekeepingStaffRepository housekeepingStaffRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Manually assign task to specific staff
     * Supports both housekeeping_staff table and users table staff
     */
    public HousekeepingTask assignTask(Long taskId, Long staffId, String tenantId) {
        HousekeepingTask task = getTaskById(taskId, tenantId);
        
        // Try to find staff in housekeeping_staff table first
        Optional<HousekeepingStaff> housekeepingStaffOpt = housekeepingStaffRepository.findById(staffId);
        
        if (housekeepingStaffOpt.isPresent()) {
            // Staff found in housekeeping_staff table
            HousekeepingStaff staff = housekeepingStaffOpt.get();
            if (!staff.getTenantId().equals(tenantId)) {
                throw new RuntimeException("Staff member not found for tenant");
            }
            
            if (!staff.isAvailableForTask()) {
                throw new RuntimeException("Staff member is not available for assignment");
            }
            
            task.assignToStaff(staff);
            staff.markAsWorking();
            housekeepingStaffRepository.save(staff);
            return housekeepingTaskRepository.save(task);
        } else {
            // Try to find staff in users table
            Optional<User> userOpt = userRepository.findById(staffId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (!user.getTenantId().equals(tenantId)) {
                    throw new RuntimeException("Staff member not found for tenant");
                }
                
                // Check if user has appropriate staff roles
                if (!user.getRoles().contains(UserRole.HOUSEKEEPING) && 
                    !user.getRoles().contains(UserRole.MAINTENANCE) &&
                    !user.getRoles().contains(UserRole.OPERATIONS_SUPERVISOR)) {
                    throw new RuntimeException("User does not have appropriate staff role for task assignment");
                }
                
                // Create a temporary HousekeepingStaff entity for assignment
                HousekeepingStaff tempStaff = createTempStaffFromUser(user);
                task.assignToStaff(tempStaff);
                
                // Save the temporary staff entity so it can be referenced
                tempStaff = housekeepingStaffRepository.save(tempStaff);
                return housekeepingTaskRepository.save(task);
            } else {
                throw new RuntimeException("Staff member not found");
            }
        }
    }

    // Additional required methods for controller compatibility
    public List<HousekeepingTask> getTasksByStatus(String tenantId, HousekeepingTaskStatus status) {
        try {
            return housekeepingTaskRepository.findByTenantIdAndStatus(tenantId, status);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
    
    public Page<HousekeepingStaff> getAllActiveStaff(String tenantId, Pageable pageable) {
        try {
            return housekeepingStaffRepository.findByTenantIdAndIsActive(tenantId, true, pageable);
        } catch (Exception e) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }
    
    // Maintenance methods removed - should be in a separate MaintenanceService
    /*
    public Page<MaintenanceRequest> getAllMaintenanceRequests(String tenantId, Pageable pageable) {
        try {
            return maintenanceRequestRepository.findByTenantId(tenantId, pageable);
        } catch (Exception e) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }
    */
    
    /*
    public MaintenanceRequest createMaintenanceRequest(String tenantId, Long roomId, String title, 
                                                     String description, MaintenanceCategory category, 
                                                     MaintenancePriority priority) {
        try {
            // Get current user as requester - simplified for now
            Room room = roomId != null ? roomRepository.findById(roomId).orElse(null) : null;
            Hotel hotel = room != null ? room.getHotel() : 
                         hotelRepository.findByTenantId(tenantId).stream().findFirst().orElse(null);
            
            MaintenanceRequest request = new MaintenanceRequest(title, description, category, priority, hotel, null, tenantId);
            if (room != null) {
                request.setRoom(room);
            }
            
            return maintenanceRequestRepository.save(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create maintenance request: " + e.getMessage());
        }
    }
    */
    
    public HousekeepingTask createTaskWithoutRoom(String tenantId, HousekeepingTaskType taskType, 
                                                  TaskPriority priority, String description, String specialInstructions) {
        try {
            HousekeepingTask task = new HousekeepingTask();
            task.setTaskType(taskType);
            task.setPriority(priority);
            task.setDescription(description);
            task.setSpecialInstructions(specialInstructions);
            task.setStatus(HousekeepingTaskStatus.PENDING);
            task.setTenantId(tenantId);
            task.setCreatedAt(LocalDateTime.now());
            
            return housekeepingTaskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create task: " + e.getMessage());
        }
    }
    
    public HousekeepingTask createTask(String tenantId, Long roomId, HousekeepingTaskType taskType, 
                                       TaskPriority priority, String description, String specialInstructions) {
        try {
            Room room = roomRepository.findById(roomId).orElse(null);
            HousekeepingTask task = new HousekeepingTask(room, taskType, HousekeepingTaskStatus.PENDING, priority, description, tenantId);
            if (specialInstructions != null) {
                task.setSpecialInstructions(specialInstructions);
            }
            
            return housekeepingTaskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create task: " + e.getMessage());
        }
    }
    
    public List<HousekeepingTask> getTodaysTasksForStaff(Long staffId, String tenantId) {
        try {
            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            return housekeepingTaskRepository.findByAssignedStaffIdAndTenantIdAndCreatedAtBetween(
                staffId, tenantId, startOfDay, endOfDay);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
    
    public Page<HousekeepingTask> getTasksForStaff(String tenantId, Long staffId, Pageable pageable) {
        try {
            return housekeepingTaskRepository.findByTenantIdAndAssignedStaffId(tenantId, staffId, pageable);
        } catch (Exception e) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }
    
    /*
    public MaintenanceRequest assignMaintenanceRequest(Long requestId, Long staffId, String tenantId) {
        try {
            MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));
            
            if (!request.getTenantId().equals(tenantId)) {
                throw new RuntimeException("Request not found for tenant");
            }
            
            HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
            
            request.assignTo(staff);
            return maintenanceRequestRepository.save(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to assign maintenance request: " + e.getMessage());
        }
    }
    */
    
    public HousekeepingTask assignTaskAutomatically(Long taskId, String tenantId) {
        try {
            HousekeepingTask task = getTaskById(taskId, tenantId);
            
            // Find available staff for auto-assignment
            List<HousekeepingStaff> availableStaff = housekeepingStaffRepository
                .findByTenantIdAndIsActive(tenantId, true, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(HousekeepingStaff::isAvailableForTask)
                .collect(Collectors.toList());
            
            if (availableStaff.isEmpty()) {
                throw new RuntimeException("No available staff for automatic assignment");
            }
            
            // Simple assignment to first available staff
            HousekeepingStaff staff = availableStaff.get(0);
            task.assignToStaff(staff);
            staff.markAsWorking();
            
            housekeepingStaffRepository.save(staff);
            return housekeepingTaskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to assign task automatically: " + e.getMessage());
        }
    }

    /**
     * Create a temporary HousekeepingStaff entity from a User for task assignment
     */
    private HousekeepingStaff createTempStaffFromUser(User user) {
        HousekeepingStaff tempStaff = new HousekeepingStaff();
        
        // Copy basic information
        tempStaff.setFirstName(user.getFirstName());
        tempStaff.setLastName(user.getLastName());
        tempStaff.setEmail(user.getEmail());
        tempStaff.setPhone(user.getPhone());
        tempStaff.setTenantId(user.getTenantId());
        tempStaff.setIsActive(user.getIsActive());
        
        // Set default housekeeping role based on user role
        if (user.getRoles().contains(UserRole.HOUSEKEEPING)) {
            tempStaff.setRole(HousekeepingRole.HOUSEKEEPER);
        } else if (user.getRoles().contains(UserRole.MAINTENANCE)) {
            tempStaff.setRole(HousekeepingRole.MAINTENANCE_WORKER);
        } else if (user.getRoles().contains(UserRole.OPERATIONS_SUPERVISOR)) {
            tempStaff.setRole(HousekeepingRole.SUPERVISOR);
        } else {
            tempStaff.setRole(HousekeepingRole.HOUSEKEEPER); // Default
        }
        
        // Set default values for required fields
        tempStaff.setEmployeeId("USER_" + user.getId());
        tempStaff.setHireDate(LocalDateTime.now());
        tempStaff.setShift(WorkShift.MORNING); // Default shift
        tempStaff.setStatus(StaffStatus.ACTIVE);
        tempStaff.setHourlyRate(0.0); // Default rate
        tempStaff.setPerformanceRating(5.0); // Default rating
        tempStaff.setTasksCompletedToday(0);
        tempStaff.setAverageTaskDuration(60.0); // Default 60 minutes
        tempStaff.setQualityScoreAverage(5.0); // Default quality score
        
        return tempStaff;
    }

    private HousekeepingTask getTaskById(Long taskId, String tenantId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for tenant");
        }
        
        return task;
    }

    /**
     * Find housekeeping staff by user ID
     */
    public Optional<HousekeepingStaff> findStaffByUserId(Long userId) {
        return housekeepingStaffRepository.findByUserId(userId);
    }

    /**
     * Update task status
     */
    public void updateTaskStatus(Long taskId, String status, String notes) {
        Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            HousekeepingTask task = taskOpt.get();
            
            // Convert string status to enum
            HousekeepingTaskStatus taskStatus;
            try {
                taskStatus = HousekeepingTaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + status);
            }
            
            task.setStatus(taskStatus);
            if (notes != null && !notes.trim().isEmpty()) {
                task.setInspectorNotes(notes); // Use inspectorNotes instead of notes
            }
            
            if (taskStatus == HousekeepingTaskStatus.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
            }
            
            housekeepingTaskRepository.save(task);
        } else {
            throw new RuntimeException("Task not found");
        }
    }
}