import React from 'react';
import { Box, BoxProps, SxProps, Theme } from '@mui/material';

interface TabPanelProps extends Omit<BoxProps, 'children'> {
  children?: React.ReactNode;
  index: number;
  value: number;
  idPrefix?: string;
  contentSx?: SxProps<Theme>;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  index,
  value,
  idPrefix = 'tab',
  contentSx,
  ...props
}) => {
  const isActive = value === index;

  return (
    <Box
      component="section"
      role="tabpanel"
      hidden={!isActive}
      id={`${idPrefix}-tabpanel-${index}`}
      aria-labelledby={`${idPrefix}-tab-${index}`}
      {...props}
    >
      {isActive && <Box sx={contentSx}>{children}</Box>}
    </Box>
  );
};

export default TabPanel;