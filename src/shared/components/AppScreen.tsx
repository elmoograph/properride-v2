import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, theme } from "@/src/shared/theme";

type AppScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
};

export function AppScreen({
  children,
  scrollable = false,
  padded = true,
}: AppScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            padded && styles.padded,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={[styles.container, padded && styles.padded]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.section,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
