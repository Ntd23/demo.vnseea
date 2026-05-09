// English description: Coordinates page detail state, follow action, and sharing logic for the community page detail route.

import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"
import { useCommunityPageDetail } from "../composables/useCommunityPageDetail"

type PageActionState = "idle" | "loading" | "success" | "error"

export function useCommunityPageDetailPageVM(
  repository = createApiCommunityRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()
  const translateText = useMaybeTranslatedText()

  const activeTab = ref<"posts" | "about">("posts")
  const followPending = ref(false)
  const sharePending = ref(false)
  const actionState = ref<PageActionState>("idle")
  const actionMessage = ref("")

  const username = computed(() => String(route.params.name || ""))

  const {
    page,
    status,
    error,
    refresh,
    followPage,
    pagePosts,
    categoryLabel,
    followerCountLabel,
    likeCountLabel,
  } = useCommunityPageDetail(username, repository)

  const pageName = computed(() => translateText(page.value?.name || ""))
  const pageSummary = computed(() => translateText(page.value?.summary || ""))
  const isFollowing = computed(() => page.value?.following === true)
  const avatarLabel = computed(() => pageName.value.slice(0, 2).toUpperCase())

  const responseLabel = computed(() => translateText(page.value?.responseLabel || ""))
  const foundedLabel = computed(() => translateText(page.value?.foundedLabel || ""))
  const locationLabel = computed(() => translateText(page.value?.locationLabel || ""))

  const tabs = computed(() => [
    { key: "posts", label: t("pages.pageDetailPage.tabs.posts") },
    { key: "about", label: t("pages.pageDetailPage.tabs.about") },
  ])

  async function handleFollowPage() {
    if (followPending.value || !page.value) return

    followPending.value = true
    actionState.value = "idle"
    actionMessage.value = ""

    try {
      const updatedPage = await followPage()
      actionState.value = "success"
      actionMessage.value = t("pages.pageDetailPage.followSuccessDescription", {
        page: translateText(updatedPage?.name || page.value?.name || ""),
      })
    }
    catch (err) {
      actionState.value = "error"
      actionMessage.value = err instanceof Error
        ? err.message
        : t("pages.pageDetailPage.followErrorDescription")
    }
    finally {
      followPending.value = false
    }
  }

  async function handleSharePage() {
    if (!import.meta.client || sharePending.value) return

    sharePending.value = true
    actionState.value = "idle"
    actionMessage.value = ""

    try {
      const url = window.location.href
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable")
      }

      await navigator.clipboard.writeText(url)
      actionState.value = "success"
      actionMessage.value = t("pages.pageDetailPage.shareSuccessDescription", { url })

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("pages.pageDetailPage.sharedButton"),
        description: url,
      })
    }
    catch {
      actionState.value = "error"
      actionMessage.value = t("pages.pageDetailPage.shareErrorDescription")
    }
    finally {
      sharePending.value = false
    }
  }

  return {
    activeTab,
    followPending,
    sharePending,
    actionState,
    actionMessage,
    page,
    status,
    error,
    pageName,
    pageSummary,
    isFollowing,
    avatarLabel,
    responseLabel,
    foundedLabel,
    locationLabel,
    categoryLabel,
    followerCountLabel,
    likeCountLabel,
    pagePosts,
    tabs,
    handleFollowPage,
    handleSharePage,
    slug,
  }
}
