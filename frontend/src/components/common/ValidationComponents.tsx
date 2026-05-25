import React from 'react';
import {
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  Fade,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import PremiumTextField from './PremiumTextField';
import PremiumSelect from './PremiumSelect';

const ValidationIcon = (props: React.ComponentProps<typeof Box>) => (
  <Box
    {...props}
    sx={{
      display: 'flex',
      alignItems: 'center',
      '& .MuiSvgIcon-root': {
        fontSize: '1.2rem',
      },
      ...props.sx,
    }}
  />
);

// Props interfaces
interface ValidatedTextFieldProps {
  label: string;
  value: string;
  error?: boolean;
  helperText?: string | null;
  validationState?: 'success' | 'error' | 'warning' | 'info';
  showValidationIcon?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  autoComplete?: string;
  InputProps?: any;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

interface ValidatedSelectProps {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  error?: boolean;
  helperText?: string;
  validationState?: 'success' | 'error' | 'warning' | 'info';
  showValidationIcon?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  onChange?: (event: SelectChangeEvent<string | number>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

interface PasswordFieldProps extends Omit<ValidatedTextFieldProps, 'type'> {
  showPasswordStrength?: boolean;
  strengthScore?: number;
  strengthText?: string;
}

interface ValidationSummaryProps {
  errors: Record<string, string | null>;
  touched?: Record<string, boolean>;
  title?: string;
  showOnlyTouched?: boolean;
  maxErrors?: number;
}

/**
 * Enhanced TextField with validation states and icons
 */
export const ValidatedInput: React.FC<ValidatedTextFieldProps> = ({
  validationState,
  showValidationIcon = true,
  error = false,
  helperText,
  inputRef,
  ...props
}) => {
  const theme = useTheme();

  const getValidationIcon = () => {
    if (!showValidationIcon) return null;

    switch (validationState) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return null;
    }
  };

  const icon = getValidationIcon();
  const validationTone = validationState === 'success'
    ? theme.palette.success
    : validationState === 'warning'
      ? theme.palette.warning
      : validationState === 'info'
        ? theme.palette.info
        : null;

  return (
    <PremiumTextField
      {...props}
      inputRef={inputRef}
      error={error || validationState === 'error'}
      helperText={helperText}
      InputProps={{
        ...props.InputProps,
        endAdornment: icon && (
          <InputAdornment position="end">
            <ValidationIcon>{icon}</ValidationIcon>
          </InputAdornment>
        ),
      }}
      sx={{
        ...(validationTone && {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: alpha(validationTone.main, 0.75),
            },
            '&:hover fieldset': {
              borderColor: validationTone.main,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(validationTone.main, 0.12)}`,
              '& fieldset': {
                borderColor: validationTone.main,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: validationTone.main,
            '&.Mui-focused': {
              color: `${validationTone.main} !important`,
            },
          },
        }),
      }}
    />
  );
};

/**
 * Enhanced Select with validation states
 */
export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  value,
  options,
  validationState,
  showValidationIcon = true,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  onChange,
  onBlur,
}) => {
  const theme = useTheme();

  const getValidationIcon = () => {
    if (!showValidationIcon) return null;

    switch (validationState) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return null;
    }
  };

  const validationTone = validationState === 'success'
    ? theme.palette.success
    : validationState === 'warning'
      ? theme.palette.warning
      : validationState === 'info'
        ? theme.palette.info
        : null;

  return (
    <PremiumSelect
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur as React.FocusEventHandler<HTMLElement>}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      error={error || validationState === 'error'}
      helperText={helperText}
      sx={{
        ...(validationTone && {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: alpha(validationTone.main, 0.75),
            },
            '&:hover fieldset': {
              borderColor: validationTone.main,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(validationTone.main, 0.12)}`,
              '& fieldset': {
                borderColor: validationTone.main,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: validationTone.main,
            '&.Mui-focused': {
              color: `${validationTone.main} !important`,
            },
          },
        }),
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MenuItem>
      ))}
      {showValidationIcon && (
        <Box sx={{ display: 'none' }}>
          showValidationIcon && (
            <InputAdornment position="end">
              <ValidationIcon>{getValidationIcon()}</ValidationIcon>
            </InputAdornment>
          )
        </Box>
      )}
    </PremiumSelect>
  );
};

/**
 * Password field with strength indicator
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  showPasswordStrength = false,
  strengthScore = 0,
  strengthText = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'error';
    if (score < 3) return 'warning';
    if (score < 4) return 'info';
    return 'success';
  };

  const getStrengthText = (score: number) => {
    if (strengthText) return strengthText;
    if (score < 2) return 'Weak';
    if (score < 3) return 'Fair';
    if (score < 4) return 'Good';
    return 'Strong';
  };

  return (
    <Box>
      <ValidatedInput
        {...props}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              {props.showValidationIcon && props.validationState && (
                <ValidationIcon>
                  {props.validationState === 'success' && <CheckCircle color="success" />}
                  {props.validationState === 'error' && <Error color="error" />}
                  {props.validationState === 'warning' && <Warning color="warning" />}
                  {props.validationState === 'info' && <Info color="info" />}
                </ValidationIcon>
              )}
            </InputAdornment>
          ),
        }}
      />
      {showPasswordStrength && props.value && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color={`${getStrengthColor(strengthScore)}.main`}>
            Password strength: {getStrengthText(strengthScore)}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 4,
              bgcolor: 'grey.300',
              borderRadius: 2,
              mt: 0.5,
            }}
          >
            <Box
              sx={{
                width: `${(strengthScore / 4) * 100}%`,
                height: '100%',
                bgcolor: `${getStrengthColor(strengthScore)}.main`,
                borderRadius: 2,
                transition: 'width 0.3s ease, background-color 0.3s ease',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

/**
 * Validation summary component
 */
export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  touched = {},
  title = 'Please fix the following errors:',
  showOnlyTouched = true,
  maxErrors = 10,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field, error]) =>
      error && (!showOnlyTouched || touched[field])
  );

  const displayErrors = errorEntries.slice(0, maxErrors);
  const remainingCount = errorEntries.length - maxErrors;

  if (displayErrors.length === 0) {
    return null;
  }

  return (
    <Fade in={displayErrors.length > 0}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {displayErrors.map(([field, error]) => (
            <Typography
              key={field}
              component="li"
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              {error}
            </Typography>
          ))}
          {remainingCount > 0 && (
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 0.5, fontStyle: 'italic' }}
            >
              ...and {remainingCount} more error{remainingCount === 1 ? '' : 's'}
            </Typography>
          )}
        </Box>
      </Alert>
    </Fade>
  );
};

