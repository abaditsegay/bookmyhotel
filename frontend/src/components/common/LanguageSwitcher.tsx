import React from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Box, 
  Typography,
  useTheme 
} from '@mui/material';
import { 
  Language as LanguageIcon, 
  ExpandMore as ExpandMoreIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'button' | 'menu';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'inherit' | 'white'; // Add color prop for navbar usage
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'button',
  size = 'medium',
  color = 'primary'
}) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'en', name: t('language.english'), nativeName: 'English' },
    { code: 'am', name: t('language.amharic'), nativeName: 'አማርኛ' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
    
    // Store language preference
    localStorage.setItem('preferred-language', languageCode);
    
    // Update document direction for RTL languages if needed
    document.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
  };

  if (variant === 'menu') {
    return (
      <Box>
        <Button
          id="language-button"
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          startIcon={<LanguageIcon />}
          endIcon={<ExpandMoreIcon />}
          variant="outlined"
          size={size}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: 120,
            justifyContent: 'space-between',
            // Dynamic styling based on color prop
            ...(color === 'white' && {
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }),
            ...(color === 'inherit' && {
              color: 'inherit',
              borderColor: 'currentColor',
            }),
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {currentLanguage.nativeName}
          </Typography>
        </Button>
        <Menu
          id="language-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'language-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: 160,
              boxShadow: theme.shadows[3],
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === i18n.language}
              sx={{
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  color: theme.palette.primary.main,
                }
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {language.nativeName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {language.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {languages.map((language) => (
        <Button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          variant={language.code === i18n.language ? 'contained' : 'outlined'}
          size={size}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 80,
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          }}
        >
          {language.nativeName}
        </Button>
      ))}
    </Box>
  );
};

export default LanguageSwitcher;
