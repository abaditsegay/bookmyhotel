import React from 'react';
import { alpha, TextField, TextFieldProps, useTheme } from '@mui/material';

/**
 * Premium styled TextField component for forms
 * Features gold border, cream background, and uppercase labels to match PremiumDisplayField
 */
const PremiumTextField: React.FC<TextFieldProps> = (props) => {
  const theme = useTheme();

  return (
    <TextField
      {...props}
      variant="outlined"
      InputLabelProps={{
        ...props.InputLabelProps,
        sx: {
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: theme.palette.primary.main,
          '&.Mui-focused': {
            color: `${theme.palette.primary.main} !important`,
            fontWeight: 600,
          },
          ...props.InputLabelProps?.sx,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: theme.palette.grey[50],
          borderRadius: '4px',
          '& fieldset': {
            borderColor: theme.palette.divider,
            borderWidth: '1px',
            borderLeftWidth: '2px',
            borderLeftColor: theme.palette.secondary.main,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.grey[400],
            borderLeftWidth: '2px',
            borderLeftColor: theme.palette.secondary.main,
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.secondary.light, 0.08),
            '& fieldset': {
              borderColor: theme.palette.secondary.main,
              borderWidth: '1px',
              borderLeftWidth: '2px',
              borderLeftColor: theme.palette.secondary.main,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            '& fieldset': {
              borderColor: theme.palette.grey[400],
              borderWidth: '1px',
              borderLeftWidth: '2px',
              borderLeftColor: theme.palette.secondary.main,
            },
            '& input': {
              color: theme.palette.text.disabled,
              WebkitTextFillColor: theme.palette.text.disabled,
            },
            '& textarea': {
              color: theme.palette.text.disabled,
              WebkitTextFillColor: theme.palette.text.disabled,
            },
          },
          '&.Mui-error fieldset': {
            borderLeftColor: theme.palette.error.main,
          },
          '& input': {
            color: theme.palette.text.primary,
          },
          '& textarea': {
            color: theme.palette.text.primary,
          },
        },
        '& .MuiInputLabel-root': {
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: theme.palette.primary.main,
          '&.Mui-focused': {
            color: `${theme.palette.primary.main} !important`,
            fontWeight: 600,
          },
        },
        ...props.sx,
      }}
    />
  );
};

export default PremiumTextField;
