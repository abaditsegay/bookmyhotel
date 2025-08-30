package com.bookmyhotel.repository;

import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.entity.TaskStatus;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {

        // Find by tenant
        List<MaintenanceTask> findByTenantIdOrderByCreatedAtDesc(String tenantId);

        List<MaintenanceTask> findByTenantId(String tenantId);

        Page<MaintenanceTask> findByTenantId(String tenantId, Pageable pageable);

        // Find by tenant and hotel
        List<MaintenanceTask> findByTenantIdAndHotelIdOrderByCreatedAtDesc(String tenantId, Long hotelId);

        // Find by tenant and status
        List<MaintenanceTask> findByTenantIdAndStatus(String tenantId, TaskStatus status);

        List<MaintenanceTask> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, TaskStatus status);

        // Find by tenant, hotel and status
        List<MaintenanceTask> findByTenantIdAndHotelIdAndStatusOrderByCreatedAtDesc(
                        String tenantId, Long hotelId, TaskStatus status);

        // Find by assigned staff member
        List<MaintenanceTask> findByTenantIdAndAssignedTo(String tenantId, HousekeepingStaff assignedTo);

        List<MaintenanceTask> findByTenantIdAndAssignedToOrderByScheduledStartTimeAsc(
                        String tenantId, HousekeepingStaff assignedTo);

        // Find by assigned staff member email
        List<MaintenanceTask> findByTenantIdAndAssignedTo_EmailOrderByCreatedAtDesc(
                        String tenantId, String assignedToEmail);

        // Find by assigned staff member and status
        List<MaintenanceTask> findByTenantIdAndAssignedToAndStatusOrderByScheduledStartTimeAsc(
                        String tenantId, HousekeepingStaff assignedTo, TaskStatus status);

        // Find by priority
        List<MaintenanceTask> findByTenantIdAndPriority(String tenantId, TaskPriority priority);

        List<MaintenanceTask> findByTenantIdAndPriorityOrderByCreatedAtDesc(
                        String tenantId, TaskPriority priority);

        List<MaintenanceTask> findByTenantIdAndPriorityOrderByCreatedAtAsc(
                        String tenantId, TaskPriority priority);

        // Find by task type
        List<MaintenanceTask> findByTenantIdAndTaskType(String tenantId, String taskType);

        List<MaintenanceTask> findByTenantIdAndTaskTypeOrderByCreatedAtDesc(
                        String tenantId, String taskType);

        // Find by equipment type
        List<MaintenanceTask> findByTenantIdAndEquipmentType(String tenantId, String equipmentType);

        List<MaintenanceTask> findByTenantIdAndEquipmentTypeOrderByCreatedAtDesc(
                        String tenantId, String equipmentType);

        // Find by room
        List<MaintenanceTask> findByTenantIdAndRoom(String tenantId, Room room);

        List<MaintenanceTask> findByTenantIdAndRoomIdOrderByCreatedAtDesc(
                        String tenantId, Long roomId);

        // Find unassigned tasks
        List<MaintenanceTask> findByTenantIdAndAssignedToIsNull(String tenantId);

        // Find by date range
        List<MaintenanceTask> findByTenantIdAndCreatedAtBetween(String tenantId, LocalDateTime start,
                        LocalDateTime end);

        // Find emergency tasks (urgent/critical priority)
        @Query("SELECT m FROM MaintenanceTask m WHERE m.tenantId = :tenantId " +
                        "AND m.priority IN ('URGENT', 'CRITICAL') " +
                        "AND m.status NOT IN ('COMPLETED', 'VERIFIED', 'CANCELLED') " +
                        "ORDER BY m.priority DESC, m.createdAt ASC")
        List<MaintenanceTask> findEmergencyTasks(@Param("tenantId") String tenantId);

        // Find overdue tasks
        @Query("SELECT m FROM MaintenanceTask m WHERE m.tenantId = :tenantId " +
                        "AND m.scheduledStartTime < :currentTime " +
                        "AND m.status NOT IN ('COMPLETED', 'VERIFIED', 'CANCELLED')")
        List<MaintenanceTask> findOverdueTasks(@Param("tenantId") String tenantId,
                        @Param("currentTime") LocalDateTime currentTime);

        // Find tasks scheduled for today
        @Query("SELECT m FROM MaintenanceTask m WHERE m.tenantId = :tenantId " +
                        "AND DATE(m.scheduledStartTime) = DATE(:date)")
        List<MaintenanceTask> findTasksScheduledForDate(@Param("tenantId") String tenantId,
                        @Param("date") LocalDateTime date);

        // Find tasks requiring follow-up
        @Query("SELECT m FROM MaintenanceTask m WHERE m.tenantId = :tenantId " +
                        "AND m.followUpRequired = true " +
                        "AND m.followUpDate <= :currentTime " +
                        "ORDER BY m.followUpDate ASC")
        List<MaintenanceTask> findTasksRequiringFollowUp(@Param("tenantId") String tenantId,
                        @Param("currentTime") LocalDateTime currentTime);

        // Count methods
        Long countByTenantIdAndStatus(String tenantId, TaskStatus status);

        Long countByTenantIdAndPriority(String tenantId, TaskPriority priority);

        Long countByTenantIdAndCreatedAtBetween(String tenantId, LocalDateTime start, LocalDateTime end);

        // For completed tasks in date range - use actualEndTime instead of non-existent
        // completedAt
        @Query("SELECT COUNT(m) FROM MaintenanceTask m WHERE m.tenantId = :tenantId " +
                        "AND m.status = :status " +
                        "AND m.actualEndTime BETWEEN :start AND :end")
        Long countByTenantIdAndStatusAndActualEndTimeBetween(@Param("tenantId") String tenantId,
                        @Param("status") TaskStatus status,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Statistics methods
        @Query("SELECT AVG(m.actualDurationMinutes) FROM MaintenanceTask m WHERE m.tenantId = :tenantId AND m.taskType = :taskType AND m.actualDurationMinutes IS NOT NULL")
        Double findAverageDurationByCategory(@Param("tenantId") String tenantId, @Param("taskType") String taskType);

        @Query("SELECT m.taskType, COUNT(m) FROM MaintenanceTask m WHERE m.tenantId = :tenantId GROUP BY m.taskType ORDER BY COUNT(m) DESC")
        List<Object[]> findMostCommonCategories(@Param("tenantId") String tenantId);

        @Query("SELECT m.assignedTo, COUNT(m), AVG(m.actualDurationMinutes) FROM MaintenanceTask m WHERE m.tenantId = :tenantId AND m.createdAt BETWEEN :start AND :end GROUP BY m.assignedTo")
        List<Object[]> findStaffWorkloadStats(@Param("tenantId") String tenantId, @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Paginated queries
        Page<MaintenanceTask> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

        Page<MaintenanceTask> findByTenantIdAndHotelIdOrderByCreatedAtDesc(
                        String tenantId, Long hotelId, Pageable pageable);

        Page<MaintenanceTask> findByTenantIdAndAssignedToOrderByScheduledStartTimeAsc(
                        String tenantId, User assignedTo, Pageable pageable);
}
