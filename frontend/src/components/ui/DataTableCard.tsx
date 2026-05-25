import React from 'react';
import { Box, Stack, SxProps, TableContainer, Theme, Typography } from '@mui/material';

import SurfaceCard from './SurfaceCard';

interface DataTableCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  pagination?: React.ReactNode;
  variantStyle?: 'default' | 'subtle' | 'elevated';
  tableContainerSx?: SxProps<Theme>;
}

const DataTableCard: React.FC<DataTableCardProps> = ({
  title,
  description,
  actions,
  filters,
  children,
  pagination,
  variantStyle = 'elevated',
  tableContainerSx,
}) => {
  const hasHeader = Boolean(title || description || actions);

  return (
    <SurfaceCard variantStyle={variantStyle} contentSx={{ p: 0 }}>
      {hasHeader && (
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2, md: 2.5 },
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'center' }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {description}
                </Typography>
              )}
            </Box>
            {actions && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', lg: 'auto' } }}>
                {actions}
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {filters && (
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2, md: 2.5 },
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            backgroundColor: theme => theme.palette.background.default,
          }}
        >
          {filters}
        </Box>
      )}

      <TableContainer sx={{ ...tableContainerSx }}>{children}</TableContainer>

      {pagination && (
        <Box sx={{ borderTop: theme => `1px solid ${theme.palette.divider}` }}>
          {pagination}
        </Box>
      )}
    </SurfaceCard>
  );
};

export default DataTableCard;