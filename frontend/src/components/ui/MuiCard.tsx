import React from 'react';
import { CardProps as MuiCardProps } from '@mui/material';

import StandardCard from '../common/StandardCard';

interface CardProps extends Omit<MuiCardProps, 'variant'> {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Remove default padding from content */
  noPadding?: boolean;
  /** Card visual variant */
  cardVariant?: 'default' | 'outlined' | 'elevated';
  /** Loading state */
  loading?: boolean;
}

const Card: React.FC<CardProps> = (props) => {
  return <StandardCard {...props} />;
};

export default Card;