/**
 * Ethiopian Calendar & Time Utility
 *
 * Supports both Ethiopian and Gregorian calendar display.
 * Reads user preference from localStorage (calendar-storage).
 *
 * Ethiopian Calendar:
 * - 13 months: 12 months of 30 days + Pagume (5 or 6 days)
 * - ~7-8 years behind Gregorian
 * - Leap year when ethYear % 4 === 3
 *
 * Ethiopian Time:
 * - Day starts at 6:00 AM (Gregorian) = 12:00 (Ethiopian morning)
 * - 12-hour clock offset by 6 hours from Western time
 */

import { getCalendarType } from '../contexts/store';
import i18n from '../i18n';
export { useCalendarStore } from '../contexts/store';

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

// Ethiopian epoch: Meskerem 1, Year 1 in Julian Day Number
const ETHIOPIAN_EPOCH = 1724221;

// --- Core Conversion Functions ---

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): [number, number, number] {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return [year, month, day];
}

/**
 * Convert Gregorian date to Ethiopian date.
 * Cycle: 365, 365, 366 (leap), 365 = 1461 days
 * Leap years: ethYear % 4 === 3
 */
export function gregorianToEthiopian(
  gYear: number,
  gMonth: number,
  gDay: number
): [number, number, number] {
  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  const offset = jdn - ETHIOPIAN_EPOCH;

  const cycle = Math.floor(offset / 1461);
  const remainder = offset % 1461;

  let yearInCycle: number;
  let dayInYear: number;

  if (remainder < 365) {
    yearInCycle = 0;
    dayInYear = remainder;
  } else if (remainder < 730) {
    yearInCycle = 1;
    dayInYear = remainder - 365;
  } else if (remainder < 1096) {
    // Leap year (366 days)
    yearInCycle = 2;
    dayInYear = remainder - 730;
  } else {
    yearInCycle = 3;
    dayInYear = remainder - 1096;
  }

  const ethYear = cycle * 4 + yearInCycle + 1;
  const ethMonth = Math.floor(dayInYear / 30) + 1;
  const ethDay = (dayInYear % 30) + 1;

  return [ethYear, ethMonth, ethDay];
}

/**
 * Convert Ethiopian date to Gregorian date.
 */
export function ethiopianToGregorian(
  eYear: number,
  eMonth: number,
  eDay: number
): [number, number, number] {
  const yearDaysInCycle = [0, 365, 730, 1096];
  const cycle = Math.floor((eYear - 1) / 4);
  const pos = (eYear - 1) % 4;
  const dayOfYear = (eMonth - 1) * 30 + (eDay - 1);

  const jdn = ETHIOPIAN_EPOCH + cycle * 1461 + yearDaysInCycle[pos] + dayOfYear;
  return jdnToGregorian(jdn);
}

// --- Ethiopian Time ---

/**
 * Convert a Gregorian hour (0-23) to Ethiopian time.
 * Ethiopian time is offset by 6 hours:
 * - 6 AM (Greg) = 12:00 morning (Eth)
 * - 7 AM = 1:00 morning
 * - 12 PM = 6:00 afternoon
 * - 6 PM = 12:00 evening
 * - 12 AM = 6:00 night
 */
function toEthiopianHour(gregHour: number): { hour: number; period: string; periodAm: string } {
  const ethHour = (gregHour + 6) % 12 || 12;

  let period: string;
  let periodAm: string;

  if (gregHour >= 6 && gregHour < 12) {
    period = 'morning';
    periodAm = 'ጠዋት';
  } else if (gregHour >= 12 && gregHour < 18) {
    period = 'afternoon';
    periodAm = 'ከሰዓት';
  } else if (gregHour >= 18) {
    period = 'evening';
    periodAm = 'ምሽት';
  } else {
    period = 'night';
    periodAm = 'ሌሊት';
  }

  return { hour: ethHour, period, periodAm };
}

// --- Gregorian Formatting Helpers ---

const GREG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const GREG_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

