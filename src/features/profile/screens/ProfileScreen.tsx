import {
  Activity,
  Bookmark,
  CircleHelp,
  LogOut,
  PenLine,
  Settings,
} from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ProfileHeader } from "@/src/features/profile/components/ProfileHeader";
import { ProfileMenuItem } from "@/src/features/profile/components/ProfileMenuItem";
import { ProfilePostGrid } from "@/src/features/profile/components/ProfilePostGrid";
import { ensureProfileForUser } from "@/src/features/profile/repositories/profile.repository";
import { listPostsByUserId } from "@/src/features/feed/repositories/post.repository";
import type { FeedPost } from "@/src/shared/types/app.types";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import type { ProfileRow } from "@/src/shared/types/database.types";

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        setProfileError(null);

        const [userProfile, posts] = await Promise.all([
          ensureProfileForUser(user),
          listPostsByUserId(user.id),
        ]);

        if (isMounted) {
          setProfile(userProfile);
          setMyPosts(posts);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat profil.";

        if (isMounted) {
          setProfileError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleSignOut() {
    try {
      setSigningOut(true);

      await signOut();

      router.replace("/(auth)/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat keluar.";

      Alert.alert("Gagal keluar", message);
    } finally {
      setSigningOut(false);
    }
  }

  if (loadingProfile) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat profil...
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
            Silakan masuk kembali untuk membuka Profile.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (profileError || !profile) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Profile belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {profileError ?? "Data profil belum tersedia."}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/feed")}>
            Kembali ke Feed
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const profileHeaderData = {
    displayName: profile.full_name,
    username: profile.username,
    garageName: profile.garage_name ?? "Garage belum dinamai",
    avatarUrl: profile.avatar_url,
    location: profile.location,
    bio: profile.bio,
  };

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <AppText variant="titleLarge">Profile</AppText>
        <AppText tone="secondary" style={styles.subtitle}>
          Kelola identitas builder, akun, dan aktivitas kamu.
        </AppText>
      </View>

      <View style={styles.content}>
        <ProfileHeader profile={profileHeaderData} />

        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionText}>
              <AppText variant="title">My Posts</AppText>
              <AppText
                variant="caption"
                tone="secondary"
                style={styles.sectionSubtitle}
              >
                Post yang kamu buat dan tampil di Feed.
              </AppText>
            </View>

            <AppText variant="caption" tone="muted">
              {myPosts.length} post
            </AppText>
          </View>

          <ProfilePostGrid posts={myPosts} />
        </View>

        <View style={styles.menuSection}>
          <AppText variant="title">Account</AppText>

          <View style={styles.menuList}>
            <ProfileMenuItem
              icon={<PenLine size={18} color={theme.textPrimary} />}
              title="Edit Profil"
            />

            <ProfileMenuItem
              icon={<Bookmark size={18} color={theme.textPrimary} />}
              title="Tersimpan"
            />

            <ProfileMenuItem
              icon={<Activity size={18} color={theme.textPrimary} />}
              title="Aktivitas"
            />

            <ProfileMenuItem
              icon={<Settings size={18} color={theme.textPrimary} />}
              title="Pengaturan"
            />

            <ProfileMenuItem
              icon={<CircleHelp size={18} color={theme.textPrimary} />}
              title="Bantuan"
            />
          </View>
        </View>

        <View style={styles.logoutSection}>
          <ProfileMenuItem
            icon={<LogOut size={18} color={theme.danger} />}
            title={signingOut ? "Keluar..." : "Keluar"}
            danger
            onPress={handleSignOut}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  subtitle: {
    maxWidth: 320,
  },
  content: {
    marginTop: spacing.xl,
  },
  postsSection: {
    marginTop: spacing.section,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionText: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  menuSection: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  menuList: {
    gap: spacing.sm,
  },
  logoutSection: {
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
