/**
 * Dynamic date helper utilities for CuevikSync print production calculations.
 * Consistent with Excel formula structures.
 */

/**
 * Formats a stored ISO date string (YYYY-MM-DD) to American format (MM/DD/YYYY).
 * Returns "" if the date string is falsy.
 */
export function formatDateUS(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${month}/${day}/${year}`;
}

/**
 * Calculates the week ending Monday (starts Tuesday, ends on that Monday) for a given date.
 */
export function getWeekEndingMonday(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ...
  const diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const yy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Parses a YYYY-MM-DD string as LOCAL midnight — avoids the UTC-offset
 * bug where new Date("2026-08-10") = Aug 10 00:00 UTC = Aug 10 05:30 IST,
 * making diffs come out 1 day too large when rounded.
 */
export function parseLocalDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date(NaN);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d); // local time, no timezone shift
}

/**
 * Calculates the calendar days turnaround between the order date and the completion date.
 */
export function getTurnaroundDays(
  orderStr: string | undefined,
  completedStr: string | undefined,
): number {
  if (!orderStr || !completedStr) return 0;
  const order = parseLocalDate(orderStr);
  const completed = parseLocalDate(completedStr);
  const diffDays = Math.round(
    (completed.getTime() - order.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diffDays);
}

/**
 * Checks if a delivered date is on or before the promised date.
 */
export function isOnTime(
  promisedStr: string | undefined,
  deliveredStr: string | undefined,
): boolean {
  if (!promisedStr || !deliveredStr) return false;
  return parseLocalDate(deliveredStr) <= parseLocalDate(promisedStr);
}
