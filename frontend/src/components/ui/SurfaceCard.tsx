import React from 'react';
import { Card, CardContent, CardProps } from '@mui/material';

import { surfaceCardContentSx, surfaceCardSx } from '../../theme/sxHelpers';

interface SurfaceCardProps extends Omit<CardProps, 'variant'> {
  variantStyle?: 'default' | 'subtle' | 'elevated';
  contentSx?: CardProps['sx'];
  children: React.ReactNode;
}

const SurfaceCard: React.FC<SurfaceCardProps> = ({
  variantStyle = 'default',
  contentSx,
  children,
  sx,
  ...cardProps
}) => {
  return (
    <Card elevation={0} sx={{ ...surfaceCardSx(variantStyle), ...sx }} {...cardProps}>
      <CardContent sx={{ ...surfaceCardContentSx, ...contentSx }}>{children}</CardContent>
    </Card>
  );
};

export default SurfaceCard;