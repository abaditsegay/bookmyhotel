// Enhanced FormField Component
// Consistent form field styling with design system integration

import React from 'react';
import { 
  TextFieldProps,
  FormLabel,
  FormHelperText,
  Box,
  Typography
} from '@mui/material';
import PremiumTextField from '../common/PremiumTextField';

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
            color: isError ? 'error.main' : 'text.secondary',
            fontWeight: 600,
            fontSize: '0.82rem',
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

      <PremiumTextField
        {...props}
        error={isError}
        disabled={isDisabled}
        fullWidth
        variant="outlined"
        sx={{
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