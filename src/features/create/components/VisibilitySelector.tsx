import { StyleSheet, View } from "react-native";

import { AppChip, AppText } from "@/src/shared/components";
import { spacing } from "@/src/shared/theme";

export type VisibilityOption = "public" | "private";

type VisibilitySelectorProps = {
  value: VisibilityOption;
  onChange: (value: VisibilityOption) => void;
};

const options: Array<{
  label: string;
  value: VisibilityOption;
}> = [
  {
    label: "Public",
    value: "public",
  },
  {
    label: "Private",
    value: "private",
  },
];

export function VisibilitySelector({
  value,
  onChange,
}: VisibilitySelectorProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        Siapa yang bisa melihat?
      </AppText>

      <View style={styles.chips}>
        {options.map((option) => (
          <AppChip
            key={option.value}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          >
            {option.label}
          </AppChip>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    marginLeft: spacing.xs,
  },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
