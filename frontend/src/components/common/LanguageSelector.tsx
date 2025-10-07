import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  variant?: 'icon' | 'text';
  size?: 'small' | 'medium';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'icon',
  size = 'medium'
}) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguage = i18n.language || 'en';
  
  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'am', name: t('language.amharic'), flag: '🇪🇹' },
  ];

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'English';
  };

  const getCurrentLanguageFlag = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.flag : '🇺🇸';
  };

  if (variant === 'text') {
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={handleClick}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: size === 'small' ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              mr: 0.5,
            }}
          >
            {getCurrentLanguageFlag()}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: size === 'small' ? '0.75rem' : '0.875rem',
              fontWeight: 500,
            }}
          >
            {getCurrentLanguageName()}
          </Typography>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={currentLanguage === language.code}
              sx={{ minWidth: 140 }}
            >
              <Typography sx={{ mr: 1, fontSize: '1.1rem' }}>
                {language.flag}
              </Typography>
              <Typography variant="body2">
                {language.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  // Icon variant
  return (
    <Box>
      <Tooltip title={t('language.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          size={size}
          color="inherit"
          sx={{
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <LanguageIcon 
              sx={{ 
                fontSize: size === 'small' ? '1.25rem' : '1.5rem',
              }} 
            />
            <Typography
              sx={{
                position: 'absolute',
                fontSize: '0.6rem',
                fontWeight: 'bold',
                color: 'inherit',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                lineHeight: 1,
              }}
            >
              {currentLanguage.toUpperCase()}
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
            sx={{ minWidth: 140 }}
          >
            <Typography sx={{ mr: 1, fontSize: '1.1rem' }}>
              {language.flag}
            </Typography>
            <Typography variant="body2">
              {language.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;