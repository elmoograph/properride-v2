import { router } from "expo-router";
import { ChevronLeft, Edit3 } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type BuildHeroProps = {
  imageUrl: string | null;
  motorcycleId: string;
  showBackButton: boolean;
  canEdit: boolean;
};

export function BuildHero({
  imageUrl,
  motorcycleId,
  showBackButton,
  canEdit,
}: BuildHeroProps) {
  return (
    <View style={styles.heroWrap}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <AppText variant="caption" tone="secondary">
            Foto motor belum ditambahkan.
          </AppText>
        </View>
      )}

      <View style={styles.heroOverlay} />

      <View style={styles.topActions}>
        {showBackButton ? (
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={theme.textPrimary} />
          </Pressable>
        ) : (
          <View />
        )}

        {canEdit ? (
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push(`/motorcycle/edit/${motorcycleId}`)}
          >
            <Edit3 size={18} color={theme.textPrimary} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    height: "100%",
    backgroundColor: theme.surfaceSoft,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(11, 15, 20, 0.16)",
  },
  topActions: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});
