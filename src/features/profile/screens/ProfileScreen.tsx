import {
  Activity,
  Bookmark,
  CircleHelp,
  LogOut,
  PenLine,
  Settings,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import {
  builderProfile,
  currentUser,
  feedPosts,
} from "@/src/shared/constants/mockData";
import { spacing, theme } from "@/src/shared/theme";
import { ProfileHeader } from "@/src/features/profile/components/ProfileHeader";
import { ProfileMenuItem } from "@/src/features/profile/components/ProfileMenuItem";
import { ProfilePostGrid } from "@/src/features/profile/components/ProfilePostGrid";

export function ProfileScreen() {
  const myPosts = feedPosts.filter((post) => post.userId === currentUser.id);

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <AppText variant="titleLarge">Profile</AppText>
        <AppText tone="secondary" style={styles.subtitle}>
          Kelola identitas builder, akun, dan aktivitas kamu.
        </AppText>
      </View>

      <View style={styles.content}>
        <ProfileHeader profile={builderProfile} />

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
            title="Keluar"
            danger
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
});
