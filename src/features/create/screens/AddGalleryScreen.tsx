import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, BackHandler, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  AppText,
  ImageUploadBox,
} from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";

type GalleryStep = "gallery" | "share" | "post";

export function AddGalleryScreen() {
  const { motorcycleId } = useLocalSearchParams<{ motorcycleId?: string }>();

  const [step, setStep] = useState<GalleryStep>("gallery");
  const [hasMedia, setHasMedia] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [postCaption, setPostCaption] = useState("");

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step === "post") {
          setStep("share");
          return true;
        }

        if (step === "share") {
          setStep("gallery");
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [step]);

  const motorcycle =
    motorcycles.find((item) => item.id === motorcycleId) ?? motorcycles[0];

  const isGalleryStep = step === "gallery";
  const isShareStep = step === "share";
  const isPostStep = step === "post";

  const primaryButtonLabel = isGalleryStep
    ? "Lanjut"
    : isShareStep
      ? "Simpan Gallery Saja"
      : "Simpan Gallery + Post";

  const isSubmitDisabled =
    (isGalleryStep && !hasMedia) || (isPostStep && !postCaption.trim());

  function handleBack() {
    if (isPostStep) {
      setStep("share");
      return;
    }

    if (isShareStep) {
      setStep("gallery");
      return;
    }

    router.back();
  }

  function handlePrimaryAction() {
    if (isSubmitDisabled) {
      return;
    }

    if (isGalleryStep) {
      setStep("share");
      return;
    }

    if (isShareStep) {
      saveGalleryOnly();
      return;
    }

    saveGalleryAndPost();
  }

  function saveGalleryOnly() {
    Alert.alert(
      "Gallery tersimpan",
      `Foto berhasil ditambahkan ke Gallery ${motorcycle.brand} ${motorcycle.model}. Data ini masih sementara sampai Supabase dihubungkan.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  function saveGalleryAndPost() {
    Alert.alert(
      "Gallery dan Post tersimpan",
      `Foto berhasil ditambahkan ke Gallery ${motorcycle.brand} ${motorcycle.model} dan dibuat sebagai Post di Feed. Data ini masih sementara sampai Supabase dihubungkan.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Add Gallery</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Tambahkan foto ke Gallery motor, lalu pilih apakah ingin dibagikan
            ke Feed.
          </AppText>
        </View>
      </View>

      <AppCard style={styles.contextCard}>
        <AppText variant="caption" tone="secondary">
          Motor terkait
        </AppText>

        <AppText variant="bodyMedium" style={styles.contextTitle}>
          {motorcycle.brand} {motorcycle.model}
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.contextMeta}>
          {motorcycle.year} · {motorcycle.engineInfo}
        </AppText>
      </AppCard>

      <View style={styles.progressRow}>
        <StepPill
          label="Gallery"
          active={isGalleryStep}
          done={!isGalleryStep}
        />
        <StepPill label="Share" active={isShareStep} done={isPostStep} />
        <StepPill label="Post" active={isPostStep} done={false} />
      </View>

      <View style={styles.content}>
        {isGalleryStep ? (
          <GalleryContentStep
            hasMedia={hasMedia}
            galleryCaption={galleryCaption}
            onPickMedia={() => setHasMedia(true)}
            onChangeGalleryCaption={setGalleryCaption}
          />
        ) : null}

        {isShareStep ? (
          <ShareDecisionStep
            motorcycleName={`${motorcycle.brand} ${motorcycle.model}`}
            onShareToFeed={() => setStep("post")}
          />
        ) : null}

        {isPostStep ? (
          <PostCaptionStep
            postCaption={postCaption}
            onChangePostCaption={setPostCaption}
          />
        ) : null}

        <AppButton
          disabled={isSubmitDisabled}
          style={styles.submitButton}
          onPress={handlePrimaryAction}
        >
          {primaryButtonLabel}
        </AppButton>

        {isShareStep ? (
          <AppText variant="caption" tone="muted" style={styles.note}>
            Jika tidak dibagikan ke Feed, foto hanya tersimpan di Gallery motor.
          </AppText>
        ) : null}
      </View>
    </AppScreen>
  );
}

