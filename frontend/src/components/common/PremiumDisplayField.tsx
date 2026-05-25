import React from 'react';
import { alpha, Box, Typography, useTheme } from '@mui/material';
import PremiumTextField from './PremiumTextField';

interface PremiumDisplayFieldProps {
  label: string;
  value: string | number | undefined;
  isEditMode: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  type?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Premium styled field component that switches between elegant display mode and edit mode
 * Display mode: Card-based with gold accent border
 * Edit mode: Standard TextField with gold focus colors
 */
const PremiumDisplayField: React.FC<PremiumDisplayFieldProps> = ({
  label,
  value,
  isEditMode,
  multiline = false,
  rows = 1,
  required = false,
  type = 'text',
  onChange,
  placeholder,
  minHeight
}) => {
  const theme = useTheme();

  if (isEditMode) {
    return (
      <PremiumTextField
        label={label}
        fullWidth
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Box>
      <Typography 
        variant="caption" 
        sx={{
          color: theme.palette.text.secondary,
          mb: 0.5,
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </Typography>
      <Box sx={{
        p: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.default,
        borderLeft: `3px solid ${theme.palette.secondary.main}`,
        minHeight: minHeight || (multiline ? '80px' : 'auto'),
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.grey[400],
          boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}>
        <Typography 
          variant={multiline ? "body2" : "body1"} 
          sx={{ 
            fontWeight: multiline ? 400 : 500,
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
            color: value ? theme.palette.text.primary : theme.palette.text.disabled
          }}
        >
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PremiumDisplayField;
