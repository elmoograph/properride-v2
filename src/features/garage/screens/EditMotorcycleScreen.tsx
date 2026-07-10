import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  getMotorcycleById,
  updateMotorcycleById,
} from "@/src/features/garage/repositories/motorcycle.repository";
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
import {
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";
import { radius, spacing, theme, typography } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

type SelectField = "brand" | "model" | "year" | null;

export function EditMotorcycleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [motorcycle, setMotorcycle] = useState<MotorcycleRow | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [activeSelect, setActiveSelect] = useState<SelectField>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);

  const modelOptions = useMemo(() => {
    if (!brand) {
      return [];
    }

    return motorcycleModelOptionsByBrand[brand] ?? [];
  }, [brand]);

  const isSubmitDisabled =
    saving || !brand || !model || !year || !engineCc.trim();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMotorcycle() {
        if (!id) {
          setScreenError("Motor tidak ditemukan.");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setScreenError(null);

          const motorcycleData = await getMotorcycleById(id);

          if (!motorcycleData) {
            throw new Error("Data motor tidak ditemukan.");
          }

          if (isActive) {
            setMotorcycle(motorcycleData);
            setBrand(motorcycleData.brand);
            setModel(motorcycleData.model);
            setYear(motorcycleData.year);
            setEngineCc(
              motorcycleData.engine_cc ? String(motorcycleData.engine_cc) : "",
            );
            setCurrentImageUrl(motorcycleData.image_url ?? null);
            setCoverImageUri(null);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat data motor.";

          if (isActive) {
            setScreenError(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadMotorcycle();

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  function handleBrandChange(nextBrand: string) {
    setBrand(nextBrand);
    setModel("");
  }

  function handleEngineCcChange(value: string) {
    const numericValue = value.replace(/\D/g, "");
    setEngineCc(numericValue);
  }

  async function handlePickCoverImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin diperlukan",
        "Izinkan akses galeri untuk memilih foto motor.",
      );
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.88,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memilih foto.";

      Alert.alert(
        "Gagal memilih foto",
        `${message}\n\nCoba pilih foto dari galeri lokal atau download foto dari Google Photos terlebih dahulu.`,
      );
      return;
    }

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0]?.uri;

    if (!imageUri) {
      Alert.alert("Foto tidak valid", "Pilih foto lain untuk cover motor.");
      return;
    }

    setCoverImageUri(imageUri);
  }

  async function uploadCoverImageIfSelected() {
    if (!motorcycle || !coverImageUri) {
      return currentImageUrl;
    }

    const path = createStorageImagePath({
      userId: motorcycle.user_id,
      folder: "motorcycles",
      ownerId: motorcycle.id,
    });

    return uploadImageToStorage({
      uri: coverImageUri,
      path,
    });
  }

  async function handleSaveMotorcycle() {
    if (isSubmitDisabled || !motorcycle) {
      return;
    }

    try {
      setSaving(true);

      const uploadedImageUrl = await uploadCoverImageIfSelected();

      await updateMotorcycleById(motorcycle.id, {
        brand,
        model,
        year,
        engine_cc: Number(engineCc),
        engine_info: `${engineCc} cc`,
        image_url: uploadedImageUrl,
        name: `${brand} ${model}`,
      });

      Alert.alert("Motor tersimpan", "Motor berhasil diperbarui.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan motor.";

      Alert.alert("Gagal menyimpan motor", message);
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
            Memuat data motor...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (screenError || !motorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Edit motor belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {screenError ?? "Data motor tidak tersedia."}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/garage")}>
            Kembali ke Garage
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
          <AppText variant="titleLarge">Edit Motorcycle</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Perbarui foto dan detail motor yang tampil di Garage.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <ImageUploadBox
          title={
            coverImageUri || currentImageUrl
              ? "Foto motor sudah dipilih"
              : "Tambah foto motor"
          }
          description={
            coverImageUri
              ? "Foto baru ini akan menjadi cover motor di Garage."
              : currentImageUrl
                ? "Foto ini sedang dipakai sebagai cover motor."
                : "Pilih foto terbaik untuk cover motor kamu."
          }
          imageUri={coverImageUri ?? currentImageUrl}
          onPress={handlePickCoverImage}
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
          loading={saving}
          style={styles.submitButton}
          onPress={handleSaveMotorcycle}
        >
          Simpan Motor
        </AppButton>

        <AppText variant="caption" tone="muted" style={styles.note}>
          Semua field wajib diisi. Perubahan akan tampil di Garage, Featured
          Build, dan Motorcycle Detail.
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
