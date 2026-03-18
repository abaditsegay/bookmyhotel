import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { saveLanguage, getCurrentLanguage, isSupportedLanguage } from '../../utils/languageUtils';
import { useCalendarStore } from '../../contexts/store';

interface LanguageSelectorProps {
  variant?: 'icon' | 'text';
  size?: 'small' | 'medium';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'icon',
  size = 'medium'
}) => {
  const { i18n, t } = useTranslation();
  const { setCalendarType } = useCalendarStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Ensure language is properly initialized on mount
  useEffect(() => {
    const savedLanguage = getCurrentLanguage();
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    // Validate language code
    if (!isSupportedLanguage(languageCode)) {
      return;
    }
    
    // Change language and persist it
    i18n.changeLanguage(languageCode);
    saveLanguage(languageCode);
    
    // Auto-switch calendar: Amharic → Ethiopian, others → Gregorian
    setCalendarType(languageCode === 'am' ? 'ethiopian' : 'gregorian');
    
    handleClose();
  };

  const currentLanguage = i18n.language || 'en';
  
  const languages = [
    { code: 'en', abbr: 'EN', name: t('language.english') },
    { code: 'am', abbr: 'AM', name: t('language.amharic') },
    { code: 'om', abbr: 'OR', name: t('language.oromo') },
  ];

  const getCurrentAbbr = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.abbr : 'EN';
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'English';
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
              fontWeight: 700,
              mr: 0.5,
            }}
          >
            {getCurrentAbbr()}
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
              <Typography sx={{ mr: 1.5, fontWeight: 700, fontSize: '0.85rem', minWidth: 24 }}>
                {language.abbr}
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

  // Icon variant — shows language abbreviation (EN, AM, OR) as a button
  return (
    <Box>
      <Tooltip title={t('language.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          size={size}
          color="inherit"
          sx={{
            borderRadius: 2,
            px: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <Typography
            sx={{
              fontSize: size === 'small' ? '0.8rem' : '0.9rem',
              fontWeight: 700,
              color: 'inherit',
              lineHeight: 1,
              letterSpacing: '0.05em',
            }}
          >
            {getCurrentAbbr()}
          </Typography>
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
            sx={{ minWidth: 160 }}
          >
            <Typography sx={{ mr: 1.5, fontWeight: 700, fontSize: '0.85rem', minWidth: 24 }}>
              {language.abbr}
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