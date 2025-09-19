/**
 * Network Status Hook
 * Provides real-time network connectivity monitoring and offline state management
 */

import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '../services/SyncManager';
import { offlineStorage } from '../services/OfflineStorageService';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
}

interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncAttempt?: string;
  lastSyncSuccess?: string;
  lastSyncError?: string;
}

interface OfflineStats {
  totalBookings: number;
  pendingSync: number;
  syncedBookings: number;
  failedBookings: number;
  storageSize: string;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0
  });

  const [offlineStats, setOfflineStats] = useState<OfflineStats>({
    totalBookings: 0,
    pendingSync: 0,
    syncedBookings: 0,
    failedBookings: 0,
    storageSize: '0 KB'
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    persistent?: boolean;
  }>>([]);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    };

    // Determine if connection is slow
    if (connection) {
      newStatus.isSlowConnection = 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        (connection.downlink && connection.downlink < 0.5) ||
        (connection.rtt && connection.rtt > 2000);
    }

    // Update last online/offline times
    if (newStatus.isOnline && !networkStatus.isOnline) {
      newStatus.lastOnlineTime = new Date();
    } else if (!newStatus.isOnline && networkStatus.isOnline) {
      newStatus.lastOfflineTime = new Date();
    } else {
      newStatus.lastOnlineTime = networkStatus.lastOnlineTime;
      newStatus.lastOfflineTime = networkStatus.lastOfflineTime;
    }

    setNetworkStatus(newStatus);
  }, [networkStatus.isOnline, networkStatus.lastOnlineTime, networkStatus.lastOfflineTime]);

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setSyncStatus({
        isSyncing: status.isSyncing,
        pendingCount: status.pendingCount,
        failedCount: status.failedCount,
        lastSyncAttempt: status.lastSyncAttempt,
        lastSyncSuccess: syncStatus.lastSyncSuccess,
        lastSyncError: syncStatus.lastSyncError
      });
    } catch (error) {
      console.error('Failed to update sync status:', error);
      // Set default sync status if database not initialized
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingCount: 0,
        failedCount: 0
      }));
    }
  }, [syncStatus.lastSyncSuccess, syncStatus.lastSyncError]);

  // Update offline statistics
  const updateOfflineStats = useCallback(async () => {
    try {
      const stats = await offlineStorage.getStorageStats();
      const allBookings = await offlineStorage.getOfflineBookings();
      
      const syncedCount = allBookings.filter(b => b.status === 'SYNCED').length;
      const failedCount = allBookings.filter(b => b.status === 'SYNC_FAILED').length;

      // Estimate storage size (rough calculation)
      const estimatedSize = allBookings.length * 1024; // ~1KB per booking
      const sizeString = estimatedSize > 1024 * 1024 
        ? `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(estimatedSize / 1024).toFixed(1)} KB`;

      setOfflineStats({
        totalBookings: stats.bookings,
        pendingSync: stats.pendingSync,
        syncedBookings: syncedCount,
        failedBookings: failedCount,
        storageSize: sizeString
      });
    } catch (error) {
      console.error('Failed to update offline stats:', error);
      // Set default stats if database not initialized
      setOfflineStats({
        totalBookings: 0,
        pendingSync: 0,
        syncedBookings: 0,
        failedBookings: 0,
        storageSize: '0 KB'
      });
    }
  }, []);

  // Add notification
  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    persistent = false
  ) => {
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      persistent
    };

    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10

    // Auto-remove non-persistent notifications after 5 seconds
    if (!persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }

    return notification.id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Trigger manual sync
  const triggerSync = useCallback(async (token?: string) => {
    if (!networkStatus.isOnline) {
      addNotification('error', 'Cannot sync while offline');
      return false;
    }

    if (syncStatus.isSyncing) {
      addNotification('warning', 'Sync already in progress');
      return false;
    }

    if (!token) {
      addNotification('error', 'Authentication token required for sync');
      return false;
    }

    try {
      addNotification('info', 'Starting sync...');
      const result = await syncManager.syncAllPendingBookings(token);
      
      if (result.success) {
        addNotification('success', `Successfully synced ${result.syncedCount} bookings`);
        setSyncStatus(prev => ({ ...prev, lastSyncSuccess: new Date().toISOString() }));
      } else {
        addNotification('warning', `Synced ${result.syncedCount} bookings, ${result.failedCount} failed`);
        setSyncStatus(prev => ({ ...prev, lastSyncError: new Date().toISOString() }));
      }

      await updateSyncStatus();
      await updateOfflineStats();
      return true;

    } catch (error: any) {
      addNotification('error', `Sync failed: ${error.message}`);
      setSyncStatus(prev => ({ ...prev, lastSyncError: new Date().toISOString() }));
      return false;
    }
  }, [networkStatus.isOnline, syncStatus.isSyncing, addNotification, updateSyncStatus, updateOfflineStats]);

  // Retry failed bookings
  const retryFailedBookings = useCallback(async (token?: string) => {
    if (!networkStatus.isOnline) {
      addNotification('error', 'Cannot retry while offline');
      return false;
    }

    if (!token) {
      addNotification('error', 'Authentication token required for retry');
      return false;
    }

    try {
      addNotification('info', 'Retrying failed bookings...');
      const result = await syncManager.retryFailedBookings(token);
      
      if (result.success) {
        addNotification('success', `Successfully retried ${result.syncedCount} bookings`);
      } else {
        addNotification('warning', `Retried ${result.syncedCount} bookings, ${result.failedCount} still failed`);
      }

      await updateSyncStatus();
      await updateOfflineStats();
      return true;

    } catch (error: any) {
      addNotification('error', `Retry failed: ${error.message}`);
      return false;
    }
  }, [networkStatus.isOnline, addNotification, updateSyncStatus, updateOfflineStats]);

  // Clear old synced bookings
  const clearOldBookings = useCallback(async (daysOld = 30) => {
    try {
      const deletedCount = await syncManager.clearOldSyncedBookings(daysOld);
      addNotification('success', `Cleared ${deletedCount} old bookings`);
      await updateOfflineStats();
      return deletedCount;
    } catch (error: any) {
      addNotification('error', `Failed to clear old bookings: ${error.message}`);
      return 0;
    }
  }, [addNotification, updateOfflineStats]);

  // Export offline data
  const exportOfflineData = useCallback(async () => {
    try {
      const data = await syncManager.exportOfflineBookings();
      
      // Create and download file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offline-bookings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification('success', 'Offline data exported successfully');
      return true;
    } catch (error: any) {
      addNotification('error', `Export failed: ${error.message}`);
      return false;
    }
  }, [addNotification]);

  // Initialize and set up event listeners
  useEffect(() => {
    // Initialize offline storage first, then load data
    const initializeServices = async () => {
      try {
        // Always ensure database is initialized
        await offlineStorage.init();
        
        // Wait a bit to ensure initialization is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initial data load after initialization
        updateNetworkStatus();
        await updateSyncStatus();
        await updateOfflineStats();
      } catch (error) {
        console.error('Failed to initialize offline services:', error);
        // Still update network status even if offline storage fails
        updateNetworkStatus();
      }
    };

    initializeServices();

    // Network status listeners
    const handleOnline = () => {
      updateNetworkStatus();
      addNotification('success', 'Connection restored! Syncing offline bookings...', false);
      
      // Auto-trigger sync when coming online
      setTimeout(() => {
        triggerSync();
      }, 1000);
    };

    const handleOffline = () => {
      updateNetworkStatus();
      addNotification('warning', 'You are now offline. Bookings will be saved locally.', false);
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    // Sync status listeners
    const handleSyncMessage = (event: CustomEvent) => {
      const { type, message } = event.detail;
      
      switch (type) {
        case 'SYNC_SUCCESS':
          addNotification('success', message);
          setSyncStatus(prev => ({ ...prev, lastSyncSuccess: new Date().toISOString() }));
          break;
        case 'SYNC_PARTIAL':
          addNotification('warning', message);
          setSyncStatus(prev => ({ ...prev, lastSyncError: new Date().toISOString() }));
          break;
        case 'SYNC_FAILED':
          addNotification('error', message);
          setSyncStatus(prev => ({ ...prev, lastSyncError: new Date().toISOString() }));
          break;
      }
      
      updateSyncStatus();
      updateOfflineStats();
    };

    // BroadcastChannel for cross-tab communication
    const broadcastChannel = new BroadcastChannel('offline-sync');
    const handleBroadcastMessage = (event: MessageEvent) => {
      handleSyncMessage(new CustomEvent('offline-sync', { detail: event.data }));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync', handleSyncMessage as EventListener);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    if ('BroadcastChannel' in window) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // Periodic updates
    const statusInterval = setInterval(() => {
      updateSyncStatus();
      updateOfflineStats();
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync', handleSyncMessage as EventListener);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }

      if ('BroadcastChannel' in window) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
        broadcastChannel.close();
      }

      clearInterval(statusInterval);
    };
  }, [updateNetworkStatus, updateSyncStatus, updateOfflineStats, addNotification, triggerSync]);

  return {
    // Network status
    networkStatus,
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    connectionType: networkStatus.connectionType,

    // Sync status
    syncStatus,
    isSyncing: syncStatus.isSyncing,
    hasPendingSync: syncStatus.pendingCount > 0,
    hasFailedSync: syncStatus.failedCount > 0,

    // Offline stats
    offlineStats,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,

    // Actions
    triggerSync,
    retryFailedBookings,
    clearOldBookings,
    exportOfflineData,

    // Utilities
    refresh: () => {
      updateNetworkStatus();
      updateSyncStatus();
      updateOfflineStats();
    }
  };
};

export type {
  NetworkStatus,
  SyncStatus,
  OfflineStats
};