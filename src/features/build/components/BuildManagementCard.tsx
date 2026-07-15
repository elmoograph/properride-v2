import { Trash2 } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { AppCard, AppText } from "@/src/shared/components";
import { spacing, theme, radius } from "@/src/shared/theme";

type BuildManagementCardProps = {
  removingMotorcycle: boolean;
  onRemoveMotorcycle: () => void;
};

export function BuildManagementCard({
  removingMotorcycle,
  onRemoveMotorcycle,
}: BuildManagementCardProps) {
  return (
    <AppCard style={styles.dangerZoneCard}>
      <View style={styles.dangerZoneText}>
        <AppText variant="bodyMedium">Kelola Build</AppText>
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.dangerZoneDescription}
        >
          Arsipkan motor jika sudah tidak digunakan lagi. Data tidak dihapus
          permanen.
        </AppText>
      </View>

      <Pressable
        disabled={removingMotorcycle}
        onPress={onRemoveMotorcycle}
        style={({ pressed }) => [
          styles.removeMotorcycleButton,
          pressed && styles.pressed,
          removingMotorcycle && styles.disabledButton,
        ]}
      >
        {removingMotorcycle ? (
          <ActivityIndicator size="small" color={theme.danger} />
        ) : (
          <Trash2 size={16} color={theme.danger} />
        )}

        <AppText variant="caption" style={styles.removeMotorcycleText}>
          {removingMotorcycle ? "Memproses..." : "Hapus"}
        </AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  dangerZoneCard: {
    marginTop: spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dangerZoneText: {
    flex: 1,
  },
  dangerZoneDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  removeMotorcycleButton: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 91, 91, 0.35)",
    backgroundColor: "rgba(255, 91, 91, 0.08)",
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  removeMotorcycleText: {
    color: theme.danger,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
});
