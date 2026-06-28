import { router } from "expo-router";

import { AppButton, AppScreen, AppText } from "@/src/shared/components";

export function AddPartScreen() {
  return (
    <AppScreen>
      <AppText variant="titleLarge">Tambah Part</AppText>
      <AppText tone="secondary" style={{ marginTop: 8 }}>
        Form part sederhana akan dibuat di tahap berikutnya.
      </AppText>

      <AppButton
        variant="secondary"
        style={{ marginTop: 24 }}
        onPress={() => router.back()}
      >
        Kembali
      </AppButton>
    </AppScreen>
  );
}
