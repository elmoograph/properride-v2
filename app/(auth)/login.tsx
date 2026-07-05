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
import { spacing, theme } from "@/src/shared/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Login gagal", "Email dan password wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);

      await signIn({
        email,
        password,
      });

      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.";

      Alert.alert("Login gagal", message);
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
          <AppText variant="title">ProperRide</AppText>
          <AppText variant="body" tone="secondary">
            Masuk untuk mengelola Garage, membagikan build, dan menyimpan
            inspirasi modifikasi motor.
          </AppText>
        </View>

        <View style={styles.form}>
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
            placeholder="Masukkan password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <AppButton loading={submitting} onPress={handleLogin}>
            Masuk
          </AppButton>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" tone="secondary">
            Belum punya akun?
          </AppText>

          <Link href="/(auth)/register" asChild>
            <AppButton variant="ghost">Buat akun</AppButton>
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
