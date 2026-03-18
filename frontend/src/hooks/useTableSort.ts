import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortOrder;
}

/**
 * Custom hook for table sorting
 * @param items - Array of items to sort
 * @param initialSortKey - Initial key to sort by
 * @param initialSortOrder - Initial sort order
 * @returns Sorted items and sort handlers
 */
export function useTableSort<T>(
  items: T[],
  initialSortKey: keyof T | null = null,
  initialSortOrder: SortOrder = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSortKey,
    direction: initialSortOrder,
  });

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) {
      return items;
    }

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Handle booleans
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const aNum = aValue ? 1 : 0;
        const bNum = bValue ? 1 : 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Default comparison
      return 0;
    });

    return sorted;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: SortOrder = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: keyof T): SortOrder | undefined => {
    return sortConfig.key === key ? sortConfig.direction : undefined;
  };

  return { sortedItems, requestSort, getSortDirection, sortConfig };
}
