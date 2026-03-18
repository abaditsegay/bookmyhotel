package com.bookmyhotel.repository;

import com.bookmyhotel.entity.SystemAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long> {

    @Query("SELECT l FROM SystemAuditLog l WHERE " +
           "(:action IS NULL OR l.action = :action) AND " +
           "(:entityType IS NULL OR l.entityType = :entityType) AND " +
           "(:userEmail IS NULL OR LOWER(l.performedByUserEmail) LIKE LOWER(CONCAT('%', :userEmail, '%'))) AND " +
           "(:from IS NULL OR l.performedAt >= :from) AND " +
           "(:to IS NULL OR l.performedAt <= :to) " +
           "ORDER BY l.performedAt DESC")
    Page<SystemAuditLog> findWithFilters(
            @Param("action") String action,
            @Param("entityType") String entityType,
            @Param("userEmail") String userEmail,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    @Query("SELECT COUNT(l) FROM SystemAuditLog l WHERE l.performedAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(l) FROM SystemAuditLog l WHERE l.success = false AND l.performedAt >= :since")
    long countFailedSince(@Param("since") LocalDateTime since);
}
