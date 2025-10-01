import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  useTheme,
  Skeleton,
  Collapse,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { designSystem } from '../../theme/designSystem';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  minWidth?: number;
  format?: (value: any) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: any }[];
}

export interface TableAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  disabled?: (row: any) => boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface AdvancedTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  actions?: TableAction[];
  onSort?: (column: string, direction: SortDirection) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: any) => void;
  renderExpandedRow?: (row: any) => React.ReactNode;
  emptyMessage?: string;
  stickyHeader?: boolean;
  dense?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  showPagination?: boolean;
  maxHeight?: number | string;
  rowKeyField?: string;
}

const AdvancedTable: React.FC<AdvancedTableProps> = ({
  columns,
  data,
  loading = false,
  selectable = false,
  expandable = false,
  actions = [],
  onSort,
  onSelectionChange,
  onRowClick,
  renderExpandedRow,
  emptyMessage = 'No data available',
  stickyHeader = false,
  dense = false,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  showPagination = true,
  maxHeight,
  rowKeyField = 'id',
}) => {
  const theme = useTheme();
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    element: HTMLElement;
    row: any;
  } | null>(null);

  // Sorted and paginated data
  const processedData = useMemo(() => {
    let sortedData = [...data];

    // Apply sorting
    if (sortColumn) {
      sortedData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortedData;
  }, [data, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return processedData;
    
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, showPagination]);

  const handleSort = (column: string) => {
    const isCurrentColumn = sortColumn === column;
    const direction = isCurrentColumn && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortColumn(column);
    setSortDirection(direction);
    onSort?.(column, direction);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map(row => row[rowKeyField]);
      setSelectedRows(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    let newSelected: string[];
    
    if (checked) {
      newSelected = [...selectedRows, rowId];
    } else {
      newSelected = selectedRows.filter(id => id !== rowId);
    }
    
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleExpandRow = (rowId: string) => {
    if (expandedRows.includes(rowId)) {
      setExpandedRows(expandedRows.filter(id => id !== rowId));
    } else {
      setExpandedRows([...expandedRows, rowId]);
    }
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.stopPropagation();
    setActionMenuAnchor({ element: event.currentTarget, row });
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleActionClick = (action: TableAction, row: any) => {
    action.onClick(row);
    handleActionMenuClose();
  };

  const isAllSelected = paginatedData.length > 0 && selectedRows.length === paginatedData.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && <TableCell padding="checkbox" />}
              {expandable && <TableCell />}
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <Skeleton variant="text" width="60%" />
                </TableCell>
              ))}
              {actions.length > 0 && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowsPerPage }).map((_, index) => (
              <TableRow key={index}>
                {selectable && <TableCell padding="checkbox" />}
                {expandable && <TableCell />}
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
                {actions.length > 0 && <TableCell />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight,
          borderRadius: designSystem.borderRadius.md,
          boxShadow: designSystem.shadows.sm,
        }}
      >
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    color="primary"
                  />
                </TableCell>
              )}
              {expandable && <TableCell />}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    width: column.width, 
                    minWidth: column.minWidth,
                  }}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        '&.Mui-active': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={
                    columns.length + 
                    (selectable ? 1 : 0) + 
                    (expandable ? 1 : 0) + 
                    (actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row[rowKeyField];
                const isSelected = selectedRows.includes(rowId);
                const isExpanded = expandedRows.includes(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      hover
                      selected={isSelected}
                      onClick={() => onRowClick?.(row)}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        backgroundColor: isExpanded ? theme.palette.action.selected : 'inherit', // Highlight expanded rows
                        '&:hover': {
                          backgroundColor: isExpanded ? theme.palette.action.selected : theme.palette.action.hover,
                        },
                        transition: 'background-color 0.2s ease',
                        ...(isExpanded && {
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                        }),
                      }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(rowId, e.target.checked);
                            }}
                            color="primary"
                          />
                        </TableCell>
                      )}
                      {expandable && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandRow(rowId);
                            }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format ? 
                            column.format(row[column.id]) : 
                            row[column.id]
                          }
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, row)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    {expandable && isExpanded && renderExpandedRow && (
                      <TableRow>
                        <TableCell 
                          colSpan={
                            columns.length + 
                            (selectable ? 1 : 0) + 
                            (expandable ? 1 : 0) + 
                            (actions.length > 0 ? 1 : 0)
                          }
                          sx={{ py: 0, border: 0 }}
                        >
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2 }}>
                              {renderExpandedRow(row)}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {showPagination && paginatedData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={processedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
          }}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor?.element}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: designSystem.borderRadius.md,
            boxShadow: designSystem.shadows.lg,
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => handleActionClick(action, actionMenuAnchor?.row)}
            disabled={action.disabled?.(actionMenuAnchor?.row)}
            sx={{
              color: action.color ? theme.palette[action.color].main : 'inherit',
              '&:hover': {
                backgroundColor: action.color ? 
                  theme.palette[action.color].main + '10' : 
                  theme.palette.action.hover,
              },
            }}
          >
            {action.icon && (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                {action.icon}
              </Box>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default AdvancedTable;