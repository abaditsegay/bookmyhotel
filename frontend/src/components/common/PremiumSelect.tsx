import React from 'react';
import { FormControl, InputLabel, Select, SelectProps, FormControlProps, SelectChangeEvent, SxProps, Theme } from '@mui/material';
import { COLORS } from '../../theme/themeColors';

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
  const baseSx: SxProps<Theme> = {
    '& .MuiInputLabel-root': {
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      color: COLORS.PRIMARY,
      '&.Mui-focused': {
        color: `${COLORS.PRIMARY} !important`, // Keep consistent dark focus
      },
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa', // Light gray background to match reference
      borderRadius: '4px',
      '& fieldset': {
        borderColor: '#e0e0e0', // Light gray border
        borderWidth: '1px',
        borderLeftWidth: '2px', // Gold left border
        borderLeftColor: '#E8B86D', // Gold left accent
      },
      '&:hover fieldset': {
        borderColor: '#d0d0d0',
        borderLeftWidth: '2px',
        borderLeftColor: '#E8B86D',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E8B86D',
        borderWidth: '1px',
        borderLeftWidth: '2px',
        borderLeftColor: '#E8B86D',
      },
      '&.Mui-disabled': {
        backgroundColor: '#e8e8e8', // Darker gray to show disabled state
        '& fieldset': {
          borderColor: '#d0d0d0', // Darker border
          borderWidth: '1px',
          borderLeftWidth: '2px',
          borderLeftColor: '#E8B86D', // Gold accent
        },
        '& .MuiSelect-select': {
          color: '#666', // Gray text to show disabled
          WebkitTextFillColor: '#666',
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
          color: COLORS.PRIMARY,
          '&.Mui-focused': {
            color: `${COLORS.PRIMARY} !important`, // Keep dark on focus, not gold
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
