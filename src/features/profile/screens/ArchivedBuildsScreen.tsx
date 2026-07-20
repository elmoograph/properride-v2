import { router, useFocusEffect } from "expo-router";
import { Archive, Bike, ChevronLeft, ChevronRight } from "lucide-react-native";
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
  listArchivedMotorcyclesByUserId,
  restoreMotorcycleById,
} from "@/src/features/garage/repositories/motorcycle.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

export function ArchivedBuildsScreen() {
  const { user } = useAuth();
  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoringMotorcycleId, setRestoringMotorcycleId] = useState<
    string | null
  >(null);

  function handleRestoreMotorcycle(motorcycle: MotorcycleRow) {
    const title =
      motorcycle.name?.trim() || `${motorcycle.brand} ${motorcycle.model}`;

    Alert.alert(
      "Pulihkan Build?",
      `${title} akan dikembalikan ke daftar Build aktif.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Pulihkan",
          onPress: async () => {
            try {
              setRestoringMotorcycleId(motorcycle.id);
              await restoreMotorcycleById(motorcycle.id);
              setMotorcycles((current) =>
                current.filter((item) => item.id !== motorcycle.id),
              );

              Alert.alert(
                "Build dipulihkan",
                `${title} sudah kembali ke daftar Build aktif.`,
                [
                  { text: "Tetap di sini", style: "cancel" },
                  {
                    text: "Buka Build",
                    onPress: () =>
                      router.replace({
                        pathname: "/(tabs)/garage",
                        params: { motorcycleId: motorcycle.id },
                      }),
                  },
                ],
              );
            } catch (error) {
              Alert.alert(
                "Gagal memulihkan Build",
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan saat memulihkan Build.",
              );
            } finally {
              setRestoringMotorcycleId(null);
            }
          },
        },
      ],
    );
  }

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadArchivedBuilds() {
        if (!user) {
          setMotorcycles([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);
          const data = await listArchivedMotorcyclesByUserId(user.id);

          if (isActive) {
            setMotorcycles(data);
          }
        } catch (error) {
          if (isActive) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat memuat Build yang diarsipkan.",
            );
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadArchivedBuilds();
      return () => {
        isActive = false;
      };
    }, [user]),
  );

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Archived Builds</AppText>
          <AppText variant="caption" tone="secondary">
            Build yang tidak lagi tampil dalam daftar aktif.
          </AppText>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary">Memuat Build...</AppText>
        </View>
      ) : null}

      {!loading && !user ? (
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk membuka Archived Builds.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      ) : null}

      {!loading && user && errorMessage ? (
        <View style={styles.centerState}>
          <AppText variant="title">Archived Builds belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>
          <AppButton onPress={() => router.replace("/archived-builds")}>
            Muat Ulang
          </AppButton>
        </View>
      ) : null}

      {!loading && user && !errorMessage && motorcycles.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Archive size={22} color={theme.primary} />
          </View>
          <AppText variant="title">Belum ada Build diarsipkan</AppText>
          <AppText variant="caption" tone="secondary" style={styles.centerText}>
            Build yang kamu arsipkan akan tersimpan dan muncul di halaman ini.
          </AppText>
        </View>
      ) : null}

      {!loading && user && !errorMessage && motorcycles.length > 0 ? (
        <View style={styles.list}>
          {motorcycles.map((motorcycle) => {
            const title =
              motorcycle.name?.trim() ||
              `${motorcycle.brand} ${motorcycle.model}`;

            return (
              <View key={motorcycle.id} style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/motorcycle/${motorcycle.id}`)}
                  style={({ pressed }) => [
                    styles.cardMain,
                    pressed && styles.pressed,
                  ]}
                >
                  {motorcycle.image_url ? (
                    <Image
                      source={{ uri: motorcycle.image_url }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                      <Bike size={24} color={theme.primary} />
                    </View>
                  )}

                  <View style={styles.cardContent}>
                    <AppText variant="bodyMedium" numberOfLines={1}>
                      {title}
                    </AppText>
                    <AppText
                      variant="caption"
                      tone="secondary"
                      numberOfLines={1}
                    >
                      {motorcycle.brand} {motorcycle.model} · {motorcycle.year}
                    </AppText>
                    <AppText variant="tiny" tone="muted">
                      Diarsipkan {formatArchivedDate(motorcycle.archived_at)}
                    </AppText>
                  </View>

                  <ChevronRight size={18} color={theme.textMuted} />
                </Pressable>

                <Pressable
                  disabled={restoringMotorcycleId !== null}
                  onPress={() => handleRestoreMotorcycle(motorcycle)}
                  style={({ pressed }) => [
                    styles.restoreButton,
                    pressed && styles.pressed,
                    restoringMotorcycleId !== null && styles.disabled,
                  ]}
                >
                  {restoringMotorcycleId === motorcycle.id ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <AppText variant="caption" tone="accent">
                      Pulihkan Build
                    </AppText>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </AppScreen>
  );
}

function formatArchivedDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: spacing.xs },
  centerState: { flex: 1, minHeight: 420, alignItems: "center", justifyContent: "center", gap: spacing.md },
  centerText: { maxWidth: 290, textAlign: "center", lineHeight: 18 },
  emptyCard: { marginTop: spacing.section, minHeight: 280, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.borderSoft, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  emptyIcon: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: theme.primarySoft, alignItems: "center", justifyContent: "center" },
  list: { marginTop: spacing.section, gap: spacing.md },
  card: { borderRadius: radius.lg, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.borderSoft, overflow: "hidden" },
  cardMain: { minHeight: 82, padding: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.md },
  image: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: theme.surfaceSoft },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1, gap: spacing.xs },
  restoreButton: { minHeight: 42, borderTopWidth: 1, borderTopColor: theme.borderSoft, alignItems: "center", justifyContent: "center", backgroundColor: theme.surfaceSoft },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82 },
});
