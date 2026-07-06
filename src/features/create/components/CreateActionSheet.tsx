import { router } from "expo-router";
import {
  Bike,
  ImagePlus,
  Images,
  PenSquare,
  Wrench,
  X,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type CreateActionSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type CreateActionItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

export function CreateActionSheet({
  visible,
  onClose,
}: CreateActionSheetProps) {
  function handleNavigate(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <View style={styles.titleIcon}>
                <PenSquare size={20} color={theme.primary} />
              </View>

              <View style={styles.headerText}>
                <AppText variant="titleLarge">Create</AppText>
                <AppText tone="secondary" style={styles.subtitle}>
                  Pilih apa yang ingin kamu buat di ProperRide.
                </AppText>
              </View>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={18} color={theme.textMuted} />
            </Pressable>
          </View>

          <View style={styles.actionList}>
            <CreateActionItem
              icon={<ImagePlus size={20} color={theme.primary} />}
              title="Create Post"
              description="Bagikan foto, caption, dan inspirasi ke Feed."
              onPress={() => handleNavigate("/create-post")}
            />

            <CreateActionItem
              icon={<Bike size={20} color={theme.primary} />}
              title="Add Motorcycle"
              description="Tambahkan motor baru ke Garage kamu."
              onPress={() => handleNavigate("/add-motorcycle")}
            />

            <CreateActionItem
              icon={<Images size={20} color={theme.primary} />}
              title="Add Gallery"
              description="Tambahkan dokumentasi foto ke motor tertentu."
              onPress={() => handleNavigate("/select-motorcycle-for-gallery")}
            />

            <CreateActionItem
              icon={<Wrench size={20} color={theme.primary} />}
              title="Add Part"
              description="Pilih motor dulu, lalu catat part/modifikasi."
              onPress={() => handleNavigate("/select-motorcycle-for-part")}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CreateActionItem({
  icon,
  title,
  description,
  onPress,
}: CreateActionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionItem,
        pressed && styles.actionPressed,
      ]}
    >
      <View style={styles.actionIcon}>{icon}</View>

      <View style={styles.actionText}>
        <AppText variant="bodyMedium">{title}</AppText>
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.actionDescription}
          numberOfLines={2}
        >
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: theme.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    flex: 1,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionList: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  actionItem: {
    minHeight: 74,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
  },
  actionDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  actionPressed: {
    opacity: 0.82,
  },
});
