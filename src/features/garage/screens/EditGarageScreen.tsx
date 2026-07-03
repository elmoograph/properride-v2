import { router, useFocusEffect } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

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

      await updateProfile(user.id, {
        garage_name: trimmedGarageName,
      });

      Alert.alert("Garage tersimpan", "Nama Garage berhasil diperbarui.", [
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
});
