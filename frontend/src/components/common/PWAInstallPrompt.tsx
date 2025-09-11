import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Share as ShareIcon,
  Add as AddIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';

interface PWAInstallPromptProps {
  open: boolean;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ open, onClose }) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  const steps = [
    {
      label: 'Tap the Share button',
      description: 'Look for the share icon at the bottom of your screen',
      icon: <ShareIcon />,
    },
    {
      label: 'Find "Add to Home Screen"',
      description: 'Scroll through the options and tap "Add to Home Screen"',
      icon: <AddIcon />,
    },
    {
      label: 'Confirm installation',
      description: 'Tap "Add" to install BookMyHotel as an app',
      icon: <GetAppIcon />,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Install BookMyHotel App
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isIOS ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Add BookMyHotel to your iPhone's home screen for quick access and a native app experience!
            </Typography>
            
            <Stepper orientation="vertical">
              {steps.map((step, index) => (
                <Step key={index} active>
                  <StepLabel
                    icon={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                        }}
                      >
                        {step.icon}
                      </Box>
                    }
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        ) : (
          <Box textAlign="center">
            <GetAppIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1">
              Your browser should have prompted you to install BookMyHotel as an app. 
              If not, look for the "Install" or "Add to Home Screen" option in your browser menu.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;
