import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { Camera, ChevronLeft, User } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(
    null,
  );
  const [selectedAvatarBase64, setSelectedAvatarBase64] = useState<
    string | null
  >(null);

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
            setAvatarUrl(profile.avatar_url);
            setSelectedAvatarUri(null);
            setSelectedAvatarBase64(null);
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

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin galeri dibutuhkan",
        "Berikan izin akses galeri untuk mengganti foto profile.",
      );
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.72,
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

    const selectedAsset = result.assets[0];

    if (!selectedAsset?.uri) {
      Alert.alert(
        "Foto tidak terbaca",
        "Coba pilih foto lain dari galeri lokal.",
      );
      return;
    }

    setSelectedAvatarUri(selectedAsset.uri);
    setSelectedAvatarBase64(null);
  }

  async function uploadAvatarIfSelected() {
    if (!user || !selectedAvatarUri) {
      return avatarUrl;
    }

    const path = createStorageImagePath({
      userId: user.id,
      folder: "avatars",
    });

    return uploadImageToStorage({
      uri: selectedAvatarUri,
      path,
    });
  }

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
      Alert.alert("Nama belum diisi", "Full Name wajib diisi.");
      return;
    }

    if (!normalizedUsername) {
      setUsernameError("Builder Name wajib diisi.");
      return;
    }

    if (normalizedUsername.length < 3) {
      setUsernameError("Builder Name minimal 3 karakter.");
      return;
    }

    try {
      setSaving(true);
      setUsernameError(null);

      const uploadedAvatarUrl = await uploadAvatarIfSelected();

      await updateProfile(user.id, {
        full_name: trimmedFullName,
        username: normalizedUsername,
        avatar_url: uploadedAvatarUrl,
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
            Perbarui Full Name, Builder Name, foto, dan detail Profile kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.avatarSection}>
          <Pressable
            onPress={handlePickAvatar}
            style={({ pressed }) => [
              styles.avatarPicker,
              pressed && styles.pressed,
            ]}
          >
            {selectedAvatarUri || avatarUrl ? (
              <Image
                source={{ uri: selectedAvatarUri ?? avatarUrl ?? "" }}
                style={styles.avatarPreview}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <User size={32} color={theme.textMuted} />
              </View>
            )}

            <View style={styles.cameraBadge}>
              <Camera size={15} color={theme.primary} />
            </View>
          </Pressable>

          <View style={styles.avatarText}>
            <AppText variant="bodyMedium">Foto Profile</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.avatarHelper}
            >
              Tap untuk memilih foto baru dari galeri.
            </AppText>
          </View>
        </View>

        <AppInput
          label="Full Name"
          placeholder="Contoh: Zaky Pratama"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <AppInput
          label="Builder Name"
          placeholder="contoh: elmoo.garage"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            setUsernameError(null);
          }}
          autoCapitalize="none"
          errorText={usernameError ?? undefined}
          helperText="Gunakan huruf kecil, angka, titik, atau underscore. Builder Name akan tampil sebagai identitas publik."
        />

        <AppInput
          label="Lokasi"
          placeholder="Contoh: Jakarta, Bandung, Bali"
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
  avatarSection: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarPicker: {
    position: "relative",
    width: 82,
    height: 82,
    borderRadius: radius.pill,
  },
  avatarPreview: {
    width: 82,
    height: 82,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 2,
    borderColor: theme.border,
  },
  avatarFallback: {
    width: 82,
    height: 82,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    flex: 1,
  },
  avatarHelper: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
