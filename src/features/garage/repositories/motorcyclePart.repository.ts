import { supabase } from "@/src/shared/lib/supabase";
import type {
  MotorcyclePartRow,
  MotorcycleTimelineItemRow,
} from "@/src/shared/types/database.types";

export type CreateMotorcyclePartPayload = {
  motorcycleId: string;
  category: string;
  brand: string;
  name: string;
  description?: string | null;
  timelineDescription: string;
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

export async function createMotorcyclePartWithTimeline({
  motorcycleId,
  category,
  brand,
  name,
  description = null,
  timelineDescription,
}: CreateMotorcyclePartPayload): Promise<MotorcyclePartRow> {
  const { data, error } = await supabase.rpc(
    "create_motorcycle_part_with_timeline",
    {
      p_motorcycle_id: motorcycleId,
      p_category: category,
      p_brand: brand,
      p_name: name,
      p_description: description,
      p_timeline_description: timelineDescription,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveMotorcyclePartWithTimeline(
  partId: string,
): Promise<MotorcyclePartRow> {
  const { data, error } = await supabase.rpc(
    "archive_motorcycle_part_with_timeline",
    {
      p_part_id: partId,
    },
  );

  if (error) {
    throw error;
  }
  return data;
}

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
