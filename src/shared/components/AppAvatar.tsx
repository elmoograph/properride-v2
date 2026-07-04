import { User } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";

import { radius, theme } from "@/src/shared/theme";

type AppAvatarSize = "sm" | "md" | "lg" | "xl";

type AppAvatarProps = {
  uri?: string | null;
  size?: AppAvatarSize;
};

const AVATAR_SIZE_MAP: Record<AppAvatarSize, number> = {
  sm: 32,
  md: 36,
  lg: 44,
  xl: 72,
};

const ICON_SIZE_MAP: Record<AppAvatarSize, number> = {
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
};

export function AppAvatar({ uri, size = "md" }: AppAvatarProps) {
  const avatarSize = AVATAR_SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];
  const avatarUri =
    typeof uri === "string" && uri.trim().length > 0 ? uri : null;

  const avatarStyle = [
    styles.avatar,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: radius.pill,
    },
  ];

  if (avatarUri) {
    return <Image source={{ uri: avatarUri }} style={avatarStyle} />;
  }

  return (
    <View style={[avatarStyle, styles.fallback]}>
      <User size={iconSize} color={theme.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
