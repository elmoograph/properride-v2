import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Camera, ChevronLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  getMotorcycleById,
  updateMotorcycleById,
} from "@/src/features/garage/repositories/motorcycle.repository";
import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import {
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

export function EditMotorcycleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [motorcycle, setMotorcycle] = useState<MotorcycleRow | null>(null);
  const [name, setName] = useState("");
  const [engineInfo, setEngineInfo] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);

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
            setName(motorcycleData.name ?? "");
            setEngineInfo(motorcycleData.engine_info ?? "");
            setImageUrl(motorcycleData.image_url ?? null);
            setSelectedImageUri(null);
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

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin galeri dibutuhkan",
        "Berikan izin akses galeri untuk mengganti foto motor.",
      );
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.84,
        base64: false,
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

    const uri = result.assets[0]?.uri;

    if (!uri) {
      Alert.alert("Foto tidak valid", "Coba pilih foto lain.");
      return;
    }

    setSelectedImageUri(uri);
  }

  async function uploadImageIfSelected() {
    if (!motorcycle || !selectedImageUri) {
      return imageUrl;
    }

    const path = createStorageImagePath({
      userId: motorcycle.user_id,
      folder: "motorcycles",
      ownerId: motorcycle.id,
    });

    return uploadImageToStorage({
      uri: selectedImageUri,
      path,
    });
  }

  async function handleSave() {
    if (!motorcycle) {
      return;
    }

    try {
      setSaving(true);

      const uploadedImageUrl = await uploadImageIfSelected();

      await updateMotorcycleById(motorcycle.id, {
        name: name.trim() || null,
        engine_info: engineInfo.trim() || null,
        image_url: uploadedImageUrl,
      });

      Alert.alert("Motor tersimpan", "Detail motor berhasil diperbarui.", [
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

  const previewImageUri = selectedImageUri ?? imageUrl;

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
            Ubah foto utama dan detail ringan motor ini.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <Pressable
          onPress={handlePickImage}
          style={({ pressed }) => [
            styles.imagePicker,
            pressed && styles.pressed,
          ]}
        >
          {previewImageUri ? (
            <Image source={{ uri: previewImageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={28} color={theme.primary} />
              <AppText
                variant="caption"
                tone="secondary"
                style={styles.imagePlaceholderText}
              >
                Tambahkan foto utama motor.
              </AppText>
            </View>
          )}

          <View style={styles.imageBadge}>
            <Camera size={15} color={theme.primary} />
            <AppText variant="caption" tone="accent">
              Ganti Foto
            </AppText>
          </View>
        </Pressable>

        <AppInput
          label="Nama Build"
          placeholder="Contoh: NMAX Daily Touring"
          value={name}
          onChangeText={setName}
          helperText="Opsional. Nama ini tampil sebagai nama build."
        />

        <AppInput
          label="Info Mesin"
          placeholder="Contoh: 155 cc, bore up 183 cc, standard harian"
          value={engineInfo}
          onChangeText={setEngineInfo}
          helperText="Opsional. Isi detail mesin atau setup utama."
        />

        <AppButton onPress={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Motor"}
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
  imagePicker: {
    height: 210,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceSoft,
    paddingHorizontal: spacing.lg,
  },
  imagePlaceholderText: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  imageBadge: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(18, 24, 33, 0.92)",
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  pressed: {
    opacity: 0.82,
  },
});
