import { supabase } from "@/src/shared/lib/supabase";
import type {
  MotorcycleRow,
  MotorcycleStatus,
  Visibility,
} from "@/src/shared/types/database.types";

export type CreateMotorcyclePayload = {
  userId: string;
  brand: string;
  model: string;
  year: string;
  engineCc: number;
  name?: string | null;
  engineInfo?: string | null;
  imageUrl?: string | null;
  status?: MotorcycleStatus;
  visibility?: Visibility;
};

export type UpdateMotorcyclePayload = Partial<{
  name: string | null;
  brand: string;
  model: string;
  year: string;
  engine_cc: number | null;
  engine_info: string | null;
  image_url: string | null;
  status: MotorcycleRow["status"];
  visibility: MotorcycleRow["visibility"];
  archived_at: string | null;
}>;

export async function listMotorcyclesByUserId(userId: string) {
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function listArchivedMotorcyclesByUserId(userId: string) {
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getMotorcycleById(id: string) {
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMotorcycleById(
  motorcycleId: string,
  payload: UpdateMotorcyclePayload,
): Promise<MotorcycleRow> {
  const { data, error } = await supabase
    .from("motorcycles")
    .update(payload)
    .eq("id", motorcycleId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createMotorcycle({
  userId,
  brand,
  model,
  year,
  engineCc,
  name = null,
  engineInfo = null,
  imageUrl = null,
  status = "in_progress",
  visibility = "public",
}: CreateMotorcyclePayload): Promise<MotorcycleRow> {
  const { data, error } = await supabase
    .from("motorcycles")
    .insert({
      user_id: userId,
      brand,
      model,
      year,
      engine_cc: engineCc,
      engine_info: engineInfo,
      image_url: imageUrl,
      name,
      status,
      visibility,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveMotorcycleById(
  motorcycleId: string,
): Promise<MotorcycleRow> {
  return updateMotorcycleById(motorcycleId, {
    archived_at: new Date().toISOString(),
  });
}

export async function restoreMotorcycleById(
  motorcycleId: string,
): Promise<MotorcycleRow> {
  return updateMotorcycleById(motorcycleId, {
    archived_at: null,
  });
}
