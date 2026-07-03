import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ChevronLeft, ImagePlus, Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import { createPostWithMedia } from "@/src/features/feed/repositories/post.repository";
import { ensureProfileForUser } from "@/src/features/profile/repositories/profile.repository";
import type { MotorcycleRow } from "@/src/shared/types/database.types";
import type { MotorcycleSelectCardData } from "@/src/features/create/components/MotorcycleSelectCard";

import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import { MotorcycleSelectCard } from "@/src/features/create/components/MotorcycleSelectCard";
import {
  createStorageImagePath,
  uploadImageToStorage,
} from "@/src/shared/lib/storage";

type CreatePostStep = "media" | "caption" | "motorcycle" | "summary";
type PostVisibility = "public" | "private";

const maxMediaCount = 10;
function mapMotorcycleToSelectCardData(
  motorcycle: MotorcycleRow,
): MotorcycleSelectCardData {
  return {
    id: motorcycle.id,
    name: motorcycle.name ?? `${motorcycle.brand} ${motorcycle.model}`.trim(),
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    imageUrl: motorcycle.image_url,
    engineInfo:
      motorcycle.engine_info ??
      (motorcycle.engine_cc
        ? `${motorcycle.engine_cc} cc`
        : "Mesin belum diisi"),
  };
}

export function CreatePostScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<CreatePostStep>("media");
  const [selectedMediaUris, setSelectedMediaUris] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<
    string | null
  >(null);
  const [visibility, setVisibility] = useState<PostVisibility>("public");

  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [loadingMotorcycles, setLoadingMotorcycles] = useState(true);
  const [motorcycleError, setMotorcycleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mediaCount = selectedMediaUris.length;

  const selectedMotorcycle = motorcycles.find(
    (motorcycle) => motorcycle.id === selectedMotorcycleId,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadMotorcycles() {
      if (!user) {
        setLoadingMotorcycles(false);
        return;
      }

      try {
        setLoadingMotorcycles(true);
        setMotorcycleError(null);

        const data = await listMotorcyclesByUserId(user.id);

        if (isMounted) {
          setMotorcycles(data);
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
          setLoadingMotorcycles(false);
        }
      }
    }

    loadMotorcycles();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isMediaStep = step === "media";
  const isCaptionStep = step === "caption";
  const isMotorcycleStep = step === "motorcycle";
  const isSummaryStep = step === "summary";

  const isNextDisabled =
    submitting ||
    (isMediaStep && mediaCount === 0) ||
    (isCaptionStep && !caption.trim());

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

  async function uploadSelectedPostMedia() {
    if (!user) {
      throw new Error("Sesi tidak aktif.");
    }

    if (selectedMediaUris.length === 0) {
      throw new Error("Pilih minimal satu foto untuk Post.");
    }

    const uploadedUrls = await Promise.all(
      selectedMediaUris.map((uri) => {
        const path = createStorageImagePath({
          userId: user.id,
          folder: "posts",
        });

        return uploadImageToStorage({
          uri,
          path,
        });
      }),
    );

    return uploadedUrls;
  }

  async function handleCreatePost() {
    if (!user) {
      Alert.alert("Sesi tidak aktif", "Silakan masuk kembali.");
      router.replace("/(auth)/login");
      return;
    }

    try {
      setSubmitting(true);

      await ensureProfileForUser(user);

      const uploadedMediaUrls = await uploadSelectedPostMedia();

      await createPostWithMedia({
        userId: user.id,
        motorcycleId: selectedMotorcycleId,
        caption: caption.trim(),
        visibility,
        mediaUrls: uploadedMediaUrls,
      });

      Alert.alert("Post dibuat", "Post berhasil dibuat dan masuk ke Feed.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/feed"),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat post.";

      Alert.alert("Gagal membuat post", message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin diperlukan",
        "Izinkan akses galeri untuk memilih foto post.",
      );
      return;
    }

    const remainingSlots = maxMediaCount - selectedMediaUris.length;

    if (remainingSlots <= 0) {
      Alert.alert("Batas media tercapai", `Maksimal ${maxMediaCount} foto.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.88,
    });

    if (result.canceled) {
      return;
    }

    const nextUris = result.assets.map((asset) => asset.uri).filter(Boolean);

    if (nextUris.length === 0) {
      Alert.alert("Foto tidak valid", "Pilih foto lain untuk Post.");
      return;
    }

    setSelectedMediaUris((current) =>
      [...current, ...nextUris].slice(0, maxMediaCount),
    );
  }

  function handleRemoveMedia(uri: string) {
    setSelectedMediaUris((current) => current.filter((item) => item !== uri));
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
            selectedMediaUris={selectedMediaUris}
            onPickMedia={handlePickMedia}
            onRemoveMedia={handleRemoveMedia}
          />
        ) : null}

        {isCaptionStep ? (
          <CaptionStep caption={caption} onChangeCaption={setCaption} />
        ) : null}

        {isMotorcycleStep ? (
          <MotorcycleStep
            motorcycles={motorcycles}
            loading={loadingMotorcycles}
            errorMessage={motorcycleError}
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
          loading={submitting}
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
  selectedMediaUris,
  onPickMedia,
  onRemoveMedia,
}: {
  selectedMediaUris: string[];
  onPickMedia: () => void;
  onRemoveMedia: (uri: string) => void;
}) {
  const mediaCount = selectedMediaUris.length;
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

      <Pressable
        style={styles.mediaPickerCard}
        onPress={onPickMedia}
        disabled={isMaxMedia}
      >
        <View style={styles.mediaIconCircle}>
          <ImagePlus size={26} color={theme.primary} />
        </View>

        <AppText variant="bodyMedium" style={styles.mediaTitle}>
          {hasMedia ? `${mediaCount} media dipilih` : "Tambah media"}
        </AppText>

        <AppText variant="caption" tone="secondary" style={styles.mediaText}>
          {isMaxMedia
            ? `Maksimal ${maxMediaCount} foto sudah dipilih.`
            : hasMedia
              ? "Tekan untuk menambahkan foto lagi."
              : "Pilih foto dari perangkat kamu."}
        </AppText>
      </Pressable>

      {hasMedia ? (
        <View style={styles.mediaPreviewGrid}>
          {selectedMediaUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.mediaPreviewItem}>
              <Image
                source={{ uri }}
                style={styles.mediaPreviewImage}
                resizeMode="cover"
              />

              <Pressable
                style={styles.removeMediaButton}
                onPress={() => onRemoveMedia(uri)}
                hitSlop={10}
              >
                <Minus size={16} color={theme.textPrimary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.mediaCountBox}>
        <AppText variant="title">{mediaCount}</AppText>
        <AppText variant="caption" tone="muted">
          / {maxMediaCount}
        </AppText>
      </View>

      <AppText variant="caption" tone="muted" style={styles.note}>
        Foto akan di-upload ke Supabase Storage saat Post dibuat.
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
  motorcycles,
  loading,
  errorMessage,
  selectedMotorcycleId,
  onSelectMotorcycle,
  onSkip,
}: {
  motorcycles: MotorcycleRow[];
  loading: boolean;
  errorMessage: string | null;
  selectedMotorcycleId: string | null;
  onSelectMotorcycle: (id: string | null) => void;
  onSkip: () => void;
}) {
  const motorcycleCards = motorcycles.map(mapMotorcycleToSelectCardData);
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
        {loading ? (
          <AppCard style={styles.inlineStateCard}>
            <AppText variant="bodyMedium">Memuat motor...</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.inlineStateText}
            >
              Motor dari Garage kamu sedang dimuat.
            </AppText>
          </AppCard>
        ) : null}

        {!loading && errorMessage ? (
          <AppCard style={styles.inlineStateCard}>
            <AppText variant="bodyMedium">Motor belum bisa dimuat</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.inlineStateText}
            >
              {errorMessage}
            </AppText>
          </AppCard>
        ) : null}

        {!loading && !errorMessage && motorcycleCards.length === 0 ? (
          <AppCard style={styles.inlineStateCard}>
            <AppText variant="bodyMedium">Belum ada motor</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.inlineStateText}
            >
              Kamu tetap bisa membuat post tanpa menghubungkan motor.
            </AppText>
          </AppCard>
        ) : null}

        {!loading && !errorMessage
          ? motorcycleCards.map((motorcycle) => {
              const isSelected = motorcycle.id === selectedMotorcycleId;

              return (
                <View
                  key={motorcycle.id}
                  style={[isSelected && styles.selectedMotorcycleWrap]}
                >
                  <MotorcycleSelectCard
                    motorcycle={motorcycle}
                    onPress={() =>
                      onSelectMotorcycle(isSelected ? null : motorcycle.id)
                    }
                  />

                  {isSelected ? (
                    <View style={styles.selectedBadge}>
                      <AppText variant="tiny" tone="accent">
                        Tap lagi untuk batal
                      </AppText>
                    </View>
                  ) : null}
                </View>
              );
            })
          : null}
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
  inlineStateCard: {
    alignItems: "flex-start",
  },
  inlineStateText: {
    marginTop: spacing.xs,
  },
  mediaPreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  mediaPreviewItem: {
    width: "31.8%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  mediaPreviewImage: {
    width: "100%",
    height: "100%",
  },
  removeMediaButton: {
    position: "absolute",
    right: spacing.xs,
    top: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.82)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
