import { Check, ChevronDown } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";
import { AppText } from "./AppText";

export type SelectOption = {
  label: string;
  value: string;
};

type AppSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
  compact?: boolean;
  triggerLabel?: string;
};

export function AppSelect({
  label,
  placeholder,
  value,
  options,
  visible,
  onOpen,
  onClose,
  onChange,
  disabled = false,
  helperText,
  compact = false,
  triggerLabel,
}: AppSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      {!compact ? (
        <AppText variant="caption" tone="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <Pressable
        disabled={disabled}
        onPress={onOpen}
        style={({ pressed }) => [
          styles.trigger,
          compact && styles.compactTrigger,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <AppText
          variant={compact ? "caption" : "body"}
          tone={selectedOption ? "primary" : "muted"}
          numberOfLines={1}
        >
          {triggerLabel ?? selectedOption?.label ?? placeholder}
        </AppText>

        <ChevronDown
          size={compact ? 15 : 18}
          color={disabled ? theme.textMuted : theme.textPrimary}
        />
      </Pressable>

      {helperText ? (
        <AppText variant="caption" tone="muted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <AppText variant="title">{label}</AppText>

              <Pressable
                onPress={onClose}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <AppText variant="caption" tone="accent">
                  Tutup
                </AppText>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionList}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText variant="bodyMedium">{option.label}</AppText>

                    {isSelected ? (
                      <View style={styles.checkCircle}>
                        <Check size={15} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  trigger: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  compactTrigger: {
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  helper: {
    marginLeft: spacing.xs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "72%",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.section,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: theme.border,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionList: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  option: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.surfaceSoft,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
