import React from 'react';
import { Box, Typography, TextField, TextFieldProps } from '@mui/material';

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
      <TextField
        label={label}
        fullWidth
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        placeholder={placeholder}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': { borderColor: '#E8B86D' },
            '&.Mui-focused fieldset': { borderColor: '#E8B86D', borderWidth: 2 }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1a365d'
          }
        }}
      />
    );
  }

  return (
    <Box>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#666', 
          mb: 0.5, 
          display: 'block', 
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </Typography>
      <Box sx={{
        p: 1.5,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#fafafa',
        borderLeft: '3px solid #E8B86D',
        minHeight: minHeight || (multiline ? '80px' : 'auto'),
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#d0d0d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
      }}>
        <Typography 
          variant={multiline ? "body2" : "body1"} 
          sx={{ 
            fontWeight: multiline ? 400 : 500,
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
            color: value ? '#212121' : '#999'
          }}
        >
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PremiumDisplayField;