/**
 * Field validation indicator chip
 */
export const ValidationChip: React.FC<{
  state: 'success' | 'error' | 'warning' | 'info';
  label: string;
  size?: 'small' | 'medium';
}> = ({ state, label, size = 'small' }) => {
  const getIcon = () => {
    switch (state) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={label}
      size={size}
      color={state === 'success' ? 'success' : state === 'error' ? 'error' : 'default'}
      variant={state === 'success' ? 'filled' : 'outlined'}
    />
  );
};

/**
 * Real-time validation status indicator
 */
export const ValidationStatus: React.FC<{
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
  validationText?: string;
}> = ({ isValid, isDirty, hasErrors, validationText }) => {
  if (!isDirty) {
    return null;
  }

  return (
    <Fade in={isDirty}>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {isValid ? (
          <>
            <CheckCircle color="success" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="caption" color="success.main">
              {validationText || 'All fields are valid'}
            </Typography>
          </>
        ) : (
          <>
            <Error color="error" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="caption" color="error.main">
              {validationText || 'Please fix validation errors'}
            </Typography>
          </>
        )}
      </Box>
    </Fade>
  );
};

const ValidationComponents = {
  ValidatedInput,
  ValidatedSelect,
  PasswordField,
  ValidationSummary,
  ValidationChip,
  ValidationStatus,
};

export default ValidationComponents;