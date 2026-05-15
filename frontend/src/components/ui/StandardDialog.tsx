import React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

interface StandardDialogProps extends Omit<DialogProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  contentSx?: SxProps<Theme>;
}

const StandardDialog: React.FC<StandardDialogProps> = ({
  title,
  description,
  actions,
  children,
  contentSx,
  PaperProps,
  ...dialogProps
}) => {
  return (
    <Dialog
      PaperProps={{
        ...PaperProps,
        sx: {
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: theme => theme.shadows[12],
          ...PaperProps?.sx,
        },
      }}
      {...dialogProps}
    >
      <DialogTitle
        sx={{
          px: { xs: 2.5, md: 3 },
          py: { xs: 2, md: 2.5 },
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 }, ...contentSx }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            borderTop: theme => `1px solid ${theme.palette.divider}`,
            gap: 1.5,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StandardDialog;