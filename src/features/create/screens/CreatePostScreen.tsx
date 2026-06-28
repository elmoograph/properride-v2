import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
  ImageUploadBox,
} from "@/src/shared/components";
import { motorcycles } from "@/src/shared/constants/mockData";
import { spacing, theme } from "@/src/shared/theme";
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";
import {
  VisibilitySelector,
  type VisibilityOption,
} from "@/src/features/create/components/VisibilitySelector";

const totalSteps = 4;

type CreatePostStep = 1 | 2 | 3 | 4;

export function CreatePostScreen() {
  const [step, setStep] = useState<CreatePostStep>(1);
  const [hasMedia, setHasMedia] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<
    string | null
  >(null);
  const [visibility, setVisibility] = useState<VisibilityOption>("public");
  const goToPreviousStep = useCallback(() => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep((currentStep) => (currentStep - 1) as CreatePostStep);
  }, [step]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step > 1) {
          setStep((currentStep) => (currentStep - 1) as CreatePostStep);
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [step]);

  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;

  const canContinue =
    step === 1 ? hasMedia : step === 2 ? Boolean(caption.trim()) : true;

  function handleBack() {
    goToPreviousStep();
  }

  function handleNext() {
    if (!canContinue) {
      return;
    }

    if (isLastStep) {
      handleCreatePost();
      return;
    }

    setStep((currentStep) => (currentStep + 1) as CreatePostStep);
  }

  function handleCreatePost() {
    // Nanti diganti dengan submit real ke Supabase.
    setStep(1);
    setHasMedia(false);
    setCaption("");
    setSelectedMotorcycleId(null);
    setVisibility("public");

    router.back();
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Buat Post</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            {getStepSubtitle(step)}
          </AppText>
        </View>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressInfo}>
          <AppText variant="caption" tone="accent">
            Step {step} dari {totalSteps}
          </AppText>

          <AppText variant="caption" tone="muted">
            {getStepTitle(step)}
          </AppText>
        </View>

        <View style={styles.progressTrack}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 <= step;

            return (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  isActive && styles.progressActive,
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.content}>{renderStepContent()}</View>

      <View style={styles.footer}>
        {!isFirstStep ? (
          <AppButton
            variant="secondary"
            style={styles.footerButton}
            onPress={handleBack}
          >
            Kembali
          </AppButton>
        ) : null}

        <AppButton
          disabled={!canContinue}
          style={styles.footerButton}
          onPress={handleNext}
        >
          {isLastStep ? "Buat Post" : "Lanjut"}
        </AppButton>
      </View>
    </AppScreen>
  );

  function renderStepContent() {
    if (step === 1) {
      return (
        <View style={styles.stepContent}>
          <ImageUploadBox
            title={hasMedia ? "Media sudah dipilih" : "Tambah foto / video"}
            description={
              hasMedia
                ? "Untuk MVP, preview media akan dibuat setelah image picker aktif."
                : "Pilih satu media utama untuk post kamu."
            }
            onPress={() => setHasMedia(true)}
          />

          <AppText variant="caption" tone="muted" style={styles.helperText}>
            Untuk awal, kita pakai satu foto atau video dulu. Carousel bisa
            ditambahkan nanti.
          </AppText>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.stepContent}>
          <AppInput
            label="Caption"
            placeholder="Ceritakan momen atau inspirasi ride kamu..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            helperText={`${caption.length}/500`}
          />
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.stepContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <AppText variant="title">Hubungkan Motor</AppText>
              <AppText tone="secondary" style={styles.sectionSubtitle}>
                Pilih motor dari Garage agar post ini punya konteks.
              </AppText>
            </View>

            <Pressable
              onPress={() => {
                setSelectedMotorcycleId(null);
                setStep(4);
              }}
            >
              <AppText variant="caption" tone="accent">
                Lewati
              </AppText>
            </Pressable>
          </View>

          <View style={styles.motorcycleList}>
            {motorcycles.map((motorcycle) => (
              <MotorcycleSelectCard
                key={motorcycle.id}
                motorcycle={motorcycle}
                selected={selectedMotorcycleId === motorcycle.id}
                onPress={() => setSelectedMotorcycleId(motorcycle.id)}
              />
            ))}
          </View>

          <AppText variant="caption" tone="muted" style={styles.helperText}>
            Langkah ini opsional. Post tetap bisa dibuat tanpa motor terkait.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <VisibilitySelector value={visibility} onChange={setVisibility} />

        <View style={styles.summaryCard}>
          <AppText variant="title">Ringkasan Post</AppText>

          <View style={styles.summaryRow}>
            <AppText tone="secondary">Media</AppText>
            <AppText variant="bodyMedium">
              {hasMedia ? "Sudah dipilih" : "-"}
            </AppText>
          </View>

          <View style={styles.summaryRow}>
            <AppText tone="secondary">Caption</AppText>
            <AppText variant="bodyMedium">
              {caption.trim() ? "Sudah diisi" : "-"}
            </AppText>
          </View>

          <View style={styles.summaryRow}>
            <AppText tone="secondary">Motor</AppText>
            <AppText variant="bodyMedium">
              {getSelectedMotorcycleName() ?? "Tidak dihubungkan"}
            </AppText>
          </View>

          <View style={styles.summaryRow}>
            <AppText tone="secondary">Visibility</AppText>
            <AppText variant="bodyMedium">
              {visibility === "public" ? "Public" : "Private"}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  function getSelectedMotorcycleName() {
    return motorcycles.find(
      (motorcycle) => motorcycle.id === selectedMotorcycleId,
    )?.name;
  }
}

function getStepTitle(step: CreatePostStep) {
  if (step === 1) {
    return "Tambah media";
  }

  if (step === 2) {
    return "Tulis caption";
  }

  if (step === 3) {
    return "Koneksi motor";
  }

  return "Visibility";
}

function getStepSubtitle(step: CreatePostStep) {
  if (step === 1) {
    return "Mulai dari foto atau video utama.";
  }

  if (step === 2) {
    return "Tambahkan cerita singkat untuk post kamu.";
  }

  if (step === 3) {
    return "Hubungkan post ke motor di Garage.";
  }

  return "Atur siapa yang bisa melihat post ini.";
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
    borderRadius: 999,
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
  progressArea: {
    marginTop: spacing.section,
    gap: spacing.sm,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  progressTrack: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.surfaceSoft,
  },
  progressActive: {
    backgroundColor: theme.primary,
  },
  content: {
    marginTop: spacing.section,
  },
  stepContent: {
    gap: spacing.xl,
  },
  helperText: {
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitleArea: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  motorcycleList: {
    gap: spacing.sm,
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.section,
    flexDirection: "row",
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
