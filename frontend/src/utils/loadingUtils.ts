/**
 * Utility functions for batch operations with loading states
 */

interface BatchOptions<T> {
  onProgress?: (completed: number, total: number) => void;
  onBatchComplete?: (results: T[]) => void;
  onBatchError?: (error: any, completedResults: T[]) => void;
  parallel?: boolean;
}

export const batchWithLoading = async <T>(
  operations: Array<() => Promise<T>>,
  setLoading: (loading: boolean) => void,
  options?: BatchOptions<T>
): Promise<T[]> => {
  const { onProgress, onBatchComplete, onBatchError, parallel = false } = options || {};
  
  setLoading(true);
  const results: T[] = [];
  
  try {
    if (parallel) {
      const allResults = await Promise.all(operations.map(op => op()));
      results.push(...allResults);
    } else {
      for (let i = 0; i < operations.length; i++) {
        const result = await operations[i]();
        results.push(result);
        onProgress?.(i + 1, operations.length);
      }
    }

    onBatchComplete?.(results);
    return results;
  } catch (error) {
    onBatchError?.(error, results);
    throw error;
  } finally {
    setLoading(false);
  }
};