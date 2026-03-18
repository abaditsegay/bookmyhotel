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

import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.User;

/**
 * Repository interface for HousekeepingTask entity operations
 */
@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {

        // Basic queries by hotel
        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.hotel.id = :hotelId")
        List<HousekeepingTask> findByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.hotel.id = :hotelId")
        Page<HousekeepingTask> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

        // Find by ID with eager loading (to avoid lazy loading issues)
        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.id = :id")
        Optional<HousekeepingTask> findByIdWithUserAndHotel(@Param("id") Long id);

        // Status-based queries
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status = :status")
        List<HousekeepingTask> findByHotelIdAndStatus(@Param("hotelId") Long hotelId,
                        @Param("status") HousekeepingTaskStatus status);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status = :status")
        Page<HousekeepingTask> findByHotelIdAndStatus(@Param("hotelId") Long hotelId,
                        @Param("status") HousekeepingTaskStatus status, Pageable pageable);

        // Staff assignment queries
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser = :user")
        List<HousekeepingTask> findByHotelIdAndAssignedUser(@Param("hotelId") Long hotelId,
                        @Param("user") User user);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser = :user AND h.status = :status")
        List<HousekeepingTask> findByHotelIdAndAssignedUserAndStatus(@Param("hotelId") Long hotelId,
                        @Param("user") User user, @Param("status") HousekeepingTaskStatus status);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser = :user")
        Page<HousekeepingTask> findByHotelIdAndAssignedUser(@Param("hotelId") Long hotelId,
                        @Param("user") User user, Pageable pageable);

        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.hotel.id = :hotelId AND h.assignedUser.id = :userId")
        Page<HousekeepingTask> findByHotelIdAndAssignedUserId(@Param("hotelId") Long hotelId,
                        @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.assignedUser.id = :userId AND h.hotel.id = :hotelId AND h.createdAt BETWEEN :start AND :end")
        List<HousekeepingTask> findByAssignedUserIdAndHotelIdAndCreatedAtBetween(@Param("userId") Long userId,
                        @Param("hotelId") Long hotelId, @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.hotel.id = :hotelId AND h.assignedUser = :user AND h.createdAt BETWEEN :start AND :end")
        List<HousekeepingTask> findByHotelIdAndAssignedUserAndCreatedAtBetween(@Param("hotelId") Long hotelId,
                        @Param("user") User user, @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // User-specific queries (for staff view)
        @Query("SELECT h FROM HousekeepingTask h LEFT JOIN FETCH h.assignedUser LEFT JOIN FETCH h.hotel WHERE h.assignedUser.id = :userId")
        Page<HousekeepingTask> findByAssignedUserId(@Param("userId") Long userId, Pageable pageable);

        @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.assignedUser.id = :userId")
        long countByAssignedUserId(@Param("userId") Long userId);

        @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.assignedUser.id = :userId AND h.status = :status")
        long countByAssignedUserIdAndStatus(@Param("userId") Long userId,
                        @Param("status") HousekeepingTaskStatus status);

        // Room number-based queries (using string field)
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.roomNumber = :roomNumber")
        List<HousekeepingTask> findByHotelIdAndRoomNumber(@Param("hotelId") Long hotelId,
                        @Param("roomNumber") String roomNumber);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.roomNumber = :roomNumber AND h.status = :status")
        List<HousekeepingTask> findByHotelIdAndRoomNumberAndStatus(@Param("hotelId") Long hotelId,
                        @Param("roomNumber") String roomNumber,
                        @Param("status") HousekeepingTaskStatus status);

        // Task type queries
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.taskType = :taskType")
        List<HousekeepingTask> findByHotelIdAndTaskType(@Param("hotelId") Long hotelId,
                        @Param("taskType") HousekeepingTaskType taskType);

        // Priority queries
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.priority = :priority")
        List<HousekeepingTask> findByHotelIdAndPriority(@Param("hotelId") Long hotelId,
                        @Param("priority") TaskPriority priority);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.priority IN :priorities")
        List<HousekeepingTask> findByHotelIdAndPriorityIn(@Param("hotelId") Long hotelId,
                        @Param("priorities") List<TaskPriority> priorities);

        // Date-based queries
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.createdAt BETWEEN :start AND :end")
        List<HousekeepingTask> findByHotelIdAndCreatedAtBetween(@Param("hotelId") Long hotelId,
                        @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedAt BETWEEN :start AND :end")
        List<HousekeepingTask> findByHotelIdAndAssignedAtBetween(@Param("hotelId") Long hotelId,
                        @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.completedAt BETWEEN :start AND :end")
        List<HousekeepingTask> findByHotelIdAndCompletedAtBetween(@Param("hotelId") Long hotelId,
                        @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // Unassigned tasks
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser IS NULL")
        List<HousekeepingTask> findByHotelIdAndAssignedUserIsNull(@Param("hotelId") Long hotelId);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser IS NULL")
        Page<HousekeepingTask> findByHotelIdAndAssignedUserIsNull(@Param("hotelId") Long hotelId, Pageable pageable);

        // Overdue tasks
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status IN (:statuses) AND h.createdAt < :cutoffTime")
        List<HousekeepingTask> findOverdueTasks(@Param("hotelId") Long hotelId,
                        @Param("statuses") List<HousekeepingTaskStatus> statuses,
                        @Param("cutoffTime") LocalDateTime cutoffTime);

        // Tasks requiring inspection
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status = 'PENDING_INSPECTION'")
        List<HousekeepingTask> findTasksPendingInspection(@Param("hotelId") Long hotelId);

        // Tasks by quality score
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.qualityScore IS NOT NULL")
        List<HousekeepingTask> findByHotelIdAndQualityScoreIsNotNull(@Param("hotelId") Long hotelId);

        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.qualityScore < :qualityScore")
        List<HousekeepingTask> findByHotelIdAndQualityScoreLessThan(@Param("hotelId") Long hotelId,
                        @Param("qualityScore") Integer qualityScore);

        // Statistics queries
        @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status = :status")
        long countByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") HousekeepingTaskStatus status);

        @Query("SELECT COUNT(h) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser = :user AND h.status = :status")
        long countByHotelIdAndAssignedUserAndStatus(@Param("hotelId") Long hotelId,
                        @Param("user") User user,
                        @Param("status") HousekeepingTaskStatus status);

        @Query("SELECT AVG(h.qualityScore) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.qualityScore IS NOT NULL")
        Optional<Double> findAverageQualityScoreByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT AVG(h.actualDurationMinutes) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.actualDurationMinutes IS NOT NULL AND h.taskType = :taskType")
        Optional<Double> findAverageDurationByHotelIdAndTaskType(@Param("hotelId") Long hotelId,
                        @Param("taskType") HousekeepingTaskType taskType);

        // Active tasks for user
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.assignedUser = :user AND h.status IN ('ASSIGNED', 'IN_PROGRESS')")
        List<HousekeepingTask> findActiveTasksByUser(@Param("hotelId") Long hotelId,
                        @Param("user") User user);

        // Tasks by room number and date range
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.roomNumber = :roomNumber AND h.createdAt BETWEEN :start AND :end ORDER BY h.createdAt DESC")
        List<HousekeepingTask> findByRoomNumberAndDateRange(@Param("hotelId") Long hotelId,
                        @Param("roomNumber") String roomNumber,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // High priority pending tasks
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.priority IN ('HIGH', 'URGENT', 'CRITICAL') AND h.status IN ('PENDING', 'ASSIGNED') ORDER BY h.priority DESC, h.createdAt ASC")
        List<HousekeepingTask> findHighPriorityPendingTasks(@Param("hotelId") Long hotelId);

        // Tasks requiring follow-up
        @Query("SELECT h FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.status IN ('REJECTED', 'QUALITY_ISSUE', 'GUEST_COMPLAINT') ORDER BY h.priority DESC, h.createdAt ASC")
        List<HousekeepingTask> findTasksRequiringFollowUp(@Param("hotelId") Long hotelId);

        // Performance metrics
        @Query("SELECT h.assignedUser, AVG(h.qualityScore), COUNT(h) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND h.qualityScore IS NOT NULL AND h.completedAt BETWEEN :start AND :end GROUP BY h.assignedUser")
        List<Object[]> findUserPerformanceMetrics(@Param("hotelId") Long hotelId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Daily task summary
        @Query("SELECT h.taskType, h.status, COUNT(h) FROM HousekeepingTask h WHERE h.hotel.id = :hotelId AND DATE(h.createdAt) = DATE(:date) GROUP BY h.taskType, h.status")
        List<Object[]> findDailyTaskSummary(@Param("hotelId") Long hotelId, @Param("date") LocalDateTime date);
}
