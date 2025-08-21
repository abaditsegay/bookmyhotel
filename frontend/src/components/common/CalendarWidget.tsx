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
import { useAuth } from '../../contexts/AuthContext';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Mock events based on user role - in real app, fetch from API
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [];
    const today = new Date();
    
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
    } else if (user?.roles?.includes('GUEST')) {
      mockEvents.push(
        {
          id: '7',
          title: 'Hotel Reservation',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
          type: 'booking',
          description: 'Grand Hotel - 3 nights'
        },
        {
          id: '8',
          title: 'Flight Departure',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
          type: 'reminder',
          description: 'Pack bags, check-in online'
        }
      );
    }
    
    setEvents(mockEvents);
  }, [user]);

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'booking': return theme.palette.primary.main;
      case 'checkin': return theme.palette.success.main;
      case 'checkout': return theme.palette.warning.main;
      case 'maintenance': return theme.palette.error.main;
      case 'meeting': return theme.palette.info.main;
      case 'reminder': return theme.palette.secondary.main;
      default: return theme.palette.grey[500];
    }
  };

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
      elevation={1}
      sx={{
        p: 1,
        height: 'fit-content',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Month Navigation Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          p: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <IconButton 
          size="small" 
          onClick={() => navigateMonth('prev')}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
          }}
        >
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: theme.palette.text.primary,
          textAlign: 'center',
          fontSize: '0.95rem',
        }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={() => navigateMonth('next')}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
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
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Box
              key={day}
              sx={{
                flex: 1,
                py: 1,
                textAlign: 'center',
                borderRight: index < 6 
                  ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                  : 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
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
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            borderRadius: 1,
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
                  ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                  : 'none',
              }}
            >
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                <Box
                  key={dayIndex}
                  onClick={() => date && setSelectedDate(date)}
                  sx={{
                    flex: 1,
                    minHeight: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: date ? 'pointer' : 'default',
                    borderRight: dayIndex < 6 
                      ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                      : 'none',
                    backgroundColor: date ? (
                      isSelected(date) 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : isToday(date) 
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : 'transparent'
                    ) : alpha(theme.palette.grey[300], 0.1),
                    transition: 'all 0.2s ease',
                    '&:hover': date ? {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    } : {},
                  }}
                >
                  {date && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday(date) ? 700 : isSelected(date) ? 600 : 400,
                          color: isToday(date)
                            ? theme.palette.secondary.main
                            : isSelected(date)
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                          fontSize: '0.9rem',
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
                              color: theme.palette.text.secondary,
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
