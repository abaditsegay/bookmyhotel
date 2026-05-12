import React from 'react';
import { FormControl, InputLabel, Select, FormControlProps, SelectChangeEvent, SxProps, Theme, useTheme } from '@mui/material';

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
 * Premium styled Select component for forms
 * Features gold border, cream background, and uppercase labels to match PremiumTextField
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
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      color: theme.palette.primary.main,
      '&.Mui-focused': {
        color: `${theme.palette.primary.main} !important`,
      },
    },
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
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.secondary.main,
        borderWidth: '1px',
        borderLeftWidth: '2px',
        borderLeftColor: theme.palette.secondary.main,
      },
      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        '& fieldset': {
          borderColor: theme.palette.grey[400],
          borderWidth: '1px',
          borderLeftWidth: '2px',
          borderLeftColor: theme.palette.secondary.main,
        },
        '& .MuiSelect-select': {
          color: theme.palette.text.disabled,
          WebkitTextFillColor: theme.palette.text.disabled,
        },
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
      sx={combinedSx}
    >
      <InputLabel
        sx={{
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: theme.palette.primary.main,
          '&.Mui-focused': {
            color: `${theme.palette.primary.main} !important`,
          },
        }}
      >
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
