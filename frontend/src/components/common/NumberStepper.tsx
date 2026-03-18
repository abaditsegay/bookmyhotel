import React from 'react';
import {
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import PremiumTextField from './PremiumTextField';
import {
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  disabled = false,
  fullWidth = false,
  size = 'medium'
}) => {
  const theme = useTheme();

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <PremiumTextField
      label={label}
      value={value}
      onChange={handleInputChange}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      type="number"
      inputProps={{
        min,
        max,
        style: {
          textAlign: 'center',
          MozAppearance: 'textfield', // Firefox: hide spinner
          paddingRight: '80px', // Make space for buttons
        }
      }}
      sx={{
        '& .MuiInputBase-root': {
          position: 'relative',
          paddingRight: 0,
        },
        '& input[type=number]': {
          '&::-webkit-outer-spin-button': {
            display: 'none', // Chrome/Safari: hide spinner
          },
          '&::-webkit-inner-spin-button': {
            display: 'none', // Chrome/Safari: hide spinner
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'background.paper',
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
          >
            <IconButton
              onClick={handleDecrement}
              disabled={disabled || value <= min}
              size="small"
              sx={{
                height: '100%',
                width: 36,
                borderRadius: 0,
                color: theme.palette.text.secondary,
                borderRight: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                '&.Mui-disabled': {
                  backgroundColor: 'transparent',
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleIncrement}
              disabled={disabled || value >= max}
              size="small"
              sx={{
                height: '100%',
                width: 36,
                borderRadius: 0,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                '&.Mui-disabled': {
                  backgroundColor: 'transparent',
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      }}
    />
  );
};

export default NumberStepper;