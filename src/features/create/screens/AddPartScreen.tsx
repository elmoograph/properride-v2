import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppInput,
  AppScreen,
  AppSelect,
  AppText,
} from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import {
  partBrandOptions,
  partCategoryOptions,
} from "@/src/shared/constants/partOptions";
import { spacing, theme } from "@/src/shared/theme";

type SelectField = "category" | "brand" | null;

export function AddPartScreen() {
  const { motorcycleId } = useLocalSearchParams<{ motorcycleId?: string }>();

  const [category, setCategory] = useState("");
  const [partBrand, setPartBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [partName, setPartName] = useState("");
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);

  const motorcycle =
    motorcycles.find((item) => item.id === motorcycleId) ?? motorcycles[0];

  const isCustomBrand = partBrand === "custom";

  const isSubmitDisabled =
    !category ||
    !partBrand ||
    (isCustomBrand && !customBrand.trim()) ||
    !partName.trim();

  function handleBrandChange(nextBrand: string) {
    setPartBrand(nextBrand);

    if (nextBrand !== "custom") {
      setCustomBrand("");
    }
  }

  function handleSavePart() {
    if (isSubmitDisabled) {
      return;
    }

    Alert.alert(
      "Part tersimpan",
      `Part berhasil ditambahkan ke ${motorcycle.brand} ${motorcycle.model}. Data ini masih sementara sampai Supabase dihubungkan.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Tambah Part</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Catat part untuk motor yang sedang kamu buka.
          </AppText>
        </View>
      </View>

      <View style={styles.contextCard}>
        <AppText variant="caption" tone="secondary">
          Motor terkait
        </AppText>

        <AppText variant="bodyMedium" style={styles.contextTitle}>
          {motorcycle.brand} {motorcycle.model}
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.contextMeta}>
          {motorcycle.year} · {motorcycle.engineInfo}
        </AppText>
      </View>

      <View style={styles.form}>
        <AppSelect
          label="Kategori part"
          placeholder="Pilih kategori"
          value={category}
          options={partCategoryOptions}
          visible={activeSelect === "category"}
          onOpen={() => setActiveSelect("category")}
          onClose={() => setActiveSelect(null)}
          onChange={setCategory}
        />

        <View style={styles.brandSection}>
          <AppSelect
            label="Brand part"
            placeholder="Pilih brand"
            value={partBrand}
            options={partBrandOptions}
            visible={activeSelect === "brand"}
            onOpen={() => setActiveSelect("brand")}
            onClose={() => setActiveSelect(null)}
            onChange={handleBrandChange}
          />

          {isCustomBrand ? (
            <AppInput
              label="By"
              placeholder="Contoh: Bengkel lokal / brand custom"
              value={customBrand}
              onChangeText={setCustomBrand}
              helperText="Isi nama pembuat atau brand custom."
            />
          ) : null}
        </View>

        <AppInput
          label="Nama part"
          placeholder="Contoh: Alpha Series"
          value={partName}
          onChangeText={setPartName}
          helperText="Isi nama produk atau seri part."
        />

        <AppButton
          disabled={isSubmitDisabled}
          style={styles.submitButton}
          onPress={handleSavePart}
        >
          Simpan Part
        </AppButton>

        <AppText variant="caption" tone="muted" style={styles.note}>
          Timeline motor akan diperbarui otomatis saat part ditambahkan atau
          dilepas.
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
  contextCard: {
    marginTop: spacing.section,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  contextTitle: {
    marginTop: spacing.xs,
  },
  contextMeta: {
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.section,
    gap: spacing.xl,
  },
  brandSection: {
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  note: {
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
});
