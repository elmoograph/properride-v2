import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";

import { supabase } from "@/src/shared/lib/supabase";

const STORAGE_BUCKET = "properride-media";

type UploadImagePayload = {
  uri: string;
  path: string;
};

export async function uploadImageToStorage({
  uri,
  path,
}: UploadImagePayload): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();

  const fileExt = getFileExtension(file.name || uri);
  const contentType = getImageContentType(fileExt);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, decode(base64), {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}

export function createStorageImagePath({
  userId,
  folder,
  ownerId,
  fileName,
}: {
  userId: string;
  folder: "avatars" | "motorcycles" | "gallery" | "posts";
  ownerId?: string;
  fileName?: string;
}) {
  const safeFileName = fileName ?? `${Date.now()}-${randomId()}.jpg`;

  if (ownerId) {
    return `${userId}/${folder}/${ownerId}/${safeFileName}`;
  }

  return `${userId}/${folder}/${safeFileName}`;
}

function getFileExtension(value: string) {
  const cleanValue = value.split("?")[0] ?? value;
  const extension = cleanValue.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
}

function getImageContentType(extension: string) {
  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
