package com.bookmyhotel.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.TaskPriority;

/**
 * Repository interface for HousekeepingTask entity operations
 */
@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    
    // Basic queries by tenant
    List<HousekeepingTask> findByTenantId(String tenantId);
    Page<HousekeepingTask> findByTenantId(String tenantId, Pageable pageable);
    
    // Status-based queries
    List<HousekeepingTask> findByTenantIdAndStatus(String tenantId, HousekeepingTaskStatus status);
    Page<HousekeepingTask> findByTenantIdAndStatus(String tenantId, HousekeepingTaskStatus status, Pageable pageable);
    
    // Staff assignment queries
    List<HousekeepingTask> findByTenantIdAndAssignedStaff(String tenantId, HousekeepingStaff staff);
    List<HousekeepingTask> findByTenantIdAndAssignedStaffAndStatus(String tenantId, HousekeepingStaff staff, HousekeepingTaskStatus status);
    Page<HousekeepingTask> findByTenantIdAndAssignedStaff(String tenantId, HousekeepingStaff staff, Pageable pageable);
    Page<HousekeepingTask> findByTenantIdAndAssignedStaffId(String tenantId, Long staffId, Pageable pageable);
    List<HousekeepingTask> findByAssignedStaffIdAndTenantIdAndCreatedAtBetween(Long staffId, String tenantId, LocalDateTime start, LocalDateTime end);
    List<HousekeepingTask> findByTenantIdAndAssignedStaffAndCreatedAtBetween(String tenantId, HousekeepingStaff staff, LocalDateTime start, LocalDateTime end);
    
    // Staff-specific queries (for staff view)
    Page<HousekeepingTask> findByAssignedStaffId(Long staffId, Pageable pageable);
    long countByAssignedStaffId(Long staffId);
    long countByAssignedStaffIdAndStatus(Long staffId, HousekeepingTaskStatus status);
    
    // Room-based queries
    List<HousekeepingTask> findByTenantIdAndRoom(String tenantId, Room room);
    List<HousekeepingTask> findByTenantIdAndRoomAndStatus(String tenantId, Room room, HousekeepingTaskStatus status);
    
    // Task type queries
    List<HousekeepingTask> findByTenantIdAndTaskType(String tenantId, HousekeepingTaskType taskType);
    
    // Priority queries
    List<HousekeepingTask> findByTenantIdAndPriority(String tenantId, TaskPriority priority);
    List<HousekeepingTask> findByTenantIdAndPriorityIn(String tenantId, List<TaskPriority> priorities);
    
    // Date-based queries
    List<HousekeepingTask> findByTenantIdAndCreatedAtBetween(String tenantId, LocalDateTime start, LocalDateTime end);
    List<HousekeepingTask> findByTenantIdAndAssignedAtBetween(String tenantId, LocalDateTime start, LocalDateTime end);
    List<HousekeepingTask> findByTenantIdAndCompletedAtBetween(String tenantId, LocalDateTime start, LocalDateTime end);
    
    // Unassigned tasks
    List<HousekeepingTask> findByTenantIdAndAssignedStaffIsNull(String tenantId);
    Page<HousekeepingTask> findByTenantIdAndAssignedStaffIsNull(String tenantId, Pageable pageable);
    
    // Overdue tasks
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.status IN (:statuses) AND h.createdAt < :cutoffTime")
    List<HousekeepingTask> findOverdueTasks(@Param("tenantId") String tenantId, 
                                           @Param("statuses") List<HousekeepingTaskStatus> statuses,
                                           @Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Tasks requiring inspection
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.status = 'PENDING_INSPECTION'")
    List<HousekeepingTask> findTasksPendingInspection(@Param("tenantId") String tenantId);
    
    // Tasks by quality score
    List<HousekeepingTask> findByTenantIdAndQualityScoreIsNotNull(String tenantId);
    List<HousekeepingTask> findByTenantIdAndQualityScoreLessThan(String tenantId, Integer qualityScore);
    
    // Statistics queries
    @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") HousekeepingTaskStatus status);
    
    @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.assignedStaff = :staff AND h.status = :status")
    long countByTenantIdAndAssignedStaffAndStatus(@Param("tenantId") String tenantId, 
                                                 @Param("staff") HousekeepingStaff staff,
                                                 @Param("status") HousekeepingTaskStatus status);
    
    @Query("SELECT AVG(h.qualityScore) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.qualityScore IS NOT NULL")
    Optional<Double> findAverageQualityScoreByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT AVG(h.actualDurationMinutes) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.actualDurationMinutes IS NOT NULL AND h.taskType = :taskType")
    Optional<Double> findAverageDurationByTenantIdAndTaskType(@Param("tenantId") String tenantId, @Param("taskType") HousekeepingTaskType taskType);
    
    // Active tasks for staff
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.assignedStaff = :staff AND h.status IN ('ASSIGNED', 'IN_PROGRESS')")
    List<HousekeepingTask> findActiveTasksByStaff(@Param("tenantId") String tenantId, @Param("staff") HousekeepingStaff staff);
    
    // Tasks by room and date range
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.room = :room AND h.createdAt BETWEEN :start AND :end ORDER BY h.createdAt DESC")
    List<HousekeepingTask> findByRoomAndDateRange(@Param("tenantId") String tenantId, 
                                                 @Param("room") Room room,
                                                 @Param("start") LocalDateTime start, 
                                                 @Param("end") LocalDateTime end);
    
    // High priority pending tasks
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.priority IN ('HIGH', 'URGENT', 'CRITICAL') AND h.status IN ('PENDING', 'ASSIGNED') ORDER BY h.priority DESC, h.createdAt ASC")
    List<HousekeepingTask> findHighPriorityPendingTasks(@Param("tenantId") String tenantId);
    
    // Tasks requiring follow-up
    @Query("SELECT h FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.status IN ('REJECTED', 'QUALITY_ISSUE', 'GUEST_COMPLAINT') ORDER BY h.priority DESC, h.createdAt ASC")
    List<HousekeepingTask> findTasksRequiringFollowUp(@Param("tenantId") String tenantId);
    
    // Performance metrics
    @Query("SELECT h.assignedStaff, AVG(h.qualityScore), COUNT(h) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND h.qualityScore IS NOT NULL AND h.completedAt BETWEEN :start AND :end GROUP BY h.assignedStaff")
    List<Object[]> findStaffPerformanceMetrics(@Param("tenantId") String tenantId, 
                                              @Param("start") LocalDateTime start, 
                                              @Param("end") LocalDateTime end);
    
    // Daily task summary
    @Query("SELECT h.taskType, h.status, COUNT(h) FROM HousekeepingTask h WHERE h.tenantId = :tenantId AND DATE(h.createdAt) = DATE(:date) GROUP BY h.taskType, h.status")
    List<Object[]> findDailyTaskSummary(@Param("tenantId") String tenantId, @Param("date") LocalDateTime date);
}
