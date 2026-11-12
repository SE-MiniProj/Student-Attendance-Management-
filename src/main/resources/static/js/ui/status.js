// The four attendance marks and how they are drawn.
import { badge } from './components.js';

/** Usual minimum attendance. The API itself does not enforce one. */
export const REQUIRED_PERCENT = 75;

export const STATUSES = [
  { value: 'PRESENT', label: 'Present', short: 'P', tone: 'present' },
  { value: 'ABSENT', label: 'Absent', short: 'A', tone: 'absent' },
  { value: 'LATE', label: 'Late', short: 'L', tone: 'late' },
  { value: 'EXCUSED', label: 'Excused', short: 'E', tone: 'excused' },
];

export const statusInfo = (value) => STATUSES.find((s) => s.value === value);

export function statusBadge(value) {
  const info = statusInfo(value);
  return badge(info ? info.label : value, info ? info.tone : 'neutral');
}
