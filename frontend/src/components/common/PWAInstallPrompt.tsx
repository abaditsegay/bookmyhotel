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
  onPermanentDismiss?: () => void;
  deviceType?: 'ios' | 'android';
  onInstall?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  open, 
  onClose, 
  onPermanentDismiss,
  deviceType, 
  onInstall 
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device types
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/i.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsAndroid(android);
  }, []);

  const iosSteps = [
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

  const androidSteps = [
    {
      label: 'Tap the menu button',
      description: 'Look for the three-dot menu in your browser',
      icon: <ShareIcon />,
    },
    {
      label: 'Find "Add to Home screen" or "Install app"',
      description: 'Look for the install option in the menu',
      icon: <AddIcon />,
    },
    {
      label: 'Confirm installation',
      description: 'Tap "Add" or "Install" to install BookMyHotel',
      icon: <GetAppIcon />,
    },
  ];

  const currentDevice = deviceType || (isIOS ? 'ios' : isAndroid ? 'android' : 'ios');
  const steps = currentDevice === 'ios' ? iosSteps : androidSteps;

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
        {currentDevice === 'android' && onInstall ? (
          <Box>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <GetAppIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 2 }}>
                Install BookMyHotel as an app for quick access and a native experience!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={onInstall}
                startIcon={<GetAppIcon />}
                sx={{ mb: 2 }}
              >
                Install App
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              If the above button doesn't work, try these steps:
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
        ) : currentDevice === 'ios' ? (
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
              Install BookMyHotel as an app for quick access and a better experience!
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary" fullWidth>
          Got it!
        </Button>
        {onPermanentDismiss && (
          <Button 
            onClick={onPermanentDismiss} 
            variant="text" 
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            Don't show this again
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;
