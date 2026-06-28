import { router } from "expo-router";

import { AppButton, AppScreen, AppText } from "@/src/shared/components";

export function AddMotorcycleScreen() {
  return (
    <AppScreen>
      <AppText variant="titleLarge">Tambah Motor</AppText>
      <AppText tone="secondary" style={{ marginTop: 8 }}>
        Form motor sederhana akan dibuat di tahap berikutnya.
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
