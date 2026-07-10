import { supabase } from "@/src/shared/lib/supabase";
import type { MotorcycleGalleryItemRow } from "@/src/shared/types/database.types";

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

export async function getGalleryItemById(
  galleryItemId: string,
): Promise<MotorcycleGalleryItemRow | null> {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .select("*")
    .eq("id", galleryItemId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
