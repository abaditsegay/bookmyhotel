import React from 'react';
import { alpha, TextField, TextFieldProps, useTheme } from '@mui/material';

/**
 * Premium styled TextField component for forms
 * Keeps a lightly elevated form treatment while deferring typography and color rules to the theme.
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
          fontSize: '0.82rem',
          fontWeight: 500,
          color: theme.palette.text.secondary,
          '&.Mui-focused': {
            color: `${theme.palette.primary.main} !important`,
            fontWeight: 600,
          },
          ...props.InputLabelProps?.sx,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          borderRadius: `${theme.shape.borderRadius}px`,
          '& fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.12),
            borderWidth: '1px',
          },
          '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.24),
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}`,
            '& fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: '1px',
            },
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            '& fieldset': {
              borderColor: alpha(theme.palette.primary.main, 0.08),
              borderWidth: '1px',
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
            borderColor: theme.palette.error.main,
          },
          '& input': {
            color: theme.palette.text.primary,
          },
          '& textarea': {
            color: theme.palette.text.primary,
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.82rem',
          fontWeight: 500,
          color: theme.palette.text.secondary,
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
