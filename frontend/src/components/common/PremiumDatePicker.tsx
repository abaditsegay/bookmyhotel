import React from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCalendarStore } from '../../contexts/store';
import { EthDatePicker } from './EthDatePickers';

const PremiumDatePicker: React.FC<DatePickerProps<Date>> = (props) => {
  const textFieldProps = props.slotProps?.textField;
  const existingSx = typeof textFieldProps === 'object' && 'sx' in textFieldProps ? textFieldProps.sx : {};
  const { calendarType } = useCalendarStore();

  const commonProps = {
    ...props,
    slotProps: {
      ...props.slotProps,
      textField: {
        fullWidth: true,
        sx: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fafafa',
            borderLeft: '2px solid #E8B86D',
            borderRadius: '4px',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#bdbdbd',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#fafafa',
              '& fieldset': {
                borderColor: '#E8B86D',
                borderWidth: '1px',
              },
            },
            '&.Mui-disabled': {
              backgroundColor: '#e8e8e8',
              borderLeft: '2px solid #E8B86D',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#666',
          },
          '& .MuiInputLabel-root.Mui-disabled': {
            color: '#999',
          },
          '& .MuiInputBase-input': {
            color: '#333',
            fontSize: '0.875rem',
          },
          '& .MuiInputBase-input.Mui-disabled': {
            color: '#666',
            WebkitTextFillColor: '#666',
          },
          ...existingSx,
        },
      },
    }
  };

  if (calendarType === 'ethiopian') {
    return (
      <EthDatePicker {...commonProps} />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker {...commonProps} />
    </LocalizationProvider>
  );
};

export default PremiumDatePicker;
