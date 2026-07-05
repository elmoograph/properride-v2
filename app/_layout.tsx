import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthGate } from "@/src/features/auth/components/AuthGate";

import { AuthProvider } from "@/src/features/auth/providers/AuthProvider";
import { theme } from "@/src/shared/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar style="light" />
            <NavigationBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
