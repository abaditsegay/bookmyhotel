import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { 
  Home as HomeIcon,
  ArrowBack as BackIcon,
  SearchOff as NotFoundIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StandardError } from '../components/common';

/**
 * 404 Not Found page component
 * Displays when users navigate to non-existent routes
 */
const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ 
      mt: 4, 
      mb: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '60vh',
      justifyContent: 'center'
    }}>
      {/* Large 404 Icon */}
      <Box sx={{ 
        textAlign: 'center',
        mb: 4,
        opacity: 0.7
      }}>
        <NotFoundIcon sx={{ fontSize: 120, color: 'text.secondary' }} />
      </Box>

      {/* Error Display using StandardError */}
      <StandardError
        error={true}
        title={t('notFoundPage.title')}
        message={t('notFoundPage.message')}
        severity="info"
        showRetry={false}
      />

      {/* Action Buttons */}
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{ 
            minWidth: 120,
            height: '44px'
          }}
        >
          {t('notFoundPage.goHome')}
        </Button>

        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleGoBack}
          sx={{ 
            minWidth: 120,
            height: '44px'
          }}
        >
          {t('common.back')}
        </Button>
      </Box>

      {/* Additional Help Text */}
      <Box sx={{ 
        mt: 4,
        textAlign: 'center',
        maxWidth: 500
      }}>
        <Typography variant="body2" color="text.secondary">
          {t('notFoundPage.helpText')}
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;