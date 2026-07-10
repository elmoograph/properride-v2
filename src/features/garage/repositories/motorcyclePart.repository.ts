import { supabase } from "@/src/shared/lib/supabase";
import type {
  MotorcyclePartRow,
  MotorcycleTimelineItemRow,
} from "@/src/shared/types/database.types";

export type CreateMotorcyclePartPayload = {
  motorcycleId: string;
  userId: string;
  category: string;
  brand: string;
  name: string;
  description?: string | null;
};

export type UpdateMotorcyclePartPayload = Partial<{
  category: string;
  brand: string;
  name: string;
  description: string | null;
}>;

export async function listPartsByMotorcycleId(
  motorcycleId: string,
): Promise<MotorcyclePartRow[]> {
  const { data, error } = await supabase
    .from("motorcycle_parts")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createMotorcyclePart({
  motorcycleId,
  userId,
  category,
  brand,
  name,
  description = null,
}: CreateMotorcyclePartPayload): Promise<MotorcyclePartRow> {
  const { data, error } = await supabase
    .from("motorcycle_parts")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      category,
      brand,
      name,
      description,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveMotorcyclePartById(partId: string): Promise<void> {
  const { error } = await supabase
    .from("motorcycle_parts")
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq("id", partId);

  if (error) {
    throw error;
  }
}

export type CreateMotorcycleTimelineItemPayload = {
  motorcycleId: string;
  userId: string;
  title: string;
  description: string;
};

export async function listTimelineItemsByMotorcycleId(
  motorcycleId: string,
): Promise<MotorcycleTimelineItemRow[]> {
  const { data, error } = await supabase
    .from("motorcycle_timeline_items")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createPartAddedTimelineItem({
  motorcycleId,
  userId,
  title,
  description,
}: CreateMotorcycleTimelineItemPayload): Promise<MotorcycleTimelineItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_timeline_items")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      action: "part_added",
      title,
      description,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPartArchivedTimelineItem({
  motorcycleId,
  userId,
  title,
  description,
}: CreateMotorcycleTimelineItemPayload): Promise<MotorcycleTimelineItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_timeline_items")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      action: "part_removed",
      title,
      description,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMotorcyclePartById(
  partId: string,
): Promise<MotorcyclePartRow | null> {
  const { data, error } = await supabase
    .from("motorcycle_parts")
    .select("*")
    .eq("id", partId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMotorcyclePartById(
  partId: string,
  payload: UpdateMotorcyclePartPayload,
): Promise<MotorcyclePartRow> {
  const { data, error } = await supabase
    .from("motorcycle_parts")
    .update(payload)
    .eq("id", partId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
