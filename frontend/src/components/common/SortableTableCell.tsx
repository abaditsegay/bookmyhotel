import React from 'react';
import { TableCell, TableSortLabel } from '@mui/material';
import { SortOrder } from '../../hooks/useTableSort';

interface SortableTableCellProps {
  label: string;
  sortKey?: string;
  active?: boolean;
  direction?: SortOrder;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
}

/**
 * Reusable sortable table header cell component
 */
export const SortableTableCell: React.FC<SortableTableCellProps> = ({
  label,
  sortKey,
  active = false,
  direction = 'asc',
  onSort,
  align = 'left',
}) => {
  if (!onSort || !sortKey) {
    // Non-sortable column
    return (
      <TableCell align={align}>
        {label}
      </TableCell>
    );
  }

  return (
    <TableCell align={align}>
      <TableSortLabel
        active={active}
        direction={direction}
        onClick={onSort}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
};
