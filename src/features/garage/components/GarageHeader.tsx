import { Edit3 } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type GarageHeaderProps = {
  garageName: string;
  builderName: string;
  onPressEdit?: () => void;
};

const heroImageUrl =
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200";

export function GarageHeader({
  garageName,
  builderName,
  onPressEdit,
}: GarageHeaderProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: heroImageUrl }} style={styles.heroImage} />

      <View style={styles.floatingCard}>
        <View style={styles.identity}>
          <AppText variant="title" numberOfLines={1}>
            {garageName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.builderText}
          >
            <AppText variant="caption" tone="accent">
              Builder Name:{" "}
            </AppText>
            {builderName}
          </AppText>
        </View>

        <Pressable
          onPress={onPressEdit}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
        >
          <Edit3 size={14} color={theme.primary} />
          <AppText variant="caption" tone="accent">
            Edit Garage
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingBottom: 58,
  },
  heroImage: {
    width: "100%",
    height: 230,
    backgroundColor: theme.surfaceSoft,
  },
  floatingCard: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
    minHeight: 86,
    borderRadius: radius.xl,
    backgroundColor: "rgba(18, 24, 33, 0.96)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  identity: {
    flex: 1,
  },
  builderText: {
    marginTop: spacing.xs,
  },
  editButton: {
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(23, 177, 105, 0.12)",
    borderWidth: 1,
    borderColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
