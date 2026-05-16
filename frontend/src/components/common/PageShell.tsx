import React from 'react';
import {
  Box,
  BoxProps,
  Card,
  CardContent,
  CardProps,
  Container,
  ContainerProps,
  SxProps,
  Theme,
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { surfaceCardContentSx, surfaceCardSx } from '../../theme/sxHelpers';

interface PageContainerProps extends Omit<ContainerProps, 'children'> {
  children: React.ReactNode;
  gap?: number;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
  disableGutters = false,
  gap,
  sx,
  ...props
}) => {
  const standardGap = gap ?? designSystem.layout.sectionGap.md;

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={maxWidth === false ? true : disableGutters}
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: {
          xs: designSystem.layout.sectionGap.xs,
          md: standardGap,
        },
        py: designSystem.layout.pagePaddingY,
        pb: designSystem.layout.pagePaddingBottom,
        ...(maxWidth === false && {
          maxWidth: 'none',
          width: '100%',
          px: designSystem.layout.pagePaddingX,
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export const PageSection: React.FC<BoxProps> = ({ children, sx, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: designSystem.layout.sectionGap,
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

interface SurfaceCardProps extends Omit<CardProps, 'children'> {
  children: React.ReactNode;
  contentSx?: SxProps<Theme>;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  sx,
  contentSx,
  ...props
}) => (
  <Card
    elevation={0}
    sx={[surfaceCardSx('elevated'), sx]}
    {...props}
  >
    <CardContent
      sx={[surfaceCardContentSx, {
        '&:last-child': {
          pb: designSystem.layout.cardPadding,
        },
      }, contentSx]}
    >
      {children}
    </CardContent>
  </Card>
);