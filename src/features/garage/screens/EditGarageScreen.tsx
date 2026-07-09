import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
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
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  getProfileById,
  updateProfile,
} from "@/src/features/profile/repositories/profile.repository";
import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export function EditGarageScreen() {
  const { user } = useAuth();

  const [garageName, setGarageName] = useState("");
  const [garageCoverUrl, setGarageCoverUrl] = useState<string | null>(null);
  const [selectedCoverUri, setSelectedCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadGarageProfile() {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setScreenError(null);

          const profile = await getProfileById(user.id);

          if (isActive) {
            setGarageName(profile?.garage_name ?? "");
            setGarageCoverUrl(profile?.garage_cover_url ?? null);
            setSelectedCoverUri(null);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat Garage.";

          if (isActive) {
            setScreenError(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadGarageProfile();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  async function handlePickGarageCover() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin galeri dibutuhkan",
        "Berikan izin akses galeri untuk mengganti cover Garage.",
      );
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.82,
        base64: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memilih foto.";

      Alert.alert(
        "Gagal memilih cover",
        `${message}\n\nCoba pilih foto dari galeri lokal atau download foto dari Google Photos terlebih dahulu.`,
      );
      return;
    }

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0]?.uri;

    if (!imageUri) {
      Alert.alert(
        "Cover tidak valid",
        "Coba pilih foto lain dari galeri lokal.",
      );
      return;
    }

    setSelectedCoverUri(imageUri);
  }

  async function uploadGarageCoverIfSelected() {
    if (!user || !selectedCoverUri) {
      return garageCoverUrl;
    }

    const path = createStorageImagePath({
      userId: user.id,
      folder: "garage-covers",
    });

    return uploadImageToStorage({
      uri: selectedCoverUri,
      path,
    });
  }

  async function handleSaveGarage() {
    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk mengedit Garage.",
      );
      router.replace("/(auth)/login");
      return;
    }

    const trimmedGarageName = garageName.trim();

    if (!trimmedGarageName) {
      Alert.alert("Nama Garage belum diisi", "Nama Garage wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const uploadedCoverUrl = await uploadGarageCoverIfSelected();

      await updateProfile(user.id, {
        garage_name: trimmedGarageName,
        garage_cover_url: uploadedCoverUrl,
      });

      Alert.alert("Garage tersimpan", "Garage berhasil diperbarui.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan Garage.";

      Alert.alert("Gagal menyimpan Garage", message);
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
            Memuat data Garage...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (!user) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk mengedit Garage.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (screenError) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Edit Garage belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {screenError}
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
          <AppText variant="titleLarge">Edit Garage</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Atur identitas Garage yang menampung koleksi motor kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <Pressable
          onPress={handlePickGarageCover}
          style={({ pressed }) => [
            styles.coverPicker,
            pressed && styles.pressed,
          ]}
        >
          {selectedCoverUri || garageCoverUrl ? (
            <Image
              source={{ uri: selectedCoverUri ?? garageCoverUrl ?? "" }}
              style={styles.coverPreview}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Camera size={26} color={theme.primary} />
              <AppText
                variant="caption"
                tone="secondary"
                style={styles.coverPlaceholderText}
              >
                Tambahkan cover Garage
              </AppText>
            </View>
          )}

          <View style={styles.coverBadge}>
            <Camera size={15} color={theme.primary} />
            <AppText variant="caption" tone="accent">
              Ganti Cover
            </AppText>
          </View>
        </Pressable>
        <AppInput
          label="Nama Garage"
          placeholder="Contoh: NMAX Daily Garage"
          value={garageName}
          onChangeText={setGarageName}
          helperText="Nama ini tampil di Garage dan tombol Buka Garage di Profile."
        />

        <AppButton onPress={handleSaveGarage} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Garage"}
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
  coverPicker: {
    height: 176,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  coverPreview: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceSoft,
    paddingHorizontal: spacing.lg,
  },
  coverPlaceholderText: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  coverBadge: {
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
  pressed: {
    opacity: 0.82,
  },
});
