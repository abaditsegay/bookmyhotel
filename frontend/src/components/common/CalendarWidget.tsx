import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/themeColors';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'booking' | 'maintenance' | 'meeting' | 'reminder' | 'checkout' | 'checkin';
  color?: string;
  description?: string;
}

const CalendarWidget: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Check if user has access to Calendar functionality
  // CUSTOMER and GUEST roles should not have access to calendar
  const hasAccess = user?.roles && 
    !user.roles.includes('CUSTOMER') && 
    !user.roles.includes('GUEST');

  // Get event type color based on theme
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'booking': return theme.palette.primary.main;
      case 'checkin': return theme.palette.primary.dark;
      case 'checkout': return theme.palette.primary.light;
      case 'maintenance': return theme.palette.primary.main;
      case 'meeting': return theme.palette.primary.dark;
      case 'reminder': return theme.palette.primary.light;
      default: return theme.palette.primary.light;
    }
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Mock events based on user role - in real app, fetch from API
  useEffect(() => {
    if (!hasAccess) return;
    
    const mockEvents: CalendarEvent[] = [];
    const today = new Date();
    
    // Only show calendar events for staff roles, not for CUSTOMER or GUEST roles
    if (user?.roles?.includes('HOTEL_ADMIN')) {
      mockEvents.push(
        {
          id: '1',
          title: 'Room 101 Check-in',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          type: 'checkin',
          description: 'Guest: John Smith'
        },
        {
          id: '2',
          title: 'Room 205 Check-out',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          type: 'checkout',
          description: 'Guest: Jane Doe'
        },
        {
          id: '3',
          title: 'AC Maintenance',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          type: 'maintenance',
          description: 'Room 301 - Annual service'
        },
        {
          id: '4',
          title: 'Staff Meeting',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
          type: 'meeting',
          description: 'Monthly team sync'
        }
      );
    } else if (user?.roles?.includes('FRONTDESK')) {
      mockEvents.push(
        {
          id: '5',
          title: 'Check-ins Today: 8',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          type: 'checkin',
          description: 'Review guest arrivals'
        },
        {
          id: '6',
          title: 'Check-outs Today: 5',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          type: 'checkout',
          description: 'Process departures'
        }
      );
    }
    // Removed GUEST and CUSTOMER calendar events - they should not have access to calendar
    
    setEvents(mockEvents);
  }, [user, hasAccess]);

  // If user doesn't have access, don't render the widget
  if (!hasAccess) {
    return null;
  }

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date has events
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const calendarDays = getCalendarDays();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 0,
        height: 'fit-content',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 'auto',
        background: 'linear-gradient(140deg, #3c73aa 0%, #4a85be 50%, #5a95ce 100%)',
        border: `1px solid ${alpha(COLORS.PRIMARY, 0.1)}`,
        boxShadow: '0 8px 18px rgba(0, 0, 0, 0.16)',
      }}
    >
      {/* Month Navigation Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          px: 2,
          background: `linear-gradient(135deg, ${alpha(COLORS.PRIMARY, 0.78)} 0%, ${alpha(COLORS.PRIMARY, 0.88)} 60%, ${COLORS.PRIMARY_HOVER} 100%)`,
          color: COLORS.WHITE,
          position: 'relative',
          borderBottom: `1px solid ${alpha(COLORS.PRIMARY_HOVER, 0.35)}`,
        }}
      >
        <IconButton 
          size="small" 
          onClick={() => navigateMonth('prev')}
          sx={{
            position: 'absolute',
            left: 8,
            color: COLORS.WHITE,
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.12),
            },
          }}
        >
          <ChevronLeft />
        </IconButton>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
              color: COLORS.WHITE,
            textAlign: 'center',
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={() => navigateMonth('next')}
          sx={{
            position: 'absolute',
            right: 8,
            color: COLORS.WHITE,
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.12),
            },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Weekday Headers */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.24)',
        }}
      >
          {[
            t('widgets.calendar.weekdays.sunday'),
            t('widgets.calendar.weekdays.monday'),
            t('widgets.calendar.weekdays.tuesday'),
            t('widgets.calendar.weekdays.wednesday'),
            t('widgets.calendar.weekdays.thursday'),
            t('widgets.calendar.weekdays.friday'),
            t('widgets.calendar.weekdays.saturday')
          ].map((day, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: 'center',
                borderRight: index < 6 ? '1px solid rgba(255, 255, 255, 0.22)' : 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: alpha(COLORS.WHITE, 0.85),
                  textTransform: 'uppercase',
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Table */}
        <Box
          sx={{
            overflow: 'hidden',
          }}
        >
          {/* Calendar Days in Table Format */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
            <Box
              key={weekIndex}
              sx={{
                display: 'flex',
                borderBottom: weekIndex < Math.ceil(calendarDays.length / 7) - 1 
                  ? '1px solid rgba(255, 255, 255, 0.22)'
                  : 'none',
              }}
            >
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                <Box
                  key={dayIndex}
                  onClick={() => date && setSelectedDate(date)}
                  sx={{
                    flex: 1,
                    minHeight: 45,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: date ? 'pointer' : 'default',
                    borderRight: dayIndex < 6 ? '1px solid rgba(255, 255, 255, 0.22)' : 'none',
                    backgroundColor: date ? (
                      isSelected(date) 
                        ? COLORS.PRIMARY
                        : isToday(date) 
                          ? alpha(COLORS.PRIMARY, 0.32)
                          : 'rgba(255, 255, 255, 0.12)'
                    ) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': date ? {
                      backgroundColor: isSelected(date) 
                        ? COLORS.PRIMARY_HOVER 
                        : alpha(COLORS.PRIMARY, 0.26),
                    } : {},
                  }}
                >
                  {date && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday(date) ? 700 : isSelected(date) ? 700 : 600,
                          color: isSelected(date) 
                            ? COLORS.WHITE
                            : isToday(date)
                            ? alpha(COLORS.WHITE, 0.9)
                            : alpha(COLORS.WHITE, 0.8),
                          fontSize: '1.05rem',
                          mb: 0.25,
                        }}
                      >
                        {date.getDate()}
                      </Typography>

                      {/* Event indicators - simple dots */}
                      <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {getEventsForDate(date).slice(0, 3).map((event, i) => (
                          <Tooltip key={event.id} title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: getEventTypeColor(event.type),
                                border: `1px solid ${alpha(getEventTypeColor(event.type), 0.7)}`,
                              }}
                            />
                          </Tooltip>
                        ))}
                        {getEventsForDate(date).length > 3 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: alpha(COLORS.WHITE, 0.7),
                              fontSize: '0.6rem',
                              ml: 0.25,
                            }}
                          >
                            +{getEventsForDate(date).length - 3}
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
    </Paper>
  );
};

export default CalendarWidget;
