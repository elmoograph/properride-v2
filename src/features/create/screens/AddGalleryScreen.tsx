import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { createMotorcycleGalleryItem } from "@/src/features/garage/repositories/motorcycleGallery.repository";

import { getMotorcycleById } from "@/src/features/garage/repositories/motorcycle.repository";
import { createPostWithMedia } from "@/src/features/feed/repositories/post.repository";
import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  AppText,
  ImageUploadBox,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";
import {
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";

type GalleryStep = "gallery" | "share" | "post";
type ShareChoice = "gallery_only" | "share_to_feed";
const TEMP_GALLERY_IMAGE_URL =
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200";

export function AddGalleryScreen() {
  const { motorcycleId } = useLocalSearchParams<{ motorcycleId?: string }>();
  const { user } = useAuth();

  const [motorcycle, setMotorcycle] = useState<MotorcycleRow | null>(null);
  const [loadingMotorcycle, setLoadingMotorcycle] = useState(true);
  const [motorcycleError, setMotorcycleError] = useState<string | null>(null);

  const [step, setStep] = useState<GalleryStep>("gallery");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [shareChoice, setShareChoice] = useState<ShareChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMotorcycleContext() {
      if (!motorcycleId) {
        setLoadingMotorcycle(false);
        setMotorcycleError(
          "Motor belum dipilih. Add Gallery harus memiliki konteks motor.",
        );
        return;
      }

      try {
        setLoadingMotorcycle(true);
        setMotorcycleError(null);

        const data = await getMotorcycleById(motorcycleId);

        if (isMounted) {
          setMotorcycle(data);

          if (!data) {
            setMotorcycleError("Motor tidak ditemukan atau sudah dihapus.");
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat motor.";

        if (isMounted) {
          setMotorcycleError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingMotorcycle(false);
        }
      }
    }

    loadMotorcycleContext();

    return () => {
      isMounted = false;
    };
  }, [motorcycleId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step === "post") {
          setStep("share");
          return true;
        }

        if (step === "share") {
          setShareChoice(null);
          setStep("gallery");
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [step]);

  const isGalleryStep = step === "gallery";
  const isShareStep = step === "share";
  const isPostStep = step === "post";

  const primaryButtonLabel = isGalleryStep
    ? "Lanjut"
    : isShareStep
      ? "Confirm"
      : "Simpan Gallery + Post";

  const isSubmitDisabled =
    submitting ||
    !motorcycle ||
    (isGalleryStep && !selectedImageUri) ||
    (isShareStep && !shareChoice) ||
    (isPostStep && !postCaption.trim());

  async function handlePickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin diperlukan",
        "Izinkan akses galeri untuk memilih foto motor.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.88,
    });

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0]?.uri;

    if (!imageUri) {
      Alert.alert("Foto tidak valid", "Pilih foto lain untuk Gallery.");
      return;
    }

    setSelectedImageUri(imageUri);
  }

  function handleBack() {
    if (isPostStep) {
      setStep("share");
      return;
    }

    if (isShareStep) {
      setShareChoice(null);
      setStep("gallery");
      return;
    }

    router.back();
  }

  function handlePrimaryAction() {
    if (isSubmitDisabled || !motorcycle) {
      return;
    }

    if (isGalleryStep) {
      setStep("share");
      return;
    }

    if (isShareStep) {
      if (shareChoice === "gallery_only") {
        saveGalleryOnly();
        return;
      }

      if (shareChoice === "share_to_feed") {
        setStep("post");
        return;
      }
    }

    saveGalleryAndPost();
  }

  async function uploadSelectedGalleryImage() {
    if (!user || !motorcycle || !selectedImageUri) {
      throw new Error("Foto gallery belum siap untuk di-upload.");
    }

    const path = createStorageImagePath({
      userId: user.id,
      folder: "gallery",
      ownerId: motorcycle.id,
    });

    return uploadImageToStorage({
      uri: selectedImageUri,
      path,
    });
  }

  async function saveGalleryOnly() {
    if (!motorcycle) {
      return;
    }

    if (!user) {
      Alert.alert("Sesi tidak aktif", "Silakan masuk kembali.");
      router.replace("/(auth)/login");
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImageUrl = await uploadSelectedGalleryImage();

      await createMotorcycleGalleryItem({
        motorcycleId: motorcycle.id,
        userId: user.id,
        imageUrl: uploadedImageUrl,
        caption: galleryCaption.trim() || null,
      });

      Alert.alert(
        "Gallery tersimpan",
        `Foto berhasil ditambahkan ke Gallery ${motorcycle.brand} ${motorcycle.model}.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan gallery.";

      Alert.alert("Gagal menyimpan gallery", message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveGalleryAndPost() {
    if (!motorcycle) {
      return;
    }

    if (!user) {
      Alert.alert("Sesi tidak aktif", "Silakan masuk kembali.");
      router.replace("/(auth)/login");
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImageUrl = await uploadSelectedGalleryImage();

      await createMotorcycleGalleryItem({
        motorcycleId: motorcycle.id,
        userId: user.id,
        imageUrl: uploadedImageUrl,
        caption: galleryCaption.trim() || null,
      });

      await createPostWithMedia({
        userId: user.id,
        motorcycleId: motorcycle.id,
        caption: postCaption.trim(),
        visibility: "public",
        mediaUrls: [uploadedImageUrl],
      });

      Alert.alert(
        "Gallery dan Post tersimpan",
        `Foto berhasil ditambahkan ke Gallery ${motorcycle.brand} ${motorcycle.model} dan dibagikan ke Feed.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan gallery dan post.";

      Alert.alert("Gagal menyimpan", message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMotorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat motor terkait...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (motorcycleError || !motorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Motor belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {motorcycleError ??
              "Pilih motor terlebih dahulu sebelum menambahkan gallery."}
          </AppText>
          <AppButton
            onPress={() =>
              router.replace("/(create)/select-motorcycle-for-gallery")
            }
          >
            Pilih Motor
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const motorcycleName = `${motorcycle.brand} ${motorcycle.model}`;
  const motorcycleEngineInfo =
    motorcycle.engine_info ??
    (motorcycle.engine_cc ? `${motorcycle.engine_cc} cc` : "Mesin belum diisi");

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
          {motorcycleName}
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.contextMeta}>
          {motorcycle.year} · {motorcycleEngineInfo}
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
            selectedImageUri={selectedImageUri}
            galleryCaption={galleryCaption}
            onPickMedia={handlePickMedia}
            onChangeGalleryCaption={setGalleryCaption}
          />
        ) : null}

        {isShareStep ? (
          <ShareDecisionStep
            motorcycleName={motorcycleName}
            selectedChoice={shareChoice}
            onSelectChoice={setShareChoice}
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
          loading={submitting}
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
  selectedImageUri,
  galleryCaption,
  onPickMedia,
  onChangeGalleryCaption,
}: {
  selectedImageUri: string | null;
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
        title={selectedImageUri ? "Foto sudah dipilih" : "Tambah foto gallery"}
        description={
          selectedImageUri
            ? "Foto siap di-upload ke Gallery motor."
            : "Pilih satu foto terbaik untuk galeri motor ini."
        }
        imageUri={selectedImageUri}
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
  selectedChoice,
  onSelectChoice,
}: {
  motorcycleName: string;
  selectedChoice: ShareChoice | null;
  onSelectChoice: (choice: ShareChoice) => void;
}) {
  const isGalleryOnlySelected = selectedChoice === "gallery_only";
  const isShareToFeedSelected = selectedChoice === "share_to_feed";

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
            Pilih tempat publikasi foto ini, lalu tekan Confirm.
          </AppText>
        </View>
      </View>

      <Pressable
        onPress={() => onSelectChoice("gallery_only")}
        style={({ pressed }) => [
          styles.shareOptionCard,
          isGalleryOnlySelected && styles.shareOptionCardSelected,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.shareOptionTopRow}>
          <View style={styles.shareOptionTextWrap}>
            <AppText variant="bodyMedium">Simpan sebagai Gallery saja</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.shareOptionText}
            >
              Foto hanya muncul di Motorcycle Detail &gt; Gallery.
            </AppText>
          </View>

          <View
            style={[
              styles.choiceIndicator,
              isGalleryOnlySelected && styles.choiceIndicatorSelected,
            ]}
          />
        </View>
      </Pressable>

      <Pressable
        onPress={() => onSelectChoice("share_to_feed")}
        style={({ pressed }) => [
          styles.shareOptionCard,
          isShareToFeedSelected && styles.shareOptionCardSelected,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.shareOptionTopRow}>
          <View style={styles.shareOptionTextWrap}>
            <AppText variant="bodyMedium">Bagikan juga ke Feed</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.shareOptionText}
            >
              Buat Post baru yang terhubung ke {motorcycleName}.
            </AppText>
          </View>

          <View
            style={[
              styles.choiceIndicator,
              isShareToFeedSelected && styles.choiceIndicatorSelected,
            ]}
          />
        </View>
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
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  shareOptionCardSelected: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  shareOptionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  shareOptionTextWrap: {
    flex: 1,
  },
  shareOptionText: {
    marginTop: spacing.xs,
  },
  choiceIndicator: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceSoft,
  },
  choiceIndicatorSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
