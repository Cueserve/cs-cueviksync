import { z } from "zod";

const dateStringSchema = z
  .string()
  .trim()
  .refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  });

export const lineItemInsertSchema = z.object({
  id: z.string().optional(),
  job_id: z.string().optional(),
  lineNo: z.number().int().positive("Line number must be a positive integer."),
  itemDescription: z
    .string()
    .trim()
    .min(1, "Item description cannot be empty."),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be greater than or equal to 0."),
  materialShortage: z.string().nullable().optional(),
  equipmentIssue: z.string().nullable().optional(),
});

export const jobInsertSchema = z.object({
  id: z.string().optional(),
  jobNo: z.string().optional(),
  orderDate: z.string().trim().min(1, "Order date is required."),
  promisedDate: z.string().trim().min(1, "Promised date is required."),
  completedDate: dateStringSchema.nullable().optional(),
  deliveredDate: dateStringSchema.nullable().optional(),
  overdueReason: z.string().nullable().optional(),
  inThisWeek: z.boolean().default(false),
  invoiceValue: z.number().nonnegative().default(0),
  spoilagePercent: z.number().min(0).max(100).default(0),
  reprintRequired: z.boolean().default(false),
  notes: z.string().nullable().optional(),
  deleted_at: dateStringSchema.nullable().optional(),
});

export const jobUpdateSchema = jobInsertSchema.partial();

export const createJobWithItemsSchema = z.object({
  job: jobInsertSchema,
  lineItems: z.array(lineItemInsertSchema).default([]),
});

export const updateJobWithItemsSchema = z.object({
  id: z.string().min(1, "Job ID is required."),
  updates: jobUpdateSchema,
  lineItemsToUpsert: z.array(lineItemInsertSchema).optional(),
  lineItemsToDelete: z.array(z.string()).optional(),
});

export const deleteJobSchema = z.object({
  id: z.string().min(1, "Job ID is required."),
});

export type JobInsertInput = z.infer<typeof jobInsertSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
export type LineItemInsertInput = z.infer<typeof lineItemInsertSchema>;
