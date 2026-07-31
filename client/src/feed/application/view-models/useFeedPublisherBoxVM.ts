// English description: Owns feed publisher draft content, media, location, current-user state, and backend post creation.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { useFeedPostColors } from "../composables/useFeedPostColors"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import { normalizeContentAudienceSelection, type ContentAudience } from "../../../shared-kernel/domain/content-audience"
import {
  emptyLocationSelection,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../../location/domain/types/location.types"
import {
  validateFeedImages,
  validateFeedVideo,
  type UploadValidationResult,
} from "../../../shared-kernel/application/utils/uploadValidation"

type PublisherAction = "image" | "video" | "poll" | "job" | "feeling" | "story" | "colors" | "product" | "location"
type PublisherAudience = ContentAudience
type PublisherFeeling = "happy" | "loved" | "sad" | "angry" | "funny" | "cool" | "tired" | "confused" | ""

export function useFeedPublisherBoxVM(
  emit: (event: "created", post: FeedPostRecord | null) => void,
  pageId?: number,
  eventId?: number,
  groupId?: number,
  repository = createApiFeedRepository(),
) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const currentAuthUserStore = useCurrentAuthUserStore()

  const textareaEl = ref<HTMLTextAreaElement | null>(null)
  const imageInputRef = ref<HTMLInputElement | null>(null)
  const videoInputRef = ref<HTMLInputElement | null>(null)

  const expanded = ref(false)
  const showFeelingPicker = ref(false)
  const showPollForm = ref(false)
  const pollAnswers = ref<string[]>(["", ""])
  const imageFiles = ref<File[]>([])
  const videoFile = ref<File | null>(null)

  const selectedColorId = ref<number | null>(null)
  const showColorsPicker = ref(false)
  const showProductForm = ref(false)
  const showLocationForm = ref(false)

  const { postColorOptions } = useFeedPostColors()

  const storageKey = `feed-publisher-draft:${route.path || "/"}`
  const draft = ref<{
    text: string
    audience: PublisherAudience
    isAnonymous: boolean
    feeling: PublisherFeeling
    location: LocationSelection
  }>({
    text: "",
    audience: "public",
    isAnonymous: false,
    feeling: "",
    location: emptyLocationSelection(),
  })

  const submitting = ref(false)
  const statusMessage = ref("")
  const statusTone = ref<"neutral" | "success" | "warning">("neutral")

  function getUploadValidationMessage(result: UploadValidationResult) {
    if (result.valid) {
      return ""
    }

    if (result.code === "too-large") {
      return t("uploadValidation.tooLarge", {
        name: result.fileName,
        maxSize: result.maxSizeLabel,
      })
    }

    if (result.code === "too-many-files") {
      return t("uploadValidation.tooManyFiles", {
        maxFiles: result.maxFiles,
      })
    }

    if (result.code === "empty-file") {
      return t("uploadValidation.emptyFile", {
        name: result.fileName,
      })
    }

    return t("uploadValidation.unsupportedType", {
      name: result.fileName,
    })
  }

  function showUploadValidationError(result: UploadValidationResult) {
    statusTone.value = "warning"
    statusMessage.value = getUploadValidationMessage(result)
    expanded.value = true
  }

  const currentUserName = computed(() => currentAuthUserStore.user?.name || "")
  const currentUserAvatar = computed(() => currentAuthUserStore.user?.avatarUrl || "")
  const currentUserProfilePath = computed(() => {
    const username = currentAuthUserStore.user?.username?.trim().replace(/^@+/, "") || ""
    return username ? appRoutes.profile(username) : ""
  })
  const currentUserInitials = computed(() =>
    currentUserName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join(""),
  )

  const compactActions = computed(() => [
    { value: "image" as const, icon: "i-ph-image-bold", label: t("feed.publisherBox.actionImage") },
    { value: "video" as const, icon: "i-ph-video-camera-bold", label: t("feed.publisherBox.actionVideo") },
    { value: "product" as const, icon: "i-ph-shopping-cart-bold", label: locale.value === "vi" ? "Bán sản phẩm" : "Sell Product", },
    { value: "job" as const, icon: "i-ph-briefcase-bold", label: t("feed.publisherBox.actionJob") },
  ])

  const actions = computed(() => [
    { value: "image" as const, label: t("feed.publisherBox.actionImage"), icon: "i-ph-image-bold" },
    { value: "video" as const, label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera-bold" },
    { value: "product" as const, label: locale.value === "vi" ? "Bán sản phẩm" : "Sell Product", icon: "i-ph-shopping-cart-bold" },
    { value: "job" as const, label: t("feed.publisherBox.actionJob"), icon: "i-ph-briefcase-bold" },
  ])

  const audiences = computed(() => {
    if (groupId || eventId) return []
    const options = [
      { value: "public" as const, label: locale.value === "vi" ? "Công khai" : "Public", icon: "i-ph-globe-bold" },
      { value: "friends" as const, label: locale.value === "vi" ? "Bạn bè" : "Friends", icon: "i-ph-users-bold" },
      { value: "followers" as const, label: locale.value === "vi" ? "Người theo dõi" : "Followers", icon: "i-ph-users-three-bold" },
      { value: "only_me" as const, label: locale.value === "vi" ? "Chỉ mình tôi" : "Only me", icon: "i-ph-lock-simple-bold" },
    ]
    return pageId ? options.filter(option => option.value === "public" || option.value === "followers") : options
  })
  const isPersonalComposer = computed(() => !pageId && !eventId && !groupId)

  const feelingOptions = computed(() => [
    { value: "happy" as const, emoji: "😊", label: locale.value === "vi" ? "Vui mừng" : "Happy" },
    { value: "loved" as const, emoji: "😍", label: locale.value === "vi" ? "Được yêu" : "Loved" },
    { value: "funny" as const, emoji: "😄", label: locale.value === "vi" ? "Vui nhộn" : "Funny" },
    { value: "cool" as const, emoji: "😎", label: locale.value === "vi" ? "Tuyệt" : "Cool" },
    { value: "sad" as const, emoji: "😢", label: locale.value === "vi" ? "Buồn" : "Sad" },
    { value: "angry" as const, emoji: "😡", label: locale.value === "vi" ? "Tức giận" : "Angry" },
    { value: "tired" as const, emoji: "😫", label: locale.value === "vi" ? "Mệt mỏi" : "Tired" },
    { value: "confused" as const, emoji: "😕", label: locale.value === "vi" ? "Bối rối" : "Confused" },
  ])

  const activeFeeling = computed(() =>
    feelingOptions.value.find(option => option.value === draft.value?.feeling) ?? null,
  )

  const selectedMediaLabel = computed(() =>
    imageFiles.value.length > 1
      ? `${imageFiles.value.length} ${locale.value === "vi" ? "ảnh" : "photos"}`
      : imageFiles.value[0]?.name || videoFile.value?.name || "",
  )
  const selectedMediaType = computed<"image" | "video" | "">(() => {
    if (imageFiles.value.length > 0) {
      return "image"
    }

    if (videoFile.value) {
      return "video"
    }

    return ""
  })

  const canPublish = computed(() => {
    if (showPollForm.value) {
      return Boolean(
        draft.value?.text?.trim()
        && pollAnswers.value.filter(answer => answer.trim()).length >= 2,
      )
    }

    return Boolean(
      draft.value?.text?.trim()
      || imageFiles.value.length > 0
      || videoFile.value
      || draft.value?.feeling
      || draft.value?.location.address.trim(),
    )
  })

  onMounted(async () => {
    await currentAuthUserStore.hydrate()
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed === "object") {
            draft.value.text = parsed.text || ""
            draft.value.feeling = parsed.feeling || ""
            draft.value.location = normalizeLocationSelection(parsed.location)
            
            const selection = normalizeContentAudienceSelection(parsed.audience)
            draft.value.audience = selection.audience
            draft.value.isAnonymous = Boolean(parsed.isAnonymous) || selection.isAnonymous
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load publisher box draft from localStorage:", e)
    }
  })

  watch(
    draft,
    (newVal) => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(newVal))
        }
      } catch (e) {
        // ignore quota errors
      }
    },
    { deep: true }
  )

  watch(
    () => draft.value.isAnonymous,
    (isAnonymous) => {
      if (isAnonymous) {
        draft.value.audience = "public"
      }
    },
  )

  watch(expanded, async (value) => {
    console.log("[useFeedPublisherBoxVM] watch(expanded) triggered! New value is:", value)
    if (!value) {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      showLocationForm.value = false
      return
    }

    await nextTick()
    textareaEl.value?.focus()
  })

  function resetSelectedMedia() {
    imageFiles.value = []
    videoFile.value = null

    if (imageInputRef.value) {
      imageInputRef.value.value = ""
    }

    if (videoInputRef.value) {
      videoInputRef.value.value = ""
    }
  }

  function openImagePicker() {
    showFeelingPicker.value = false
    showPollForm.value = false
    showColorsPicker.value = false
    showProductForm.value = false
    showLocationForm.value = false
    
    imageInputRef.value?.click()
    expanded.value = true
  }

  function openVideoPicker() {
    showFeelingPicker.value = false
    showPollForm.value = false
    showColorsPicker.value = false
    showProductForm.value = false
    showLocationForm.value = false
    
    videoInputRef.value?.click()
    expanded.value = true
  }

  function handleCompactAction(value: PublisherAction) {
    if (value === "story") {
      void router.push(appRoutes.statusCreate)
      return
    }

    if (value === "image") {
      void openImagePicker()
      return
    }

    if (value === "video") {
      void openVideoPicker()
      return
    }

    if (value === "poll") {
      showPollForm.value = true
      expanded.value = true
      return
    }

    if (value === "job") {
      return
    }

    if (value === "location") {
      showLocationForm.value = true
      expanded.value = true
      return
    }

    if (value === "product") {
      showProductForm.value = true
      showFeelingPicker.value = false
      showColorsPicker.value = false
      showPollForm.value = false
      expanded.value = true
      return
    }

    expanded.value = true
  }

  function handleAction(value: PublisherAction) {
    if (value === "story") {
      void router.push(appRoutes.statusCreate)
      return
    }

    if (value === "image") {
      void openImagePicker()
      return
    }

    if (value === "video") {
      void openVideoPicker()
      return
    }

    if (value === "poll") {
      showFeelingPicker.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      showLocationForm.value = false
      showPollForm.value = !showPollForm.value
      return
    }

    if (value === "job") {
      return
    }

    if (value === "location") {
      showLocationForm.value = !showLocationForm.value
      showFeelingPicker.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      showPollForm.value = false
      expanded.value = true
      return
    }

    if (value === "feeling") {
      showFeelingPicker.value = !showFeelingPicker.value
      showColorsPicker.value = false
      showProductForm.value = false
      showPollForm.value = false
      showLocationForm.value = false
      return
    }

    if (value === "colors") {
      showColorsPicker.value = !showColorsPicker.value
      showFeelingPicker.value = false
      showProductForm.value = false
      showPollForm.value = false
      showLocationForm.value = false
      expanded.value = true
      return
    }

    if (value === "product") {
      showProductForm.value = !showProductForm.value
      showFeelingPicker.value = false
      showColorsPicker.value = false
      showPollForm.value = false
      showLocationForm.value = false
      expanded.value = true
      return
    }
  }

  function selectImageFile(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files ?? [])

    if (!files.length) {
      return
    }

    const validation = validateFeedImages(files)
    input.value = ""

    if (!validation.valid) {
      showUploadValidationError(validation)
      return
    }

    videoFile.value = null
    imageFiles.value = files
    showFeelingPicker.value = false
    statusMessage.value = ""
  }

  function selectVideoFile(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      return
    }

    const validation = validateFeedVideo(file)
    input.value = ""

    if (!validation.valid) {
      showUploadValidationError(validation)
      return
    }

    imageFiles.value = []
    videoFile.value = file
    showFeelingPicker.value = false
    statusMessage.value = ""
  }

  function clearSelectedMedia() {
    resetSelectedMedia()
  }

  function addPollAnswer() {
    if (pollAnswers.value.length < 10) {
      pollAnswers.value.push("")
    }
  }

  function removePollAnswer(index: number) {
    if (pollAnswers.value.length > 2) {
      pollAnswers.value.splice(index, 1)
    }
  }

  function selectFeeling(value: PublisherFeeling) {
    draft.value.feeling = draft.value.feeling === value ? "" : value
    showFeelingPicker.value = false
    expanded.value = true

    nextTick(() => {
      textareaEl.value?.focus()
    })
  }

  async function publish(input?: { text?: string }) {
    const mediaValidation = imageFiles.value.length
      ? validateFeedImages(imageFiles.value)
      : videoFile.value
        ? validateFeedVideo(videoFile.value)
        : { valid: true as const }

    if (!mediaValidation.valid) {
      showUploadValidationError(mediaValidation)
      return
    }

    if (!canPublish.value) {
      statusTone.value = "warning"
      statusMessage.value = showPollForm.value
        ? t("feed.publisherBox.pollValidationError")
        : t("feed.publisherBox.statusErrorDescription")
      return
    }

    submitting.value = true
    statusTone.value = "neutral"
    statusMessage.value = ""

    try {
      const response = await repository.createPost({
        text: input?.text ?? draft.value?.text ?? "",
        audience: groupId ? undefined : draft.value?.audience || "public",
        isAnonymous: isPersonalComposer.value && draft.value?.isAnonymous,
        feeling: draft.value?.feeling || undefined,
        imageFiles: imageFiles.value.length ? imageFiles.value : undefined,
        videoFile: videoFile.value || undefined,
        pageId,
        eventId,
        groupId,
        colorId: selectedColorId.value || undefined,
        location: draft.value.location.address.trim()
          ? normalizeLocationSelection(draft.value.location)
          : undefined,
        pollAnswers: showPollForm.value
          ? pollAnswers.value.map(answer => answer.trim()).filter(Boolean)
          : undefined,
      })

      statusTone.value = "neutral"
      statusMessage.value = ""
      if (draft.value) {
        draft.value.text = ""
        draft.value.feeling = ""
        draft.value.isAnonymous = false
        draft.value.location = emptyLocationSelection()
      }
      selectedColorId.value = null
      showColorsPicker.value = false
      resetSelectedMedia()
      showFeelingPicker.value = false
      showPollForm.value = false
      showLocationForm.value = false
      pollAnswers.value = ["", ""]
      expanded.value = false
      emit("created", response.post)

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("feed.publisherBox.statusSuccessTitle"),
        description: t("feed.publisherBox.statusSuccessDescription"),
      })
    }
    catch (error) {
      statusTone.value = "warning"
      statusMessage.value = error instanceof Error
        ? error.message
        : t("feed.publisherBox.statusErrorDescription")
    }
    finally {
      submitting.value = false
    }
  }

  return {
    textareaEl,
    imageInputRef,
    videoInputRef,
    expanded,
    draft,
    submitting,
    statusMessage,
    statusTone,
    currentUserName,
    currentUserAvatar,
    currentUserProfilePath,
    currentUserInitials,
    compactActions,
    actions,
    audiences,
    isPersonalComposer,
    feelingOptions,
    activeFeeling,
    selectedMediaLabel,
    selectedMediaType,
    showFeelingPicker,
    showPollForm,
    pollAnswers,
    canPublish,
    handleCompactAction,
    handleAction,
    selectImageFile,
    selectVideoFile,
    clearSelectedMedia,
    selectFeeling,
    addPollAnswer,
    removePollAnswer,
    publish,
    selectedColorId,
    showColorsPicker,
    postColorOptions,
    showProductForm,
    showLocationForm,
    imageFiles,
    videoFile,
  }
}
