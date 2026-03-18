import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface StandardTextFieldProps extends Omit<TextFieldProps, 'size'> {
  fieldSize?: 'small' | 'medium';
}

/**
 * StandardTextField - A themed text input component with consistent styling and behavior
 * 
 * @description
 * Extends Material-UI TextField with standardized sizing, border radius, and focus states.
 * Provides smooth transitions and consistent helper text positioning.
 * 
 * @example
 * ```tsx
 * // Basic input
 * <StandardTextField
 *   label="Email"
 *   fieldSize="medium"
 *   variant="outlined"
 *   fullWidth
 * />
 * 
 * // Compact form input
 * <StandardTextField
 *   label="Search"
 *   fieldSize="small"
 *   placeholder="Search hotels..."
 * />
 * 
 * // With validation
 * <StandardTextField
 *   label="Required Field"
 *   error={hasError}
 *   helperText={errorMessage || "Please enter a value"}
 * />
 * ```
 * 
 * @param fieldSize - Size variant: 'small' (40px), 'medium' (48px) 
 * @param variant - Material-UI variant: 'standard', 'outlined', 'filled'
 * @param sx - Additional Material-UI styling overrides
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
          borderRadius: `${designSystem.borderRadius.sm}px`, // 4px consistent with other components
          transition: 'all 0.2s ease-in-out',
          
          // Default state
          '& fieldset': {
            borderColor: addAlpha(COLORS.BLACK, 0.12),
            borderWidth: '1px',
          },
          
          // Hover state
          '&:hover fieldset': {
            borderColor: addAlpha(COLORS.BLACK, 0.25),
            borderWidth: '1px',
          },
          
          // Focus state
          '&.Mui-focused fieldset': {
            borderWidth: '2px',
            boxShadow: `0 0 0 1px ${addAlpha(COLORS.BOOKED, 0.2)}`,
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
          borderRadius: `${designSystem.borderRadius.sm}px ${designSystem.borderRadius.sm}px 0 0`,
          '&:before, &:after': {
            borderRadius: 0,
          },
        },
        
        // Standard variant styling  
        '& .MuiInput-root': {
          '&:before': {
            borderBottomColor: addAlpha(COLORS.BLACK, 0.12),
          },
          '&:hover:before': {
            borderBottomColor: addAlpha(COLORS.BLACK, 0.25),
          },
        },
        
        // Label styling
        '& .MuiInputLabel-root': {
          fontSize: fieldSize === 'small' ? '14px' : '16px',
          transition: 'all 0.2s ease-in-out',
        },
        
        // Helper text styling
        '& .MuiFormHelperText-root': {
          marginLeft: designSystem.spacing.sm, // 8px
          marginTop: designSystem.spacing.xs, // 4px
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