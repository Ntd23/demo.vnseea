// English description: Owns the feed publisher draft, current-user state, and backend post creation flow for the publisher box.

import { useStorage, useTextareaAutosize } from "@vueuse/core"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type PublisherAction = "image" | "video" | "feeling" | "story" | ""
type PublisherAudience = "public" | "connections" | "group"

export function useFeedPublisherBoxVM(
  emit: (event: "created", post: FeedPostRecord | null) => void,
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const currentAuthUserStore = useCurrentAuthUserStore()

  const textareaEl = ref<HTMLTextAreaElement | null>(null)
  const draftTextInput = ref("")
  const { triggerResize } = useTextareaAutosize({ element: textareaEl, input: draftTextInput })

  const expanded = ref(false)
  const storageKey = `feed-publisher-draft:${route.path || "/"}`
  const draft = useStorage<{
    text: string
    audience: PublisherAudience
    action: PublisherAction
  }>(
    storageKey,
    {
      text: "",
      audience: "public",
      action: "",
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

  function handleCompactAction(value: string) {
    if (value === "story") {
      void router.push(appRoutes.statusCreate)
      return
    }

    expanded.value = true
    draft.value.action = value as typeof draft.value.action
  }

  async function publish() {
    if (!draft.value.text.trim()) {
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
      })

      statusTone.value = "success"
      statusMessage.value = t("feed.publisherBox.statusSuccessDescription")
      draft.value.text = ""
      draft.value.action = ""
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
    handleCompactAction,
    publish,
  }
}
