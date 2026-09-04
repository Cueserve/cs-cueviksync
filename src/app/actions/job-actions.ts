"use server";

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

  // Insert the parent job
  // trg_assign_job_number trigger automatically assigns jobNo.
  const { data: insertedJob, error: jobError } = await supabase
    .from("jobs")
    .insert(sanitizedJob)
    .select()
    .single();

  if (jobError) {
    console.error("Error inserting job:", jobError);
    return { success: false, error: jobError.message };
  }

  if (validatedLineItems && validatedLineItems.length > 0) {
    const lineItemsToInsert = validatedLineItems.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      job_id: insertedJob.id,
    }));

    const { error: lineItemsError } = await supabase
      .from("job_line_items")
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error("Error inserting line items:", lineItemsError);
      return { success: false, error: lineItemsError.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/waste");

  return { success: true, data: insertedJob };
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

  const { error: jobError } = await supabase
    .from("jobs")
    .update(sanitizedUpdates)
    .eq("id", validatedId);

  if (jobError) {
    console.error("Error updating job:", jobError);
    return { success: false, error: jobError.message };
  }

  if (validatedLineItemsToDelete && validatedLineItemsToDelete.length > 0) {
    const { error: delError } = await supabase
      .from("job_line_items")
      .delete()
      .in("id", validatedLineItemsToDelete);

    if (delError) {
      console.error("Error deleting line items:", delError);
    }
  }

  if (validatedLineItemsToUpsert && validatedLineItemsToUpsert.length > 0) {
    const { error: upsertError } = await supabase.from("job_line_items").upsert(
      validatedLineItemsToUpsert.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        job_id: validatedId,
      })),
      { onConflict: "id" },
    );

    if (upsertError) {
      console.error("Error upserting line items:", upsertError);
    }
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
