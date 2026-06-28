import { Image, Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, Warehouse } from "lucide-react-native";

import { AppText } from "@/src/shared/components";
import type { BuilderProfile } from "@/src/shared/types/app.types";
import { radius, spacing, theme } from "@/src/shared/theme";

type ProfileHeaderProps = {
  profile: BuilderProfile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />

        <View style={styles.identityText}>
          <AppText variant="caption" tone="muted">
            Builder Name
          </AppText>

          <AppText variant="titleLarge" style={styles.name}>
            {profile.builderName}
          </AppText>

          <AppText variant="caption" tone="secondary" style={styles.location}>
            {profile.location}
          </AppText>
        </View>
      </View>

      <AppText tone="secondary" style={styles.bio}>
        {profile.bio}
      </AppText>

      <Pressable
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
      </Pressable>
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 2,
    borderColor: theme.border,
  },
  identityText: {
    flex: 1,
  },
  name: {
    marginTop: spacing.xs,
  },
  location: {
    marginTop: spacing.xs,
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
