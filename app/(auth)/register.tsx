import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { colors, spacing } from "@/src/shared/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid =
    confirmPassword.length > 0 && password === confirmPassword;

  const emailError =
    emailTouched && trimmedEmail.length === 0
      ? "Email wajib diisi."
      : emailTouched && !isEmailValid
        ? "Format email belum benar."
        : undefined;

  const passwordError =
    passwordTouched && password.length === 0
      ? "Password wajib diisi."
      : passwordTouched && !isPasswordValid
        ? "Password minimal 6 karakter."
        : undefined;

  const confirmPasswordError =
    confirmPasswordTouched && confirmPassword.length === 0
      ? "Konfirmasi password wajib diisi."
      : confirmPasswordTouched && !isConfirmPasswordValid
        ? "Konfirmasi password tidak sama."
        : undefined;

  const isFormValid = isEmailValid && isPasswordValid && isConfirmPasswordValid;

  async function handleRegister() {
    if (!isFormValid) {
      setEmailTouched(true);
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);
      Alert.alert("Daftar gagal", "Periksa kembali data yang belum sesuai.");
      return;
    }

    try {
      setSubmitting(true);

      await signUp({
        email: trimmedEmail,
        password,
      });

      Alert.alert(
        "Akun berhasil dibuat",
        "Silakan masuk menggunakan email dan password yang sudah dibuat.",
        [
          {
            text: "Masuk",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat akun.";

      Alert.alert("Daftar gagal", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <AppText variant="title">Create Account</AppText>
          <AppText variant="body" tone="secondary">
            Buat akun ProperRide untuk mulai membangun Profile, Garage, dan
            inspirasi build motor kamu.
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (!emailTouched) {
                setEmailTouched(true);
              }
            }}
            onBlur={() => setEmailTouched(true)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            errorText={emailError}
          />

          <AppInput
            label="Password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (!passwordTouched) {
                setPasswordTouched(true);
              }
            }}
            onBlur={() => setPasswordTouched(true)}
            secureTextEntry
            textContentType="newPassword"
            errorText={passwordError}
          />

          <AppInput
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (!confirmPasswordTouched) {
                setConfirmPasswordTouched(true);
              }
            }}
            onBlur={() => setConfirmPasswordTouched(true)}
            secureTextEntry
            textContentType="newPassword"
            errorText={confirmPasswordError}
          />

          <AppButton
            loading={submitting}
            disabled={submitting || !isFormValid}
            onPress={handleRegister}
          >
            Buat akun
          </AppButton>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" tone="secondary">
            Sudah punya akun?
          </AppText>

          <Link href="/(auth)/login" asChild>
            <AppButton variant="ghost">Masuk</AppButton>
          </Link>
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
  header: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
});
