// Enhanced StatusChip Component
// Consistent status display with design system colors

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { designSystem, statusColors } from '../../theme/designSystem';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  /** Status value that determines color */
  status: string;
  /** Status category (booking, payment, room, stock) */
  category: keyof typeof statusColors;
  /** Chip size */
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  category,
  size = 'small',
  sx,
  ...props
}) => {
  // Get color mapping for the category and status
  const getStatusColor = () => {
    const categoryColors = statusColors[category];
    if (categoryColors && status in categoryColors) {
      return (categoryColors as any)[status];
    }
    // Default to info if status not found
    return 'info';
  };

  const statusColor = getStatusColor();

  // Convert status to display format
  const getDisplayLabel = (statusValue: string) => {
    return statusValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayLabel = getDisplayLabel(status);

  return (
    <Chip
      {...props}
      label={displayLabel}
      color={statusColor as any}
      size={size}
      sx={{
        borderRadius: designSystem.borderRadius.md,
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? '24px' : '32px',
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        },
        ...sx,
      }}
    />
  );
};

export default StatusChip;