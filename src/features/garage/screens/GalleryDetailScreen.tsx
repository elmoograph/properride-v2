import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Archive,
  Bookmark,
  Check,
  ChevronLeft,
  Heart,
  MoreHorizontal,
  Pencil,
  Share2,
  X,
} from "lucide-react-native";
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
  archiveGalleryItemById,
  getGalleryItemById,
} from "@/src/features/garage/repositories/motorcycleGallery.repository";
import {
  archivePostById,
  getPostById,
  updatePostCaptionById,
} from "@/src/features/feed/repositories/post.repository";
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
  const [relatedPostCaption, setRelatedPostCaption] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

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
          let postCaption = "";

          if (data.related_post_id) {
            const relatedPost = await getPostById(data.related_post_id);
            postCaption = relatedPost?.caption ?? "";
          }

          if (isActive) {
            setGalleryItem(data);
            setRelatedPostCaption(postCaption);
            setCaptionDraft(postCaption);
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
    if (!galleryItem?.related_post_id) {
      return;
    }

    setCaptionDraft(relatedPostCaption);
    setEditingCaption(true);
    setMenuVisible(false);
  }

  function handleCancelEditCaption() {
    setCaptionDraft(relatedPostCaption);
    setEditingCaption(false);
  }

  async function handleSaveCaption() {
    if (!galleryItem?.related_post_id) {
      return;
    }

    const cleanCaption = captionDraft.trim();

    if (!cleanCaption) {
      Alert.alert("Caption kosong", "Caption Feed tidak boleh kosong.");
      return;
    }

    try {
      setSavingCaption(true);

      await updatePostCaptionById(galleryItem.related_post_id, cleanCaption);

      setRelatedPostCaption(cleanCaption);
      setCaptionDraft(cleanCaption);
      setEditingCaption(false);
      setMenuVisible(false);

      Alert.alert("Caption tersimpan", "Caption Feed berhasil diperbarui.");
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

  function handleArchivePhoto() {
    if (!galleryItem) {
      return;
    }

    setMenuVisible(false);

    const message = galleryItem.related_post_id
      ? "Foto ini akan diarsipkan dari Gallery dan Post terkait akan diarsipkan dari Feed."
      : "Foto ini akan diarsipkan dari Gallery motor.";

    Alert.alert("Archive foto?", message, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Archive",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);

            await archiveGalleryItemById(galleryItem.id);

            if (galleryItem.related_post_id) {
              await archivePostById(galleryItem.related_post_id);
            }

            Alert.alert("Foto diarsipkan", "Foto berhasil diarsipkan.", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat mengarsipkan foto.";

            Alert.alert("Gagal mengarsipkan foto", message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
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

  const hasRelatedPost = Boolean(galleryItem.related_post_id);

  return (
    <AppScreen padded={false}>
      <View style={styles.container}>
        <Image
          source={{ uri: galleryItem.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.topActions}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={theme.textPrimary} />
          </Pressable>

          <View>
            <Pressable
              style={styles.iconButton}
              onPress={() => setMenuVisible((current) => !current)}
            >
              <MoreHorizontal size={22} color={theme.textPrimary} />
            </Pressable>

            {menuVisible ? (
              <View style={styles.menuCard}>
                {hasRelatedPost ? (
                  <Pressable
                    onPress={handleStartEditCaption}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Pencil size={16} color={theme.textPrimary} />
                    <AppText variant="caption">Edit Caption</AppText>
                  </Pressable>
                ) : null}

                <Pressable
                  disabled={deleting}
                  onPress={handleArchivePhoto}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.pressed,
                    deleting && styles.disabledButton,
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color={theme.danger} />
                  ) : (
                    <Archive size={16} color={theme.danger} />
                  )}

                  <AppText variant="caption" style={styles.archiveText}>
                    {deleting ? "Mengarsipkan..." : "Archive Foto"}
                  </AppText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.bottomContent}>
          {editingCaption ? (
            <View style={styles.captionEditPanel}>
              <TextInput
                value={captionDraft}
                onChangeText={setCaptionDraft}
                placeholder="Tulis caption Feed..."
                placeholderTextColor={theme.textMuted}
                selectionColor={theme.primary}
                multiline
                maxLength={220}
                style={styles.captionEditInput}
              />

              <View style={styles.captionEditFooter}>
                <AppText variant="tiny" tone="muted">
                  {captionDraft.length}/220
                </AppText>

                <View style={styles.captionEditActions}>
                  <Pressable
                    disabled={savingCaption}
                    onPress={handleCancelEditCaption}
                    style={({ pressed }) => [
                      styles.captionGhostButton,
                      pressed && styles.pressed,
                      savingCaption && styles.disabledButton,
                    ]}
                  >
                    <AppText variant="caption" tone="secondary">
                      Batal
                    </AppText>
                  </Pressable>

                  <Pressable
                    disabled={savingCaption}
                    onPress={handleSaveCaption}
                    style={({ pressed }) => [
                      styles.captionPrimaryButton,
                      pressed && styles.pressed,
                      savingCaption && styles.disabledButton,
                    ]}
                  >
                    {savingCaption ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.background}
                      />
                    ) : (
                      <Check size={15} color={theme.background} />
                    )}

                    <AppText
                      variant="caption"
                      style={styles.captionPrimaryText}
                    >
                      {savingCaption ? "Menyimpan" : "Simpan"}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <>
              {hasRelatedPost && relatedPostCaption ? (
                <AppText variant="bodyMedium" style={styles.caption}>
                  {relatedPostCaption}
                </AppText>
              ) : null}

              <View style={styles.socialActions}>
                <Pressable style={styles.socialButton}>
                  <Heart size={22} color={theme.textPrimary} />
                </Pressable>

                <Pressable style={styles.socialButton}>
                  <Bookmark size={22} color={theme.textPrimary} />
                </Pressable>

                <Pressable style={styles.socialButton}>
                  <Share2 size={22} color={theme.textPrimary} />
                </Pressable>
              </View>
            </>
          )}
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
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  caption: {
    maxWidth: "86%",
    marginBottom: spacing.md,
    color: theme.textPrimary,
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 6,
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
  disabledButton: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  menuCard: {
    position: "absolute",
    right: 0,
    top: 48,
    width: 180,
    borderRadius: radius.lg,
    backgroundColor: "rgba(18, 24, 33, 0.96)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  menuItem: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  archiveText: {
    color: theme.danger,
  },
  bottomContent: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    alignItems: "flex-start",
  },
  socialActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  captionEditPanel: {
    width: "100%",
    borderRadius: radius.xl,
    backgroundColor: "rgba(11, 15, 20, 0.9)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  captionEditInput: {
    minHeight: 72,
    maxHeight: 132,
    color: theme.textPrimary,
    padding: 0,
    textAlignVertical: "top",
    ...typography.body,
  },
  captionEditFooter: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  captionEditActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  captionGhostButton: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  captionPrimaryButton: {
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  captionPrimaryText: {
    color: theme.background,
  },
});
