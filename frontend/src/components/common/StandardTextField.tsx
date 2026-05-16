import React from 'react';
import { TextFieldProps } from '@mui/material';
import PremiumTextField from './PremiumTextField';

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
  return (
    <PremiumTextField
      variant={variant}
      size={fieldSize}
      sx={{
        '& .MuiInputLabel-root': {
          fontSize: fieldSize === 'small' ? '0.8rem' : '0.9rem',
        },
        '& .MuiFormHelperText-root': {
          mt: 0.5,
          mx: 0,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default StandardTextField;