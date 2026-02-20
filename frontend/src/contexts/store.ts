import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalendarType = 'ethiopian' | 'gregorian';

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
    { name: 'calendar-storage' }
  )
);

/** Read calendar preference without React hooks (for utility functions). */
export function getCalendarType(): CalendarType {
  try {
    const raw = localStorage.getItem('calendar-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.calendarType || 'ethiopian';
    }
  } catch { /* ignore */ }
  return 'ethiopian';
}
