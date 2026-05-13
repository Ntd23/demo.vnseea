// English description: Owns the feed publisher draft, media pickers, feeling picker, current-user state, and backend post creation flow for the publisher box.

import { useStorage, useTextareaAutosize } from "@vueuse/core"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type PublisherAction = "image" | "video" | "feeling" | "story"
type PublisherAudience = "public" | "connections" | "group"
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
  const draftTextInput = ref("")
  const { triggerResize } = useTextareaAutosize({ element: textareaEl, input: draftTextInput })

  const expanded = ref(false)
  const showFeelingPicker = ref(false)
  const imageFile = ref<File | null>(null)
  const videoFile = ref<File | null>(null)

  const storageKey = `feed-publisher-draft:${route.path || "/"}`
  const draft = useStorage<{
    text: string
    audience: PublisherAudience
    feeling: PublisherFeeling
  }>(
    storageKey,
    {
      text: "",
      audience: "public",
      feeling: "",
    },
    undefined,
    {
      initOnMounted: true,
      mergeDefaults: true,
    },
  )

  watch(
    () => draft.value.text,
    (value) => {
      draftTextInput.value = value
    },
    { immediate: true },
  )

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
    { value: "story" as const, icon: "i-ph-sparkle-bold", label: t("feed.publisherBox.actionStory") },
  ])

  const actions = computed(() => [
    { value: "image" as const, label: t("feed.publisherBox.actionImage"), icon: "i-ph-image-bold" },
    { value: "video" as const, label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera-bold" },
    { value: "feeling" as const, label: t("feed.publisherBox.actionFeeling"), icon: "i-ph-smiley-bold" },
    { value: "story" as const, label: t("feed.publisherBox.actionStory"), icon: "i-ph-sparkle-bold" },
  ])

  const audiences = computed(() => [
    { value: "public" as const, label: t("feed.publisherBox.audiencePublic") },
    { value: "connections" as const, label: t("feed.publisherBox.audienceConnections") },
    { value: "group" as const, label: t("feed.publisherBox.audienceGroup") },
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
    feelingOptions.value.find(option => option.value === draft.value.feeling) ?? null,
  )

  const selectedMediaLabel = computed(() =>
    imageFile.value?.name || videoFile.value?.name || "",
  )
  const selectedMediaType = computed<"image" | "video" | "">(() => {
    if (imageFile.value) {
      return "image"
    }

    if (videoFile.value) {
      return "video"
    }

    return ""
  })

  const canPublish = computed(() =>
    Boolean(
      draft.value.text.trim()
      || imageFile.value
      || videoFile.value
      || draft.value.feeling,
    ),
  )

  onMounted(async () => {
    await currentAuthUserStore.hydrate()
  })

  watch(expanded, async (value) => {
    if (!value) {
      return
    }

    await nextTick()
    triggerResize()
    textareaEl.value?.focus()
  })

  function resetSelectedMedia() {
    imageFile.value = null
    videoFile.value = null

    if (imageInputRef.value) {
      imageInputRef.value.value = ""
    }

    if (videoInputRef.value) {
      videoInputRef.value.value = ""
    }
  }

  function openImagePicker() {
    expanded.value = true
    showFeelingPicker.value = false
    imageInputRef.value?.click()
  }

  function openVideoPicker() {
    expanded.value = true
    showFeelingPicker.value = false
    videoInputRef.value?.click()
  }

  function handleCompactAction(value: PublisherAction) {
    if (value === "story") {
      void router.push(appRoutes.statusCreate)
      return
    }

    if (value === "image") {
      openImagePicker()
      return
    }

    if (value === "video") {
      openVideoPicker()
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
      openImagePicker()
      return
    }

    if (value === "video") {
      openVideoPicker()
      return
    }

    showFeelingPicker.value = !showFeelingPicker.value
  }

  function selectImageFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (!file) {
      return
    }

    videoFile.value = null
    imageFile.value = file
    showFeelingPicker.value = false
  }

  function selectVideoFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (!file) {
      return
    }

    imageFile.value = null
    videoFile.value = file
    showFeelingPicker.value = false
  }

  function clearSelectedMedia() {
    resetSelectedMedia()
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
      statusMessage.value = t("feed.publisherBox.statusErrorDescription")
      return
    }

    submitting.value = true
    statusTone.value = "neutral"
    statusMessage.value = t("feed.publisherBox.statusLoadingDescription")

    try {
      const response = await repository.createPost({
        text: draft.value.text,
        audience: draft.value.audience,
        feeling: draft.value.feeling || undefined,
        imageFile: imageFile.value || undefined,
        videoFile: videoFile.value || undefined,
        pageId,
        eventId,
        groupId,
      })

      statusTone.value = "success"
      statusMessage.value = t("feed.publisherBox.statusSuccessDescription")
      draft.value.text = ""
      draft.value.feeling = ""
      resetSelectedMedia()
      showFeelingPicker.value = false
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
    currentUserInitials,
    compactActions,
    actions,
    audiences,
    feelingOptions,
    activeFeeling,
    selectedMediaLabel,
    selectedMediaType,
    showFeelingPicker,
    canPublish,
    handleCompactAction,
    handleAction,
    selectImageFile,
    selectVideoFile,
    clearSelectedMedia,
    selectFeeling,
    publish,
  }
}
