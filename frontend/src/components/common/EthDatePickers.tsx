import React, { useState, useMemo, useRef } from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import {
  TextField, IconButton, Popover, Box, Typography, Grid,
  Select, MenuItem, SelectChangeEvent,
} from '@mui/material';
import { CalendarMonth, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { gregorianToEthiopian, ethiopianToGregorian } from '../../utils/ethiopianCalendar';
import { useTranslation } from 'react-i18next';

/* ── Ethiopian month & day names ── */
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
const ETH_DAYS_AM = ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'];
const ETH_DAYS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ETH_PERIODS_AM: Record<string, string> = {
  morning: 'ጠዋት', evening: 'ማታ',
};
const ETH_PERIODS_EN: Record<string, string> = {
  morning: 'morning (ጠዋት)', evening: 'evening (ማታ)',
};
const ETH_PERIODS_OM: Record<string, string> = {
  morning: 'waaree dura (ጠዋት)', evening: 'galgala (ማታ)',
};

function getLangCode(language: string): 'en' | 'am' | 'om' {
  if (language.startsWith('am')) return 'am';
  if (language.startsWith('om')) return 'om';
  return 'en';
}

function getEthPeriods(lang: 'en' | 'am' | 'om'): Record<string, string> {
  if (lang === 'am') return ETH_PERIODS_AM;
  if (lang === 'om') return ETH_PERIODS_OM;
  return ETH_PERIODS_EN;
}

function getEthMonths(lang: 'en' | 'am' | 'om'): string[] {
  if (lang === 'am') return ETH_MONTHS_AM;
  return ETH_MONTHS_EN; // Oromo uses the same short English transliterations in the picker
}

/* ── helpers ── */
function daysInEthMonth(month: number, year: number): number {
  if (month <= 12) return 30;
  return year % 4 === 3 ? 6 : 5;
}

function firstDayOfWeek(eYear: number, eMonth: number): number {
  const [gY, gM, gD] = ethiopianToGregorian(eYear, eMonth, 1);
  return new Date(gY, gM - 1, gD).getDay();
}

function ethToGreg(eY: number, eM: number, eD: number): Date {
  const [gY, gM, gD] = ethiopianToGregorian(eY, eM, eD);
  return new Date(gY, gM - 1, gD);
}

function gregToEth(d: Date): [number, number, number] {
  return gregorianToEthiopian(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function formatEthDisplay(d: Date | null, lang: 'en' | 'am' | 'om'): string {
  if (!d || isNaN(d.getTime())) return '';
  const [eY, eM, eD] = gregToEth(d);
  const months = getEthMonths(lang);
  return `${months[eM - 1]} ${eD}, ${eY}`;
}

function formatEthDateTimeDisplay(d: Date | null, lang: 'en' | 'am' | 'om'): string {
  if (!d || isNaN(d.getTime())) return '';
  const [eY, eM, eD] = gregToEth(d);
  const months = getEthMonths(lang);
  const periods = getEthPeriods(lang);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ethH = (h + 6) % 12 || 12;
  const periodKey = (h >= 6 && h < 18) ? 'morning' : 'evening';
  return `${months[eM - 1]} ${eD}, ${eY}  ${ethH}:${m} ${periods[periodKey]}`;
}

/* ══════════════════════════════════════
   Ethiopian Calendar Popover (date-only)
   ══════════════════════════════════════ */

interface CalendarPopoverProps {
  value: Date | null;
  onChange: (d: Date) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  minDate?: Date;
}

const EthCalendarPopover: React.FC<CalendarPopoverProps> = ({
  value, onChange, onClose, anchorEl, open, minDate,
}) => {
  const { i18n } = useTranslation();
  const lang = getLangCode(i18n.language);
  const months = getEthMonths(lang);
  const dayLabels = lang === 'am' ? ETH_DAYS_AM : ETH_DAYS_EN;
  const today = new Date();
  const [todayEY, todayEM] = gregToEth(today);

  const initEth = value ? gregToEth(value) : [todayEY, todayEM, 1] as [number, number, number];
  const [viewYear, setViewYear] = useState(initEth[0]);
  const [viewMonth, setViewMonth] = useState(initEth[1]);

  const selectedEth = value ? gregToEth(value) : null;

  const days = useMemo(() => daysInEthMonth(viewMonth, viewYear), [viewMonth, viewYear]);
  const startDay = useMemo(() => firstDayOfWeek(viewYear, viewMonth), [viewYear, viewMonth]);

  const minEth = minDate ? gregToEth(minDate) : null;

  const isDisabled = (day: number) => {
    if (!minEth) return false;
    const [mY, mM, mD] = minEth;
    if (viewYear < mY) return true;
    if (viewYear === mY && viewMonth < mM) return true;
    if (viewYear === mY && viewMonth === mM && day < mD) return true;
    return false;
  };

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(13); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 13) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    const greg = ethToGreg(viewYear, viewMonth, day);
    if (value) {
      greg.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
    }
    onChange(greg);
    onClose();
  };

  const yearOptions: number[] = [];
  for (let y = todayEY - 5; y <= todayEY + 5; y++) yearOptions.push(y);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{ sx: { p: 2, width: 320, borderRadius: 3 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton size="small" onClick={prevMonth}><ChevronLeft /></IconButton>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Select
            size="small" variant="standard" disableUnderline
            value={viewMonth}
            onChange={(e: SelectChangeEvent<number>) => setViewMonth(Number(e.target.value))}
            sx={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            {months.map((m, i) => (
              <MenuItem key={i} value={i + 1}>{m}</MenuItem>
            ))}
          </Select>
          <Select
            size="small" variant="standard" disableUnderline
            value={viewYear}
            onChange={(e: SelectChangeEvent<number>) => setViewYear(Number(e.target.value))}
            sx={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
        <IconButton size="small" onClick={nextMonth}><ChevronRight /></IconButton>
      </Box>

      <Grid container columns={7} sx={{ mb: 0.5 }}>
        {dayLabels.map((d, i) => (
          <Grid item xs={1} key={i}>
            <Typography variant="caption" align="center" display="block"
              sx={{ fontWeight: 700, color: 'text.secondary' }}>{d}</Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container columns={7}>
        {cells.map((day, i) => (
          <Grid item xs={1} key={i}>
            {day ? (
              <Box
                onClick={() => handleDayClick(day)}
                sx={{
                  width: 36, height: 36, mx: 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', cursor: isDisabled(day) ? 'default' : 'pointer',
                  fontWeight: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day ? 700 : 400,
                  bgcolor: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                    ? 'primary.main' : 'transparent',
                  color: isDisabled(day) ? 'text.disabled'
                    : selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                    ? 'primary.contrastText' : 'text.primary',
                  '&:hover': !isDisabled(day) ? {
                    bgcolor: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                      ? 'primary.dark' : 'action.hover',
                  } : {},
                  fontSize: '0.85rem',
                }}
              >
                {day}
              </Box>
            ) : <Box sx={{ width: 36, height: 36 }} />}
          </Grid>
        ))}
      </Grid>
    </Popover>
  );
};

/* ══════════════════════════════════════
   EthDatePicker (date-only)
   ══════════════════════════════════════ */

export function EthDatePicker(props: DatePickerProps<Date>) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const lang = getLangCode(i18n.language);
  const tfProps = (props.slotProps?.textField ?? {}) as any;

  return (
    <Box ref={anchorRef}>
      <TextField
        {...tfProps}
        label={props.label}
        value={formatEthDisplay(props.value ?? null, lang)}
        onClick={() => setOpen(true)}
        InputProps={{
          ...tfProps.InputProps,
          readOnly: true,
          endAdornment: (
            <IconButton size="small" onClick={() => setOpen(true)}>
              <CalendarMonth />
            </IconButton>
          ),
        }}
        sx={props.sx}
      />
      <EthCalendarPopover
        value={props.value ?? null}
        onChange={(d) => props.onChange?.(d, {} as any)}
        onClose={() => setOpen(false)}
        anchorEl={anchorRef.current}
        open={open}
        minDate={props.minDate}
      />
    </Box>
  );
}

/* ══════════════════════════════════════
   Ethiopian Time Select
   ══════════════════════════════════════ */

interface TimeSelectProps {
  value: Date | null;
  onChange: (d: Date) => void;
}

const EthTimeSelect: React.FC<TimeSelectProps & { lang?: string }> = ({ value, onChange, lang: langProp }) => {
  const { i18n } = useTranslation();
  const lang: 'en' | 'am' | 'om' = getLangCode(langProp ?? i18n.language);
  const periodMap = getEthPeriods(lang);
  const h = value ? value.getHours() : 0;
  const m = value ? value.getMinutes() : 0;

  const ethH = (h + 6) % 12 || 12;
  // Ethiopian day: morning (ጠዋት) 6AM-5:59PM | evening (ማታ) 6PM-5:59AM
  const periodKey = (h >= 6 && h < 18) ? 'morning' : 'evening';
  const period = periodMap[periodKey];

  const setTime = (newEthH: number, newPeriodDisplay: string, newMin: number) => {
    const h12 = newEthH === 12 ? 0 : newEthH;
    // Reverse-lookup the canonical key from the display label
    const key = Object.entries(periodMap).find(([, v]) => v === newPeriodDisplay)?.[0] ?? 'morning';
    // morning: Eth 1–12 = Greg 7AM–6PM (offset +6)
    // evening: Eth 1–12 = Greg 7PM–6AM (offset +18)
    const gregH = key === 'morning' ? (h12 + 6) % 24 : (h12 + 18) % 24;

    const d = value ? new Date(value.getTime()) : new Date();
    d.setHours(gregH, newMin, 0, 0);
    onChange(d);
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const periods = Object.values(periodMap);

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
      <Select size="small" value={ethH}
        onChange={(e) => setTime(Number(e.target.value), period, m)}
        sx={{ minWidth: 60 }}>
        {hours.map(hr => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
      </Select>
      <Typography sx={{ alignSelf: 'center' }}>:</Typography>
      <Select size="small" value={m - (m % 5)}
        onChange={(e) => setTime(ethH, period, Number(e.target.value))}
        sx={{ minWidth: 60 }}>
        {minutes.map(min => <MenuItem key={min} value={min}>{min.toString().padStart(2, '0')}</MenuItem>)}
      </Select>
      <Select size="small" value={period}
        onChange={(e) => setTime(ethH, e.target.value, m)}
        sx={{ minWidth: 100 }}>
        {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
      </Select>
    </Box>
  );
};

/* ══════════════════════════════════════
   Ethiopian Calendar+Time Popover
   ══════════════════════════════════════ */

interface DateTimePopoverProps {
  value: Date | null;
  onChange: (d: Date) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  open: boolean;
}

const EthCalendarTimePopover: React.FC<DateTimePopoverProps> = ({
  value, onChange, onClose, anchorEl, open,
}) => {
  const { i18n } = useTranslation();
  const lang = getLangCode(i18n.language);
  const months = getEthMonths(lang);
  const dayLabels = lang === 'am' ? ETH_DAYS_AM : ETH_DAYS_EN;
  const today = new Date();
  const [todayEY, todayEM] = gregToEth(today);

  const initEth = value ? gregToEth(value) : [todayEY, todayEM, 1] as [number, number, number];
  const [viewYear, setViewYear] = useState(initEth[0]);
  const [viewMonth, setViewMonth] = useState(initEth[1]);
  const [localValue, setLocalValue] = useState<Date | null>(value);

  const selectedEth = localValue ? gregToEth(localValue) : null;

  const days = useMemo(() => daysInEthMonth(viewMonth, viewYear), [viewMonth, viewYear]);
  const startDay = useMemo(() => firstDayOfWeek(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(13); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 13) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (day: number) => {
    const greg = ethToGreg(viewYear, viewMonth, day);
    if (localValue) {
      greg.setHours(localValue.getHours(), localValue.getMinutes(), localValue.getSeconds());
    }
    setLocalValue(greg);
    onChange(greg);
  };

  const handleTimeChange = (d: Date) => {
    setLocalValue(d);
    onChange(d);
  };

  const yearOptions: number[] = [];
  for (let y = todayEY - 5; y <= todayEY + 5; y++) yearOptions.push(y);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{ sx: { p: 2, width: 320, borderRadius: 3 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton size="small" onClick={prevMonth}><ChevronLeft /></IconButton>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Select
            size="small" variant="standard" disableUnderline
            value={viewMonth}
            onChange={(e: SelectChangeEvent<number>) => setViewMonth(Number(e.target.value))}
            sx={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            {months.map((m, i) => (
              <MenuItem key={i} value={i + 1}>{m}</MenuItem>
            ))}
          </Select>
          <Select
            size="small" variant="standard" disableUnderline
            value={viewYear}
            onChange={(e: SelectChangeEvent<number>) => setViewYear(Number(e.target.value))}
            sx={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
        <IconButton size="small" onClick={nextMonth}><ChevronRight /></IconButton>
      </Box>

      <Grid container columns={7} sx={{ mb: 0.5 }}>
        {dayLabels.map((d, i) => (
          <Grid item xs={1} key={i}>
            <Typography variant="caption" align="center" display="block"
              sx={{ fontWeight: 700, color: 'text.secondary' }}>{d}</Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container columns={7}>
        {cells.map((day, i) => (
          <Grid item xs={1} key={i}>
            {day ? (
              <Box
                onClick={() => handleDayClick(day)}
                sx={{
                  width: 36, height: 36, mx: 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', cursor: 'pointer',
                  fontWeight: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day ? 700 : 400,
                  bgcolor: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                    ? 'primary.main' : 'transparent',
                  color: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                    ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: selectedEth && selectedEth[0] === viewYear && selectedEth[1] === viewMonth && selectedEth[2] === day
                      ? 'primary.dark' : 'action.hover',
                  },
                  fontSize: '0.85rem',
                }}
              >
                {day}
              </Box>
            ) : <Box sx={{ width: 36, height: 36 }} />}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mb: 0.5 }}>
          {lang === 'am' ? 'ሰዓት' : lang === 'om' ? "Sa'aatii" : 'Time'}
        </Typography>
        <EthTimeSelect value={localValue} onChange={handleTimeChange} lang={lang} />
      </Box>
    </Popover>
  );
};

/* ══════════════════════════════════════
   EthDateTimePicker (date + time)
   ══════════════════════════════════════ */

export function EthDateTimePicker(props: DateTimePickerProps<Date>) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const lang = getLangCode(i18n.language);
  const tfProps = (props.slotProps?.textField ?? {}) as any;

  return (
    <Box ref={anchorRef}>
      <TextField
        {...tfProps}
        label={props.label}
        value={formatEthDateTimeDisplay(props.value ?? null, lang)}
        onClick={() => setOpen(true)}
        InputProps={{
          ...tfProps.InputProps,
          readOnly: true,
          endAdornment: (
            <IconButton size="small" onClick={() => setOpen(true)}>
              <CalendarMonth />
            </IconButton>
          ),
        }}
        sx={props.sx}
      />
      <EthCalendarTimePopover
        value={props.value ?? null}
        onChange={(d) => props.onChange?.(d, {} as any)}
        onClose={() => setOpen(false)}
        anchorEl={anchorRef.current}
        open={open}
      />
    </Box>
  );
}
