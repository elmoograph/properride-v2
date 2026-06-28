import { Stack } from "expo-router";

import { theme } from "@/src/shared/theme";

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    />
  );
}
