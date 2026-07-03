import { router, useFocusEffect } from "expo-router";
import { Bookmark, ChevronLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ProfilePostGrid } from "@/src/features/profile/components/ProfilePostGrid";
import { listSavedPostsByUserId } from "@/src/features/feed/repositories/post.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { FeedPost } from "@/src/shared/types/app.types";

export function SavedPostsScreen() {
  const { user } = useAuth();

  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadSavedPosts() {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const posts = await listSavedPostsByUserId(user.id);

          if (isActive) {
            setSavedPosts(posts);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat post tersimpan.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadSavedPosts();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat post tersimpan...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (!user) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk melihat post tersimpan.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Tersimpan belum bisa dimuat</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/profile")}>
            Kembali ke Profile
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Tersimpan</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Post yang kamu simpan untuk dilihat lagi nanti.
          </AppText>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Bookmark size={20} color={theme.primary} />
        </View>

        <View style={styles.summaryText}>
          <AppText variant="bodyMedium">{savedPosts.length} post</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.summaryMeta}
          >
            Koleksi inspirasi modifikasi kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.gridSection}>
        <ProfilePostGrid posts={savedPosts} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  summaryCard: {
    marginTop: spacing.section,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    flex: 1,
  },
  summaryMeta: {
    marginTop: spacing.xs,
  },
  gridSection: {
    marginTop: spacing.section,
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
