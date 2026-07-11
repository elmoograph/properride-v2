import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, Pencil, Trash2, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  deleteGalleryItemById,
  getGalleryItemById,
  updateGalleryItemCaptionById,
} from "@/src/features/garage/repositories/motorcycleGallery.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme, typography } from "@/src/shared/theme";
import type { MotorcycleGalleryItemRow } from "@/src/shared/types/database.types";

export function GalleryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [galleryItem, setGalleryItem] =
    useState<MotorcycleGalleryItemRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const [savingCaption, setSavingCaption] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadGalleryItem() {
        if (!id) {
          setScreenError("Foto tidak ditemukan.");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setScreenError(null);

          const data = await getGalleryItemById(id);

          if (!data) {
            throw new Error("Foto gallery tidak ditemukan.");
          }

          if (isActive) {
            setGalleryItem(data);
            setCaptionDraft(data.caption ?? "");
            setEditingCaption(false);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat foto.";

          if (isActive) {
            setScreenError(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadGalleryItem();

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  function handleStartEditCaption() {
    if (!galleryItem) {
      return;
    }

    setCaptionDraft(galleryItem.caption ?? "");
    setEditingCaption(true);
  }

  function handleCancelEditCaption() {
    setCaptionDraft(galleryItem?.caption ?? "");
    setEditingCaption(false);
  }

  async function handleSaveCaption() {
    if (!galleryItem) {
      return;
    }

    try {
      setSavingCaption(true);

      const cleanCaption = captionDraft.trim();
      const updatedGalleryItem = await updateGalleryItemCaptionById(
        galleryItem.id,
        cleanCaption || null,
      );

      setGalleryItem(updatedGalleryItem);
      setCaptionDraft(updatedGalleryItem.caption ?? "");
      setEditingCaption(false);

      Alert.alert("Caption tersimpan", "Caption gallery berhasil diperbarui.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan caption.";

      Alert.alert("Gagal menyimpan caption", message);
    } finally {
      setSavingCaption(false);
    }
  }

  function handleDeletePhoto() {
    if (!galleryItem) {
      return;
    }

    Alert.alert(
      "Hapus foto?",
      "Foto ini akan dihapus dari Gallery motor. Aksi ini tidak bisa dibatalkan.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);

              await deleteGalleryItemById(galleryItem.id);

              Alert.alert(
                "Foto dihapus",
                "Foto berhasil dihapus dari Gallery.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ],
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan saat menghapus foto.";

              Alert.alert("Gagal menghapus foto", message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <AppScreen padded={false}>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary">Memuat foto...</AppText>
        </View>
      </AppScreen>
    );
  }

  if (screenError || !galleryItem) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Foto tidak ditemukan</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {screenError ?? "Data foto belum tersedia atau sudah dihapus."}
          </AppText>
          <AppButton onPress={() => router.back()}>Kembali</AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen padded={false}>
      <View style={styles.container}>
        <Image
          source={{ uri: galleryItem.image_url }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.topActions}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={theme.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.bottomSheet}>
          <AppText variant="caption" tone="accent">
            Gallery
          </AppText>

          {editingCaption ? (
            <View style={styles.captionEditor}>
              <TextInput
                value={captionDraft}
                onChangeText={setCaptionDraft}
                placeholder="Tulis caption gallery..."
                placeholderTextColor={theme.textMuted}
                selectionColor={theme.primary}
                multiline
                style={styles.captionInput}
              />

              <View style={styles.captionActions}>
                <Pressable
                  disabled={savingCaption}
                  onPress={handleCancelEditCaption}
                  style={({ pressed }) => [
                    styles.captionActionButton,
                    pressed && styles.pressed,
                    savingCaption && styles.disabledButton,
                  ]}
                >
                  <X size={15} color={theme.textMuted} />
                  <AppText variant="caption" tone="secondary">
                    Batal
                  </AppText>
                </Pressable>

                <Pressable
                  disabled={savingCaption}
                  onPress={handleSaveCaption}
                  style={({ pressed }) => [
                    styles.captionActionButton,
                    styles.captionSaveButton,
                    pressed && styles.pressed,
                    savingCaption && styles.disabledButton,
                  ]}
                >
                  {savingCaption ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Check size={15} color={theme.primary} />
                  )}

                  <AppText variant="caption" tone="accent">
                    {savingCaption ? "Menyimpan..." : "Simpan"}
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {galleryItem.caption ? (
                <AppText variant="bodyMedium" style={styles.caption}>
                  {galleryItem.caption}
                </AppText>
              ) : (
                <AppText variant="bodyMedium" style={styles.caption}>
                  Tidak ada caption.
                </AppText>
              )}

              <Pressable
                onPress={handleStartEditCaption}
                style={({ pressed }) => [
                  styles.editCaptionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Pencil size={15} color={theme.primary} />
                <AppText variant="caption" tone="accent">
                  Edit Caption
                </AppText>
              </Pressable>
            </>
          )}

          <AppText variant="caption" tone="muted" style={styles.dateText}>
            {new Date(galleryItem.created_at).toLocaleDateString("id-ID")}
          </AppText>

          <Pressable
            disabled={deleting}
            onPress={handleDeletePhoto}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
              deleting && styles.disabledButton,
            ]}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={theme.danger} />
            ) : (
              <Trash2 size={16} color={theme.danger} />
            )}

            <AppText variant="caption" style={styles.deleteText}>
              {deleting ? "Menghapus..." : "Hapus Foto"}
            </AppText>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  image: {
    width: "100%",
    height: "100%",
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
  bottomSheet: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: "rgba(18, 24, 33, 0.94)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  caption: {
    marginTop: spacing.xs,
  },
  dateText: {
    marginTop: spacing.sm,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
  },
  deleteButton: {
    marginTop: spacing.lg,
    minHeight: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: theme.danger,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  deleteText: {
    color: theme.danger,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  editCaptionButton: {
    marginTop: spacing.md,
    minHeight: 36,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  captionEditor: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  captionInput: {
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: theme.textPrimary,
    textAlignVertical: "top",
    ...typography.body,
  },
  captionActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  captionActionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  captionSaveButton: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
});
