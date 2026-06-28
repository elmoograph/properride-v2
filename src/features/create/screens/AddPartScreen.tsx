import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

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
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";

type SelectField = "category" | "brand" | null;

export function AddPartScreen() {
  const [category, setCategory] = useState("");
  const [partBrand, setPartBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [partName, setPartName] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<
    string | null
  >(null);
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);

  const isCustomBrand = partBrand === "custom";

  const isSubmitDisabled =
    !category ||
    !partBrand ||
    (isCustomBrand && !customBrand.trim()) ||
    !partName.trim() ||
    !selectedMotorcycleId;

  function handleBrandChange(nextBrand: string) {
    setPartBrand(nextBrand);

    if (nextBrand !== "custom") {
      setCustomBrand("");
    }
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
            Catat part yang terpasang dan hubungkan ke motor di Garage.
          </AppText>
        </View>
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

        <View style={styles.motorcycleSection}>
          <View style={styles.sectionHeader}>
            <AppText variant="caption" tone="secondary">
              Motor terkait
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
                selected={selectedMotorcycleId === motorcycle.id}
                onPress={() => setSelectedMotorcycleId(motorcycle.id)}
              />
            ))}
          </View>
        </View>

        <AppButton disabled={isSubmitDisabled} style={styles.submitButton}>
          Simpan Part
        </AppButton>

        <AppText variant="caption" tone="muted" style={styles.note}>
          Link affiliate tidak ditampilkan di form ini. Field tersebut bisa
          dikelola nanti sebagai data internal.
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
  form: {
    marginTop: spacing.section,
    gap: spacing.xl,
  },
  brandSection: {
    gap: spacing.md,
  },
  motorcycleSection: {
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
  submitButton: {
    marginTop: spacing.sm,
  },
  note: {
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
});
