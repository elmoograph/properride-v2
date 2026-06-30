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
import { spacing } from "@/src/shared/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert("Daftar gagal", "Semua field wajib diisi.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Daftar gagal", "Password minimal 6 karakter.");
      return;
    }

    try {
      setSubmitting(true);

      await signUp({
        fullName,
        username,
        email,
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
            Buat akun untuk mulai membangun Garage dan membagikan inspirasi
            modifikasi motor.
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Nama lengkap"
            placeholder="Nama kamu"
            value={fullName}
            onChangeText={setFullName}
            textContentType="name"
          />

          <AppInput
            label="Username"
            placeholder="contoh: nmax.daily"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppInput
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <AppInput
            label="Password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <AppButton loading={submitting} onPress={handleRegister}>
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
