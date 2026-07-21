import { router } from "expo-router";
import {
  Archive,
  Boxes,
  Disc3,
  Droplets,
  Gauge,
  MoreVertical,
  Paintbrush,
  Pencil,
  SlidersHorizontal,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppCard, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcyclePartRow } from "@/src/shared/types/database.types";

type PartArea = {
  name: string;
  categories: string[];
};

type PartAreaGroup = {
  area: string;
  parts: MotorcyclePartRow[];
};

type BuildSetupPartsTabProps = {
  motorcycleId: string;
  parts: MotorcyclePartRow[];
  archivingPartId: string | null;
  onArchivePart: (part: MotorcyclePartRow) => void;
  canManage: boolean;
};

const partAreas: PartArea[] = [
  {
    name: "Kaki-kaki",
    categories: ["Ban", "Velg", "Suspensi", "Rem", "Rantai & Gir"],
  },
  {
    name: "Mesin & Performa",
    categories: ["Engine", "CVT", "Knalpot"],
  },
  {
    name: "Elektrikal",
    categories: ["ECU & Kelistrikan", "Aki", "Lampu"],
  },
  {
    name: "Kontrol & Kenyamanan",
    categories: ["Stang & Cockpit", "Spion", "Jok"],
  },
  {
    name: "Body & Tampilan",
    categories: ["Body Kit", "Aksesoris"],
  },
  {
    name: "Perawatan",
    categories: ["Oli & Fluids"],
  },
];

export function BuildSetupPartsTab({
  motorcycleId,
  parts,
  archivingPartId,
  onArchivePart,
  canManage,
}: BuildSetupPartsTabProps) {
  const groupedParts = useMemo(() => groupPartsByArea(parts), [parts]);
  const [selectedPart, setSelectedPart] = useState<MotorcyclePartRow | null>(
    null,
  );

  function handleEditPart() {
    if (!selectedPart) {
      return;
    }

    const partId = selectedPart.id;
    setSelectedPart(null);
    router.push(`/part/edit/${partId}`);
  }

  function handleArchivePart() {
    if (!selectedPart) {
      return;
    }

    const part = selectedPart;
    setSelectedPart(null);
    onArchivePart(part);
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
            Part dikelompokkan berdasarkan area motor.
          </AppText>
        </View>

        {canManage ? (
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
        ) : null}
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
        <View style={styles.areaList}>
          {groupedParts.map((group) => (
            <View key={group.area} style={styles.areaSection}>
              <View style={styles.areaHeader}>
                <View style={styles.areaIdentity}>
                  <View style={styles.areaIcon}>{renderAreaIcon(group.area)}</View>
                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={styles.areaName}
                  >
                    {group.area}
                  </AppText>
                </View>

                <View style={styles.areaCountBadge}>
                  <AppText variant="tiny" tone="secondary">
                    {group.parts.length} {group.parts.length === 1 ? "part" : "parts"}
                  </AppText>
                </View>
              </View>

              <View style={styles.partList}>
                {group.parts.map((part, index) => (
                  <View
                    key={part.id}
                    style={[
                      styles.partRow,
                      index < group.parts.length - 1 && styles.partRowBorder,
                    ]}
                  >
                    <Pressable
                      disabled={!canManage}
                      onPress={() => router.push(`/part/edit/${part.id}`)}
                      style={({ pressed }) => [
                        styles.partMainAction,
                        pressed && styles.pressed,
                      ]}
                    >
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
                      </View>
                    </Pressable>

                    {canManage ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Kelola ${part.name}`}
                        disabled={archivingPartId === part.id}
                        onPress={() => setSelectedPart(part)}
                        style={({ pressed }) => [
                          styles.partMenuButton,
                          pressed && styles.pressed,
                          archivingPartId === part.id && styles.disabledButton,
                        ]}
                      >
                        {archivingPartId === part.id ? (
                          <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                          <MoreVertical size={18} color={theme.textMuted} />
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(selectedPart)}
        onRequestClose={() => setSelectedPart(null)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setSelectedPart(null)}
        >
          <Pressable style={styles.menuSheet}>
            <View style={styles.sheetHandle} />
            <AppText variant="title" numberOfLines={1}>
              {selectedPart?.name}
            </AppText>

            <Pressable
              onPress={handleEditPart}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Pencil size={18} color={theme.textPrimary} />
              <AppText variant="bodyMedium">Edit part</AppText>
            </Pressable>

            <Pressable
              onPress={handleArchivePart}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Archive size={18} color={theme.danger} />
              <AppText variant="bodyMedium" style={styles.archiveText}>
                Archive part
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function groupPartsByArea(parts: MotorcyclePartRow[]): PartAreaGroup[] {
  const knownCategories = new Set(
    partAreas.flatMap((area) => area.categories),
  );

  const groups = partAreas
    .map((area) => ({
      area: area.name,
      parts: parts.filter((part) => area.categories.includes(part.category)),
    }))
    .filter((group) => group.parts.length > 0);

  const otherParts = parts.filter(
    (part) => !knownCategories.has(part.category),
  );

  if (otherParts.length > 0) {
    groups.push({ area: "Lainnya", parts: otherParts });
  }

  return groups;
}

function renderAreaIcon(area: string) {
  const iconProps = { size: 15, color: theme.primary };

  switch (area) {
    case "Kaki-kaki":
      return <Disc3 {...iconProps} />;
    case "Mesin & Performa":
      return <Gauge {...iconProps} />;
    case "Elektrikal":
      return <Zap {...iconProps} />;
    case "Kontrol & Kenyamanan":
      return <SlidersHorizontal {...iconProps} />;
    case "Body & Tampilan":
      return <Paintbrush {...iconProps} />;
    case "Perawatan":
      return <Droplets {...iconProps} />;
    default:
      return <Boxes {...iconProps} />;
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacing.lg,
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
  areaList: {
    gap: spacing.xl,
  },
  areaSection: {
    gap: spacing.md,
  },
  areaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
    gap: spacing.md,
  },
  areaIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  areaIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  areaName: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  areaCountBadge: {
    minHeight: 26,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  partList: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  partRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  partRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  partMainAction: {
    flex: 1,
    minHeight: 68,
    justifyContent: "center",
    paddingRight: spacing.sm,
  },
  partText: {
    flex: 1,
  },
  partMeta: {
    marginTop: spacing.xs,
  },
  partMenuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
  menuBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  menuSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.section,
    gap: spacing.sm,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: theme.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  menuItem: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuItemPressed: {
    backgroundColor: theme.surfaceSoft,
  },
  archiveText: {
    color: theme.danger,
  },
  pressed: {
    opacity: 0.82,
  },
});
