// Enhanced FormField Component
// Consistent form field styling with design system integration

import React from 'react';
import { 
  TextField, 
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  /** Field label */
  label?: string;
  /** Helper text below field */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Required field indicator */
  required?: boolean;
  /** Field description */
  description?: string;
  /** Loading state */
  loading?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  errorMessage,
  required = false,
  description,
  loading = false,
  error,
  disabled,
  sx,
  ...props
}) => {
  const isError = Boolean(error || errorMessage);
  const isDisabled = disabled || loading;

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {label && (
        <FormLabel 
          required={required}
          error={isError}
          sx={{ 
            mb: 1,
            display: 'block',
            color: isError ? 'error.main' : 'text.primary',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </FormLabel>
      )}
      
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {description}
        </Typography>
      )}

      <TextField
        {...props}
        error={isError}
        disabled={isDisabled}
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: designSystem.borderRadius.md,
            backgroundColor: isDisabled ? 'action.disabledBackground' : 'background.paper',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isError ? 'error.main' : 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isError ? 'error.main' : 'primary.main',
              borderWidth: '2px',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: 'error.main',
            },
          },
          '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: isError ? 'error.main' : 'primary.main',
            },
            '&.Mui-error': {
              color: 'error.main',
            },
          },
          ...(loading && {
            '& .MuiOutlinedInput-root': {
              opacity: 0.7,
            },
          }),
        }}
      />

      {(helperText || errorMessage) && (
        <FormHelperText 
          error={isError}
          sx={{ 
            mt: 1,
            fontSize: '0.75rem',
            lineHeight: 1.33,
          }}
        >
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField;