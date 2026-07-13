import { router, useFocusEffect } from "expo-router";
import { Bike, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

export function BuildScreen() {
  const { user } = useAuth();

  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadBuilds() {
        if (!user) {
          setMotorcycles([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const data = await listMotorcyclesByUserId(user.id);

          if (isActive) {
            setMotorcycles(data);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat build.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadBuilds();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary">Memuat Build...</AppText>
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
            Silakan masuk kembali untuk membuka Build.
          </AppText>

          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Build belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>

          <AppButton onPress={() => router.replace("/(tabs)/feed")}>
            Kembali ke Feed
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const featuredBuild = motorcycles[0] ?? null;

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <View>
          <AppText variant="caption" tone="accent">
            Build
          </AppText>

          <AppText variant="titleLarge" style={styles.title}>
            Build Saya
          </AppText>

          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            Kelola motor, setup parts, timeline, dan gallery build kamu.
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push("/add-motorcycle")}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Plus size={20} color={theme.background} />
        </Pressable>
      </View>

      {featuredBuild ? (
        <Pressable
          onPress={() => router.push(`/motorcycle/${featuredBuild.id}`)}
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.pressed,
          ]}
        >
          {featuredBuild.image_url ? (
            <Image
              source={{ uri: featuredBuild.image_url }}
              style={styles.featuredImage}
            />
          ) : (
            <View style={[styles.featuredImage, styles.imagePlaceholder]}>
              <Bike size={34} color={theme.primary} />
            </View>
          )}

          <View style={styles.featuredOverlay} />

          <View style={styles.featuredContent}>
            <AppText variant="caption" tone="accent">
              Featured Build
            </AppText>

            <AppText variant="title" style={styles.featuredTitle}>
              {featuredBuild.name ||
                `${featuredBuild.brand} ${featuredBuild.model}`}
            </AppText>

            <AppText variant="caption" style={styles.featuredMeta}>
              {featuredBuild.year} ·{" "}
              {featuredBuild.engine_info ??
                (featuredBuild.engine_cc
                  ? `${featuredBuild.engine_cc} cc`
                  : "Mesin belum diisi")}
            </AppText>
          </View>
        </Pressable>
      ) : (
        <AppCard style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Bike size={24} color={theme.primary} />
          </View>

          <AppText variant="title">Belum ada build</AppText>

          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Tambahkan motor pertama untuk mulai membuat Build di ProperRide.
          </AppText>

          <AppButton
            style={styles.emptyButton}
            onPress={() => router.push("/add-motorcycle")}
          >
            Tambah Motor
          </AppButton>
        </AppCard>
      )}

      {motorcycles.length > 1 ? (
        <View style={styles.section}>
          <AppText variant="title">Build Lainnya</AppText>

          <View style={styles.buildList}>
            {motorcycles.slice(1).map((motorcycle) => (
              <Pressable
                key={motorcycle.id}
                onPress={() => router.push(`/motorcycle/${motorcycle.id}`)}
                style={({ pressed }) => [
                  styles.buildRow,
                  pressed && styles.pressed,
                ]}
              >
                {motorcycle.image_url ? (
                  <Image
                    source={{ uri: motorcycle.image_url }}
                    style={styles.buildThumb}
                  />
                ) : (
                  <View style={[styles.buildThumb, styles.imagePlaceholder]}>
                    <Bike size={20} color={theme.primary} />
                  </View>
                )}

                <View style={styles.buildText}>
                  <AppText variant="bodyMedium" numberOfLines={1}>
                    {motorcycle.name ||
                      `${motorcycle.brand} ${motorcycle.model}`}
                  </AppText>

                  <AppText variant="caption" tone="secondary">
                    {motorcycle.year}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  title: {
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 280,
    lineHeight: 18,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredCard: {
    marginTop: spacing.section,
    height: 320,
    borderRadius: radius.xl,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
  },
  featuredOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(11, 15, 20, 0.38)",
  },
  featuredContent: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  featuredTitle: {
    marginTop: spacing.xs,
    color: theme.textPrimary,
  },
  featuredMeta: {
    marginTop: spacing.xs,
    color: theme.textPrimary,
  },
  section: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  buildList: {
    gap: spacing.md,
  },
  buildRow: {
    minHeight: 76,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  buildThumb: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
  },
  buildText: {
    flex: 1,
  },
  emptyCard: {
    marginTop: spacing.section,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyText: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: spacing.lg,
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
