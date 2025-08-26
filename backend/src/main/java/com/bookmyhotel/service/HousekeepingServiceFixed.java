package com.bookmyhotel.service;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.enums.*;
import com.bookmyhotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing housekeeping operations
 */
@Service
@Transactional
public class HousekeepingServiceFixed {
    
    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;
    
    @Autowired
    private HousekeepingStaffRepository housekeepingStaffRepository;
    
    @Autowired
    private UserRepository userRepository;

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
}
