import { ImagePlus } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";
import { AppText } from "./AppText";

type ImageUploadBoxProps = {
  title: string;
  description?: string;
  imageUri?: string | null;
  onPress?: () => void;
};

export function ImageUploadBox({
  title,
  description = "Tambah foto dari perangkat kamu.",
  imageUri = null,
  onPress,
}: ImageUploadBoxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <View style={styles.emptyContent}>
          <View style={styles.iconBadge}>
            <ImagePlus size={24} color={theme.primary} />
          </View>

          <View style={styles.textContent}>
            <AppText variant="bodyMedium">{title}</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.description}
            >
              {description}
            </AppText>
          </View>
        </View>
      )}

      {imageUri ? (
        <View style={styles.previewOverlay}>
          <View style={styles.previewBadge}>
            <ImagePlus size={16} color={theme.primary} />
            <AppText variant="caption" tone="accent">
              Ganti Foto
            </AppText>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 148,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  description: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 188,
  },
  previewOverlay: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    alignItems: "flex-start",
  },
  previewBadge: {
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.82)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