function GalleryContentStep({
  hasMedia,
  galleryCaption,
  onPickMedia,
  onChangeGalleryCaption,
}: {
  hasMedia: boolean;
  galleryCaption: string;
  onPickMedia: () => void;
  onChangeGalleryCaption: (value: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="title">Foto Gallery</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Pilih foto yang akan masuk ke Gallery motor.
          </AppText>
        </View>

        <AppText variant="caption" tone="muted">
          Wajib
        </AppText>
      </View>

      <ImageUploadBox
        title={hasMedia ? "Foto sudah dipilih" : "Tambah foto gallery"}
        description={
          hasMedia
            ? "Preview foto akan dibuat setelah image picker aktif."
            : "Pilih satu foto terbaik untuk galeri motor ini."
        }
        onPress={onPickMedia}
      />

      <AppInput
        label="Caption Gallery"
        placeholder="Contoh: Detail setup exhaust terbaru..."
        value={galleryCaption}
        onChangeText={onChangeGalleryCaption}
        multiline
        maxLength={160}
        helperText={`${galleryCaption.length}/160 · Opsional`}
      />
    </View>
  );
}

function ShareDecisionStep({
  motorcycleName,
  onShareToFeed,
}: {
  motorcycleName: string;
  onShareToFeed: () => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="title">Bagikan ke Feed?</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Gallery sudah siap disimpan. Kamu bisa sekalian membuat Post dari
            foto ini.
          </AppText>
        </View>
      </View>

      <AppCard style={styles.shareOptionCard}>
        <AppText variant="bodyMedium">Simpan sebagai Gallery saja</AppText>
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.shareOptionText}
        >
          Foto hanya muncul di Motorcycle Detail &gt; Gallery.
        </AppText>
      </AppCard>

      <Pressable
        onPress={onShareToFeed}
        style={({ pressed }) => [
          styles.shareToFeedCard,
          pressed && styles.pressed,
        ]}
      >
        <AppText variant="bodyMedium">Bagikan juga ke Feed</AppText>
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.shareOptionText}
        >
          Buat Post baru yang terhubung ke {motorcycleName}.
        </AppText>
      </Pressable>
    </View>
  );
}

function PostCaptionStep({
  postCaption,
  onChangePostCaption,
}: {
  postCaption: string;
  onChangePostCaption: (value: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="title">Caption Feed</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Tulis caption untuk Post yang akan tampil di Feed dan Profile kamu.
          </AppText>
        </View>

        <AppText variant="caption" tone="muted">
          Wajib
        </AppText>
      </View>

      <AppInput
        label="Caption Post"
        placeholder="Contoh: Setup baru untuk daily ride."
        value={postCaption}
        onChangeText={onChangePostCaption}
        multiline
        maxLength={220}
        helperText={`${postCaption.length}/220 · Akan tampil di Feed`}
      />

      <AppCard style={styles.feedPreviewCard}>
        <AppText variant="caption" tone="secondary">
          Preview relasi post
        </AppText>

        <AppText variant="bodyMedium" style={styles.feedPreviewTitle}>
          Post ini akan masuk Feed dan tersimpan di Profile kamu.
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.feedPreviewMeta}>
          Feed · Profile Posts · Related Motorcycle
        </AppText>
      </AppCard>
    </View>
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
  contextCard: {
    marginTop: spacing.section,
    alignItems: "flex-start",
  },
  contextTitle: {
    marginTop: spacing.xs,
  },
  contextMeta: {
    marginTop: spacing.xs,
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
  sectionSubtitle: {
    marginTop: spacing.xs,
    maxWidth: 270,
  },
  shareOptionCard: {
    alignItems: "flex-start",
  },
  shareToFeedCard: {
    borderRadius: radius.xl,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    padding: spacing.lg,
  },
  shareOptionText: {
    marginTop: spacing.xs,
  },
  feedPreviewCard: {
    backgroundColor: theme.surfaceSoft,
    borderColor: theme.borderSoft,
    alignItems: "flex-start",
  },
  feedPreviewTitle: {
    marginTop: spacing.xs,
  },
  feedPreviewMeta: {
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.section,
  },
  note: {
    marginTop: spacing.md,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
});
