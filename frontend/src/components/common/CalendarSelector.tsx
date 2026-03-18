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
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCalendarStore, CalendarType } from '../../contexts/store';

interface CalendarSelectorProps {
  variant?: 'icon' | 'text';
  size?: 'small' | 'medium';
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ 
  variant = 'icon',
  size = 'medium'
}) => {
  const { t } = useTranslation();
  const { calendarType, setCalendarType } = useCalendarStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCalendarChange = (type: CalendarType) => {
    setCalendarType(type);
    handleClose();
  };

  const calendars: { type: CalendarType; name: string; shortName: string }[] = [
    { type: 'ethiopian', name: 'Ethiopian Calendar', shortName: 'EC' },
    { type: 'gregorian', name: 'Gregorian Calendar', shortName: 'GC' },
  ];

  const currentCalendar = calendars.find(c => c.type === calendarType) || calendars[0];

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
          <CalendarIcon sx={{ mr: 0.5, fontSize: size === 'small' ? '1.25rem' : '1.5rem' }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: size === 'small' ? '0.75rem' : '0.875rem',
              fontWeight: 500,
            }}
          >
            {currentCalendar.name}
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
          {calendars.map((calendar) => (
            <MenuItem
              key={calendar.type}
              onClick={() => handleCalendarChange(calendar.type)}
              selected={calendarType === calendar.type}
              sx={{ minWidth: 140 }}
            >
              <Typography variant="body2">
                {calendar.name}
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
      <Tooltip title="Change Calendar">
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
            <CalendarIcon 
              sx={{ 
                fontSize: size === 'small' ? '1.25rem' : '1.5rem',
              }} 
            />
            <Typography
              sx={{
                position: 'absolute',
                fontSize: '0.55rem',
                fontWeight: 'bold',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -20%)',
                lineHeight: 1,
                bgcolor: 'background.paper',
                color: 'text.primary',
                px: 0.2,
                borderRadius: 0.5,
                opacity: 0.9,
              }}
            >
              {currentCalendar.shortName}
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
        {calendars.map((calendar) => (
          <MenuItem
            key={calendar.type}
            onClick={() => handleCalendarChange(calendar.type)}
            selected={calendarType === calendar.type}
            sx={{ minWidth: 140 }}
          >
            <Typography variant="body2">
              {calendar.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CalendarSelector;
