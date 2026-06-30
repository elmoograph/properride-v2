import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { getMotorcycleById } from "@/src/features/garage/repositories/motorcycle.repository";
import {
  createMotorcyclePart,
  createPartAddedTimelineItem,
} from "@/src/features/garage/repositories/motorcyclePart.repository";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppInput,
  AppScreen,
  AppSelect,
  AppText,
} from "@/src/shared/components";
import {
  partBrandOptions,
  partCategoryOptions,
} from "@/src/shared/constants/partOptions";
import { spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

type SelectField = "category" | "brand" | null;

export function AddPartScreen() {
  const { motorcycleId } = useLocalSearchParams<{ motorcycleId?: string }>();
  const { user } = useAuth();

  const [motorcycle, setMotorcycle] = useState<MotorcycleRow | null>(null);
  const [loadingMotorcycle, setLoadingMotorcycle] = useState(true);
  const [motorcycleError, setMotorcycleError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [partBrand, setPartBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [partName, setPartName] = useState("");
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCustomBrand = partBrand === "custom";

  const isSubmitDisabled =
    submitting ||
    !motorcycle ||
    !category ||
    !partBrand ||
    (isCustomBrand && !customBrand.trim()) ||
    !partName.trim();

  useEffect(() => {
    let isMounted = true;

    async function loadMotorcycleContext() {
      if (!motorcycleId) {
        setLoadingMotorcycle(false);
        setMotorcycleError(
          "Motor belum dipilih. Add Part harus memiliki konteks motor.",
        );
        return;
      }

      try {
        setLoadingMotorcycle(true);
        setMotorcycleError(null);

        const data = await getMotorcycleById(motorcycleId);

        if (isMounted) {
          setMotorcycle(data);

          if (!data) {
            setMotorcycleError("Motor tidak ditemukan atau sudah dihapus.");
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat motor.";

        if (isMounted) {
          setMotorcycleError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingMotorcycle(false);
        }
      }
    }

    loadMotorcycleContext();

    return () => {
      isMounted = false;
    };
  }, [motorcycleId]);

  function handleBrandChange(nextBrand: string) {
    setPartBrand(nextBrand);

    if (nextBrand !== "custom") {
      setCustomBrand("");
    }
  }

  async function handleSavePart() {
    if (isSubmitDisabled || !motorcycle) {
      return;
    }

    if (!user) {
      Alert.alert("Sesi tidak aktif", "Silakan masuk kembali.");
      router.replace("/(auth)/login");
      return;
    }

    const finalBrand = isCustomBrand ? customBrand.trim() : partBrand;
    const cleanPartName = partName.trim();

    try {
      setSubmitting(true);

      await createMotorcyclePart({
        motorcycleId: motorcycle.id,
        userId: user.id,
        category,
        brand: finalBrand,
        name: cleanPartName,
      });

      await createPartAddedTimelineItem({
        motorcycleId: motorcycle.id,
        userId: user.id,
        title: cleanPartName,
        description: `${finalBrand} ditambahkan ke setup ${motorcycle.brand} ${motorcycle.model}.`,
      });

      Alert.alert(
        "Part tersimpan",
        `Part berhasil ditambahkan ke ${motorcycle.brand} ${motorcycle.model}.`,
        [
          {
            text: "OK",
            onPress: () => router.replace(`/motorcycle/${motorcycle.id}`),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan part.";

      Alert.alert("Gagal menyimpan part", message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMotorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat motor terkait...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (motorcycleError || !motorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Motor belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {motorcycleError ??
              "Pilih motor terlebih dahulu sebelum menambahkan part."}
          </AppText>
          <AppButton
            onPress={() =>
              router.replace("/(create)/select-motorcycle-for-part")
            }
          >
            Pilih Motor
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const motorcycleEngineInfo =
    motorcycle.engine_info ??
    (motorcycle.engine_cc ? `${motorcycle.engine_cc} cc` : "Mesin belum diisi");

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
          {motorcycle.year} · {motorcycleEngineInfo}
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
          loading={submitting}
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
