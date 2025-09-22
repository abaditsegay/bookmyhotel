import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { themeConstants } from '../../theme/theme';

interface StandardTextFieldProps extends Omit<TextFieldProps, 'size'> {
  fieldSize?: 'small' | 'medium';
}

/**
 * StandardTextField - A themed text field component with consistent styling
 * 
 * Features:
 * - Theme-aware sizing and spacing
 * - Consistent border radius and colors
 * - Enhanced focus states with smooth transitions
 * - Support for all Material-UI TextField variants (standard, outlined, filled)
 * - Responsive padding and spacing
 * - Error state styling integration
 */
const StandardTextField: React.FC<StandardTextFieldProps> = ({
  fieldSize = 'medium',
  variant = 'outlined',
  sx,
  ...props
}) => {
  const sizeConfig = {
    small: { 
      height: '40px',
      '& .MuiInputBase-input': { padding: '8.5px 14px' }
    },
    medium: { 
      height: '48px',
      '& .MuiInputBase-input': { padding: '12px 14px' }
    }
  };

  return (
    <TextField
      variant={variant}
      sx={{
        // Base sizing
        ...sizeConfig[fieldSize],
        
        // Border radius consistency
        '& .MuiOutlinedInput-root': {
          borderRadius: `${themeConstants.spacing.xs * 8}px`, // 4px consistent with other components
          transition: 'all 0.2s ease-in-out',
          
          // Default state
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderWidth: '1px',
          },
          
          // Hover state
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.25)',
            borderWidth: '1px',
          },
          
          // Focus state
          '&.Mui-focused fieldset': {
            borderWidth: '2px',
            boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)',
          },
          
          // Error state
          '&.Mui-error fieldset': {
            borderColor: 'error.main',
          },
          
          '&.Mui-error:hover fieldset': {
            borderColor: 'error.dark',
          },
        },
        
        // Filled variant styling
        '& .MuiFilledInput-root': {
          borderRadius: `${themeConstants.spacing.xs * 8}px ${themeConstants.spacing.xs * 8}px 0 0`,
          '&:before, &:after': {
            borderRadius: 0,
          },
        },
        
        // Standard variant styling  
        '& .MuiInput-root': {
          '&:before': {
            borderBottomColor: 'rgba(0, 0, 0, 0.12)',
          },
          '&:hover:before': {
            borderBottomColor: 'rgba(0, 0, 0, 0.25)',
          },
        },
        
        // Label styling
        '& .MuiInputLabel-root': {
          fontSize: fieldSize === 'small' ? '14px' : '16px',
          transition: 'all 0.2s ease-in-out',
        },
        
        // Helper text styling
        '& .MuiFormHelperText-root': {
          marginLeft: themeConstants.spacing.xs * 2, // 4px
          marginTop: themeConstants.spacing.xs, // 4px
          fontSize: '12px',
        },
        
        // Custom sx overrides
        ...sx,
      }}
      {...props}
    />
  );
};

export default StandardTextField;