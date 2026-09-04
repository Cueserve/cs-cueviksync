import { z } from "zod";

const dateStringSchema = z
  .string()
  .trim()
  .refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  })
  .transform((val) => (!val || val === "" ? null : val));

export const lineItemInsertSchema = z.object({
  id: z.string().optional(),
  job_id: z.string().optional(),
  lineNo: z.coerce
    .number()
    .int()
    .positive("Line number must be a positive integer."),
  itemDescription: z
    .string()
    .trim()
    .min(1, "Item description cannot be empty."),
  quantity: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be greater than or equal to 0."),
  materialShortage: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (!val || val === "" ? null : val)),
  equipmentIssue: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (!val || val === "" ? null : val)),
});

const rawJobFields = {
  id: z.string().optional(),
  jobNo: z.string().optional(),
  orderDate: z
    .string()
    .trim()
    .min(1, "Order date is required.")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid order date format",
    }),
  promisedDate: z
    .string()
    .trim()
    .min(1, "Promised date is required.")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid promised date format",
    }),
  completedDate: dateStringSchema.nullable().optional(),
  deliveredDate: dateStringSchema.nullable().optional(),
  overdueReason: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (!val || val === "" ? null : val)),
  inThisWeek: z.boolean(),
  invoiceValue: z.coerce
    .number()
    .nonnegative("Invoice value must be greater than or equal to 0."),
  spoilagePercent: z.coerce
    .number()
    .min(0, "Spoilage percent cannot be negative.")
    .max(100, "Spoilage percent cannot exceed 100."),
  reprintRequired: z.boolean(),
  notes: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (!val || val === "" ? null : val)),
  deleted_at: dateStringSchema.nullable().optional(),
};

export const jobInsertSchema = z
  .object({
    ...rawJobFields,
    inThisWeek: rawJobFields.inThisWeek.default(false),
    invoiceValue: rawJobFields.invoiceValue.default(0),
    spoilagePercent: rawJobFields.spoilagePercent.default(0),
    reprintRequired: rawJobFields.reprintRequired.default(false),
  })
  .refine(
    (data) => {
      if (data.completedDate && data.deliveredDate) {
        return new Date(data.deliveredDate) >= new Date(data.completedDate);
      }
      return true;
    },
    {
      message: "Delivered date cannot be earlier than Completed date",
      path: ["deliveredDate"],
    },
  );

export const jobUpdateSchema = z
  .object(rawJobFields)
  .partial()
  .refine(
    (data) => {
      if (data.completedDate && data.deliveredDate) {
        return new Date(data.deliveredDate) >= new Date(data.completedDate);
      }
      return true;
    },
    {
      message: "Delivered date cannot be earlier than Completed date",
      path: ["deliveredDate"],
    },
  );

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

export type JobInsertInput = z.input<typeof jobInsertSchema>;
export type JobInsertOutput = z.output<typeof jobInsertSchema>;
export type JobUpdateInput = z.input<typeof jobUpdateSchema>;
export type JobUpdateOutput = z.output<typeof jobUpdateSchema>;
export type LineItemInsertInput = z.input<typeof lineItemInsertSchema>;
export type LineItemInsertOutput = z.output<typeof lineItemInsertSchema>;
