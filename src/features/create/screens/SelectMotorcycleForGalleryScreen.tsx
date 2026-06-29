import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import { spacing, theme } from "@/src/shared/theme";
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";

export function SelectMotorcycleForGalleryScreen() {
  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Pilih Motor</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Pilih motor yang ingin kamu tambahkan foto galerinya.
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <AppText variant="caption" tone="secondary">
            Motor di Garage
          </AppText>

          <AppText variant="caption" tone="muted">
            Wajib
          </AppText>
        </View>

        <View style={styles.motorcycleList}>
          {motorcycles.map((motorcycle) => (
            <MotorcycleSelectCard
              key={motorcycle.id}
              motorcycle={motorcycle}
              onPress={() =>
                router.push(
                  `/(create)/add-gallery?motorcycleId=${motorcycle.id}`,
                )
              }
            />
          ))}
        </View>

        <AppText variant="caption" tone="muted" style={styles.note}>
          Gallery membutuhkan konteks motor agar foto tersimpan di motor yang
          tepat.
        </AppText>
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
    borderRadius: 999,
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
  content: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  sectionHeader: {
    marginLeft: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  motorcycleList: {
    gap: spacing.sm,
  },
  note: {
    marginTop: spacing.md,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
});
