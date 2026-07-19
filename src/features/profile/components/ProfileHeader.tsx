import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, MapPin, Warehouse } from "lucide-react-native";
import { router } from "expo-router";

import { AppAvatar, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type ProfileHeaderData = {
  displayName: string;
  username: string;
  garageName: string;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
};

type ProfileHeaderProps = {
  profile: ProfileHeaderData;
  showGarageButton?: boolean;
};

export function ProfileHeader({
  profile,
  showGarageButton = true,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <AppAvatar uri={profile.avatarUrl} size="xl" />

        <View style={styles.identityText}>
          <AppText variant="titleLarge" style={styles.name} numberOfLines={1}>
            {profile.username}
          </AppText>

          <AppText variant="caption" tone="secondary" style={styles.fullName}>
            Full Name: {profile.displayName}
          </AppText>

          <View style={styles.locationRow}>
            <MapPin size={13} color={theme.primary} />

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.location}
              numberOfLines={1}
            >
              {profile.location ?? "Lokasi belum diisi"}
            </AppText>
          </View>
        </View>
      </View>

      <AppText tone="secondary" style={styles.bio}>
        {profile.bio ?? "Ceritakan sedikit tentang gaya build dan motor kamu."}
      </AppText>

      {showGarageButton ? <Pressable
        onPress={() => router.push("/(tabs)/garage")}
        style={({ pressed }) => [
          styles.garageButton,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.garageButtonLeft}>
          <View style={styles.garageIcon}>
            <Warehouse size={18} color={theme.primary} />
          </View>

          <View>
            <AppText variant="bodyMedium">Buka Garage</AppText>
            <AppText variant="caption" tone="secondary">
              {profile.garageName}
            </AppText>
          </View>
        </View>

        <ChevronRight size={18} color={theme.textMuted} />
      </Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  identityText: {
    flex: 1,
  },
  name: {
    marginTop: 0,
  },
  fullName: {
    marginTop: spacing.xs,
  },
  locationRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  location: {
    flex: 1,
  },
  bio: {
    marginTop: spacing.lg,
  },
  garageButton: {
    marginTop: spacing.lg,
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  garageButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  garageIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
