import React from 'react';
import { ButtonProps as MuiButtonProps } from '@mui/material';

import StandardButton from '../common/StandardButton';

interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  /** Button size following design system */
  size?: 'small' | 'medium' | 'large';
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display before text */
  startIcon?: React.ReactNode;
  /** Icon to display after text */
  endIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ size = 'medium', ...props }) => {
  return <StandardButton buttonSize={size} {...props} />;
};

export { Button };
export default Button;