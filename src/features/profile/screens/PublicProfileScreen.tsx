import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { listPostsByUserId } from "@/src/features/feed/repositories/post.repository";
import { ProfileHeader } from "@/src/features/profile/components/ProfileHeader";
import { ProfilePostGrid } from "@/src/features/profile/components/ProfilePostGrid";
import { getProfileById } from "@/src/features/profile/repositories/profile.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import type { FeedPost } from "@/src/shared/types/app.types";
import type { ProfileRow } from "@/src/shared/types/database.types";

export function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id === user?.id) {
      router.replace("/(tabs)/profile");
      return;
    }

    let isActive = true;

    async function loadProfile() {
      if (!id) {
        setErrorMessage("Profil tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);
        const [profileData, postData] = await Promise.all([
          getProfileById(id),
          listPostsByUserId(id),
        ]);

        if (!profileData) {
          throw new Error("Profil tidak ditemukan.");
        }

        if (isActive) {
          setProfile(profileData);
          setPosts(postData);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat profil.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      isActive = false;
    };
  }, [id, user?.id]);

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary">Memuat profil builder...</AppText>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage || !profile) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Profil tidak ditemukan</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage ?? "Data profil belum tersedia."}
          </AppText>
          <AppButton onPress={() => router.back()}>Kembali</AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable>
      <View style={styles.titleRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>
        <AppText variant="titleLarge">Profile</AppText>
      </View>

      <View style={styles.content}>
        <ProfileHeader
          profile={{
            displayName: profile.full_name,
            username: profile.username,
            garageName: profile.garage_name ?? "Garage belum dinamai",
            avatarUrl: profile.avatar_url,
            location: profile.location,
            bio: profile.bio,
          }}
          showGarageButton={false}
        />

        <View style={styles.postsSection}>
          <AppText variant="title">Posts</AppText>
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            Post publik dari builder ini.
          </AppText>
          <View style={styles.gridWrap}>
            <ProfilePostGrid posts={posts} canCreatePost={false} />
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  content: { marginTop: spacing.xl },
  postsSection: { marginTop: spacing.section },
  subtitle: { marginTop: spacing.xs },
  gridWrap: { marginTop: spacing.md },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  centerText: { maxWidth: 280, textAlign: "center" },
});
