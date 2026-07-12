import { supabase } from "@/src/shared/lib/supabase";
import type { MotorcycleGalleryItemRow } from "@/src/shared/types/database.types";

export type CreateMotorcycleGalleryItemPayload = {
  motorcycleId: string;
  userId: string;
  imageUrl: string;
  caption?: string | null;
  relatedPostId?: string | null;
};

export async function listGalleryItemsByMotorcycleId(motorcycleId: string) {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .eq("status", "active")
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
  relatedPostId = null,
}: CreateMotorcycleGalleryItemPayload): Promise<MotorcycleGalleryItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .insert({
      motorcycle_id: motorcycleId,
      user_id: userId,
      image_url: imageUrl,
      caption,
      related_post_id: relatedPostId,
      status: "active",
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

export async function deleteGalleryItemById(galleryItemId: string) {
  const { error } = await supabase
    .from("motorcycle_gallery_items")
    .delete()
    .eq("id", galleryItemId);

  if (error) {
    throw error;
  }
}

export async function updateGalleryItemCaptionById(
  galleryItemId: string,
  caption: string | null,
): Promise<MotorcycleGalleryItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .update({
      caption,
    })
    .eq("id", galleryItemId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveGalleryItemById(
  galleryItemId: string,
): Promise<MotorcycleGalleryItemRow> {
  const { data, error } = await supabase
    .from("motorcycle_gallery_items")
    .update({
      status: "archived",
    })
    .eq("id", galleryItemId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
