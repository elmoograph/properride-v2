import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { supabase } from "@/src/shared/lib/supabase";

const STORAGE_BUCKET = "properride-media";

type UploadImagePayload = {
  uri: string;
  path: string;
  base64?: string | null;
};

type UploadMediaPayload = {
  uri: string;
  path: string;
  mediaType: "image" | "video";
  base64?: string | null;
};

export async function uploadImageToStorage({
  uri,
  path,
  base64,
}: UploadImagePayload): Promise<string> {
  const imageBase64 = base64 ?? (await readImageAsBase64(uri));
  const fileExt = getFileExtension(path);
  const contentType = getImageContentType(fileExt);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, decode(imageBase64), {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadMediaToStorage({
  uri,
  path,
  mediaType,
  base64,
}: UploadMediaPayload): Promise<string> {
  const mediaBase64 = base64 ?? (await readMediaAsBase64(uri, mediaType));
  const fileExt = getFileExtension(path);
  const contentType =
    mediaType === "video"
      ? getVideoContentType(fileExt)
      : getImageContentType(fileExt);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, decode(mediaBase64), {
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
  extension = "jpg",
}: {
  userId: string;
  folder: "avatars" | "motorcycles" | "gallery" | "posts" | "garage-covers";
  ownerId?: string;
  fileName?: string;
  extension?: string;
}) {
  const safeFileName = fileName ?? `${Date.now()}-${randomId()}.${extension}`;

  if (ownerId) {
    return `${userId}/${folder}/${ownerId}/${safeFileName}`;
  }

  return `${userId}/${folder}/${safeFileName}`;
}

async function readImageAsBase64(uri: string) {
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    throw new Error(
      "Gagal membaca file gambar dari perangkat. Coba pilih gambar lain atau buka ulang aplikasi.",
    );
  }
}

async function readMediaAsBase64(uri: string, mediaType: "image" | "video") {
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    throw new Error(
      mediaType === "video"
        ? "Gagal membaca file video dari perangkat. Coba pilih video lain atau buka ulang aplikasi."
        : "Gagal membaca file gambar dari perangkat. Coba pilih gambar lain atau buka ulang aplikasi.",
    );
  }
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

function getVideoContentType(extension: string) {
  switch (extension) {
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "m4v":
      return "video/x-m4v";
    case "mp4":
    default:
      return "video/mp4";
  }
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
