import React from 'react';
import { alpha, FormControl, InputLabel, Select, FormControlProps, SelectChangeEvent, SxProps, Theme, useTheme } from '@mui/material';

interface PremiumSelectProps {
  label: string;
  formControlProps?: Omit<FormControlProps, 'children'>;
  children: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  value?: any;
  onChange?: (event: SelectChangeEvent<any>) => void;
  disabled?: boolean;
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
  sx,
  ...otherProps
}) => {
  const theme = useTheme();

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
        '& .MuiSelect-select': {
          color: theme.palette.text.disabled,
          WebkitTextFillColor: theme.palette.text.disabled,
        },
      },
      '& .MuiSelect-select': {
        color: theme.palette.text.primary,
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
        {...otherProps}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default PremiumSelect;
