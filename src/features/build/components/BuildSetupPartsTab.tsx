import { router } from "expo-router";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { AppCard, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcyclePartRow } from "@/src/shared/types/database.types";

type PartCategoryGroup = {
  category: string;
  parts: MotorcyclePartRow[];
};

type BuildSetupPartsTabProps = {
  motorcycleId: string;
  parts: MotorcyclePartRow[];
  archivingPartId: string | null;
  onArchivePart: (part: MotorcyclePartRow) => void;
};

export function BuildSetupPartsTab({
  motorcycleId,
  parts,
  archivingPartId,
  onArchivePart,
}: BuildSetupPartsTabProps) {
  const groupedParts = useMemo(() => groupPartsByCategory(parts), [parts]);

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() =>
    groupedParts.reduce<Record<string, boolean>>((result, group, index) => {
      result[group.category] = index === 0;
      return result;
    }, {}),
  );

  useEffect(() => {
    setExpandedCategories(
      groupedParts.reduce<Record<string, boolean>>((result, group, index) => {
        result[group.category] = index === 0;
        return result;
      }, {}),
    );
  }, [groupedParts]);

  function toggleCategory(category: string) {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <AppText variant="title">Setup Parts</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Part dikelompokkan berdasarkan kategori setup.
          </AppText>
        </View>

        <Pressable
          onPress={() =>
            router.push(`/(create)/add-part?motorcycleId=${motorcycleId}`)
          }
          style={({ pressed }) => [
            styles.sectionActionButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="caption" tone="accent">
            Add Part
          </AppText>
        </Pressable>
      </View>

      {groupedParts.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyMedium">Belum ada part</AppText>
          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Tambahkan part pertama untuk mulai mencatat setup motor ini.
          </AppText>
        </AppCard>
      ) : null}

      {groupedParts.length > 0 ? (
        <View style={styles.categoryList}>
          {groupedParts.map((group) => {
            const isExpanded = expandedCategories[group.category];

            return (
              <View key={group.category} style={styles.categoryAccordion}>
                <Pressable
                  onPress={() => toggleCategory(group.category)}
                  style={({ pressed }) => [
                    styles.accordionHeader,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.accordionTitle}>
                    <AppText variant="bodyMedium">{group.category}</AppText>

                    <View style={styles.categoryCountPill}>
                      <AppText variant="tiny" tone="secondary">
                        {group.parts.length} item
                      </AppText>
                    </View>
                  </View>

                  {isExpanded ? (
                    <ChevronDown size={18} color={theme.textMuted} />
                  ) : (
                    <ChevronRight size={18} color={theme.textMuted} />
                  )}
                </Pressable>

                {isExpanded ? (
                  <View style={styles.partList}>
                    {group.parts.map((part) => (
                      <Pressable
                        key={part.id}
                        onPress={() => router.push(`/part/edit/${part.id}`)}
                        style={({ pressed }) => [
                          styles.partRow,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.partThumbnail}>
                          <Package size={18} color={theme.primary} />
                        </View>

                        <View style={styles.partText}>
                          <AppText variant="bodyMedium" numberOfLines={1}>
                            {part.name}
                          </AppText>

                          <AppText
                            variant="caption"
                            tone="secondary"
                            style={styles.partMeta}
                            numberOfLines={1}
                          >
                            {part.brand} · {part.category}
                          </AppText>

                          {part.description ? (
                            <AppText
                              variant="caption"
                              tone="muted"
                              style={styles.partDescription}
                            >
                              {part.description}
                            </AppText>
                          ) : null}
                        </View>

                        <Pressable
                          disabled={archivingPartId === part.id}
                          onPress={() => onArchivePart(part)}
                          style={({ pressed }) => [
                            styles.archivePartButton,
                            pressed && styles.pressed,
                            archivingPartId === part.id &&
                              styles.disabledButton,
                          ]}
                        >
                          {archivingPartId === part.id ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.primary}
                            />
                          ) : (
                            <Archive size={16} color={theme.primary} />
                          )}
                        </Pressable>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function groupPartsByCategory(parts: MotorcyclePartRow[]): PartCategoryGroup[] {
  const grouped = parts.reduce<Record<string, MotorcyclePartRow[]>>(
    (result, part) => {
      if (!result[part.category]) {
        result[part.category] = [];
      }

      result[part.category].push(part);
      return result;
    },
    {},
  );

  return Object.entries(grouped).map(([category, categoryParts]) => ({
    category,
    parts: categoryParts,
  }));
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  sectionActionButton: {
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryList: {
    gap: spacing.md,
  },
  categoryAccordion: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  accordionHeader: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  accordionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  categoryCountPill: {
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  partList: {
    borderTopWidth: 1,
    borderTopColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  partRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  partThumbnail: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  partText: {
    flex: 1,
  },
  partMeta: {
    marginTop: spacing.xs,
  },
  partDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  archivePartButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyCard: {
    alignItems: "flex-start",
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
