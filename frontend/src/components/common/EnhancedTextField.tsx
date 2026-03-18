import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  useTheme,
  InputAdornment,
  IconButton,
  Fade,
  Collapse,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { designSystem } from '../../theme/designSystem';

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface EnhancedTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  validationRules?: ValidationRule[];
  realTimeValidation?: boolean;
  showCharacterCount?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  sx?: any;
}

const EnhancedTextField: React.FC<EnhancedTextFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  rows = 4,
  maxLength,
  validationRules = [],
  realTimeValidation = true,
  showCharacterCount = false,
  icon,
  helperText,
  autoComplete,
  onFocus,
  onBlur,
  sx = {},
}) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Validation logic
  useEffect(() => {
    if (!realTimeValidation && !touched) return;

    const errors: string[] = [];
    
    if (required && !value.trim()) {
      errors.push(`${label} is required`);
    }

    validationRules.forEach(rule => {
      if (value && !rule.validate(value)) {
        errors.push(rule.message);
      }
    });

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [value, validationRules, required, label, realTimeValidation, touched]);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    setTouched(true);
    onBlur?.();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const getFieldColor = () => {
    if (disabled) return 'default';
    if (touched && !isValid) return 'error';
    if (touched && isValid && value) return 'success';
    return 'primary';
  };

  const renderEndAdornment = () => {
    const elements = [];

    // Validation status icon
    if (touched && value) {
      elements.push(
        <Fade key="validation" in={true}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            {isValid ? (
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 20, 
                  color: theme.palette.success.main 
                }} 
              />
            ) : (
              <ErrorIcon 
                sx={{ 
                  fontSize: 20, 
                  color: theme.palette.error.main 
                }} 
              />
            )}
          </Box>
        </Fade>
      );
    }

    // Password visibility toggle
    if (type === 'password') {
      elements.push(
        <IconButton
          key="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
          size="small"
          sx={{ mr: 1 }}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      );
    }

    // Custom icon
    if (icon) {
      elements.push(
        <Box key="icon" sx={{ mr: 1, color: theme.palette.text.secondary }}>
          {icon}
        </Box>
      );
    }

    return elements.length > 0 ? <InputAdornment position="end">{elements}</InputAdornment> : undefined;
  };

  return (
    <Box sx={sx}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        autoComplete={autoComplete}
        color={getFieldColor() as any}
        InputProps={{
          endAdornment: renderEndAdornment(),
          sx: {
            borderRadius: designSystem.borderRadius.md,
            backgroundColor: theme.palette.background.paper,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.background.paper,
              transform: 'translateY(-1px)',
              boxShadow: focused ? designSystem.shadows.md : 'none',
            },
          },
        }}
        InputLabelProps={{
          sx: {
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            },
          },
        }}
      />

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <Fade in={focused || value.length > 0}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              color: value.length === maxLength 
                ? theme.palette.error.main 
                : theme.palette.text.secondary,
            }}
          >
            {value.length}/{maxLength}
          </Typography>
        </Fade>
      )}

      {/* Helper Text */}
      {helperText && !validationErrors.length && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: theme.palette.text.secondary,
          }}
        >
          {helperText}
        </Typography>
      )}

      {/* Validation Errors */}
      <Collapse in={touched && validationErrors.length > 0}>
        <Box sx={{ mt: 0.5 }}>
          {validationErrors.map((error, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{
                display: 'block',
                color: theme.palette.error.main,
                fontWeight: 500,
              }}
            >
              {error}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// Pre-defined validation rules
export const validationRules = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  },
  minLength: (length: number) => ({
    validate: (value: string) => value.length >= length,
    message: `Must be at least ${length} characters long`,
  }),
  maxLength: (length: number) => ({
    validate: (value: string) => value.length <= length,
    message: `Must be no more than ${length} characters long`,
  }),
  strongPassword: {
    validate: (value: string) => 
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  },
  phoneNumber: {
    validate: (value: string) => /^\+?[\d\s-()]+$/.test(value),
    message: 'Please enter a valid phone number',
  },
  noSpecialChars: {
    validate: (value: string) => /^[a-zA-Z0-9\s]*$/.test(value),
    message: 'Special characters are not allowed',
  },
};

export default EnhancedTextField;