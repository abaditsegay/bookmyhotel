import React from 'react';
import { alpha, TextField, TextFieldProps, useTheme } from '@mui/material';
import { getColorScheme } from '../../theme/designSystem';

/**
 * Premium styled TextField component for forms
 * Keeps a lightly elevated form treatment while deferring typography and color rules to the theme.
 */
const PremiumTextField: React.FC<TextFieldProps> = (props) => {
  const theme = useTheme();
  const scheme = getColorScheme(theme.palette.mode === 'dark' ? 'dark' : 'light');
  const borderColor = theme.palette.mode === 'dark' ? scheme.border.strong : scheme.border.input;
  const hoverBorderColor = theme.palette.mode === 'dark' ? alpha(scheme.border.strong, 1) : scheme.border.strong;

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
          backgroundColor: scheme.background.input,
          borderRadius: `${theme.shape.borderRadius}px`,
          '& fieldset': {
            borderColor,
            borderWidth: theme.palette.mode === 'dark' ? '1.5px' : '1px',
          },
          '&:hover fieldset': {
            borderColor: hoverBorderColor,
          },
          '&.Mui-focused': {
            backgroundColor: scheme.background.input,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
            '& fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: theme.palette.mode === 'dark' ? '1.5px' : '1px',
            },
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            '& fieldset': {
              borderColor: scheme.border.default,
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
            WebkitTextFillColor: theme.palette.text.primary,
            '&::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
          },
          '& textarea': {
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            '&::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
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
