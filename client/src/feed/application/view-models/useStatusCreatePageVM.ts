// English description: Manages media selection, responsive preview metadata, and story submission for the create-story page.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import {
  feedStoryAcceptedImageMimeTypes,
  feedStoryAcceptedMimeTypes,
  feedStoryAcceptedVideoExtensions,
  feedStoryAcceptedVideoMimeTypes,
  feedStoryCreateRedirectDelay,
  feedStoryImageMimePrefix,
  feedStoryVideoMimePrefix,
} from "../constants/story-carousel"
import type { FeedStoryRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import type { ContentAudience } from "../../../shared-kernel/domain/content-audience"

type MediaType = "image" | "video" | null
type MediaOrientation = "portrait" | "landscape" | "square" | null

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
  const mediaOrientation = ref<MediaOrientation>(null)
  const pickerAccept = ref(feedStoryAcceptedMimeTypes)
  const title = ref("")
  const caption = ref("")
  const privacy = ref<ContentAudience>("followers")
  const submitting = ref(false)
  const submitStatus = ref<"idle" | "submitting" | "error">("idle")
  const statusDescription = ref("")

  const revokePreview = () => {
    if (!previewUrl.value) {
      return
    }

    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ""
  }

  const getFileExtension = (file: File) =>
    file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ""

  const isImageFile = (file: File) =>
    file.type.startsWith(feedStoryImageMimePrefix)

  const isVideoFile = (file: File) =>
    file.type.startsWith(feedStoryVideoMimePrefix)
    || feedStoryAcceptedVideoExtensions.includes(getFileExtension(file) as typeof feedStoryAcceptedVideoExtensions[number])

  const updateMediaOrientation = (width: number, height: number) => {
    if (!width || !height) {
      mediaOrientation.value = null
      return
    }

    const aspectRatio = width / height

    mediaOrientation.value = aspectRatio > 1.08
      ? "landscape"
      : aspectRatio < 0.92
        ? "portrait"
        : "square"
  }

  const handleImageLoad = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement
    updateMediaOrientation(image.naturalWidth, image.naturalHeight)
  }

  const handleVideoMetadata = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement
    updateMediaOrientation(video.videoWidth, video.videoHeight)
  }

  const applyFile = (file: File | null) => {
    if (!file) {
      revokePreview()
      selectedFile.value = null
      mediaType.value = null
      mediaOrientation.value = null
      return
    }

    if (!isImageFile(file) && !isVideoFile(file)) {
      return
    }

    revokePreview()
    selectedFile.value = file
    mediaType.value = isVideoFile(file) ? "video" : "image"
    mediaOrientation.value = null
    previewUrl.value = URL.createObjectURL(file)
  }

  const openPicker = async (requestedType?: Exclude<MediaType, null>) => {
    pickerAccept.value = requestedType === "image"
      ? feedStoryAcceptedImageMimeTypes
      : requestedType === "video"
        ? feedStoryAcceptedVideoMimeTypes
        : feedStoryAcceptedMimeTypes

    await nextTick()
    fileInputRef.value?.click()
  }

  const handleFileSelection = (event: Event) => {
    const input = event.target as HTMLInputElement
    applyFile(input.files?.[0] ?? null)
    input.value = ""
  }

  const removeFile = () => {
    applyFile(null)
    submitStatus.value = "idle"
    statusDescription.value = ""
  }

  onMounted(async () => {
    await currentAuthUserStore.hydrate()
  })

  onUnmounted(revokePreview)

  async function submitStory() {
    if (!selectedFile.value || !mediaType.value || submitting.value) {
      return
    }

    submitting.value = true
    submitStatus.value = "submitting"
    statusDescription.value = t("pages.statusCreatePage.submittingStatus")

    try {
      const response = await repository.createStory({
        file: selectedFile.value,
        fileType: mediaType.value,
        privacy: privacy.value,
        title: title.value.trim() || undefined,
        description: caption.value.trim() || undefined,
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
    mediaOrientation,
    pickerAccept,
    title,
    caption,
    privacy,
    submitting,
    submitStatus,
    statusDescription,
    openPicker,
    handleFileSelection,
    handleImageLoad,
    handleVideoMetadata,
    removeFile,
    submitStory,
    appRoutes,
  }
}
