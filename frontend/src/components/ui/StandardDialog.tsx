import React from 'react';
import {
  alpha,
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
import { composeSx, surfaceCardSx } from '../../theme/sxHelpers';

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
      BackdropProps={{
        sx: theme => ({
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha('#020617', 0.76)
            : alpha('#0f172a', 0.38),
          backdropFilter: 'blur(8px)',
        }),
      }}
      PaperProps={{
        ...PaperProps,
        sx: composeSx(
          surfaceCardSx('default'),
          {
            boxShadow: theme => theme.shadows[10],
            backgroundColor: theme => theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.98)
              : alpha(theme.palette.background.paper, 0.995),
            backdropFilter: 'none',
          },
          PaperProps?.sx,
        ),
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