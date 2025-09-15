import { useState, useCallback, useRef, useEffect } from 'react';

// Types for loading states
interface LoadingState {
  [key: string]: boolean;
}

interface LoadingStateWithData<T = any> {
  loading: boolean;
  data: T | null;
  error: string | null;
  lastUpdated: Date | null;
}

interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
  throwOnError?: boolean;
  timeout?: number;
}

/**
 * Hook for managing multiple loading states
 */
export const useLoadingStates = (initialStates: string[] = []) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(() => {
    const initial: LoadingState = {};
    initialStates.forEach(state => {
      initial[state] = false;
    });
    return initial;
  });

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    const clearedStates: LoadingState = {};
    Object.keys(loadingStates).forEach(key => {
      clearedStates[key] = false;
    });
    setLoadingStates(clearedStates);
  }, [loadingStates]);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
  };
};

/**
 * Hook for managing async operations with loading states
 */
export const useAsyncOperation = <T = any>() => {
  const [state, setState] = useState<LoadingStateWithData<T>>({
    loading: false,
    data: null,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    asyncFunction: (signal?: AbortSignal) => Promise<T>,
    options: AsyncOperationOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      onFinally,
      throwOnError = false,
      timeout,
    } = options;

    // Cancel previous operation if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      let result: T;

      if (timeout) {
        // Add timeout support
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out')), timeout);
        });

        result = await Promise.race([
          asyncFunction(signal),
          timeoutPromise,
        ]);
      } else {
        result = await asyncFunction(signal);
      }

      if (!signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          data: result,
          error: null,
          lastUpdated: new Date(),
        }));

        onSuccess?.(result);
      }

      return result;
    } catch (error: any) {
      if (!signal.aborted) {
        const errorMessage = error.message || 'An error occurred';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        onError?.(error);

        if (throwOnError) {
          throw error;
        }
      }
    } finally {
      if (!signal.aborted) {
        onFinally?.();
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      loading: false,
      data: null,
      error: null,
      lastUpdated: null,
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
  };
};

/**
 * Hook for managing paginated data loading
 */
export const usePaginatedLoading = <T = any>() => {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    loadingMore: false,
    error: null as string | null,
    hasMore: true,
    page: 0,
    totalPages: 0,
    totalItems: 0,
  });

  const loadPage = useCallback(async (
    fetchFunction: (page: number, signal?: AbortSignal) => Promise<{
      data: T[];
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    }>,
    page: number = 0,
    append: boolean = false
  ) => {
    const loadingKey = append ? 'loadingMore' : 'loading';
    
    setState(prev => ({
      ...prev,
      [loadingKey]: true,
      error: null,
    }));

    try {
      const result = await fetchFunction(page);
      
      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...result.data] : result.data,
        loading: false,
        loadingMore: false,
        hasMore: result.hasMore,
        page,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: error.message || 'Failed to load data',
      }));
      throw error;
    }
  }, []);

  const loadMore = useCallback(async (
    fetchFunction: (page: number, signal?: AbortSignal) => Promise<{
      data: T[];
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    }>
  ) => {
    if (state.loadingMore || !state.hasMore) return;
    
    await loadPage(fetchFunction, state.page + 1, true);
  }, [loadPage, state.loadingMore, state.hasMore, state.page]);

  const refresh = useCallback(async (
    fetchFunction: (page: number, signal?: AbortSignal) => Promise<{
      data: T[];
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    }>
  ) => {
    await loadPage(fetchFunction, 0, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      page: 0,
      totalPages: 0,
      totalItems: 0,
    });
  }, []);

  return {
    ...state,
    loadPage,
    loadMore,
    refresh,
    reset,
    isEmpty: state.data.length === 0,
    isLoading: state.loading,
    isLoadingMore: state.loadingMore,
    hasError: !!state.error,
  };
};

/**
 * Hook for debounced loading states (useful for search)
 */
export const useDebouncedLoading = (delay: number = 300) => {
  const [loading, setLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedLoading(loading);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, delay]);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    debouncedLoading,
    startLoading,
    stopLoading,
    setLoading,
  };
};

/**
 * Hook for progress tracking
 */
export const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const updateProgress = useCallback((value: number, newMessage?: string) => {
    setProgress(Math.max(0, Math.min(100, value)));
    if (newMessage !== undefined) {
      setMessage(newMessage);
    }
    setIsComplete(value >= 100);
  }, []);

  const incrementProgress = useCallback((increment: number, newMessage?: string) => {
    setProgress(prev => {
      const newProgress = Math.max(0, Math.min(100, prev + increment));
      setIsComplete(newProgress >= 100);
      return newProgress;
    });
    if (newMessage !== undefined) {
      setMessage(newMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setMessage('');
    setIsComplete(false);
  }, []);

  const complete = useCallback((completionMessage?: string) => {
    setProgress(100);
    setIsComplete(true);
    if (completionMessage !== undefined) {
      setMessage(completionMessage);
    }
  }, []);

  return {
    progress,
    message,
    isComplete,
    updateProgress,
    incrementProgress,
    reset,
    complete,
    setMessage,
  };
};