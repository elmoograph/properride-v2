import { router } from "expo-router";
import {
  Bell,
  ChevronLeft,
  Lock,
  Moon,
  Shield,
  UserCircle,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export function SettingsScreen() {
  const { user, session } = useAuth();

  if (!user) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk membuka Pengaturan.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
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
          <AppText variant="titleLarge">Pengaturan</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Kelola preferensi aplikasi, privasi, dan informasi akun.
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">Account</AppText>

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <UserCircle size={22} color={theme.primary} />
          </View>

          <View style={styles.accountText}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {user.email ?? "Email tidak tersedia"}
            </AppText>

            <AppText variant="caption" tone="muted" numberOfLines={1}>
              User ID: {user.id}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.sessionText}
            >
              {session ? "Session aktif" : "Session tidak aktif"}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">Preferences</AppText>

        <View style={styles.settingList}>
          <SettingItem
            icon={<Moon size={18} color={theme.textPrimary} />}
            title="Appearance"
            description="Mode tampilan aplikasi."
            value="Dark"
          />

          <SettingItem
            icon={<Bell size={18} color={theme.textPrimary} />}
            title="Notifications"
            description="Pengaturan notifikasi aktivitas."
            value="Soon"
          />

          <SettingItem
            icon={<Shield size={18} color={theme.textPrimary} />}
            title="Privacy"
            description="Kontrol visibilitas akun dan konten."
            value="Soon"
          />

          <SettingItem
            icon={<Lock size={18} color={theme.textPrimary} />}
            title="Security"
            description="Password dan keamanan akun."
            value="Soon"
          />
        </View>
      </View>
    </AppScreen>
  );
}

function SettingItem({
  icon,
  title,
  description,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>

        <View style={styles.settingText}>
          <AppText variant="bodyMedium">{title}</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.settingDescription}
          >
            {description}
          </AppText>
        </View>
      </View>

      <AppText variant="caption" tone={value === "Soon" ? "muted" : "accent"}>
        {value}
      </AppText>
    </View>
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
  section: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  accountCard: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: {
    flex: 1,
  },
  sessionText: {
    marginTop: spacing.xs,
  },
  settingList: {
    gap: spacing.sm,
  },
  settingItem: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingDescription: {
    marginTop: spacing.xs,
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
