"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

type JobLineItemInsert =
  Database["public"]["Tables"]["job_line_items"]["Insert"];

export async function addJob(job: JobInsert, lineItems: JobLineItemInsert[]) {
  const supabase = await createClient();

  if (!job.id) {
    job.id = crypto.randomUUID();
  }

  const { data: jobNo, error: rpcError } =
    await supabase.rpc("fn_next_job_number");
  if (rpcError) {
    console.error("Error generating job number:", rpcError);
    return { success: false, error: "Failed to generate job number" };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (job as any).jobNo = jobNo; // Or if type allows, job.jobNo = jobNo

  // Insert the parent job
  const { data: insertedJob, error: jobError } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();

  if (jobError) {
    console.error("Error inserting job:", jobError);
    return { success: false, error: jobError.message };
  }

  if (lineItems && lineItems.length > 0) {
    const lineItemsToInsert = lineItems.map((item) => ({
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
  updates: JobUpdate,
  lineItemsToUpsert?: JobLineItemInsert[],
  lineItemsToDelete?: string[],
) {
  const supabase = await createClient();

  const { error: jobError } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id);

  if (jobError) {
    console.error("Error updating job:", jobError);
    return { success: false, error: jobError.message };
  }

  if (lineItemsToDelete && lineItemsToDelete.length > 0) {
    const { error: delError } = await supabase
      .from("job_line_items")
      .delete()
      .in("id", lineItemsToDelete);

    if (delError) {
      console.error("Error deleting line items:", delError);
    }
  }

  if (lineItemsToUpsert && lineItemsToUpsert.length > 0) {
    const { error: upsertError } = await supabase.from("job_line_items").upsert(
      lineItemsToUpsert.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        job_id: id,
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
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/waste");

  return { success: true };
}
