import { router } from "expo-router";
import { Bike, ImagePlus, PackagePlus, PenSquare } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import { CreateActionCard } from "@/src/features/create/components/CreateActionCard";

export function CreateScreen() {
  return (
    <AppScreen>
      <View style={styles.header}>
        <AppText variant="titleLarge">Create</AppText>
        <AppText tone="secondary" style={styles.subtitle}>
          Buat post, tambah motor, atau catat part dengan cepat.
        </AppText>
      </View>

      <View style={styles.actions}>
        <CreateActionCard
          icon={<PenSquare size={24} color={theme.primary} />}
          title="Buat Post"
          description="Bagikan momen, cerita ride, atau inspirasi ke komunitas."
          onPress={() => router.push("/(create)/create-post")}
        />

        <CreateActionCard
          icon={<Bike size={24} color={theme.primary} />}
          title="Tambah Motor"
          description="Simpan motor kamu ke Garage agar bisa terhubung ke post."
          onPress={() => router.push("/(create)/add-motorcycle")}
        />

        <CreateActionCard
          icon={<PackagePlus size={24} color={theme.primary} />}
          title="Tambah Part"
          description="Pilih motor dulu, lalu catat part yang terpasang."
          onPress={() => router.push("/(create)/select-motorcycle-for-part")}
        />

        <CreateActionCard
          icon={<ImagePlus size={24} color={theme.primary} />}
          title="Tambah Gallery"
          description="Pilih motor dulu, lalu tambahkan foto ke galerinya."
          onPress={() => router.push("/(create)/select-motorcycle-for-gallery")}
        />
      </View>

      <View style={styles.note}>
        <AppText variant="caption" tone="muted">
          Form detail akan dibuat sederhana dulu. Informasi tambahan bisa
          dilengkapi nanti.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  subtitle: {
    maxWidth: 300,
  },
  actions: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  note: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
});
