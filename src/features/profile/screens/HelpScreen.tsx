import { router } from "expo-router";
import {
  ChevronLeft,
  CircleHelp,
  MessageCircle,
  ShieldCheck,
  Warehouse,
  Wrench,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export function HelpScreen() {
  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Bantuan</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Panduan singkat untuk menggunakan fitur utama ProperRide.
          </AppText>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <CircleHelp size={24} color={theme.primary} />
        </View>

        <View style={styles.heroText}>
          <AppText variant="title">ProperRide Help Center</AppText>
          <AppText tone="secondary" style={styles.heroDescription}>
            Temukan jawaban dasar tentang Garage, Post, aktivitas, dan akun.
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">Panduan Utama</AppText>

        <View style={styles.helpList}>
          <HelpItem
            icon={<Warehouse size={18} color={theme.primary} />}
            title="Garage"
            description="Garage adalah ruang utama untuk menampilkan koleksi motor, identitas build, dan dokumentasi setup kamu."
          />

          <HelpItem
            icon={<Wrench size={18} color={theme.primary} />}
            title="Setup Parts"
            description="Gunakan Setup Parts untuk mencatat part yang dipakai pada motor, termasuk kategori, brand, dan nama part."
          />

          <HelpItem
            icon={<MessageCircle size={18} color={theme.primary} />}
            title="Post dan Feed"
            description="Post digunakan untuk membagikan konten sosial ke Feed. Gallery tetap menjadi dokumentasi motor."
          />

          <HelpItem
            icon={<ShieldCheck size={18} color={theme.primary} />}
            title="Saved dan Activity"
            description="Saved menyimpan inspirasi yang ingin kamu lihat lagi. Activity menampilkan ringkasan like, save, dan komentar kamu."
          />
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">Support</AppText>

        <View style={styles.supportCard}>
          <AppText variant="bodyMedium">Butuh bantuan lebih lanjut?</AppText>
          <AppText tone="secondary" style={styles.supportText}>
            Untuk saat ini, fitur contact support belum tersedia. Nanti bagian
            ini bisa dihubungkan ke WhatsApp, email support, atau form feedback.
          </AppText>

          <View style={styles.statusBadge}>
            <AppText variant="caption" tone="accent">
              Coming Soon
            </AppText>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

function HelpItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.helpItem}>
      <View style={styles.helpIcon}>{icon}</View>

      <View style={styles.helpText}>
        <AppText variant="bodyMedium">{title}</AppText>
        <AppText tone="secondary" style={styles.helpDescription}>
          {description}
        </AppText>
      </View>
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
  heroCard: {
    marginTop: spacing.section,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
  },
  heroDescription: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  section: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  helpList: {
    gap: spacing.sm,
  },
  helpItem: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    flex: 1,
  },
  helpDescription: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  supportCard: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  supportText: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  statusBadge: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
