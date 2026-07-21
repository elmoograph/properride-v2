import { router } from "expo-router";
import { Archive, ChevronLeft, MoreVertical, Pencil } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type BuildHeroProps = {
  imageUrl: string | null;
  motorcycleId: string;
  showBackButton: boolean;
  canEdit: boolean;
  archiving: boolean;
  onArchive: () => void;
};

export function BuildHero({
  imageUrl,
  motorcycleId,
  showBackButton,
  canEdit,
  archiving,
  onArchive,
}: BuildHeroProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  function closeMenuAndArchive() {
    setMenuVisible(false);
    onArchive();
  }

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
            accessibilityRole="button"
            accessibilityLabel="Buka menu Build"
            onPress={() => setMenuVisible(true)}
          >
            <MoreVertical size={20} color={theme.textPrimary} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup menu Build"
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuCard}>
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                router.push(`/motorcycle/edit/${motorcycleId}`);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Pencil size={18} color={theme.textPrimary} />
              <AppText variant="bodyMedium">Edit motor</AppText>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              disabled={archiving}
              onPress={closeMenuAndArchive}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
                archiving && styles.menuItemDisabled,
              ]}
            >
              {archiving ? (
                <ActivityIndicator size="small" color={theme.danger} />
              ) : (
                <Archive size={18} color={theme.danger} />
              )}
              <AppText variant="bodyMedium" style={styles.archiveText}>
                {archiving ? "Memproses..." : "Arsipkan motor"}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 15, 20, 0.28)",
  },
  menuCard: {
    position: "absolute",
    top: spacing.section + 44,
    right: spacing.lg,
    width: 190,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: spacing.xs,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.borderSoft,
    marginHorizontal: spacing.md,
  },
  menuItemPressed: {
    backgroundColor: theme.surfaceSoft,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  archiveText: {
    color: theme.danger,
  },
});
