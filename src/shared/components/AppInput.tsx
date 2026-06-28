import type { TextInputProps, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { radius, spacing, theme, typography } from "@/src/shared/theme";
import { AppText } from "./AppText";

type AppInputProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

export function AppInput({
  label,
  helperText,
  errorText,
  containerStyle,
  inputStyle,
  multiline,
  ...props
}: AppInputProps) {
  const hasError = Boolean(errorText);

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {label}
      </AppText>

      <TextInput
        multiline={multiline}
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.primary}
        style={[
          styles.input,
          multiline && styles.multiline,
          hasError && styles.inputError,
          inputStyle,
        ]}
        {...props}
      />

      {errorText ? (
        <AppText variant="caption" tone="danger" style={styles.helper}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
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
  input: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    color: theme.textPrimary,
    ...typography.body,
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.danger,
  },
  helper: {
    marginLeft: spacing.xs,
  },
});
