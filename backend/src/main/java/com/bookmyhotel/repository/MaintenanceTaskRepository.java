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

        // Find by hotel
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdOrderByCreatedAtDesc(@Param("hotelId") Long hotelId);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId")
        List<MaintenanceTask> findByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId")
        Page<MaintenanceTask> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

        // Find by hotel and status
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.status = :status")
        List<MaintenanceTask> findByHotelIdAndStatus(@Param("hotelId") Long hotelId,
                        @Param("status") TaskStatus status);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.status = :status ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndStatusOrderByCreatedAtDesc(@Param("hotelId") Long hotelId,
                        @Param("status") TaskStatus status);

        // Find by assigned staff member
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo = :assignedTo")
        List<MaintenanceTask> findByHotelIdAndAssignedTo(@Param("hotelId") Long hotelId,
                        @Param("assignedTo") HousekeepingStaff assignedTo);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo = :assignedTo ORDER BY m.scheduledStartTime ASC")
        List<MaintenanceTask> findByHotelIdAndAssignedToOrderByScheduledStartTimeAsc(
                        @Param("hotelId") Long hotelId, @Param("assignedTo") HousekeepingStaff assignedTo);

        // Find by assigned staff member email
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo.email = :assignedToEmail ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndAssignedTo_EmailOrderByCreatedAtDesc(
                        @Param("hotelId") Long hotelId, @Param("assignedToEmail") String assignedToEmail);

        // Find by assigned staff member and status
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo = :assignedTo AND m.status = :status ORDER BY m.scheduledStartTime ASC")
        List<MaintenanceTask> findByHotelIdAndAssignedToAndStatusOrderByScheduledStartTimeAsc(
                        @Param("hotelId") Long hotelId, @Param("assignedTo") HousekeepingStaff assignedTo,
                        @Param("status") TaskStatus status);

        // Find by priority
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.priority = :priority")
        List<MaintenanceTask> findByHotelIdAndPriority(@Param("hotelId") Long hotelId,
                        @Param("priority") TaskPriority priority);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.priority = :priority ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndPriorityOrderByCreatedAtDesc(
                        @Param("hotelId") Long hotelId, @Param("priority") TaskPriority priority);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.priority = :priority ORDER BY m.createdAt ASC")
        List<MaintenanceTask> findByHotelIdAndPriorityOrderByCreatedAtAsc(
                        @Param("hotelId") Long hotelId, @Param("priority") TaskPriority priority);

        // Find by task type
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.taskType = :taskType")
        List<MaintenanceTask> findByHotelIdAndTaskType(@Param("hotelId") Long hotelId,
                        @Param("taskType") String taskType);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.taskType = :taskType ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndTaskTypeOrderByCreatedAtDesc(
                        @Param("hotelId") Long hotelId, @Param("taskType") String taskType);

        // Find by equipment type
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.equipmentType = :equipmentType")
        List<MaintenanceTask> findByHotelIdAndEquipmentType(@Param("hotelId") Long hotelId,
                        @Param("equipmentType") String equipmentType);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.equipmentType = :equipmentType ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndEquipmentTypeOrderByCreatedAtDesc(
                        @Param("hotelId") Long hotelId, @Param("equipmentType") String equipmentType);

        // Find by room
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.room = :room")
        List<MaintenanceTask> findByHotelIdAndRoom(@Param("hotelId") Long hotelId, @Param("room") Room room);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.room.id = :roomId ORDER BY m.createdAt DESC")
        List<MaintenanceTask> findByHotelIdAndRoomIdOrderByCreatedAtDesc(
                        @Param("hotelId") Long hotelId, @Param("roomId") Long roomId);

        // Find unassigned tasks
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo IS NULL")
        List<MaintenanceTask> findByHotelIdAndAssignedToIsNull(@Param("hotelId") Long hotelId);

        // Find by date range
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.createdAt BETWEEN :start AND :end")
        List<MaintenanceTask> findByHotelIdAndCreatedAtBetween(@Param("hotelId") Long hotelId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Find emergency tasks (urgent/critical priority)
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId " +
                        "AND m.priority IN ('URGENT', 'CRITICAL') " +
                        "AND m.status NOT IN ('COMPLETED', 'VERIFIED', 'CANCELLED') " +
                        "ORDER BY m.priority DESC, m.createdAt ASC")
        List<MaintenanceTask> findEmergencyTasks(@Param("hotelId") Long hotelId);

        // Find overdue tasks
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId " +
                        "AND m.scheduledStartTime < :currentTime " +
                        "AND m.status NOT IN ('COMPLETED', 'VERIFIED', 'CANCELLED')")
        List<MaintenanceTask> findOverdueTasks(@Param("hotelId") Long hotelId,
                        @Param("currentTime") LocalDateTime currentTime);

        // Find tasks scheduled for today
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId " +
                        "AND DATE(m.scheduledStartTime) = DATE(:date)")
        List<MaintenanceTask> findTasksScheduledForDate(@Param("hotelId") Long hotelId,
                        @Param("date") LocalDateTime date);

        // Find tasks requiring follow-up
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId " +
                        "AND m.followUpRequired = true " +
                        "AND m.followUpDate <= :currentTime " +
                        "ORDER BY m.followUpDate ASC")
        List<MaintenanceTask> findTasksRequiringFollowUp(@Param("hotelId") Long hotelId,
                        @Param("currentTime") LocalDateTime currentTime);

        // Count methods
        @Query("SELECT COUNT(m) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.status = :status")
        Long countByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") TaskStatus status);

        @Query("SELECT COUNT(m) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.priority = :priority")
        Long countByHotelIdAndPriority(@Param("hotelId") Long hotelId, @Param("priority") TaskPriority priority);

        @Query("SELECT COUNT(m) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.createdAt BETWEEN :start AND :end")
        Long countByHotelIdAndCreatedAtBetween(@Param("hotelId") Long hotelId, @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // For completed tasks in date range - use actualEndTime instead of non-existent
        // completedAt
        @Query("SELECT COUNT(m) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId " +
                        "AND m.status = :status " +
                        "AND m.actualEndTime BETWEEN :start AND :end")
        Long countByHotelIdAndStatusAndActualEndTimeBetween(@Param("hotelId") Long hotelId,
                        @Param("status") TaskStatus status,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Statistics methods
        @Query("SELECT AVG(m.actualDurationMinutes) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.taskType = :taskType AND m.actualDurationMinutes IS NOT NULL")
        Double findAverageDurationByCategory(@Param("hotelId") Long hotelId, @Param("taskType") String taskType);

        @Query("SELECT m.taskType, COUNT(m) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId GROUP BY m.taskType ORDER BY COUNT(m) DESC")
        List<Object[]> findMostCommonCategories(@Param("hotelId") Long hotelId);

        @Query("SELECT m.assignedTo, COUNT(m), AVG(m.actualDurationMinutes) FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.createdAt BETWEEN :start AND :end GROUP BY m.assignedTo")
        List<Object[]> findStaffWorkloadStats(@Param("hotelId") Long hotelId, @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Paginated queries
        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId ORDER BY m.createdAt DESC")
        Page<MaintenanceTask> findByHotelIdOrderByCreatedAtDesc(@Param("hotelId") Long hotelId, Pageable pageable);

        @Query("SELECT m FROM MaintenanceTask m WHERE m.hotel.id = :hotelId AND m.assignedTo = :assignedTo ORDER BY m.scheduledStartTime ASC")
        Page<MaintenanceTask> findByHotelIdAndAssignedToOrderByScheduledStartTimeAsc(
                        @Param("hotelId") Long hotelId, @Param("assignedTo") User assignedTo, Pageable pageable);
}
