import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { getGalleryItemById } from "@/src/features/garage/repositories/motorcycleGallery.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleGalleryItemRow } from "@/src/shared/types/database.types";

export function GalleryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [galleryItem, setGalleryItem] =
    useState<MotorcycleGalleryItemRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState<string | null>(null);

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

          {galleryItem.caption ? (
            <AppText variant="bodyMedium" style={styles.caption}>
              {galleryItem.caption}
            </AppText>
          ) : (
            <AppText variant="bodyMedium" style={styles.caption}>
              Tidak ada caption.
            </AppText>
          )}

          <AppText variant="caption" tone="muted" style={styles.dateText}>
            {new Date(galleryItem.created_at).toLocaleDateString("id-ID")}
          </AppText>
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
});
