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
  ensureProfileForUser,
  updateProfile,
} from "@/src/features/profile/repositories/profile.repository";
import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

function normalizeUsernameInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

export function EditProfileScreen() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProfile() {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setScreenError(null);

          const profile = await ensureProfileForUser(user);

          if (isActive) {
            setFullName(profile.full_name);
            setUsername(profile.username);
            setLocation(profile.location ?? "");
            setBio(profile.bio ?? "");
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat profil.";

          if (isActive) {
            setScreenError(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadProfile();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  async function handleSaveProfile() {
    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk mengedit profil.",
      );
      router.replace("/(auth)/login");
      return;
    }

    const trimmedFullName = fullName.trim();
    const normalizedUsername = normalizeUsernameInput(username);
    const trimmedLocation = location.trim();
    const trimmedBio = bio.trim();

    if (!trimmedFullName) {
      Alert.alert("Nama belum diisi", "Nama lengkap wajib diisi.");
      return;
    }

    if (!normalizedUsername) {
      setUsernameError("Username wajib diisi.");
      return;
    }

    if (normalizedUsername.length < 3) {
      setUsernameError("Username minimal 3 karakter.");
      return;
    }

    try {
      setSaving(true);
      setUsernameError(null);

      await updateProfile(user.id, {
        full_name: trimmedFullName,
        username: normalizedUsername,
        location: trimmedLocation || null,
        bio: trimmedBio || null,
      });

      Alert.alert("Profile tersimpan", "Perubahan profil berhasil disimpan.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan profil.";

      Alert.alert("Gagal menyimpan profil", message);
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
            Memuat data profil...
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
            Silakan masuk kembali untuk mengedit profil.
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
          <AppText variant="title">Edit Profile belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {screenError}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/profile")}>
            Kembali ke Profile
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
          <AppText variant="titleLarge">Edit Profile</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Perbarui identitas builder yang tampil di Profile kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <AppInput
          label="Nama lengkap"
          placeholder="Contoh: Andi Pratama"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <AppInput
          label="Username"
          placeholder="contoh: andi.nmax"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            setUsernameError(null);
          }}
          autoCapitalize="none"
          errorText={usernameError ?? undefined}
          helperText="Gunakan huruf kecil, angka, titik, atau underscore."
        />

        <AppInput
          label="Lokasi"
          placeholder="Contoh: Jakarta, Indonesia"
          value={location}
          onChangeText={setLocation}
        />

        <AppInput
          label="Bio"
          placeholder="Ceritakan gaya build atau fokus modifikasi kamu."
          value={bio}
          onChangeText={setBio}
          multiline
          inputStyle={styles.bioInput}
        />

        <AppButton onPress={handleSaveProfile} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Profile"}
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
  bioInput: {
    minHeight: 104,
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
