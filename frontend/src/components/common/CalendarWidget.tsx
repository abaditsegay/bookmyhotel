import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
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
import { useCalendarStore } from '../../contexts/store';
import { gregorianToEthiopian, ethiopianToGregorian } from '../../utils/ethiopianCalendar';
import { COLORS, addAlpha } from '../../theme/themeColors';

/* ─── Ethiopian month names ─── */
const ETH_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር',
  'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ',
  'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];
const ETH_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir',
  'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene',
  'Hamle', 'Nehase', 'Pagume',
];

function daysInEthMonth(month: number, year: number): number {
  if (month <= 12) return 30;
  return year % 4 === 3 ? 6 : 5;
}

function ethiopianToGregorianDate(eY: number, eM: number, eD: number): Date {
  const [gY, gM, gD] = ethiopianToGregorian(eY, eM, eD);
  return new Date(gY, gM - 1, gD);
}

function gregorianToEth(d: Date): [number, number, number] {
  return gregorianToEthiopian(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function firstDayOfWeekEth(eYear: number, eMonth: number): number {
  const [gY, gM, gD] = ethiopianToGregorian(eYear, eMonth, 1);
  return new Date(gY, gM - 1, gD).getDay();
}

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
  const { t, i18n } = useTranslation();
  const { calendarType } = useCalendarStore();
  const isEthiopian = calendarType === 'ethiopian';
  const lang = i18n.language === 'am' ? 'am' : 'en';
  const ethMonths = lang === 'am' ? ETH_MONTHS_AM : ETH_MONTHS_EN;

  // Gregorian view state
  const [currentDate, setCurrentDate] = useState(new Date());
  // Ethiopian view state
  const today = new Date();
  const [todayEY, todayEM] = gregorianToEth(today);
  const [ethViewYear, setEthViewYear] = useState(todayEY);
  const [ethViewMonth, setEthViewMonth] = useState(todayEM);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const hasAccess = user?.roles &&
    !user.roles.includes('CUSTOMER') &&
    !user.roles.includes('GUEST');

  useEffect(() => {
    if (!hasAccess) return;
    const mockEvents: CalendarEvent[] = [];
    const today = new Date();
    if (user?.roles?.includes('HOTEL_ADMIN')) {
      mockEvents.push(
        { id: '1', title: 'Room 101 Check-in', date: new Date(today.getFullYear(), today.getMonth(), today.getDate()), type: 'checkin', description: 'Guest: John Smith' },
        { id: '2', title: 'Room 205 Check-out', date: new Date(today.getFullYear(), today.getMonth(), today.getDate()), type: 'checkout', description: 'Guest: Jane Doe' },
        { id: '3', title: 'AC Maintenance', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), type: 'maintenance', description: 'Room 301' },
        { id: '4', title: 'Staff Meeting', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), type: 'meeting', description: 'Monthly sync' },
      );
    } else if (user?.roles?.includes('FRONTDESK')) {
      mockEvents.push(
        { id: '5', title: 'Check-ins Today: 8', date: new Date(today.getFullYear(), today.getMonth(), today.getDate()), type: 'checkin' },
        { id: '6', title: 'Check-outs Today: 5', date: new Date(today.getFullYear(), today.getMonth(), today.getDate()), type: 'checkout' },
      );
    }
    setEvents(mockEvents);
  }, [user, hasAccess]);

  if (!hasAccess) return null;

  /* ── Gregorian helpers ── */
  const getGregorianDays = (): (Date | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const navigateGregorian = (dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (dir === 'next' ? 1 : -1));
      return d;
    });
  };

  /* ── Ethiopian helpers ── */
  const getEthiopianDays = (): (number | null)[] => {
    const days = daysInEthMonth(ethViewMonth, ethViewYear);
    const startDay = firstDayOfWeekEth(ethViewYear, ethViewMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  };

  const navigateEthiopian = (dir: 'prev' | 'next') => {
    if (dir === 'next') {
      if (ethViewMonth === 13) { setEthViewMonth(1); setEthViewYear(ethViewYear + 1); }
      else setEthViewMonth(ethViewMonth + 1);
    } else {
      if (ethViewMonth === 1) { setEthViewMonth(13); setEthViewYear(ethViewYear - 1); }
      else setEthViewMonth(ethViewMonth - 1);
    }
  };

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const isSelected = (date: Date) => selectedDate
    ? date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear()
    : false;

  const isEthToday = (day: number) => day === gregorianToEth(new Date())[2] && ethViewMonth === todayEM && ethViewYear === todayEY;
  const isEthSelected = (day: number) => {
    if (!selectedDate) return false;
    const [sY, sM, sD] = gregorianToEth(selectedDate);
    return sD === day && sM === ethViewMonth && sY === ethViewYear;
  };

  const weekdayLabels = [
    t('widgets.calendar.weekdays.sunday'),
    t('widgets.calendar.weekdays.monday'),
    t('widgets.calendar.weekdays.tuesday'),
    t('widgets.calendar.weekdays.wednesday'),
    t('widgets.calendar.weekdays.thursday'),
    t('widgets.calendar.weekdays.friday'),
    t('widgets.calendar.weekdays.saturday'),
  ];

  // Header label
  const headerLabel = isEthiopian
    ? `${ethMonths[ethViewMonth - 1]} ${ethViewYear}`
    : currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const onNavigate = (dir: 'prev' | 'next') =>
    isEthiopian ? navigateEthiopian(dir) : navigateGregorian(dir);

  const gregorianDays = isEthiopian ? [] : getGregorianDays();
  const ethiopianDays = isEthiopian ? getEthiopianDays() : [];
  const cells = isEthiopian ? ethiopianDays : gregorianDays;

  const cellDay = (cell: Date | number | null): number | null => {
    if (cell === null) return null;
    if (typeof cell === 'number') return cell;
    return cell.getDate();
  };

  const isCellToday = (cell: Date | number | null): boolean => {
    if (!cell) return false;
    if (isEthiopian && typeof cell === 'number') return isEthToday(cell);
    if (!isEthiopian && cell instanceof Date) return isToday(cell);
    return false;
  };

  const isCellSelected = (cell: Date | number | null): boolean => {
    if (!cell) return false;
    if (isEthiopian && typeof cell === 'number') return isEthSelected(cell);
    if (!isEthiopian && cell instanceof Date) return isSelected(cell);
    return false;
  };

  const handleCellClick = (cell: Date | number | null) => {
    if (!cell) return;
    if (isEthiopian && typeof cell === 'number') {
      setSelectedDate(ethiopianToGregorianDate(ethViewYear, ethViewMonth, cell));
    } else if (cell instanceof Date) {
      setSelectedDate(cell);
    }
  };

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
        background: `linear-gradient(140deg, ${COLORS.WHITE} 0%, ${addAlpha(COLORS.PRIMARY, 0.06)} 55%, ${addAlpha(COLORS.PRIMARY, 0.12)} 100%)`,
        border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
        boxShadow: `0 10px 22px ${addAlpha(COLORS.PRIMARY, 0.08)}`,
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
          background: `linear-gradient(135deg, ${alpha(COLORS.PRIMARY, 0.12)} 0%, ${alpha(COLORS.PRIMARY, 0.18)} 60%, ${alpha(COLORS.PRIMARY, 0.16)} 100%)`,
          color: COLORS.PRIMARY,
          position: 'relative',
          borderBottom: `1px solid ${alpha(COLORS.PRIMARY, 0.14)}`,
        }}
      >
        <IconButton
          size="small"
          onClick={() => onNavigate('prev')}
          sx={{ position: 'absolute', left: 8, color: COLORS.PRIMARY, '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.08) } }}
        >
          <ChevronLeft />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: COLORS.PRIMARY,
            textAlign: 'center',
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {headerLabel}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onNavigate('next')}
          sx={{ position: 'absolute', right: 8, color: COLORS.PRIMARY, '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.08) } }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Weekday Headers */}
      <Box sx={{ display: 'flex', backgroundColor: COLORS.SLATE_50, borderBottom: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}` }}>
        {weekdayLabels.map((day, index) => (
          <Box
            key={index}
            sx={{ flex: 1, py: 1.5, textAlign: 'center', borderRight: index < 6 ? `1px solid ${alpha(COLORS.PRIMARY, 0.06)}` : 'none' }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.75rem', fontWeight: 600, color: alpha(COLORS.PRIMARY, 0.9), textTransform: 'uppercase' }}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ overflow: 'hidden' }}>
        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: 'flex',
              borderBottom: weekIndex < Math.ceil(cells.length / 7) - 1
                ? `1px solid ${alpha(COLORS.PRIMARY, 0.06)}`
                : 'none',
            }}
          >
            {cells.slice(weekIndex * 7, (weekIndex + 1) * 7).map((cell, dayIndex) => {
              const today = isCellToday(cell);
              const selected = isCellSelected(cell);
              const day = cellDay(cell);
              return (
                <Box
                  key={dayIndex}
                  onClick={() => handleCellClick(cell)}
                  sx={{
                    flex: 1,
                    minHeight: 45,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: cell ? 'pointer' : 'default',
                    borderRight: dayIndex < 6 ? `1px solid ${alpha(COLORS.PRIMARY, 0.06)}` : 'none',
                    backgroundColor: cell
                      ? selected
                        ? alpha(COLORS.PRIMARY, 0.18)
                        : today
                          ? alpha(COLORS.PRIMARY, 0.12)
                          : alpha(COLORS.PRIMARY, 0.04)
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': cell ? {
                      backgroundColor: selected
                        ? alpha(COLORS.PRIMARY, 0.22)
                        : alpha(COLORS.PRIMARY, 0.14),
                    } : {},
                  }}
                >
                  {day !== null && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: today || selected ? 700 : 600,
                        color: selected
                          ? COLORS.PRIMARY
                          : today
                            ? alpha(COLORS.PRIMARY, 0.9)
                            : alpha(COLORS.PRIMARY, 0.78),
                        fontSize: '1.05rem',
                        mb: 0.25,
                      }}
                    >
                      {day}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CalendarWidget;
