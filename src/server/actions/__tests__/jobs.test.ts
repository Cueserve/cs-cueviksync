import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache and server-only modules
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

import { addJob, updateJob, deleteJob } from "../jobs";
import { revalidatePath } from "next/cache";

describe("Server Actions: jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addJob", () => {
    it("validates input and calls fn_create_job_with_items rpc", async () => {
      const insertedJobData = { id: "job-123", jobNo: "JOB-2026-001" };
      mockRpc.mockResolvedValueOnce({ data: insertedJobData, error: null });

      const res = await addJob(
        {
          orderDate: "2026-09-01",
          promisedDate: "2026-09-05",
          inThisWeek: true,
        },
        [
          {
            lineNo: 1,
            itemDescription: "Sample Item",
            quantity: 10,
          },
        ],
      );

      expect(res.success).toBe(true);
      expect(res.data).toEqual(insertedJobData);
      expect(mockRpc).toHaveBeenCalledWith(
        "fn_create_job_with_items",
        expect.objectContaining({
          p_job: expect.objectContaining({
            orderDate: "2026-09-01",
            promisedDate: "2026-09-05",
          }),
          p_line_items: expect.arrayContaining([
            expect.objectContaining({
              lineNo: 1,
              itemDescription: "Sample Item",
              quantity: 10,
            }),
          ]),
        }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/jobs");
      expect(revalidatePath).toHaveBeenCalledWith(`/jobs/JOB-2026-001`);
    });

    it("returns an error without calling DB if validation fails", async () => {
      const res = await addJob({
        orderDate: "invalid-date",
        promisedDate: "2026-09-05",
      } as unknown as Parameters<typeof addJob>[0]);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe("updateJob", () => {
    it("updates job and invokes atomic fn_update_job_with_items", async () => {
      mockRpc.mockResolvedValueOnce({ error: null });

      const res = await updateJob("job-123", {
        completedDate: "2026-09-04",
      });

      expect(res.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("fn_update_job_with_items", {
        p_job_id: "job-123",
        p_updates: { completedDate: "2026-09-04" },
        p_line_items_upsert: [],
        p_line_items_delete: [],
      });
      expect(revalidatePath).toHaveBeenCalledWith("/jobs");
    });
  });

  describe("deleteJob", () => {
    it("performs a soft delete by updating deleted_at", async () => {
      const eqMock = vi.fn().mockResolvedValueOnce({ error: null });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockFrom.mockReturnValue({ update: updateMock });

      const res = await deleteJob("job-123");

      expect(res.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("jobs");
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        }),
      );
      expect(eqMock).toHaveBeenCalledWith("id", "job-123");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });
});
