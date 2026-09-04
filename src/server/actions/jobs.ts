"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";
import {
  createJobWithItemsSchema,
  updateJobWithItemsSchema,
  deleteJobSchema,
  type JobInsertInput,
  type JobUpdateInput,
  type LineItemInsertInput,
} from "@/lib/validation/jobs";

type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

type JobLineItemInsert =
  Database["public"]["Tables"]["job_line_items"]["Insert"];

function cleanDate(val: string | null | undefined): string | null {
  if (!val || typeof val !== "string" || val.trim() === "") return null;
  return val.trim();
}

export async function addJob(
  job: JobInsert | JobInsertInput,
  lineItems: (JobLineItemInsert | LineItemInsertInput)[] = [],
) {
  const parsed = createJobWithItemsSchema.safeParse({ job, lineItems });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join("; ");
    console.error("Validation error in addJob:", errorMsg);
    return { success: false, error: errorMsg };
  }

  const { job: validatedJob, lineItems: validatedLineItems } = parsed.data;
  const supabase = await createClient();

  const sanitizedJob: JobInsert = {
    ...validatedJob,
    id: validatedJob.id || crypto.randomUUID(),
    jobNo: validatedJob.jobNo || "",
    completedDate: cleanDate(validatedJob.completedDate),
    deliveredDate: cleanDate(validatedJob.deliveredDate),
  };

  // Execute atomic job and line items creation via Postgres transaction
  const { data: insertedJob, error: rpcError } = await supabase.rpc(
    "fn_create_job_with_items",
    {
      p_job: sanitizedJob,
      p_line_items: validatedLineItems.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      })),
    },
  );

  if (rpcError) {
    console.error("Error creating job with items (atomic):", rpcError);
    return { success: false, error: rpcError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/waste");

  return {
    success: true,
    data: insertedJob as unknown as Database["public"]["Tables"]["jobs"]["Row"],
  };
}

export async function updateJob(
  id: string,
  updates: JobUpdate | JobUpdateInput,
  lineItemsToUpsert?: (JobLineItemInsert | LineItemInsertInput)[],
  lineItemsToDelete?: string[],
) {
  const parsed = updateJobWithItemsSchema.safeParse({
    id,
    updates,
    lineItemsToUpsert,
    lineItemsToDelete,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join("; ");
    console.error("Validation error in updateJob:", errorMsg);
    return { success: false, error: errorMsg };
  }

  const {
    id: validatedId,
    updates: validatedUpdates,
    lineItemsToUpsert: validatedLineItemsToUpsert,
    lineItemsToDelete: validatedLineItemsToDelete,
  } = parsed.data;

  const supabase = await createClient();

  const sanitizedUpdates: JobUpdate = {
    ...validatedUpdates,
    ...(validatedUpdates.completedDate !== undefined && {
      completedDate: cleanDate(validatedUpdates.completedDate),
    }),
    ...(validatedUpdates.deliveredDate !== undefined && {
      deliveredDate: cleanDate(validatedUpdates.deliveredDate),
    }),
  };

  const lineItemsWithIds = (validatedLineItemsToUpsert || []).map((item) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
    job_id: validatedId,
  }));

  // Execute atomic job update and line items upsert/delete via Postgres transaction
  const { error: rpcError } = await supabase.rpc("fn_update_job_with_items", {
    p_job_id: validatedId,
    p_updates: sanitizedUpdates,
    p_line_items_upsert: lineItemsWithIds,
    p_line_items_delete: validatedLineItemsToDelete || [],
  });

  if (rpcError) {
    console.error("Error updating job with items (atomic):", rpcError);
    return { success: false, error: rpcError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/waste");

  return { success: true };
}

export async function deleteJob(id: string) {
  const parsed = deleteJobSchema.safeParse({ id });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join("; ");
    console.error("Validation error in deleteJob:", errorMsg);
    return { success: false, error: errorMsg };
  }

  const { id: validatedId } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("jobs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", validatedId);

  if (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/waste");

  return { success: true };
}
