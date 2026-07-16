import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export type BuildDetailTab = "setup" | "timeline" | "gallery";

const buildDetailTabs: Array<{
  label: string;
  value: BuildDetailTab;
}> = [
  {
    label: "Setup Parts",
    value: "setup",
  },
  {
    label: "Timeline",
    value: "timeline",
  },
  {
    label: "Gallery",
    value: "gallery",
  },
];

type BuildDetailTabsProps = {
  activeTab: BuildDetailTab;
  onChangeTab: (tab: BuildDetailTab) => void;
};

export function BuildDetailTabs({
  activeTab,
  onChangeTab,
}: BuildDetailTabsProps) {
  return (
    <View style={styles.tabBar}>
      {buildDetailTabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onChangeTab(tab.value)}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
          >
            <AppText variant="caption" tone={isActive ? "accent" : "secondary"}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    marginTop: spacing.section,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.xs,
    flexDirection: "row",
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.primarySoft,
  },
});
