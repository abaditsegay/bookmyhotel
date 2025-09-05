package com.bookmyhotel.repository;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.Hotel;
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
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Find todos by creator and hotel
    List<Todo> findByCreatedByAndHotelOrderByCreatedAtDesc(User createdBy, Hotel hotel);
    
    Page<Todo> findByCreatedByAndHotel(User createdBy, Hotel hotel, Pageable pageable);
    
    // Find todos by severity
    List<Todo> findByCreatedByAndHotelAndSeverityOrderByCreatedAtDesc(User createdBy, Hotel hotel, Todo.Severity severity);
    
    // Find overdue todos
    @Query("SELECT t FROM Todo t WHERE t.createdBy = :user AND t.hotel = :hotel AND t.dueDate <= :dueDate")
    List<Todo> findOverdueTodos(@Param("user") User user, @Param("hotel") Hotel hotel, @Param("dueDate") LocalDateTime dueDate);
    
    // Find by ID and creator/hotel for security
    Optional<Todo> findByIdAndCreatedByAndHotel(Long id, User createdBy, Hotel hotel);
    
    // Delete by ID and creator/hotel for security
    void deleteByIdAndCreatedByAndHotel(Long id, User createdBy, Hotel hotel);
    
    // Count todos by severity
    @Query("SELECT COUNT(t) FROM Todo t WHERE t.createdBy = :user AND t.hotel = :hotel AND t.severity = :severity")
    long countBySeverity(@Param("user") User user, @Param("hotel") Hotel hotel, @Param("severity") Todo.Severity severity);
}
