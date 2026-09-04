import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateJobFormulas } from "./job-formulas";
import type { JobWithItems } from "./types/jobs";

describe("calculateJobFormulas", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Freeze time to 2026-09-04 local
    vi.setSystemTime(new Date(2026, 8, 4, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates pending on-track job correctly", () => {
    const job: Partial<JobWithItems> = {
      orderDate: "2026-09-01",
      promisedDate: "2026-09-10",
      completedDate: null,
      deliveredDate: null,
      inThisWeek: true,
      items: [
        {
          id: "item-1",
          job_id: "job-1",
          lineNo: 1,
          itemDescription: "Business Cards",
          quantity: 500,
          materialShortage: null,
          equipmentIssue: null,
        },
      ],
    };

    const res = calculateJobFormulas(job);

    expect(res.isCompleted).toBe(false);
    expect(res.statusStr).toBe("Pending");
    expect(res.isOverdue).toBe(false);
    expect(res.overdueFlagVal).toBe("On Track");
    expect(res.daysOverdueVal).toBe("");
    expect(res.scheduledThisWeekVal).toBe("Y");
    expect(res.itemsInJob).toBe(1);
    expect(res.totalQty).toBe(500);
  });

  it("identifies overdue jobs when promised date is in the past", () => {
    const job: Partial<JobWithItems> = {
      orderDate: "2026-08-20",
      promisedDate: "2026-09-01", // 3 days ago relative to 2026-09-04
      completedDate: null,
      deliveredDate: null,
      inThisWeek: false,
    };

    const res = calculateJobFormulas(job);

    expect(res.isOverdue).toBe(true);
    expect(res.overdueFlagVal).toBe("Overdue");
    expect(res.daysOverdueVal).toBe(3);
    expect(res.scheduledThisWeekVal).toBe("N");
  });

  it("calculates completed job formulas: turnaround, on-time delivery, and week ending", () => {
    const job: Partial<JobWithItems> = {
      orderDate: "2026-08-25",
      promisedDate: "2026-09-02",
      completedDate: "2026-09-01", // Tuesday -> Week ends Monday 2026-09-07
      deliveredDate: "2026-09-02", // Delivered on promised date -> On time: Y
      items: [
        {
          id: "1",
          job_id: "j1",
          lineNo: 1,
          itemDescription: "Flyers",
          quantity: 1000,
          materialShortage: null,
          equipmentIssue: null,
        },
        {
          id: "2",
          job_id: "j1",
          lineNo: 2,
          itemDescription: "Posters",
          quantity: 250,
          materialShortage: null,
          equipmentIssue: null,
        },
      ],
    };

    const res = calculateJobFormulas(job);

    expect(res.isCompleted).toBe(true);
    expect(res.statusStr).toBe("Completed");
    expect(res.turnaroundDaysVal).toBe(7); // Aug 25 to Sep 1 is 7 days
    expect(res.daysVsPromisedVal).toBe(0); // Delivered exactly on promised date
    expect(res.onTimeVal).toBe("Y");
    expect(res.weekEndingStr).toBe("09/07/2026");
    expect(res.itemsInJob).toBe(2);
    expect(res.totalQty).toBe(1250);
    expect(res.isOverdue).toBe(false);
  });

  it("flags late deliveries (onTimeVal = N) when delivered after promised date", () => {
    const job: Partial<JobWithItems> = {
      orderDate: "2026-08-20",
      promisedDate: "2026-08-28",
      completedDate: "2026-08-30",
      deliveredDate: "2026-08-31", // 3 days after promised
    };

    const res = calculateJobFormulas(job);

    expect(res.isCompleted).toBe(true);
    expect(res.onTimeVal).toBe("N");
    expect(res.daysVsPromisedVal).toBe(3);
  });
});
