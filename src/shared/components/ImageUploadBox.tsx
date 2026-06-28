import { ImagePlus } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";
import { AppText } from "./AppText";

type ImageUploadBoxProps = {
  title: string;
  description?: string;
  onPress?: () => void;
};

export function ImageUploadBox({
  title,
  description = "Tambah foto dari perangkat kamu.",
  onPress,
}: ImageUploadBoxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.iconBadge}>
        <ImagePlus size={24} color={theme.primary} />
      </View>

      <View style={styles.textContent}>
        <AppText variant="bodyMedium">{title}</AppText>
        <AppText variant="caption" tone="secondary" style={styles.description}>
          {description}
        </AppText>
      </View>
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
  pressed: {
    opacity: 0.82,
  },
});
