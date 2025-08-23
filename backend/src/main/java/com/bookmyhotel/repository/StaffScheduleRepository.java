package com.bookmyhotel.repository;

import com.bookmyhotel.entity.StaffSchedule;
import com.bookmyhotel.entity.StaffSchedule.Department;
import com.bookmyhotel.entity.StaffSchedule.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for StaffSchedule entity
 */
@Repository
public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {

    /**
     * Find schedules by hotel and date range
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "AND s.scheduleDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.scheduleDate ASC, s.startTime ASC")
    List<StaffSchedule> findByHotelAndDateRange(@Param("hotelId") Long hotelId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * Find schedules by staff member and date range
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.staff.id = :staffId " +
           "AND s.scheduleDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.scheduleDate ASC, s.startTime ASC")
    List<StaffSchedule> findByStaffAndDateRange(@Param("staffId") Long staffId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * Find schedules by department and date range
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "AND s.department = :department " +
           "AND s.scheduleDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.scheduleDate ASC, s.startTime ASC")
    List<StaffSchedule> findByHotelAndDepartmentAndDateRange(@Param("hotelId") Long hotelId,
                                                            @Param("department") Department department,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    /**
     * Find schedules by date
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "AND s.scheduleDate = :date " +
           "ORDER BY s.startTime ASC")
    List<StaffSchedule> findByHotelAndDate(@Param("hotelId") Long hotelId,
                                          @Param("date") LocalDate date);

    /**
     * Find schedules by staff member and date
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.staff.id = :staffId " +
           "AND s.scheduleDate = :date")
    List<StaffSchedule> findByStaffAndDate(@Param("staffId") Long staffId,
                                          @Param("date") LocalDate date);

    /**
     * Check for schedule conflicts
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.staff.id = :staffId " +
           "AND s.scheduleDate = :date " +
           "AND s.id != :excludeId " +
           "AND s.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((s.startTime <= :startTime AND s.endTime > :startTime) " +
           "OR (s.startTime < :endTime AND s.endTime >= :endTime) " +
           "OR (s.startTime >= :startTime AND s.endTime <= :endTime))")
    List<StaffSchedule> findConflictingSchedules(@Param("staffId") Long staffId,
                                                @Param("date") LocalDate date,
                                                @Param("startTime") java.time.LocalTime startTime,
                                                @Param("endTime") java.time.LocalTime endTime,
                                                @Param("excludeId") Long excludeId);

    /**
     * Find all schedules with pagination
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "ORDER BY s.scheduleDate DESC, s.startTime ASC")
    Page<StaffSchedule> findByHotelWithPagination(@Param("hotelId") Long hotelId, Pageable pageable);

    /**
     * Find schedules by status
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "AND s.status = :status " +
           "ORDER BY s.scheduleDate ASC, s.startTime ASC")
    List<StaffSchedule> findByHotelAndStatus(@Param("hotelId") Long hotelId,
                                            @Param("status") ScheduleStatus status);

    /**
     * Find upcoming schedules for a staff member
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.staff.id = :staffId " +
           "AND s.scheduleDate >= :currentDate " +
           "AND s.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "ORDER BY s.scheduleDate ASC, s.startTime ASC")
    List<StaffSchedule> findUpcomingSchedulesByStaff(@Param("staffId") Long staffId,
                                                     @Param("currentDate") LocalDate currentDate);

    /**
     * Count schedules by department for a date range
     */
    @Query("SELECT s.department, COUNT(s) FROM StaffSchedule s " +
           "WHERE s.hotel.id = :hotelId " +
           "AND s.scheduleDate BETWEEN :startDate AND :endDate " +
           "AND s.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "GROUP BY s.department")
    List<Object[]> countSchedulesByDepartment(@Param("hotelId") Long hotelId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    /**
     * Find schedule by ID and hotel (for security)
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.id = :id AND s.hotel.id = :hotelId")
    Optional<StaffSchedule> findByIdAndHotel(@Param("id") Long id, @Param("hotelId") Long hotelId);

    /**
     * Find all schedules by hotel ID ordered by date and time
     */
    @Query("SELECT s FROM StaffSchedule s WHERE s.hotel.id = :hotelId " +
           "ORDER BY s.scheduleDate DESC, s.startTime ASC")
    List<StaffSchedule> findByHotelIdOrderByScheduleDateDescStartTimeAsc(@Param("hotelId") Long hotelId);

    /**
     * Find all schedules ordered by date and time (for system admins)
     */
    @Query("SELECT s FROM StaffSchedule s ORDER BY s.scheduleDate DESC, s.startTime ASC")
    List<StaffSchedule> findAllByOrderByScheduleDateDescStartTimeAsc();
}
