import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * Premium styled TextField component for forms
 * Features gold border, cream background, and uppercase labels to match PremiumDisplayField
 */
const PremiumTextField: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...props}
      variant="outlined"
      InputLabelProps={{
        ...props.InputLabelProps,
        sx: {
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: '#666',
          '&.Mui-focused': {
            color: '#B8860B',
            fontWeight: 600,
          },
          ...props.InputLabelProps?.sx,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fafafa',
          borderRadius: '4px',
          '& fieldset': {
            borderColor: '#e0e0e0',
            borderWidth: '1px',
            borderLeftWidth: '2px',
            borderLeftColor: '#E8B86D',
          },
          '&:hover fieldset': {
            borderColor: '#d0d0d0',
            borderLeftWidth: '2px',
            borderLeftColor: '#E8B86D',
          },
          '&.Mui-focused': {
            backgroundColor: '#fffef8',
            '& fieldset': {
              borderColor: '#E8B86D',
              borderWidth: '1px',
              borderLeftWidth: '2px',
              borderLeftColor: '#E8B86D',
            },
          },
          '&.Mui-disabled': {
            backgroundColor: '#e8e8e8',
            '& fieldset': {
              borderColor: '#d0d0d0',
              borderWidth: '1px',
              borderLeftWidth: '2px',
              borderLeftColor: '#E8B86D',
            },
            '& input': {
              color: '#666',
              WebkitTextFillColor: '#666',
            },
            '& textarea': {
              color: '#666',
              WebkitTextFillColor: '#666',
            },
          },
          '&.Mui-error fieldset': {
            borderLeftColor: '#d32f2f',
          },
          '& input': {
            color: '#333',
          },
          '& textarea': {
            color: '#333',
          },
        },
        '& .MuiInputLabel-root': {
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: '#666',
          '&.Mui-focused': {
            color: '#B8860B',
            fontWeight: 600,
          },
        },
        ...props.sx,
      }}
    />
  );
};

export default PremiumTextField;
