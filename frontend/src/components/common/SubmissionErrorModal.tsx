import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface SubmissionErrorModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const SubmissionErrorModal: React.FC<SubmissionErrorModalProps> = ({
  open,
  title,
  message,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="submission-error-dialog-title"
      aria-describedby="submission-error-dialog-description"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="submission-error-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity="error" variant="outlined">
            <Typography id="submission-error-dialog-description" variant="body1">
              {message}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionErrorModal;