import React from 'react';
import { Box, Typography } from '@mui/material';
import PremiumTextField from './PremiumTextField';
import { COLORS, addAlpha } from '../../theme/themeColors';

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
          color: COLORS.TEXT_SECONDARY,
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
        border: `1px solid ${COLORS.BORDER_LIGHT}`,
        borderRadius: 1,
        backgroundColor: COLORS.BG_LIGHT,
        borderLeft: `3px solid ${COLORS.SECONDARY}`,
        minHeight: minHeight || (multiline ? '80px' : 'auto'),
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: COLORS.BORDER_DEFAULT,
          boxShadow: `0 2px 4px ${addAlpha(COLORS.BLACK, 0.08)}`
        }
      }}>
        <Typography 
          variant={multiline ? "body2" : "body1"} 
          sx={{ 
            fontWeight: multiline ? 400 : 500,
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
            color: value ? COLORS.TEXT_PRIMARY : COLORS.TEXT_DISABLED
          }}
        >
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PremiumDisplayField;
