import { useState, useCallback } from 'react';

export interface PaginationSettings {
  page: number;
  size: number;
}

export interface UsePaginationSettingsReturn {
  paginationSettings: PaginationSettings;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

export const usePaginationSettings = (
  initialPage: number = 0,
  initialSize: number = 10
): UsePaginationSettingsReturn => {
  const [paginationSettings, setPaginationSettings] = useState<PaginationSettings>({
    page: initialPage,
    size: initialSize
  });

  const setPage = useCallback((page: number) => {
    setPaginationSettings(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPaginationSettings(prev => ({ ...prev, size, page: 0 })); // Reset to first page when changing size
  }, []);

  const resetPagination = useCallback(() => {
    setPaginationSettings({ page: initialPage, size: initialSize });
  }, [initialPage, initialSize]);

  return {
    paginationSettings,
    setPage,
    setPageSize,
    resetPagination
  };
};