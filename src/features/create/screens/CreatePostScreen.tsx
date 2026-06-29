import { router } from "expo-router";
import { ChevronLeft, ImagePlus, Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, BackHandler, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";

type CreatePostStep = "media" | "caption" | "motorcycle" | "summary";
type PostVisibility = "public" | "private";

const maxMediaCount = 10;

export function CreatePostScreen() {
  const [step, setStep] = useState<CreatePostStep>("media");
  const [mediaCount, setMediaCount] = useState(0);
  const [caption, setCaption] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<
    string | null
  >(null);
  const [visibility, setVisibility] = useState<PostVisibility>("public");

  const selectedMotorcycle = motorcycles.find(
    (motorcycle) => motorcycle.id === selectedMotorcycleId,
  );

  const isMediaStep = step === "media";
  const isCaptionStep = step === "caption";
  const isMotorcycleStep = step === "motorcycle";
  const isSummaryStep = step === "summary";

  const isNextDisabled =
    (isMediaStep && mediaCount === 0) || (isCaptionStep && !caption.trim());

  const primaryButtonLabel = isSummaryStep ? "Buat Post" : "Lanjut";

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step === "summary") {
          setStep("motorcycle");
          return true;
        }

        if (step === "motorcycle") {
          setStep("caption");
          return true;
        }

        if (step === "caption") {
          setStep("media");
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [step]);

  function handleBack() {
    if (step === "summary") {
      setStep("motorcycle");
      return;
    }

    if (step === "motorcycle") {
      setStep("caption");
      return;
    }

    if (step === "caption") {
      setStep("media");
      return;
    }

    router.back();
  }

  function handleNext() {
    if (isNextDisabled) {
      return;
    }

    if (step === "media") {
      setStep("caption");
      return;
    }

    if (step === "caption") {
      setStep("motorcycle");
      return;
    }

    if (step === "motorcycle") {
      setStep("summary");
      return;
    }

    handleCreatePost();
  }

  function handleCreatePost() {
    Alert.alert(
      "Post dibuat",
      `Post dengan ${mediaCount} media berhasil dibuat. Data ini masih sementara sampai Supabase dihubungkan.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  function handleAddMedia() {
    setMediaCount((current) => Math.min(current + 1, maxMediaCount));
  }

  function handleRemoveMedia() {
    setMediaCount((current) => Math.max(current - 1, 0));
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Create Post</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Bagikan inspirasi setup, detail motor, atau momen riding kamu.
          </AppText>
        </View>
      </View>

      <View style={styles.progressRow}>
        <StepPill label="Media" active={isMediaStep} done={!isMediaStep} />
        <StepPill
          label="Caption"
          active={isCaptionStep}
          done={isMotorcycleStep || isSummaryStep}
        />
        <StepPill
          label="Motor"
          active={isMotorcycleStep}
          done={isSummaryStep}
        />
        <StepPill label="Post" active={isSummaryStep} done={false} />
      </View>

      <View style={styles.content}>
        {isMediaStep ? (
          <MediaStep
            mediaCount={mediaCount}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
          />
        ) : null}

        {isCaptionStep ? (
          <CaptionStep caption={caption} onChangeCaption={setCaption} />
        ) : null}

        {isMotorcycleStep ? (
          <MotorcycleStep
            selectedMotorcycleId={selectedMotorcycleId}
            onSelectMotorcycle={setSelectedMotorcycleId}
            onSkip={() => setStep("summary")}
          />
        ) : null}

        {isSummaryStep ? (
          <SummaryStep
            mediaCount={mediaCount}
            caption={caption}
            visibility={visibility}
            selectedMotorcycleName={
              selectedMotorcycle
                ? `${selectedMotorcycle.brand} ${selectedMotorcycle.model}`
                : null
            }
            onChangeVisibility={setVisibility}
          />
        ) : null}

        <AppButton
          disabled={isNextDisabled}
          style={styles.primaryButton}
          onPress={handleNext}
        >
          {primaryButtonLabel}
        </AppButton>
      </View>
    </AppScreen>
  );
}

function MediaStep({
  mediaCount,
  onAddMedia,
  onRemoveMedia,
}: {
  mediaCount: number;
  onAddMedia: () => void;
  onRemoveMedia: () => void;
}) {
  const hasMedia = mediaCount > 0;
  const isMaxMedia = mediaCount >= maxMediaCount;

  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <AppText variant="title">Pilih Media</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Pilih satu atau beberapa foto untuk post kamu.
          </AppText>
        </View>

        <AppText variant="caption" tone="muted">
          Wajib
        </AppText>
      </View>

      <Pressable style={styles.mediaPickerCard} onPress={onAddMedia}>
        <View style={styles.mediaIconCircle}>
          <ImagePlus size={26} color={theme.primary} />
        </View>

        <AppText variant="bodyMedium" style={styles.mediaTitle}>
          {hasMedia ? `${mediaCount} media dipilih` : "Tambah media"}
        </AppText>

        <AppText variant="caption" tone="secondary" style={styles.mediaText}>
          {hasMedia
            ? "Preview carousel akan dibuat setelah image picker aktif."
            : "Untuk MVP sekarang, tombol ini mensimulasikan tambah foto."}
        </AppText>
      </Pressable>

      <View style={styles.mediaControlRow}>
        <Pressable
          style={[styles.counterButton, mediaCount === 0 && styles.disabledBox]}
          onPress={onRemoveMedia}
          disabled={mediaCount === 0}
        >
          <Minus
            size={18}
            color={mediaCount === 0 ? theme.textMuted : theme.textPrimary}
          />
        </Pressable>

        <View style={styles.mediaCountBox}>
          <AppText variant="title">{mediaCount}</AppText>
          <AppText variant="caption" tone="muted">
            / {maxMediaCount}
          </AppText>
        </View>

        <Pressable
          style={[styles.counterButton, isMaxMedia && styles.disabledBox]}
          onPress={onAddMedia}
          disabled={isMaxMedia}
        >
          <Plus
            size={18}
            color={isMaxMedia ? theme.textMuted : theme.textPrimary}
          />
        </Pressable>
      </View>

      <AppText variant="caption" tone="muted" style={styles.note}>
        Nanti saat image picker aktif, setiap media akan masuk ke field
        post.media[].
      </AppText>
    </View>
  );
}

function CaptionStep({
  caption,
  onChangeCaption,
}: {
  caption: string;
  onChangeCaption: (value: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <AppText variant="title">Caption</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Ceritakan setup, inspirasi, atau detail dari post ini.
          </AppText>
        </View>

        <AppText variant="caption" tone="muted">
          Wajib
        </AppText>
      </View>

      <AppInput
        label="Caption Post"
        placeholder="Contoh: Setup harian baru selesai..."
        value={caption}
        onChangeText={onChangeCaption}
        multiline
        maxLength={220}
        helperText={`${caption.length}/220 · Akan tampil di Feed`}
      />
    </View>
  );
}

function MotorcycleStep({
  selectedMotorcycleId,
  onSelectMotorcycle,
  onSkip,
}: {
  selectedMotorcycleId: string | null;
  onSelectMotorcycle: (id: string) => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <AppText variant="title">Hubungkan Motor</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Pilih motor terkait agar post bisa terhubung ke Garage.
          </AppText>
        </View>

        <Pressable onPress={onSkip} hitSlop={10}>
          <AppText variant="caption" tone="accent">
            Lewati
          </AppText>
        </Pressable>
      </View>

      <View style={styles.motorcycleList}>
        {motorcycles.map((motorcycle) => {
          const isSelected = motorcycle.id === selectedMotorcycleId;

          return (
            <View
              key={motorcycle.id}
              style={[isSelected && styles.selectedMotorcycleWrap]}
            >
              <MotorcycleSelectCard
                motorcycle={motorcycle}
                onPress={() => onSelectMotorcycle(motorcycle.id)}
              />

              {isSelected ? (
                <View style={styles.selectedBadge}>
                  <AppText variant="tiny" tone="accent">
                    Dipilih
                  </AppText>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SummaryStep({
  mediaCount,
  caption,
  selectedMotorcycleName,
  visibility,
  onChangeVisibility,
}: {
  mediaCount: number;
  caption: string;
  selectedMotorcycleName: string | null;
  visibility: PostVisibility;
  onChangeVisibility: (value: PostVisibility) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <AppText variant="title">Review Post</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Periksa ringkasan sebelum post masuk ke Feed.
          </AppText>
        </View>
      </View>

      <AppCard style={styles.summaryCard}>
        <SummaryRow label="Media" value={`${mediaCount} item`} />
        <SummaryRow
          label="Motor terkait"
          value={selectedMotorcycleName ?? "Tidak dihubungkan"}
        />
        <SummaryRow
          label="Visibility"
          value={visibility === "public" ? "Public" : "Private"}
        />
      </AppCard>

      <View style={styles.visibilityBox}>
        <AppText variant="bodyMedium">Visibility</AppText>

        <View style={styles.visibilityRow}>
          <VisibilityOption
            label="Public"
            active={visibility === "public"}
            onPress={() => onChangeVisibility("public")}
          />
          <VisibilityOption
            label="Private"
            active={visibility === "private"}
            onPress={() => onChangeVisibility("private")}
          />
        </View>
      </View>

      <AppCard style={styles.captionPreviewCard}>
        <AppText variant="caption" tone="secondary">
          Caption
        </AppText>
        <AppText style={styles.captionPreview}>{caption}</AppText>
      </AppCard>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.summaryValue}>
        {value}
      </AppText>
    </View>
  );
}

function VisibilityOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.visibilityOption, active && styles.visibilityOptionActive]}
    >
      <AppText variant="caption" tone={active ? "accent" : "secondary"}>
        {label}
      </AppText>
    </Pressable>
  );
}

function StepPill({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <View
      style={[
        styles.stepPill,
        active && styles.stepPillActive,
        done && styles.stepPillDone,
      ]}
    >
      <AppText variant="tiny" tone={active || done ? "accent" : "muted"}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  progressRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.sm,
  },
  stepPill: {
    flex: 1,
    minHeight: 32,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPillActive: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  stepPillDone: {
    borderColor: theme.primary,
  },
  content: {
    marginTop: spacing.section,
  },
  stepContent: {
    gap: spacing.xl,
  },
  sectionHeader: {
    marginLeft: spacing.xs,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionText: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
    maxWidth: 270,
  },
  mediaPickerCard: {
    minHeight: 210,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  mediaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaTitle: {
    marginTop: spacing.md,
  },
  mediaText: {
    marginTop: spacing.xs,
    textAlign: "center",
    maxWidth: 260,
  },
  mediaControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBox: {
    opacity: 0.45,
  },
  mediaCountBox: {
    minWidth: 86,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  motorcycleList: {
    gap: spacing.sm,
  },
  selectedMotorcycleWrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  selectedBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  summaryCard: {
    gap: spacing.md,
    alignItems: "stretch",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  summaryValue: {
    flex: 1,
    textAlign: "right",
  },
  visibilityBox: {
    gap: spacing.md,
  },
  visibilityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  visibilityOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityOptionActive: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  captionPreviewCard: {
    alignItems: "flex-start",
  },
  captionPreview: {
    marginTop: spacing.xs,
  },
  primaryButton: {
    marginTop: spacing.section,
  },
});
