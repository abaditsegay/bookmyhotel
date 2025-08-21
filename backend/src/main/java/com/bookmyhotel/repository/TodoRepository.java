package com.bookmyhotel.repository;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.Tenant;
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
    
    List<Todo> findByUserAndTenantOrderByCreatedAtDesc(User user, Tenant tenant);
    
    List<Todo> findByUserAndTenantAndCompletedOrderByCreatedAtDesc(User user, Tenant tenant, Boolean completed);
    
    Page<Todo> findByUserAndTenant(User user, Tenant tenant, Pageable pageable);
    
    @Query("SELECT t FROM Todo t WHERE t.user = :user AND t.tenant = :tenant AND " +
           "(:completed IS NULL OR t.completed = :completed) " +
           "ORDER BY " +
           "CASE WHEN :sortBy = 'priority' THEN " +
           "  CASE t.priority " +
           "    WHEN 'HIGH' THEN 1 " +
           "    WHEN 'MEDIUM' THEN 2 " +
           "    WHEN 'LOW' THEN 3 " +
           "  END " +
           "END, " +
           "CASE WHEN :sortBy = 'dueDate' THEN t.dueDate END, " +
           "CASE WHEN :sortBy = 'created' THEN t.createdAt END DESC, " +
           "CASE WHEN :sortBy = 'alphabetical' THEN t.title END")
    List<Todo> findUserTodosWithFiltersAndSorting(
        @Param("user") User user,
        @Param("tenant") Tenant tenant,
        @Param("completed") Boolean completed,
        @Param("sortBy") String sortBy
    );
    
    @Query("SELECT COUNT(t) FROM Todo t WHERE t.user = :user AND t.tenant = :tenant AND t.completed = false")
    long countPendingTodos(@Param("user") User user, @Param("tenant") Tenant tenant);
    
    @Query("SELECT t FROM Todo t WHERE t.user = :user AND t.tenant = :tenant AND t.dueDate <= :dueDate AND t.completed = false")
    List<Todo> findOverdueTodos(@Param("user") User user, @Param("tenant") Tenant tenant, @Param("dueDate") LocalDateTime dueDate);
    
    Optional<Todo> findByIdAndUserAndTenant(Long id, User user, Tenant tenant);
    
    void deleteByIdAndUserAndTenant(Long id, User user, Tenant tenant);
}
