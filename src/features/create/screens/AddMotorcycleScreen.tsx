import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { createMotorcycle } from "@/src/features/garage/repositories/motorcycle.repository";
import {
  AppButton,
  AppScreen,
  AppSelect,
  AppText,
  ImageUploadBox,
} from "@/src/shared/components";
import {
  motorcycleBrandOptions,
  motorcycleModelOptionsByBrand,
  motorcycleYearOptions,
} from "@/src/shared/constants/motorcycleOptions";
import { radius, spacing, theme, typography } from "@/src/shared/theme";

type SelectField = "brand" | "model" | "year" | null;

export function AddMotorcycleScreen() {
  const { user } = useAuth();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);
  const [submitting, setSubmitting] = useState(false);

  const modelOptions = useMemo(() => {
    if (!brand) {
      return [];
    }

    return motorcycleModelOptionsByBrand[brand] ?? [];
  }, [brand]);

  const isSubmitDisabled =
    submitting || !brand || !model || !year || !engineCc.trim();

  function handleBrandChange(nextBrand: string) {
    setBrand(nextBrand);
    setModel("");
  }

  function handleEngineCcChange(value: string) {
    const numericValue = value.replace(/\D/g, "");
    setEngineCc(numericValue);
  }

  async function handleSaveMotorcycle() {
    if (isSubmitDisabled) {
      return;
    }

    if (!user) {
      Alert.alert("Sesi tidak aktif", "Silakan masuk kembali.");
      router.replace("/(auth)/login");
      return;
    }

    try {
      setSubmitting(true);

      await createMotorcycle({
        userId: user.id,
        brand,
        model,
        year,
        engineCc: Number(engineCc),
        name: `${brand} ${model}`,
        engineInfo: `${engineCc} cc`,
        imageUrl: null,
        status: "in_progress",
        visibility: "public",
      });

      Alert.alert("Motor tersimpan", "Motor berhasil ditambahkan ke Garage.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/garage"),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan motor.";

      Alert.alert("Gagal menyimpan motor", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Tambah Motor</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Simpan motor ke Garage agar bisa terhubung dengan post kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <ImageUploadBox
          title="Tambah foto motor"
          description="Upload foto akan dihubungkan setelah storage flow siap."
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AppSelect
              label="Brand"
              placeholder="Pilih brand"
              value={brand}
              options={motorcycleBrandOptions}
              visible={activeSelect === "brand"}
              onOpen={() => setActiveSelect("brand")}
              onClose={() => setActiveSelect(null)}
              onChange={handleBrandChange}
            />
          </View>

          <View style={styles.rowItem}>
            <AppSelect
              label="Model"
              placeholder={brand ? "Pilih model" : "Pilih brand dulu"}
              value={model}
              options={modelOptions}
              visible={activeSelect === "model"}
              onOpen={() => setActiveSelect("model")}
              onClose={() => setActiveSelect(null)}
              onChange={setModel}
              disabled={!brand}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AppSelect
              label="Tahun"
              placeholder="Pilih tahun"
              value={year}
              options={motorcycleYearOptions}
              visible={activeSelect === "year"}
              onOpen={() => setActiveSelect("year")}
              onClose={() => setActiveSelect(null)}
              onChange={setYear}
            />
          </View>

          <View style={styles.rowItem}>
            <AppText variant="caption" tone="secondary" style={styles.label}>
              Mesin
            </AppText>

            <View style={styles.engineInputWrap}>
              <TextInput
                value={engineCc}
                onChangeText={handleEngineCcChange}
                placeholder="155"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                selectionColor={theme.primary}
                style={styles.engineInput}
              />

              <AppText tone="secondary">cc</AppText>
            </View>
          </View>
        </View>

        <AppButton
          disabled={isSubmitDisabled}
          loading={submitting}
          style={styles.submitButton}
          onPress={handleSaveMotorcycle}
        >
          Simpan Motor
        </AppButton>

        <AppText variant="caption" tone="muted" style={styles.note}>
          Semua field wajib diisi. Nama build atau nickname motor bisa
          ditambahkan nanti setelah motor tersimpan di Garage.
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  engineInputWrap: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  engineInput: {
    flex: 1,
    color: theme.textPrimary,
    ...typography.body,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  note: {
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
});