function formatGregTime(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatGregDate(date: Date): string {
  return `${GREG_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatGregDateTime(date: Date): string {
  return `${formatGregDate(date)} ${formatGregTime(date)}`;
}

function formatGregDateLong(date: Date): string {
  return `${GREG_DAYS[date.getDay()]}, ${formatGregDate(date)}`;
}

// --- Public Formatting Functions ---

/**
 * Parse any date value from the backend into a Date object.
 */
function parseDateValue(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    return new Date(y, m - 1, d, h, min, s);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Get current UI language */
function getLang(): 'en' | 'am' {
  return (i18n.language || 'en').startsWith('am') ? 'am' : 'en';
}

/**
 * Format a date/time value. Uses Ethiopian or Gregorian based on user preference.
 * Language auto-detected from i18n.
 */
export function formatEthiopianDateTime(value: any, lang?: 'en' | 'am'): string {
  const l = lang ?? getLang();
  const date = parseDateValue(value);
  if (!date) return '-';

  if (getCalendarType() === 'gregorian') {
    return formatGregDateTime(date);
  }

  const [eY, eM, eD] = gregorianToEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  const monthName = l === 'am' ? ETH_MONTHS_AM[eM - 1] : ETH_MONTHS_EN[eM - 1];
  const { hour, periodAm, period } = toEthiopianHour(date.getHours());
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const periodLabel = l === 'am' ? periodAm : period;

  return `${monthName} ${eD}, ${eY} ${hour}:${minutes} ${periodLabel}`;
}

/**
 * Format a date value (no time). Uses Ethiopian or Gregorian based on user preference.
 * Example (Ethiopian): "Tir 29, 2018"
 * Example (Gregorian): "February 6, 2026"
 */
export function formatEthiopianDate(value: any, lang?: 'en' | 'am'): string {
  const l = lang ?? getLang();
  const date = parseDateValue(value);
  if (!date) return '-';

  if (getCalendarType() === 'gregorian') {
    return formatGregDate(date);
  }

  const [eY, eM, eD] = gregorianToEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  const monthName = l === 'am' ? ETH_MONTHS_AM[eM - 1] : ETH_MONTHS_EN[eM - 1];
  return `${monthName} ${eD}, ${eY}`;
}

/**
 * Format a time value. Uses Ethiopian or Gregorian based on user preference.
 * Example (Ethiopian): "1:30 ጠዋት"
 * Example (Gregorian): "7:30 AM"
 */
export function formatEthiopianTime(value: any, lang?: 'en' | 'am'): string {
  const l = lang ?? getLang();
  const date = parseDateValue(value);
  if (!date) return '-';

  if (getCalendarType() === 'gregorian') {
    return formatGregTime(date);
  }

  const { hour, periodAm, period } = toEthiopianHour(date.getHours());
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const periodLabel = l === 'am' ? periodAm : period;

  return `${hour}:${minutes} ${periodLabel}`;
}

/**
 * Format a full date string with day name. Uses Ethiopian or Gregorian based on user preference.
 * Example (Ethiopian): "Wednesday, Tir 29, 2018"
 * Example (Gregorian): "Friday, February 6, 2026"
 */
export function formatEthiopianDateLong(value: any, lang?: 'en' | 'am'): string {
  const l = lang ?? getLang();
  const date = parseDateValue(value);
  if (!date) return '-';

  if (getCalendarType() === 'gregorian') {
    return formatGregDateLong(date);
  }

  const [eY, eM, eD] = gregorianToEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  const monthName = l === 'am' ? ETH_MONTHS_AM[eM - 1] : ETH_MONTHS_EN[eM - 1];

  const dayNames = l === 'am'
    ? ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayOfWeek = dayNames[date.getDay()];

  return `${dayOfWeek}, ${monthName} ${eD}, ${eY}`;
}

/**
 * Get Ethiopian month names for use in dropdowns/pickers.
 */
export function getEthiopianMonths(lang: 'en' | 'am' = 'en') {
  return lang === 'am' ? ETH_MONTHS_AM : ETH_MONTHS_EN;
}

/**
 * Get the current Ethiopian date.
 */
export function getCurrentEthiopianDate(): [number, number, number] {
  const now = new Date();
  return gregorianToEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
