import React, { createContext, useContext, useCallback, useRef } from 'react';

export interface NotificationContextType {
  triggerRefresh: () => void;
  triggerRefreshAfterBookingAction: (action: 'cancel' | 'modify' | 'create' | 'update') => void;
  registerRefreshCallback: (callback: () => void) => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const refreshCallbacksRef = useRef<Set<() => void>>(new Set());

  const registerRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbacksRef.current.add(callback);
    
    // Return cleanup function
    return () => {
      refreshCallbacksRef.current.delete(callback);
    };
  }, []);

  const triggerRefresh = useCallback(() => {
    console.log('🔄 NotificationContext: Triggering notification refresh');
    refreshCallbacksRef.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in notification refresh callback:', error);
      }
    });
  }, []);

  const triggerRefreshAfterBookingAction = useCallback((action: 'cancel' | 'modify' | 'create' | 'update') => {
    console.log(`📋 NotificationContext: Triggering refresh after booking ${action}`);
    
    // Add a small delay to ensure backend has processed the changes
    setTimeout(() => {
      triggerRefresh();
    }, 1000); // 1 second delay
  }, [triggerRefresh]);

  const contextValue: NotificationContextType = {
    triggerRefresh,
    triggerRefreshAfterBookingAction,
    registerRefreshCallback
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;