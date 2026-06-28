import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
  ImageUploadBox,
} from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import { spacing, theme } from "@/src/shared/theme";
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";
import {
  VisibilitySelector,
  type VisibilityOption,
} from "@/src/features/create/components/VisibilitySelector";

export function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<
    string | null
  >(motorcycles[0]?.id ?? null);
  const [visibility, setVisibility] = useState<VisibilityOption>("public");

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Buat Post</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Bagikan momen ride dan hubungkan ke motor di Garage.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <ImageUploadBox
          title="Tambah foto / video"
          description="Untuk awal, cukup satu media dulu."
        />

        <AppInput
          label="Caption"
          placeholder="Ceritakan momen atau inspirasi ride kamu..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
          helperText={`${caption.length}/500`}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="caption" tone="secondary">
              Motor terkait dari Garage
            </AppText>

            <Pressable onPress={() => setSelectedMotorcycleId(null)}>
              <AppText variant="caption" tone="accent">
                Lewati
              </AppText>
            </Pressable>
          </View>

          <View style={styles.motorcycleList}>
            {motorcycles.map((motorcycle) => (
              <MotorcycleSelectCard
                key={motorcycle.id}
                motorcycle={motorcycle}
                selected={selectedMotorcycleId === motorcycle.id}
                onPress={() => setSelectedMotorcycleId(motorcycle.id)}
              />
            ))}
          </View>

          <AppText variant="caption" tone="muted" style={styles.helperText}>
            Opsional, tapi disarankan agar post terhubung ke Garage kamu.
          </AppText>
        </View>

        <VisibilitySelector value={visibility} onChange={setVisibility} />

        <AppButton style={styles.submitButton}>Bagikan</AppButton>
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
    maxWidth: 300,
  },
  form: {
    marginTop: spacing.section,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
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
  helperText: {
    marginLeft: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
