import React from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { alpha, useTheme } from '@mui/material';
import { getCalendarType, useCalendarStore } from '../../contexts/store';
import { EthDatePicker } from './EthDatePickers';
import { useTranslation } from 'react-i18next';
import { getColorScheme } from '../../theme/designSystem';

const PremiumDatePicker: React.FC<DatePickerProps<Date>> = (props) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const scheme = getColorScheme(theme.palette.mode === 'dark' ? 'dark' : 'light');
  const textFieldProps = props.slotProps?.textField;
  const existingSx = typeof textFieldProps === 'object' && 'sx' in textFieldProps ? textFieldProps.sx : {};
  const { calendarType } = useCalendarStore();
  const effectiveCalendarType = getCalendarType(i18n.language, calendarType);
  const borderColor = theme.palette.mode === 'dark' ? scheme.border.strong : scheme.border.input;
  const fieldBorderWidth = theme.palette.mode === 'dark' ? '1.5px' : '1px';

  const commonProps = {
    ...props,
    slotProps: {
      ...props.slotProps,
      textField: {
        fullWidth: true,
        sx: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: scheme.background.input,
            borderRadius: `${theme.shape.borderRadius}px`,
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor,
              borderWidth: fieldBorderWidth,
            },
            '&:hover fieldset': {
              borderColor: scheme.border.strong,
            },
            '&.Mui-focused': {
              backgroundColor: scheme.background.input,
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
              '& fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: fieldBorderWidth,
              },
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
              '& fieldset': {
                borderColor: scheme.border.default,
                borderWidth: '1px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.palette.text.secondary,
            fontSize: '0.82rem',
            fontWeight: 500,
            '&.Mui-focused': {
              color: `${theme.palette.primary.main} !important`,
              fontWeight: 600,
            },
          },
          '& .MuiInputLabel-root.Mui-disabled': {
            color: theme.palette.text.disabled,
          },
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            fontSize: '0.875rem',
          },
          '& .MuiInputBase-input.Mui-disabled': {
            color: theme.palette.text.disabled,
            WebkitTextFillColor: theme.palette.text.disabled,
          },
          ...existingSx,
        },
      },
    }
  };

  if (effectiveCalendarType === 'ethiopian') {
    return (
      <EthDatePicker key="eth" {...commonProps} />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker key="greg" {...commonProps} />
    </LocalizationProvider>
  );
};

export default PremiumDatePicker;
