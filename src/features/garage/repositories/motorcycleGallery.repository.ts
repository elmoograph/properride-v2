import { supabase } from "@/src/shared/lib/supabase";
import type {
  MotorcycleGalleryItemRow,
  MotorcycleTimelineItemRow,
} from "@/src/shared/types/database.types";

export type CreateMotorcycleGalleryItemPayload = {
  motorcycleId: string;
  userId: string;
  imageUrl: string;
  caption?: string | null;
};

export async function listGalleryItemsByMotorcycleId(motorcycleId: string) {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createMotorcycleGalleryItem({
  motorcycleId,
  userId,
  imageUrl,
  caption = null,
}: CreateMotorcycleGalleryItemPayload): Promise<MotorcycleGalleryItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      image_url: imageUrl,
      caption,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export type CreateGalleryAddedTimelineItemPayload = {
  motorcycleId: string;
  userId: string;
  title: string;
  description: string;
};

export async function createGalleryAddedTimelineItem({
  motorcycleId,
  userId,
  title,
  description,
}: CreateGalleryAddedTimelineItemPayload): Promise<MotorcycleTimelineItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_timeline_items")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      action: "gallery_added",
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
