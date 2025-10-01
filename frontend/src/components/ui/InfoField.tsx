// InfoField Component
// Consistent display of read-only information fields

import React from 'react';
import { 
  Box, 
  Typography, 
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface InfoFieldProps {
  /** Field label */
  label: string;
  /** Field value */
  value?: string | number | null;
  /** Format value as currency */
  currency?: boolean;
  /** Currency symbol */
  currencySymbol?: string;
  /** Format as percentage */
  percentage?: boolean;
  /** Show as chip instead of text */
  chip?: boolean;
  /** Chip color */
  chipColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Custom formatting function */
  format?: (value: any) => string;
  /** Show divider below field */
  divider?: boolean;
  /** Copy-to-clipboard functionality */
  copyable?: boolean;
  /** Placeholder for empty values */
  placeholder?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  currency = false,
  currencySymbol = '$',
  percentage = false,
  chip = false,
  chipColor = 'primary',
  format,
  divider = false,
  copyable = false,
  placeholder = '—'
}) => {
  // Format the value based on props
  const formatValue = () => {
    if (value === null || value === undefined || value === '') {
      return placeholder;
    }

    if (format) {
      return format(value);
    }

    if (currency) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return `${currencySymbol}${numValue.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }

    if (percentage) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return `${numValue}%`;
    }

    return String(value);
  };

  const formattedValue = formatValue();
  const isEmpty = formattedValue === placeholder;

  const handleCopy = async () => {
    if (copyable && value && !isEmpty) {
      try {
        await navigator.clipboard.writeText(String(value));
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <Box>
      <Stack spacing={1}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </Typography>
        
        <Box
          onClick={copyable ? handleCopy : undefined}
          sx={{
            ...(copyable && !isEmpty && {
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            })
          }}
        >
          {chip && !isEmpty ? (
            <Chip
              label={formattedValue}
              color={chipColor}
              size="small"
              sx={{
                borderRadius: designSystem.borderRadius.md,
                fontWeight: 500,
                height: '28px'
              }}
            />
          ) : (
            <Typography 
              variant="body1"
              color={isEmpty ? 'text.disabled' : 'text.primary'}
              sx={{
                fontWeight: isEmpty ? 400 : 500,
                fontSize: '0.875rem',
                lineHeight: 1.5,
                ...(copyable && !isEmpty && {
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem'
                })
              }}
            >
              {formattedValue}
            </Typography>
          )}
        </Box>
      </Stack>
      
      {divider && (
        <Divider 
          sx={{ 
            mt: 2,
            borderColor: designSystem.colors.primary[50]
          }} 
        />
      )}
    </Box>
  );
};

export default InfoField;