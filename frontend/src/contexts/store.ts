import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalendarType = 'ethiopian' | 'gregorian';

function isAmharicLanguage(language?: string): boolean {
  return (language || '').toLowerCase().startsWith('am');
}

interface CalendarState {
  calendarType: CalendarType;
  setCalendarType: (type: CalendarType) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      calendarType: 'ethiopian',
      setCalendarType: (calendarType) => set({ calendarType }),
    }),
    { name: 'calendar-v2' }
  )
);

/** Read calendar preference without React hooks (for utility functions). */
export function getStoredCalendarType(): CalendarType {
  try {
    const raw = localStorage.getItem('calendar-v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.calendarType || 'ethiopian';
    }
  } catch { /* ignore */ }
  return 'ethiopian';
}

/**
 * Resolve the active calendar from the current language plus any stored preference.
 * English and Oromo always use Gregorian. Amharic may use either calendar.
 */
export function getCalendarType(language?: string, preferredCalendarType?: CalendarType): CalendarType {
  if (!isAmharicLanguage(language)) {
    return 'gregorian';
  }

  return preferredCalendarType ?? getStoredCalendarType();
}
