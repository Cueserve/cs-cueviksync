import { JobItem } from "@/components/providers/tracker-provider";
import {
  getTurnaroundDays,
  isOnTime,
  getWeekEndingMonday,
  formatDateUS,
  parseLocalDate,
} from "./date-utils";

export interface JobCalculations {
  isCompleted: boolean;
  statusStr: "Completed" | "Pending";
  itemsInJob: number;
  totalQty: number;

  turnaroundDaysVal: string | number;
  daysVsPromisedVal: string | number;
  onTimeVal: string; // "Y" | "N" | "-"

  isOverdue: boolean;
  overdueFlagVal: string; // "Overdue" | ""
  daysOverdueVal: string | number;

  scheduledThisWeekVal: string; // "Y" | ""
  weekEndingStr: string; // MM/DD/YYYY or ""
}

/**
 * Centralized business logic formulas for a job.
 * These are used across the dashboard, schedule, and job details pages.
 */
export function calculateJobFormulas(job: Partial<JobItem>): JobCalculations {
  const isCompleted = !!job.completedDate;
  const statusStr = isCompleted ? "Completed" : "Pending";
  const weekEndingStr =
    isCompleted && job.completedDate
      ? formatDateUS(getWeekEndingMonday(job.completedDate))
      : "";

  let turnaroundDaysVal: string | number = "";
  let daysVsPromisedVal: string | number = "";
  let onTimeVal = "";

  if (isCompleted) {
    turnaroundDaysVal = getTurnaroundDays(job.orderDate, job.completedDate);
    if (job.deliveredDate && job.promisedDate) {
      const promiseDiff =
        parseLocalDate(job.deliveredDate).getTime() -
        parseLocalDate(job.promisedDate).getTime();
      daysVsPromisedVal = Math.round(promiseDiff / (1000 * 60 * 60 * 24));
      onTimeVal = isOnTime(job.promisedDate, job.deliveredDate) ? "Y" : "N";
    } else {
      daysVsPromisedVal = "-";
      onTimeVal = "-";
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue =
    !isCompleted &&
    !!job.promisedDate &&
    today > parseLocalDate(job.promisedDate);

  const overdueFlagVal = isOverdue ? "Overdue" : "";
  let daysOverdueVal: string | number = "";

  if (isOverdue && job.promisedDate) {
    const overdueDiff =
      today.getTime() - parseLocalDate(job.promisedDate).getTime();
    daysOverdueVal = Math.max(
      0,
      Math.round(overdueDiff / (1000 * 60 * 60 * 24)),
    );
  }

  const scheduledThisWeekVal = job.inThisWeek ? "Y" : "N";
  const itemsInJob = job.items?.length || 0;
  const totalQty = (job.items || []).reduce(
    (sum, i) => sum + Number(i.quantity || 0),
    0,
  );

  return {
    isCompleted,
    statusStr,
    itemsInJob,
    totalQty,
    turnaroundDaysVal,
    daysVsPromisedVal,
    onTimeVal,
    isOverdue,
    overdueFlagVal,
    daysOverdueVal,
    scheduledThisWeekVal,
    weekEndingStr,
  };
}
