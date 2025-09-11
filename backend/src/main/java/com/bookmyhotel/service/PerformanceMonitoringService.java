package com.bookmyhotel.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.stereotype.Service;

import com.zaxxer.hikari.HikariPoolMXBean;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.util.Map;
import java.util.HashMap;

/**
 * Performance Monitoring Service
 * Provides insights into application performance metrics including:
 * - Database connection pool statistics
 * - Cache performance metrics
 * - Memory usage statistics
 * - Query performance indicators
 */
@Service
public class PerformanceMonitoringService {

    @Autowired
    private DataSource dataSource;

    @Autowired(required = false)
    private MetricsEndpoint metricsEndpoint;

    /**
     * Get database connection pool statistics
     * Provides insights into connection pool health and performance
     */
    public Map<String, Object> getConnectionPoolStats() {
        Map<String, Object> stats = new HashMap<>();
        
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikariDS = (HikariDataSource) dataSource;
            HikariPoolMXBean poolBean = hikariDS.getHikariPoolMXBean();
            
            stats.put("activeConnections", poolBean.getActiveConnections());
            stats.put("idleConnections", poolBean.getIdleConnections());
            stats.put("totalConnections", poolBean.getTotalConnections());
            stats.put("threadsAwaitingConnection", poolBean.getThreadsAwaitingConnection());
            
            // Connection pool configuration
            stats.put("maximumPoolSize", hikariDS.getMaximumPoolSize());
            stats.put("minimumIdle", hikariDS.getMinimumIdle());
            stats.put("connectionTimeout", hikariDS.getConnectionTimeout());
            stats.put("idleTimeout", hikariDS.getIdleTimeout());
            stats.put("maxLifetime", hikariDS.getMaxLifetime());
            
            // Health indicators
            double poolUtilization = (double) poolBean.getActiveConnections() / hikariDS.getMaximumPoolSize() * 100;
            stats.put("poolUtilizationPercentage", Math.round(poolUtilization * 100.0) / 100.0);
            
            // Performance indicators
            stats.put("isHealthy", poolUtilization < 80); // Consider pool healthy if < 80% utilized
            stats.put("needsAttention", poolBean.getThreadsAwaitingConnection() > 0);
            
        } else {
            stats.put("error", "HikariCP not configured - connection pool stats unavailable");
        }
        
        return stats;
    }

    /**
     * Get cache performance statistics
     * Caching has been disabled for this application
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("cacheProvider", "None");
        stats.put("status", "Caching disabled");
        stats.put("message", "Cache configuration has been removed from the application");
        return stats;
    }

    /**
     * Get memory usage statistics
     * Provides insights into JVM memory consumption
     */
    public Map<String, Object> getMemoryStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        stats.put("maxMemoryMB", maxMemory / (1024 * 1024));
        stats.put("totalMemoryMB", totalMemory / (1024 * 1024));
        stats.put("usedMemoryMB", usedMemory / (1024 * 1024));
        stats.put("freeMemoryMB", freeMemory / (1024 * 1024));
        stats.put("availableMemoryMB", (maxMemory - usedMemory) / (1024 * 1024));
        
        double memoryUtilization = (double) usedMemory / maxMemory * 100;
        stats.put("memoryUtilizationPercentage", Math.round(memoryUtilization * 100.0) / 100.0);
        
        // Health indicators
        stats.put("isHealthy", memoryUtilization < 85); // Consider healthy if < 85% utilized
        stats.put("needsAttention", memoryUtilization > 90);
        
        return stats;
    }

    /**
     * Get comprehensive performance summary
     * Combines all performance metrics into a single report
     */
    public Map<String, Object> getPerformanceSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            summary.put("connectionPool", getConnectionPoolStats());
        } catch (Exception e) {
            summary.put("connectionPool", "Error: " + e.getMessage());
        }
        
        try {
            summary.put("cache", getCacheStats());
        } catch (Exception e) {
            summary.put("cache", "Error: " + e.getMessage());
        }
        
        try {
            summary.put("memory", getMemoryStats());
        } catch (Exception e) {
            summary.put("memory", "Error: " + e.getMessage());
        }
        
        summary.put("timestamp", System.currentTimeMillis());
        summary.put("optimizationsApplied", getOptimizationsSummary());
        
        return summary;
    }

    /**
     * Get summary of applied performance optimizations
     */
    private Map<String, Object> getOptimizationsSummary() {
        Map<String, Object> optimizations = new HashMap<>();
        
        optimizations.put("connectionPoolOptimized", true);
        optimizations.put("jpaBatchProcessingEnabled", true);
        optimizations.put("queryOptimizationApplied", true);
        optimizations.put("cachingEnabled", false);
        optimizations.put("asyncProcessingConfigured", true);
        optimizations.put("monitoringEnhanced", true);
        
        return optimizations;
    }
}
