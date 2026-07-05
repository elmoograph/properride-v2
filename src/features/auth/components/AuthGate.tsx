import { router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  ensureProfileForUser,
  isProfileComplete,
} from "@/src/features/profile/repositories/profile.repository";
import { theme } from "@/src/shared/theme";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const [checkingProfile, setCheckingProfile] = useState(false);

  const segmentKey = useMemo(() => segments.join("/"), [segments]);
  const firstSegment = segments[0];

  useEffect(() => {
    let isActive = true;

    async function guardRoute() {
      if (loading || !rootNavigationState?.key) {
        return;
      }

      const isAuthRoute = firstSegment === "(auth)";
      const isOnboardingRoute = firstSegment === "profile-onboarding";

      if (!user) {
        if (!isAuthRoute) {
          router.replace("/(auth)/login");
        }

        return;
      }

      try {
        setCheckingProfile(true);

        const profile = await ensureProfileForUser(user);

        if (!isActive) {
          return;
        }

        const profileComplete = isProfileComplete(profile);

        if (!profileComplete && !isOnboardingRoute) {
          router.replace("/profile-onboarding");
          return;
        }

        if (profileComplete && (isAuthRoute || isOnboardingRoute)) {
          router.replace("/(tabs)/feed");
        }
      } catch (error) {
        console.error("AuthGate profile check failed:", error);
      } finally {
        if (isActive) {
          setCheckingProfile(false);
        }
      }
    }

    guardRoute();

    return () => {
      isActive = false;
    };
  }, [loading, user, firstSegment, segmentKey, rootNavigationState?.key]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      {children}

      {checkingProfile ? (
        <View pointerEvents="none" style={styles.overlay}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
});
