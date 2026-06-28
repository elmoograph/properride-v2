export const colors = {
  dark: {
    background: "#0B0F14",
    surface: "#121821",
    surfaceSoft: "#1A2230",
    surfaceMuted: "#202A38",

    primary: "#17B169",
    primarySoft: "#123E2B",

    textPrimary: "#F3F4F6",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",

    border: "#2A3442",
    borderSoft: "#1F2937",

    danger: "#EF4444",
    warning: "#F59E0B",
    success: "#17B169",
  },

  light: {
    background: "#F8FAF9",
    surface: "#FFFFFF",
    surfaceSoft: "#F1F5F3",
    surfaceMuted: "#E5E7EB",

    primary: "#17B169",
    primarySoft: "#DFF8EA",

    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",

    border: "#E5E7EB",
    borderSoft: "#EEF2F0",

    danger: "#EF4444",
    warning: "#F59E0B",
    success: "#17B169",
  },
} as const;

export type ThemeMode = keyof typeof colors;

export const defaultThemeMode: ThemeMode = "dark";

export const theme = colors[defaultThemeMode];
