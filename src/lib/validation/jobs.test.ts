import { describe, it, expect } from "vitest";
import {
  jobInsertSchema,
  lineItemInsertSchema,
  createJobWithItemsSchema,
  updateJobWithItemsSchema,
} from "./jobs";

describe("jobs validation schemas", () => {
  describe("lineItemInsertSchema", () => {
    it("accepts valid line item data", () => {
      const valid = {
        lineNo: 1,
        itemDescription: "Brochures",
        quantity: 100,
        materialShortage: "",
        equipmentIssue: null,
      };
      const res = lineItemInsertSchema.safeParse(valid);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.materialShortage).toBeNull();
      }
    });

    it("rejects non-positive line numbers or empty descriptions", () => {
      const invalid = {
        lineNo: 0,
        itemDescription: "   ",
        quantity: -5,
      };
      const res = lineItemInsertSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("jobInsertSchema", () => {
    it("validates valid job with proper defaults", () => {
      const validJob = {
        orderDate: "2026-09-01",
        promisedDate: "2026-09-05",
      };
      const res = jobInsertSchema.safeParse(validJob);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.inThisWeek).toBe(false);
        expect(res.data.invoiceValue).toBe(0);
        expect(res.data.spoilagePercent).toBe(0);
        expect(res.data.reprintRequired).toBe(false);
      }
    });

    it("fails when deliveredDate is earlier than completedDate", () => {
      const invalidJob = {
        orderDate: "2026-09-01",
        promisedDate: "2026-09-05",
        completedDate: "2026-09-06",
        deliveredDate: "2026-09-04", // Before completion!
      };
      const res = jobInsertSchema.safeParse(invalidJob);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain(
          "Delivered date cannot be earlier than Completed date",
        );
      }
    });

    it("fails when spoilagePercent is outside [0, 100]", () => {
      const invalidSpoilage = {
        orderDate: "2026-09-01",
        promisedDate: "2026-09-05",
        spoilagePercent: 120,
      };
      const res = jobInsertSchema.safeParse(invalidSpoilage);
      expect(res.success).toBe(false);
    });
  });

  describe("createJobWithItemsSchema", () => {
    it("validates job and multiple line items together", () => {
      const payload = {
        job: {
          orderDate: "2026-09-01",
          promisedDate: "2026-09-05",
          inThisWeek: true,
        },
        lineItems: [
          {
            lineNo: 1,
            itemDescription: "Poster A",
            quantity: 50,
          },
          {
            lineNo: 2,
            itemDescription: "Poster B",
            quantity: 100,
          },
        ],
      };
      const res = createJobWithItemsSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.lineItems).toHaveLength(2);
      }
    });
  });

  describe("updateJobWithItemsSchema", () => {
    it("allows partial updates", () => {
      const updatePayload = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        updates: {
          spoilagePercent: 5.5,
          reprintRequired: true,
        },
      };
      const res = updateJobWithItemsSchema.safeParse(updatePayload);
      expect(res.success).toBe(true);
    });

    it("requires a valid non-empty id", () => {
      const updatePayload = {
        id: "",
        updates: { notes: "Some notes" },
      };
      const res = updateJobWithItemsSchema.safeParse(updatePayload);
      expect(res.success).toBe(false);
    });
  });
});
