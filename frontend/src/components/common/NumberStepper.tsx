import React from 'react';
import {
  Box,
  IconButton,
  TextField,
  useTheme
} from '@mui/material';
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
    <TextField
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
          MozAppearance: 'textfield' // Firefox: hide spinner
        }
      }}
      sx={{
        '& .MuiInputBase-root': {
          minHeight: 56, // Match the date picker height
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
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              marginRight: '-14px',
            }}
          >
            <IconButton
              onClick={handleDecrement}
              disabled={disabled || value <= min}
              size="small"
              sx={{
                height: 40,
                width: 32,
                borderRadius: 0,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
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
                height: 40,
                width: 32,
                borderRadius: 0,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
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