import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { LoadingOverlay } from '../components/common/LoadingComponents';

interface LoadingContextType {
  // Global loading state
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
  
  // Loading states management
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Named loading states
  loadingStates: Record<string, boolean>;
  setNamedLoading: (name: string, loading: boolean) => void;
  isNamedLoading: (name: string) => boolean;
  clearAllLoading: () => void;
  
  // Loading queue for batch operations
  loadingQueue: string[];
  addToQueue: (operation: string) => void;
  removeFromQueue: (operation: string) => void;
  clearQueue: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  showGlobalOverlay?: boolean;
}

/**
 * Loading Context Provider
 * Manages global loading states and provides loading utilities throughout the app
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  showGlobalOverlay = true,
}) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState('Loading...');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [loadingQueue, setLoadingQueue] = useState<string[]>([]);

  const handleSetGlobalLoading = useCallback((loading: boolean, message?: string) => {
    setGlobalLoading(loading);
    if (message !== undefined) {
      setGlobalLoadingMessage(message);
    }
  }, []);

  const setNamedLoading = useCallback((name: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [name]: loading,
    }));
  }, []);

  const isNamedLoading = useCallback((name: string) => {
    return loadingStates[name] || false;
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingStates({});
    setLoadingQueue([]);
  }, []);

  const addToQueue = useCallback((operation: string) => {
    setLoadingQueue(prev => {
      if (!prev.includes(operation)) {
        return [...prev, operation];
      }
      return prev;
    });
  }, []);

  const removeFromQueue = useCallback((operation: string) => {
    setLoadingQueue(prev => prev.filter(op => op !== operation));
  }, []);

  const clearQueue = useCallback(() => {
    setLoadingQueue([]);
  }, []);

  const contextValue: LoadingContextType = {
    isGlobalLoading: globalLoading,
    globalLoadingMessage,
    setGlobalLoading: handleSetGlobalLoading,
    loadingStates,
    setNamedLoading,
    isNamedLoading,
    clearAllLoading,
    loadingQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {showGlobalOverlay && (
        <LoadingOverlay
          open={globalLoading}
          message={globalLoadingMessage}
          backdrop={true}
        />
      )}
    </LoadingContext.Provider>
  );
};

/**
 * Hook to use loading context
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

/**
 * Higher-order component to wrap components with loading functionality
 */
export const withLoading = <P extends object>(
  Component: React.ComponentType<P & { setLoading?: (loading: boolean) => void; isLoading?: boolean }>,
  loadingName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { setNamedLoading, isNamedLoading } = useLoading();
    const componentLoadingName = loadingName || Component.displayName || Component.name || 'component';

    const enhancedProps = {
      ...props,
      setLoading: (loading: boolean) => setNamedLoading(componentLoadingName, loading),
      isLoading: isNamedLoading(componentLoadingName),
    } as P & { setLoading: (loading: boolean) => void; isLoading: boolean };

    return <Component {...enhancedProps} ref={ref} />;
  });
};

/**
 * Hook for managing component-specific loading with automatic cleanup
 */
export const useComponentLoading = (componentName: string) => {
  const { setNamedLoading, isNamedLoading } = useLoading();

  const setLoading = useCallback((loading: boolean) => {
    setNamedLoading(componentName, loading);
  }, [componentName, setNamedLoading]);

  const isLoading = useCallback(() => {
    return isNamedLoading(componentName);
  }, [componentName, isNamedLoading]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      setNamedLoading(componentName, false);
    };
  }, [componentName, setNamedLoading]);

  return {
    setLoading,
    isLoading: isLoading(),
  };
};

/**
 * Hook for batch operations with queue management
 */
export const useLoadingQueue = () => {
  const { loadingQueue, addToQueue, removeFromQueue, clearQueue } = useLoading();

  return {
    queue: loadingQueue,
    isInQueue: (operation: string) => loadingQueue.includes(operation),
    queueLength: loadingQueue.length,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
};

/**
 * Loading state utilities
 */
export const LoadingUtils = {
  // Delay function for testing loading states
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create a loading wrapper for async functions
  withLoadingState: <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    setLoading: (loading: boolean) => void,
    options?: {
      onStart?: () => void;
      onSuccess?: (result: R) => void;
      onError?: (error: any) => void;
      onFinally?: () => void;
    }
  ) => {
    return async (...args: T): Promise<R> => {
      const { onStart, onSuccess, onError, onFinally } = options || {};

      try {
        setLoading(true);
        onStart?.();

        const result = await asyncFn(...args);
        
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
        onFinally?.();
      }
    };
  },
};