import React from 'react';
import {
  alpha,
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
  Select,
  SelectProps,
  SxProps,
  Theme,
  useTheme,
} from '@mui/material';
import { getColorScheme } from '../../theme/designSystem';

interface PremiumSelectProps extends Omit<SelectProps<any>, 'label' | 'children' | 'sx'> {
  label: string;
  formControlProps?: Omit<FormControlProps, 'children'>;
  children: React.ReactNode;
  helperText?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Premium styled Select component for forms.
 * Mirrors PremiumTextField so select inputs participate in the same central form language.
 */
const PremiumSelect: React.FC<PremiumSelectProps> = ({ 
  label, 
  formControlProps, 
  children, 
  fullWidth,
  required,
  value,
  onChange,
  disabled,
  helperText,
  error = false,
  size = 'medium',
  variant = 'outlined',
  sx,
  ...otherProps
}) => {
  const theme = useTheme();
  const scheme = getColorScheme(theme.palette.mode === 'dark' ? 'dark' : 'light');
  const borderColor = theme.palette.mode === 'dark' ? scheme.border.strong : scheme.border.input;
  const hoverBorderColor = theme.palette.mode === 'dark' ? alpha(scheme.border.strong, 1) : scheme.border.strong;

  const baseSx: SxProps<Theme> = {
    '& .MuiInputLabel-root': {
      fontSize: '0.82rem',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: `${theme.palette.primary.main} !important`,
        fontWeight: 600,
      },
    },
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
        '& .MuiSelect-select': {
          color: theme.palette.text.disabled,
          WebkitTextFillColor: theme.palette.text.disabled,
        },
      },
      '& .MuiSelect-select': {
        color: theme.palette.text.primary,
        WebkitTextFillColor: theme.palette.text.primary,
      },
      '& .MuiSelect-icon': {
        color: theme.palette.text.secondary,
      },
      '&.Mui-error fieldset': {
        borderColor: theme.palette.error.main,
      },
    },
  };

  // Merge sx props
  const combinedSx: SxProps<Theme> = [baseSx, formControlProps?.sx, sx].filter(Boolean) as SxProps<Theme>;

  return (
    <FormControl
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={error}
      size={size}
      variant={variant}
      {...formControlProps}
      sx={combinedSx}
    >
      <InputLabel>
        {label}
      </InputLabel>
      <Select 
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        error={error}
        size={size}
        variant={variant}
        {...otherProps}
      >
        {children}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};

export default PremiumSelect;
