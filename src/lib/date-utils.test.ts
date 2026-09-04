import { describe, it, expect } from "vitest";
import {
  formatDateUS,
  getWeekEndingMonday,
  parseLocalDate,
  getTurnaroundDays,
  isOnTime,
} from "./date-utils";

describe("date-utils", () => {
  describe("formatDateUS", () => {
    it("formats ISO date YYYY-MM-DD to MM/DD/YYYY", () => {
      expect(formatDateUS("2026-09-04")).toBe("09/04/2026");
    });

    it("returns empty string when input is falsy", () => {
      expect(formatDateUS(null)).toBe("");
      expect(formatDateUS(undefined)).toBe("");
      expect(formatDateUS("")).toBe("");
    });
  });

  describe("getWeekEndingMonday", () => {
    it("returns the upcoming Monday if date is during the week", () => {
      // 2026-09-01 is Tuesday -> ends on Monday 2026-09-07
      expect(getWeekEndingMonday("2026-09-01")).toBe("2026-09-07");
      // 2026-09-06 is Sunday -> ends on Monday 2026-09-07
      expect(getWeekEndingMonday("2026-09-06")).toBe("2026-09-07");
    });

    it("returns same date if it is already a Monday", () => {
      // 2026-09-07 is Monday
      expect(getWeekEndingMonday("2026-09-07")).toBe("2026-09-07");
    });

    it("handles empty date string", () => {
      expect(getWeekEndingMonday("")).toBe("");
      expect(getWeekEndingMonday(null)).toBe("");
    });
  });

  describe("parseLocalDate", () => {
    it("correctly parses year, month, day in local midnight", () => {
      const d = parseLocalDate("2026-08-15");
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(7); // 0-indexed August
      expect(d.getDate()).toBe(15);
    });
  });

  describe("getTurnaroundDays", () => {
    it("calculates exact positive calendar days between order and completion", () => {
      expect(getTurnaroundDays("2026-08-01", "2026-08-10")).toBe(9);
      expect(getTurnaroundDays("2026-08-01", "2026-08-01")).toBe(0);
    });

    it("returns 0 if completed date is before order date", () => {
      expect(getTurnaroundDays("2026-08-10", "2026-08-01")).toBe(0);
    });

    it("returns 0 if dates are missing", () => {
      expect(getTurnaroundDays(null, "2026-08-10")).toBe(0);
      expect(getTurnaroundDays("2026-08-01", null)).toBe(0);
    });
  });

  describe("isOnTime", () => {
    it("returns true when delivered on or before promised date", () => {
      expect(isOnTime("2026-08-10", "2026-08-09")).toBe(true);
      expect(isOnTime("2026-08-10", "2026-08-10")).toBe(true);
    });

    it("returns false when delivered after promised date", () => {
      expect(isOnTime("2026-08-10", "2026-08-11")).toBe(false);
    });

    it("returns false when promised or delivered date is missing", () => {
      expect(isOnTime(null, "2026-08-10")).toBe(false);
      expect(isOnTime("2026-08-10", null)).toBe(false);
    });
  });
});
