import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  getMotorcyclePartById,
  updateMotorcyclePartById,
} from "@/src/features/garage/repositories/motorcyclePart.repository";
import {
  AppButton,
  AppInput,
  AppScreen,
  AppSelect,
  AppText,
} from "@/src/shared/components";
import {
  partBrandOptionsByCategory,
  partCategoryOptions,
} from "@/src/shared/constants/partOptions";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcyclePartRow } from "@/src/shared/types/database.types";

type SelectField = "category" | "brand" | null;

const customBrandPrefix = "Custom by ";

function getOptionValues(options: Array<{ label: string; value: string }>) {
  return options.map((option) => option.value);
}

function resolveBrandState(part: MotorcyclePartRow) {
  const brandOptions = partBrandOptionsByCategory[part.category] ?? [];
  const brandValues = getOptionValues(brandOptions);

  if (part.brand.startsWith(customBrandPrefix)) {
    return {
      partBrand: "Custom",
      otherBrandName: "",
      customBy: part.brand.replace(customBrandPrefix, ""),
    };
  }

  if (brandValues.includes(part.brand)) {
    return {
      partBrand: part.brand,
      otherBrandName: "",
      customBy: "",
    };
  }

  return {
    partBrand: "Other",
    otherBrandName: part.brand,
    customBy: "",
  };
}

export function EditPartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [part, setPart] = useState<MotorcyclePartRow | null>(null);
  const [category, setCategory] = useState("");
  const [partBrand, setPartBrand] = useState("");
  const [otherBrandName, setOtherBrandName] = useState("");
  const [customBy, setCustomBy] = useState("");
  const [partName, setPartName] = useState("");
  const [description, setDescription] = useState("");
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);

  const brandOptions = useMemo(() => {
    if (!category) {
      return [];
    }

    return partBrandOptionsByCategory[category] ?? [];
  }, [category]);

  const isOtherBrand = partBrand === "Other";
  const isCustomPart = partBrand === "Custom";

  const isSaveDisabled =
    saving ||
    !category ||
    !partBrand ||
    !partName.trim() ||
    (isOtherBrand && !otherBrandName.trim()) ||
    (isCustomPart && !customBy.trim());

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadPart() {
        if (!id) {
          setScreenError("Part tidak ditemukan.");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setScreenError(null);

          const partData = await getMotorcyclePartById(id);

          if (!partData) {
            throw new Error("Data part tidak ditemukan.");
          }

          const resolvedBrand = resolveBrandState(partData);

          if (isActive) {
            setPart(partData);
            setCategory(partData.category);
            setPartBrand(resolvedBrand.partBrand);
            setOtherBrandName(resolvedBrand.otherBrandName);
            setCustomBy(resolvedBrand.customBy);
            setPartName(partData.name);
            setDescription(partData.description ?? "");
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat part.";

          if (isActive) {
            setScreenError(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadPart();

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    setPartBrand("");
    setOtherBrandName("");
    setCustomBy("");
  }

  function handleBrandChange(nextBrand: string) {
    setPartBrand(nextBrand);
    setOtherBrandName("");
    setCustomBy("");
  }

  async function handleSavePart() {
    if (isSaveDisabled || !part) {
      return;
    }

    const finalBrand = isOtherBrand
      ? otherBrandName.trim()
      : isCustomPart
        ? `${customBrandPrefix}${customBy.trim()}`
        : partBrand;

    try {
      setSaving(true);

      await updateMotorcyclePartById(part.id, {
        category,
        brand: finalBrand,
        name: partName.trim(),
        description: description.trim() || null,
      });

      Alert.alert("Part tersimpan", "Detail part berhasil diperbarui.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan part.";

      Alert.alert("Gagal menyimpan part", message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat data part...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (screenError || !part) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Edit part belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {screenError ?? "Data part tidak tersedia."}
          </AppText>
          <AppButton onPress={() => router.back()}>Kembali</AppButton>
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
          <AppText variant="titleLarge">Edit Part</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Perbarui kategori, brand, nama part, dan keterangan setup.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <AppSelect
          label="Kategori"
          placeholder="Pilih kategori part"
          value={category}
          options={partCategoryOptions}
          visible={activeSelect === "category"}
          onOpen={() => setActiveSelect("category")}
          onClose={() => setActiveSelect(null)}
          onChange={handleCategoryChange}
        />

        <AppSelect
          label="Brand"
          placeholder={category ? "Pilih brand" : "Pilih kategori dulu"}
          value={partBrand}
          options={brandOptions}
          visible={activeSelect === "brand"}
          onOpen={() => setActiveSelect("brand")}
          onClose={() => setActiveSelect(null)}
          onChange={handleBrandChange}
          disabled={!category}
        />

        {isOtherBrand ? (
          <AppInput
            label="Brand name"
            placeholder="Contoh: SPS, KRS, brand lokal lain"
            value={otherBrandName}
            onChangeText={setOtherBrandName}
            helperText="Isi brand jika tidak tersedia di pilihan."
          />
        ) : null}

        {isCustomPart ? (
          <AppInput
            label="By"
            placeholder="Contoh: Bengkel Rapi Jaya / Pak Budi Custom"
            value={customBy}
            onChangeText={setCustomBy}
            helperText="Isi nama bengkel, builder, atau pembuat part custom."
          />
        ) : null}

        <AppInput
          label="Nama part"
          placeholder="Contoh: R9 Misano, YSS G-Series, FDR Sport XR"
          value={partName}
          onChangeText={setPartName}
        />

        <AppInput
          label="Keterangan"
          placeholder="Contoh: Ukuran 120/70, custom bracket, setting harian..."
          value={description}
          onChangeText={setDescription}
          multiline
          helperText="Opsional. Tambahkan detail ukuran, warna, setting, atau catatan pemasangan."
        />

        <AppButton
          disabled={isSaveDisabled}
          loading={saving}
          onPress={handleSavePart}
        >
          Simpan Part
        </AppButton>
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
  form: {
    marginTop: spacing.section,
    gap: spacing.lg,
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
