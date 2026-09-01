import { useMemo } from "react";
import type { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";
import {
  getWeekEndingMonday,
  getTurnaroundDays,
  isOnTime,
  parseLocalDate,
} from "@/lib/date-utils";

export type WeeklyStat = {
  weekEnding: string;
  completedCount: number;
  totalTurnaround: number;
  onTimeCount: number;
  invoiceSum: number;
};

export function useJobMetrics(jobs: JobWithItems[]) {
  return useMemo(() => {
    const pendingJobs = jobs.filter((j) => !j.completedDate);
    const overdueCount = pendingJobs.filter((j) => {
      const promised = new Date(j.promisedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      promised.setHours(0, 0, 0, 0);
      return today > promised;
    }).length;

    const completedJobs = jobs.filter((j) => !!j.completedDate);
    const totalInvoice = completedJobs.reduce(
      (sum, j) => sum + j.invoiceValue,
      0,
    );

    // Additional global metrics
    const shortagesFlaggedCount = jobs.filter((j) =>
      j.items.some(
        (i) =>
          !!i.materialShortage && i.materialShortage.toLowerCase() !== "no",
      ),
    ).length;

    const equipmentIssuesCount = jobs.filter((j) =>
      j.items.some(
        (i) => !!i.equipmentIssue && i.equipmentIssue.toLowerCase() !== "no",
      ),
    ).length;

    const avgSpoilage =
      jobs.length > 0
        ? (
            jobs.reduce((sum, j) => sum + j.spoilagePercent, 0) / jobs.length
          ).toFixed(2)
        : "0.00";

    const reprintCount = jobs.filter((j) => j.reprintRequired).length;

    const weeklyGroups: Record<string, WeeklyStat> = {};

    const jobWeeks = completedJobs
      .map((job) => getWeekEndingMonday(job.completedDate))
      .filter(Boolean) as string[];

    let allDates = [...jobWeeks];

    if (allDates.length === 0) {
      const today = new Date();
      const yy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yy}-${mm}-${dd}`;

      const incomingMonday = getWeekEndingMonday(todayStr);
      const prev = parseLocalDate(incomingMonday);
      prev.setDate(prev.getDate() - 7);
      const prevMonday = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;

      allDates = [prevMonday, incomingMonday];
    }

    const minDateStr = allDates.reduce(
      (min, w) => (w < min ? w : min),
      allDates[0],
    );
    const maxDateStr = allDates.reduce(
      (max, w) => (w > max ? w : max),
      allDates[0],
    );

    const current = parseLocalDate(minDateStr);
    const end = parseLocalDate(maxDateStr);

    const generatedWeeks: string[] = [];
    while (current <= end) {
      const yy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      generatedWeeks.push(`${yy}-${mm}-${dd}`);
      current.setDate(current.getDate() + 7);
    }

    generatedWeeks.forEach((w) => {
      weeklyGroups[w] = {
        weekEnding: w,
        completedCount: 0,
        totalTurnaround: 0,
        onTimeCount: 0,
        invoiceSum: 0,
      };
    });

    completedJobs.forEach((job) => {
      const week = getWeekEndingMonday(job.completedDate);
      if (!week) return;

      if (!weeklyGroups[week]) {
        weeklyGroups[week] = {
          weekEnding: week,
          completedCount: 0,
          totalTurnaround: 0,
          onTimeCount: 0,
          invoiceSum: 0,
        };
      }

      const group = weeklyGroups[week];
      group.completedCount += 1;
      group.totalTurnaround += getTurnaroundDays(
        job.orderDate,
        job.completedDate,
      );
      if (isOnTime(job.promisedDate, job.deliveredDate)) {
        group.onTimeCount += 1;
      }
      group.invoiceSum += job.invoiceValue;
    });

    const weeklyStatsArray = Object.values(weeklyGroups).sort((a, b) =>
      a.weekEnding.localeCompare(b.weekEnding),
    );

    // --- Chart Data ---
    const weekLabel = (w: string) => w.substring(5); // "08-03" etc.

    const turnaroundData = weeklyStatsArray.map((stat) => ({
      label: weekLabel(stat.weekEnding),
      value:
        stat.completedCount > 0
          ? Math.round((stat.totalTurnaround / stat.completedCount) * 10) / 10
          : 0,
    }));

    const onTimeData = weeklyStatsArray.map((stat) => ({
      label: weekLabel(stat.weekEnding),
      value:
        stat.completedCount > 0
          ? Math.round((stat.onTimeCount / stat.completedCount) * 100)
          : 0,
    }));

    const completedData = weeklyStatsArray.map((stat) => ({
      label: weekLabel(stat.weekEnding),
      value: stat.completedCount,
    }));

    const maxJobsCompleted = Math.max(...completedData.map((d) => d.value), 5);

    return {
      totalJobs: jobs.length,
      pendingJobs,
      overdueCount,
      completedJobs,
      totalInvoice,
      shortagesFlaggedCount,
      equipmentIssuesCount,
      avgSpoilage,
      reprintCount,
      weeklyStatsArray,
      chartData: {
        turnaroundData,
        onTimeData,
        completedData,
        maxJobsCompleted,
      },
    };
  }, [jobs]);
}
