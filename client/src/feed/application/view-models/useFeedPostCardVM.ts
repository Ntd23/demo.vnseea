// English description: Owns post-card reactions, lightbox state, share actions, and comment submission for a single feed post.

import { useTimeoutFn } from "@vueuse/core"
import {
  defaultFeedReactionAsset,
  feedPostPreviewReactionAssets,
  feedReactionAssetByValue,
  feedReactionAssets,
} from "../constants/reaction-assets"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { defaultFeedStoryReaction } from "../../domain/constants/story-reactions"
import type {
  FeedCommentRecord,
  FeedCommentSubmitPayload,
  FeedPostRecord,
  FeedStoryReactionType,
} from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

export function useFeedPostCardVM(
  post: Ref<FeedPostRecord | null>,
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const requestURL = useRequestURL()
  const toast = useToast()
  const currentAuthUserStore = useCurrentAuthUserStore()

  const showComments = ref(false)
  const showShare = ref(false)
  const liked = ref(false)
  const selectedPostReaction = ref<FeedStoryReactionType | null>(null)
  const postReactionTrayOpen = ref(false)
  const postReactionLongPressTriggered = ref(false)
  const lightboxOpen = ref(false)
  const currentMediaIndex = ref(0)
  const localComments = ref<FeedCommentRecord[]>([])
  const likesCount = ref(0)
  const sharesCount = ref(0)
  const actionState = ref<"idle" | "success" | "error">("idle")
  const actionMessage = ref("")
  const liking = ref(false)
  const commenting = ref(false)
  const reporting = ref(false)

  const postAnchorId = computed(() => post.value ? `feed-post-${post.value.id}` : "feed-post")
  const postReactionOptions = computed(() =>
    feedReactionAssets.map(reaction => ({
      value: reaction.value,
      label: t(reaction.labelKey),
      src: reaction.src,
    })),
  )
  const activePostReactionAsset = computed(() =>
    selectedPostReaction.value
      ? feedReactionAssetByValue[selectedPostReaction.value]
      : defaultFeedReactionAsset,
  )
  const activePostReactionLabel = computed(() => t(activePostReactionAsset.value.labelKey))
  const previewReactions = computed(() =>
    selectedPostReaction.value
      ? [feedReactionAssetByValue[selectedPostReaction.value]]
      : feedPostPreviewReactionAssets,
  )
  const hasReactions = computed(() => likesCount.value > 0)
  const hasPostContent = computed(() =>
    Boolean(post.value?.text.trim() || post.value?.tags.length),
  )
  const mediaItems = computed(() => post.value?.mediaItems ?? [])
  const shareUrl = computed(() =>
    new URL(`${route.path || "/"}#${postAnchorId.value}`, requestURL.origin).toString(),
  )

  watch(
    post,
    (value) => {
      localComments.value = value ? [...value.comments] : []
      likesCount.value = value?.stats.likes ?? 0
      sharesCount.value = value?.stats.shares ?? 0
      liked.value = Boolean(value?.reaction)
      selectedPostReaction.value = value?.reaction ?? null
      postReactionTrayOpen.value = false
      actionState.value = "idle"
      actionMessage.value = ""
      showComments.value = false
      showShare.value = false
      lightboxOpen.value = false
      currentMediaIndex.value = 0
    },
    { deep: true, immediate: true },
  )

  onMounted(async () => {
    await currentAuthUserStore.hydrate()
  })

  const {
    start: startPostReactionLongPressTimer,
    stop: stopPostReactionLongPressTimer,
  } = useTimeoutFn(() => {
    postReactionLongPressTriggered.value = true
    postReactionTrayOpen.value = true
  }, 420, { immediate: false })

  function openPostReactionTray() {
    postReactionTrayOpen.value = true
  }

  function closePostReactionTray() {
    postReactionTrayOpen.value = false
  }

  function startPostReactionPress() {
    if (liking.value) {
      return
    }

    postReactionLongPressTriggered.value = false
    startPostReactionLongPressTimer()
  }

  function finishPostReactionPress() {
    stopPostReactionLongPressTimer()
  }

  function cancelPostReactionPress() {
    stopPostReactionLongPressTimer()
  }

  async function handlePostReactionButtonClick() {
    if (postReactionLongPressTriggered.value) {
      return
    }

    await reactToPost(defaultFeedStoryReaction.value)
  }

  async function toggleLike() {
    await reactToPost(defaultFeedStoryReaction.value)
  }

  async function reactToPost(reaction: FeedStoryReactionType) {
    const currentPost = post.value

    if (liking.value || !currentPost) {
      return
    }

    liking.value = true
    const hadLocalReaction = Boolean(selectedPostReaction.value)

    try {
      await repository.runPostAction({
        action: "reaction",
        postId: currentPost.id,
        reaction,
      })

      if (!hadLocalReaction) {
        likesCount.value += 1
      }

      selectedPostReaction.value = reaction
      liked.value = true
      postReactionTrayOpen.value = false
    }
    catch (error) {
      actionState.value = "error"
      actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
    }
    finally {
      liking.value = false
    }
  }

  function onOpenMedia(index: number) {
    currentMediaIndex.value = index
    lightboxOpen.value = true
  }

  async function submitComment(payload: FeedCommentSubmitPayload) {
    const currentPost = post.value

    if (commenting.value || !currentPost) {
      return
    }

    commenting.value = true

    try {
      const response = await repository.runPostAction({
        action: "comment",
        postId: currentPost.id,
        text: payload.text,
        imageFile: payload.imageFile,
        gifFile: payload.gifFile,
        audioFile: payload.audioFile,
      })

      const comment: FeedCommentRecord = {
        id: response.commentId ?? Date.now(),
        author: currentAuthUserStore.user?.name || t("feed.postCard.commentAuthor"),
        authorAvatarUrl: currentAuthUserStore.user?.avatarUrl || "",
        authorPath: currentAuthUserStore.user?.username ? `/@${currentAuthUserStore.user.username}` : undefined,
        role: currentAuthUserStore.user?.username ? `@${currentAuthUserStore.user.username}` : t("feed.postCard.commentRole"),
        text: payload.text,
        time: t("feed.postCard.justNow"),
        attachment: response.attachment ?? payload.attachmentPreview,
      }

      localComments.value = [...localComments.value, comment]
      showComments.value = true
      actionState.value = "success"
      actionMessage.value = t("feed.postCard.commentAddedMessage")

      toast.add({
        color: "success",
        icon: "i-ph-chat-centered-dots-fill",
        title: currentPost.author,
        description: actionMessage.value,
      })
    }
    catch (error) {
      actionState.value = "error"
      actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
    }
    finally {
      commenting.value = false
    }
  }

  function handleShared() {
    const currentPost = post.value

    if (!currentPost) {
      return
    }

    sharesCount.value += 1
    actionState.value = "success"
    actionMessage.value = t("feed.shareModal.shared")
    showShare.value = false
  }

  async function handleMenuAction(action: string) {
    const currentPost = post.value

    if (!currentPost) {
      return
    }

    if (action === "open" && import.meta.client) {
      window.open(currentPost.sourcePath || shareUrl.value, "_blank", "noopener,noreferrer")
      return
    }

    if (action === "copy") {
      try {
        if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
          throw new Error("clipboard_unavailable")
        }

        await navigator.clipboard.writeText(shareUrl.value)
        actionState.value = "success"
        actionMessage.value = shareUrl.value
      }
      catch {
        actionState.value = "error"
        actionMessage.value = shareUrl.value
      }
    }
    else if (action === "report") {
      if (reporting.value) {
        return
      }

      reporting.value = true

      try {
        await repository.runPostAction({
          action: "report",
          postId: currentPost.id,
        })
        actionState.value = "success"
        actionMessage.value = t("feed.postHeader.menuReportLabel")
      }
      catch (error) {
        actionState.value = "error"
        actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
      }
      finally {
        reporting.value = false
      }
    }

    toast.add({
      color: actionState.value === "error" ? "warning" : "primary",
      icon: actionState.value === "error" ? "i-ph-warning-circle-fill" : "i-ph-check-circle-fill",
      title: currentPost.author,
      description: actionMessage.value,
    })
  }

  function downloadMedia() {
    const currentPost = post.value

    if (!currentPost || !mediaItems.value[currentMediaIndex.value]) {
      return
    }

    actionState.value = "success"
    actionMessage.value = t("feed.postCard.lightboxDownloadMessage")

    toast.add({
      color: "primary",
      icon: "i-ph-download-simple-fill",
      title: currentPost.author,
      description: actionMessage.value,
    })
  }

  return {
    currentAuthUserStore,
    showComments,
    showShare,
    liked,
    selectedPostReaction,
    postReactionTrayOpen,
    lightboxOpen,
    currentMediaIndex,
    localComments,
    likesCount,
    sharesCount,
    actionState,
    actionMessage,
    commenting,
    postAnchorId,
    postReactionOptions,
    activePostReactionAsset,
    activePostReactionLabel,
    previewReactions,
    hasReactions,
    hasPostContent,
    mediaItems,
    shareUrl,
    openPostReactionTray,
    closePostReactionTray,
    startPostReactionPress,
    finishPostReactionPress,
    cancelPostReactionPress,
    handlePostReactionButtonClick,
    toggleLike,
    reactToPost,
    onOpenMedia,
    submitComment,
    handleShared,
    handleMenuAction,
    downloadMedia,
  }
}
