// English description: Manages the upload-first story creation flow, preview state, and backend submission for the status create page.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import {
  feedStoryAcceptedMimeTypes,
  feedStoryAcceptedVideoExtensions,
  feedStoryCaptionMaxLength,
  feedStoryCreateRedirectDelay,
  feedStoryImageMimePrefix,
  feedStoryPreviewProgressWidths,
  feedStoryVideoMimePrefix,
} from "../constants/story-carousel"
import type { FeedStoryRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import { type ContentAudience } from "../../../shared-kernel/domain/content-audience"

type MediaType = "image" | "video" | null

export function useStatusCreatePageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()
  const router = useRouter()
  const currentAuthUserStore = useCurrentAuthUserStore()
  const pendingCreatedStory = useState<FeedStoryRecord | null>("feed-pending-created-story", () => null)

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const selectedFile = ref<File | null>(null)
  const previewUrl = ref("")
  const mediaType = ref<MediaType>(null)
  const caption = ref("")
  const privacy = ref<ContentAudience>("followers")

  const captionRef = ref<HTMLInputElement | null>(null)
  const phoneScreenRef = ref<HTMLElement | null>(null)
  const showCaptionEditor = ref(false)
  const isDraggingCaption = ref(false)
  const captionPosition = reactive({
    x: 50,
    y: 78,
  })
  const captionDragOffset = reactive({
    x: 0,
    y: 0,
  })

  const submitting = ref(false)
  const submitStatus = ref<"idle" | "submitting" | "success" | "error">("idle")
  const statusDescription = ref("")

  const currentUserName = computed(() => currentAuthUserStore.user?.name || "")
  const currentUserAvatar = computed(() => currentAuthUserStore.user?.avatarUrl || "")
  const currentUserInitials = computed(() =>
    currentUserName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join("") || t("pages.statusCreatePage.previewInitialsFallback"),
  )

  const previewBarWidth = computed(() =>
    selectedFile.value
      ? feedStoryPreviewProgressWidths.ready
      : feedStoryPreviewProgressWidths.empty,
  )

  const revokePreview = () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ""
    }
  }

  const getFileExtension = (file: File) => {
    const extension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ""
    return extension
  }

  const isImageFile = (file: File) =>
    file.type.startsWith(feedStoryImageMimePrefix)

  const isVideoFile = (file: File) =>
    file.type.startsWith(feedStoryVideoMimePrefix)
    || feedStoryAcceptedVideoExtensions.includes(getFileExtension(file) as typeof feedStoryAcceptedVideoExtensions[number])

  const clampCaptionPosition = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const updateCaptionPosition = (event: PointerEvent) => {
    const bounds = phoneScreenRef.value?.getBoundingClientRect()

    if (!bounds) {
      return
    }

    captionPosition.x = clampCaptionPosition(((event.clientX - captionDragOffset.x - bounds.left) / bounds.width) * 100, 10, 90)
    captionPosition.y = clampCaptionPosition(((event.clientY - captionDragOffset.y - bounds.top) / bounds.height) * 100, 14, 88)
  }

  const applyFile = (file: File | null) => {
    if (!file) {
      revokePreview()
      selectedFile.value = null
      mediaType.value = null
      showCaptionEditor.value = false
      return
    }

    if (!isImageFile(file) && !isVideoFile(file)) {
      return
    }

    revokePreview()
    selectedFile.value = file
    mediaType.value = isVideoFile(file) ? "video" : "image"
    previewUrl.value = URL.createObjectURL(file)
    showCaptionEditor.value = false
  }

  const openPicker = () => fileInputRef.value?.click()

  const handleFileSelection = (event: Event) =>
    applyFile((event.target as HTMLInputElement).files?.[0] ?? null)

  const removeFile = () => {
    applyFile(null)
    caption.value = ""
    captionPosition.x = 50
    captionPosition.y = 78

    if (fileInputRef.value) {
      fileInputRef.value.value = ""
    }
  }

  const openCaptionEditor = async () => {
    if (!selectedFile.value) {
      return
    }

    showCaptionEditor.value = true
    await nextTick()
    captionRef.value?.focus()
  }

  const startCaptionDrag = (event: PointerEvent) => {
    if (!selectedFile.value) {
      return
    }

    const target = event.currentTarget as HTMLElement
    const bounds = target.getBoundingClientRect()

    captionDragOffset.x = event.clientX - (bounds.left + bounds.width / 2)
    captionDragOffset.y = event.clientY - (bounds.top + bounds.height / 2)
    isDraggingCaption.value = true
    target.setPointerCapture(event.pointerId)
  }

  const dragCaption = (event: PointerEvent) => {
    if (!isDraggingCaption.value) {
      return
    }

    updateCaptionPosition(event)
  }

  const stopCaptionDrag = (event?: PointerEvent) => {
    isDraggingCaption.value = false

    if (event?.currentTarget instanceof HTMLElement && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const closeCaptionEditor = () => {
    if (!caption.value.trim()) {
      showCaptionEditor.value = false
    }
  }

  onMounted(async () => {
    await currentAuthUserStore.hydrate()
  })

  onUnmounted(() => {
    revokePreview()
  })

  async function submitStory() {
    if (!selectedFile.value || !mediaType.value || submitting.value) {
      return
    }

    submitting.value = true
    submitStatus.value = "submitting"
    statusDescription.value = t("pages.statusCreatePage.submittingStatus")

    try {
      const normalizedCaption = caption.value.trim()
      const response = await repository.createStory({
        file: selectedFile.value,
        fileType: mediaType.value,
        description: normalizedCaption || undefined,
        privacy: privacy.value,
      })

      pendingCreatedStory.value = response.story
      submitStatus.value = "idle"
      statusDescription.value = ""

      window.setTimeout(() => {
        void router.push(appRoutes.feed)
      }, feedStoryCreateRedirectDelay)
    }
    catch (error) {
      console.error(error)
      pendingCreatedStory.value = null
      submitStatus.value = "error"
      statusDescription.value = t("pages.statusCreatePage.errorStatus")
    }
    finally {
      submitting.value = false
    }
  }

  return {
    fileInputRef,
    selectedFile,
    previewUrl,
    mediaType,
    caption,
    privacy,
    captionRef,
    phoneScreenRef,
    showCaptionEditor,
    captionPosition,
    submitting,
    submitStatus,
    statusDescription,
    currentUserName,
    currentUserAvatar,
    currentUserInitials,
    previewBarWidth,
    openPicker,
    handleFileSelection,
    removeFile,
    openCaptionEditor,
    startCaptionDrag,
    dragCaption,
    stopCaptionDrag,
    closeCaptionEditor,
    submitStory,
    appRoutes,
    feedStoryAcceptedMimeTypes,
    feedStoryCaptionMaxLength,
  }
}
