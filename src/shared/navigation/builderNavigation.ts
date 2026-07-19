import { router } from "expo-router";

type OpenBuilderProfileParams = {
  currentUserId: string | null | undefined;
  builderUserId: string;
};

export function openBuilderProfile({
  currentUserId,
  builderUserId,
}: OpenBuilderProfileParams) {
  if (currentUserId === builderUserId) {
    router.push("/(tabs)/profile");
    return;
  }

  router.push(`/profile/${builderUserId}`);
}

type OpenMotorcycleBuildParams = {
  currentUserId: string | null | undefined;
  ownerUserId: string;
  motorcycleId: string;
  archivedAt?: string | null;
};

export function openMotorcycleBuild({
  currentUserId,
  ownerUserId,
  motorcycleId,
  archivedAt,
}: OpenMotorcycleBuildParams) {
  if (currentUserId === ownerUserId && !archivedAt) {
    router.push({
      pathname: "/(tabs)/garage",
      params: { motorcycleId },
    });
    return;
  }

  router.push(`/motorcycle/${motorcycleId}`);
}
