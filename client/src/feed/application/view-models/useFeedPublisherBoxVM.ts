// English description: Owns the feed publisher draft, media pickers, feeling picker, current-user state, and backend post creation flow for the publisher box.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { useFeedPostColors } from "../composables/useFeedPostColors"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type PublisherAction = "image" | "video" | "poll" | "feeling" | "story" | "colors" | "product"
type PublisherAudience = "public" | "connections" | "group" | "0" | "1" | "2" | "4"
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

  const productForm = ref({
    name: "",
    price: "",
    currency: "₫",
    category: "1",
    location: "",
    type: "0",
    description: "",
    imageFile: null as File | null,
  })

  const { postColorOptions } = useFeedPostColors()

  const storageKey = `feed-publisher-draft:${route.path || "/"}`
  const draft = ref<{
    text: string
    audience: PublisherAudience
    feeling: PublisherFeeling
  }>({
    text: "",
    audience: "0",
    feeling: "",
  })

  const submitting = ref(false)
  const statusMessage = ref("")
  const statusTone = ref<"neutral" | "success" | "warning">("neutral")

  const currentUserName = computed(() => currentAuthUserStore.user?.name || "")
  const currentUserAvatar = computed(() => currentAuthUserStore.user?.avatarUrl || "")
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
    { value: "poll" as const, icon: "i-ph-list-checks-bold", label: t("feed.publisherBox.actionPoll") },
    { value: "story" as const, icon: "i-ph-sparkle-bold", label: t("feed.publisherBox.actionStory") },
  ])

  const actions = computed(() => [
    { value: "image" as const, label: t("feed.publisherBox.actionImage"), icon: "i-ph-image-bold" },
    { value: "video" as const, label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera-bold" },
    { value: "poll" as const, label: t("feed.publisherBox.actionPoll"), icon: "i-ph-list-checks-bold" },
    { value: "feeling" as const, label: t("feed.publisherBox.actionFeeling"), icon: "i-ph-smiley-bold" },
    { value: "product" as const, label: locale.value === "vi" ? "Bán sản phẩm" : "Sell Product", icon: "i-ph-shopping-cart-bold" },
    { value: "colors" as const, label: t("feed.publisherBox.chipColors"), icon: "i-ph-palette-bold" },
    { value: "story" as const, label: t("feed.publisherBox.actionStory"), icon: "i-ph-sparkle-bold" },
  ])

  const audiences = computed(() => [
    { value: "0" as const, label: locale.value === "vi" ? "Công khai" : "Public", icon: "i-ph-globe-bold" },
    { value: "4" as const, label: locale.value === "vi" ? "Ẩn danh" : "Anonymous", icon: "i-ph-ghost-bold" },
    { value: "1" as const, label: locale.value === "vi" ? "Những người tôi theo dõi" : "People I follow", icon: "i-ph-users-bold" },
    { value: "2" as const, label: locale.value === "vi" ? "Mọi người theo dõi tôi" : "People following me", icon: "i-ph-users-three-bold" },
  ])

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
    if (showProductForm.value) {
      return Boolean(
        productForm.value.name.trim() &&
        productForm.value.price.trim() &&
        productForm.value.category &&
        productForm.value.description.trim() &&
        productForm.value.imageFile
      )
    }

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
      || draft.value?.feeling,
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
            
            // Map legacy string keys to new privacy numeric codes
            let aud = parsed.audience || "0"
            if (aud === "public") aud = "0"
            else if (aud === "connections") aud = "1"
            else if (aud === "group") aud = "2"
            draft.value.audience = aud as any
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

  watch(expanded, async (value) => {
    console.log("[useFeedPublisherBoxVM] watch(expanded) triggered! New value is:", value)
    if (!value) {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
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
    
    imageInputRef.value?.click()
    expanded.value = true
  }

  function openVideoPicker() {
    showFeelingPicker.value = false
    showPollForm.value = false
    showColorsPicker.value = false
    showProductForm.value = false
    
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
      showPollForm.value = !showPollForm.value
      return
    }

    if (value === "feeling") {
      showFeelingPicker.value = !showFeelingPicker.value
      showColorsPicker.value = false
      showProductForm.value = false
      showPollForm.value = false
      return
    }

    if (value === "colors") {
      showColorsPicker.value = !showColorsPicker.value
      showFeelingPicker.value = false
      showProductForm.value = false
      showPollForm.value = false
      expanded.value = true
      return
    }

    if (value === "product") {
      showProductForm.value = !showProductForm.value
      showFeelingPicker.value = false
      showColorsPicker.value = false
      showPollForm.value = false
      expanded.value = true
      return
    }
  }

  function selectImageFile(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? [])

    if (!files.length) {
      return
    }

    videoFile.value = null
    imageFiles.value = files
    showFeelingPicker.value = false
  }

  function selectVideoFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (!file) {
      return
    }

    imageFiles.value = []
    videoFile.value = file
    showFeelingPicker.value = false
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

  async function publish() {
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
      if (showProductForm.value) {
        // Submit product listing
        const response = await repository.createProduct({
          name: productForm.value.name,
          price: productForm.value.price,
          category: productForm.value.category,
          description: productForm.value.description,
          location: productForm.value.location,
          type: productForm.value.type,
          imageFile: productForm.value.imageFile!,
        })
        
        statusTone.value = "neutral"
        statusMessage.value = ""
        
        // Reset product form
        productForm.value = {
          name: "",
          price: "",
          currency: "₫",
          category: "1",
          location: "",
          type: "0",
          description: "",
          imageFile: null,
        }
        showProductForm.value = false
        expanded.value = false
        
        toast.add({
          color: "success",
          icon: "i-ph-check-circle-fill",
          title: locale.value === "vi" ? "Đăng sản phẩm thành công" : "Product listed successfully",
          description: locale.value === "vi" ? "Sản phẩm của bạn đã được đăng lên dòng thời gian." : "Your product has been shared on your timeline.",
        })
      } else {
        const response = await repository.createPost({
          text: draft.value?.text || "",
          audience: draft.value?.audience || "public",
          feeling: draft.value?.feeling || undefined,
          imageFiles: imageFiles.value.length ? imageFiles.value : undefined,
          videoFile: videoFile.value || undefined,
          pageId,
          eventId,
          groupId,
          colorId: selectedColorId.value || undefined,
          pollAnswers: showPollForm.value
            ? pollAnswers.value.map(answer => answer.trim()).filter(Boolean)
            : undefined,
        })

        statusTone.value = "neutral"
        statusMessage.value = ""
        if (draft.value) {
          draft.value.text = ""
          draft.value.feeling = ""
        }
        selectedColorId.value = null
        showColorsPicker.value = false
        resetSelectedMedia()
        showFeelingPicker.value = false
        showPollForm.value = false
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
    currentUserInitials,
    compactActions,
    actions,
    audiences,
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
    productForm,
    imageFiles,
    videoFile,
  }
}
