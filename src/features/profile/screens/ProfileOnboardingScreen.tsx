import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export function ProfileOnboardingScreen() {
  const { user } = useAuth();

  const [builderName, setBuilderName] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [builderNameTouched, setBuilderNameTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const trimmedBuilderName = builderName.trim();
  const normalizedUsername = normalizeUsernameInput(username);

  const isBuilderNameValid = trimmedBuilderName.length >= 2;
  const isUsernameValid = normalizedUsername.length >= 3;

  const builderNameError =
    builderNameTouched && trimmedBuilderName.length === 0
      ? "Full Name wajib diisi."
      : builderNameTouched && !isBuilderNameValid
        ? "Full Name minimal 2 karakter."
        : undefined;

  const usernameError =
    usernameTouched && username.trim().length === 0
      ? "Builder Name wajib diisi."
      : usernameTouched && !isUsernameValid
        ? "Builder Name minimal 3 karakter."
        : undefined;

  const isFormValid = isBuilderNameValid && isUsernameValid;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const profile = await ensureProfileForUser(user);

        if (isMounted) {
          setBuilderName(profile.full_name ?? "");
          setUsername(profile.username ?? "");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat Profile.";

        Alert.alert("Profile belum siap", message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleSaveProfile() {
    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk melengkapi Profile.",
      );
      router.replace("/(auth)/login");
      return;
    }

    if (!isFormValid) {
      setBuilderNameTouched(true);
      setUsernameTouched(true);
      Alert.alert(
        "Profile belum lengkap",
        "Periksa kembali data yang belum sesuai.",
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile(user.id, {
        full_name: trimmedBuilderName,
        username: normalizedUsername,
        onboarding_completed: true,
      });

      router.replace("/(tabs)/feed");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan Profile.";

      Alert.alert("Gagal menyimpan Profile", message);
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
            Menyiapkan Profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.hero}>
          <View style={styles.stepBadge}>
            <AppText variant="caption" style={styles.stepBadgeText}>
              Step 1 dari 2
            </AppText>
          </View>

          <AppText variant="titleLarge" style={styles.heroTitle}>
            Bangun identitas ProperRide kamu
          </AppText>

          <AppText tone="secondary" style={styles.subtitle}>
            Tentukan nama asli dan Builder Name yang akan menjadi identitas
            publik kamu.
          </AppText>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewTop}>
            <View style={styles.previewAvatar}>
              <AppText variant="title" style={styles.previewInitial}>
                {trimmedBuilderName.charAt(0).toUpperCase() || "P"}
              </AppText>
            </View>

            <View style={styles.previewText}>
              <AppText variant="caption" style={styles.previewBadge}>
                Builder Profile
              </AppText>

              <AppText variant="title" numberOfLines={1}>
                {normalizedUsername || "builder.name"}
              </AppText>

              <AppText variant="caption" tone="secondary" numberOfLines={1}>
                Full Name: {trimmedBuilderName || "Nama lengkap"}
              </AppText>
            </View>
          </View>

          <View style={styles.previewDivider} />

          <AppText variant="caption" tone="secondary">
            Preview ini membantu kamu melihat bagaimana identitasmu akan tampil
            di ProperRide.
          </AppText>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <AppText variant="title">Builder Identity</AppText>
            <AppText variant="caption" tone="secondary">
              Full Name dipakai untuk data akun. Builder Name akan tampil di
              area publik ProperRide.
            </AppText>
          </View>

          <AppInput
            label="Full Name"
            placeholder="Contoh: Zaky Pratama"
            value={builderName}
            onChangeText={(value) => {
              setBuilderName(value);
              if (!builderNameTouched) {
                setBuilderNameTouched(true);
              }
            }}
            onBlur={() => setBuilderNameTouched(true)}
            autoCapitalize="words"
            textContentType="name"
            errorText={builderNameError}
          />

          <AppInput
            label="Builder Name"
            placeholder="contoh: elmoo.garage"
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              if (!usernameTouched) {
                setUsernameTouched(true);
              }
            }}
            onBlur={() => setUsernameTouched(true)}
            autoCapitalize="none"
            autoCorrect={false}
            helperText="Gunakan huruf kecil, angka, titik, atau underscore. Builder Name akan tampil sebagai identitas publik."
            errorText={usernameError}
          />

          <AppButton
            loading={saving}
            disabled={saving || !isFormValid}
            onPress={handleSaveProfile}
          >
            Lanjut ke ProperRide
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  stepBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepBadgeText: {
    color: theme.primary,
  },
  heroTitle: {
    maxWidth: 320,
  },
  subtitle: {
    maxWidth: 340,
    lineHeight: 22,
  },
  previewCard: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInitial: {
    color: theme.primary,
  },
  previewText: {
    flex: 1,
    gap: spacing.xs,
  },
  previewBadge: {
    color: theme.primary,
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.borderSoft,
  },
  formCard: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  formHeader: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
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
