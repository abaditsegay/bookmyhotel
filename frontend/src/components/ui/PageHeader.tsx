import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

import { pageHeaderActionsSx, pageHeaderContentSx } from '../../theme/sxHelpers';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, eyebrow, actions }) => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }}>
      <Box sx={pageHeaderContentSx}>
        {eyebrow && (
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={pageHeaderActionsSx}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export default PageHeader;