import type { User } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/lib/supabase";
import type { ProfileRow } from "@/src/shared/types/database.types";

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

function getFallbackUsername(user: User) {
  const emailPrefix = user.email?.split("@")[0] ?? "rider";
  const safePrefix = normalizeUsername(emailPrefix) || "rider";
  const userSuffix = user.id.slice(0, 8);

  return `${safePrefix}.${userSuffix}`;
}

function getFullNameFromUser(user: User) {
  const metadataFullName = user.user_metadata?.full_name;

  if (typeof metadataFullName === "string" && metadataFullName.trim()) {
    return metadataFullName.trim();
  }

  return user.email?.split("@")[0] ?? "ProperRide User";
}

function getUsernameFromUser(user: User) {
  const metadataUsername = user.user_metadata?.username;

  if (typeof metadataUsername === "string" && metadataUsername.trim()) {
    return normalizeUsername(metadataUsername);
  }

  return getFallbackUsername(user);
}

export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureProfileForUser(user: User) {
  const existingProfile = await getProfileById(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const profilePayload = {
    id: user.id,
    full_name: getFullNameFromUser(user),
    username: getUsernameFromUser(user),
    garage_name: null,
    avatar_url: null,
    location: null,
    bio: null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(profilePayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  payload: Partial<
    Pick<
      ProfileRow,
      | "full_name"
      | "username"
      | "garage_name"
      | "avatar_url"
      | "location"
      | "bio"
    >
  >,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
