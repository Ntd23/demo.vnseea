<template>
  <div v-if="page" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityPageHeroBanner
      :page="page"
      :category-label="categoryLabel"
      :follower-count-label="followerCountLabel"
      :like-count-label="likeCountLabel"
      :follow-state="followState"
      :share-state="shareState"
      :is-following="isFollowing"
      @follow="handleFollowPage"
      @share="handleSharePage"
    />

    <CommunityGroupTabsBar
      v-model="activeTab"
      :aria-label="t('pages.pageDetailPage.tabsAriaLabel')"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.24fr)_320px]">
      <section class="min-w-0 space-y-4">
        <template v-if="activeTab === 'posts'">
          <CommunityPageFeedSection
            :page="page"
            :posts="pagePosts"
          />
        </template>

        <template v-else>
          <CommunityPageAboutCard
            :page="page"
            :category-label="categoryLabel"
            :follower-count-label="followerCountLabel"
            :like-count-label="likeCountLabel"
          />
        </template>
      </section>

      <aside class="space-y-4">
        <CommunityPageActionCard
          :page="page"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
          :follow-state="followState"
          :message-state="messageState"
          :is-following="isFollowing"
          @follow="handleFollowPage"
          @message="handleMessagePage"
        />

        <CommunityPageAboutCard
          :page="page"
          :category-label="categoryLabel"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
          compact
        />
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-megaphone-simple-fill"
        :title="t('pages.pageDetailPage.emptyTitle')"
        :description="t('pages.pageDetailPage.emptyDescription')"
      />

      <div class="mt-6 flex justify-center">
        <UButton
          to="/create-page"
          color="primary"
          variant="solid"
          size="xl"
          class="rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
        >
          {{ t("pages.pageDetailPage.createNewPage") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
type CommunityDetailTab = "posts" | "about"
type CommunityActionState = "idle" | "loading" | "success" | "error"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeDetailTab(value: string): CommunityDetailTab {
  return value === "about" ? "about" : "posts"
}

const props = defineProps<{
  pageSlug?: string
}>()

const route = useRoute()
const router = useRouter()
const requestURL = useRequestURL()
const { t } = useI18n()
const toast = useToast()
const translateText = useMaybeTranslatedText()
const activeTab = ref<CommunityDetailTab>(normalizeDetailTab(readQueryValue(route.query.tab)))
const followState = ref<CommunityActionState>("idle")
const shareState = ref<CommunityActionState>("idle")
const messageState = ref<CommunityActionState>("idle")
const isFollowing = ref(false)

const resolvedSlug = computed(() =>
  props.pageSlug || String(route.params.name || ""),
)

const {
  page,
  categoryLabel,
  followerCountLabel,
  likeCountLabel,
  pagePosts,
} = useCommunityPageDetail(resolvedSlug, computed(() => route.query))

const localizedPageName = computed(() =>
  page.value ? translateText(page.value.name) : t("pages.pageDetailPage.seoFallbackTitle"),
)

const shareUrl = computed(() =>
  new URL(route.path || `/p/${resolvedSlug.value}`, requestURL.origin).toString(),
)

watch(() => route.query.tab, (value) => {
  const normalizedTab = normalizeDetailTab(readQueryValue(value))
  if (normalizedTab !== activeTab.value) {
    activeTab.value = normalizedTab
  }
})

watch(activeTab, (value) => {
  const currentTab = readQueryValue(route.query.tab)
  const nextTab = value === "posts" ? "" : value

  if (currentTab === nextTab) return

  const nextQuery = { ...route.query }

  if (value === "posts") {
    delete nextQuery.tab
  }
  else {
    nextQuery.tab = value
  }

  router.replace({ query: nextQuery })
})

watch(() => [
  route.path,
  readQueryValue(route.query.name),
  readQueryValue(route.query.description),
  readQueryValue(route.query.category),
], () => {
  followState.value = "idle"
  shareState.value = "idle"
  messageState.value = "idle"
  isFollowing.value = false
})

async function handleFollowPage() {
  if (!page.value || followState.value === "loading" || isFollowing.value) return

  followState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 480))

    followState.value = "success"
    isFollowing.value = true

    toast.add({
      title: t("pages.pageDetailPage.followSuccessTitle"),
      description: t("pages.pageDetailPage.followSuccessDescription", {
        page: localizedPageName.value,
      }),
      color: "success",
    })
  }
  catch {
    followState.value = "error"

    toast.add({
      title: t("pages.pageDetailPage.followErrorTitle"),
      description: t("pages.pageDetailPage.followErrorDescription"),
      color: "error",
    })
  }
}

async function handleSharePage() {
  if (shareState.value === "loading") return

  shareState.value = "loading"

  try {
    if (import.meta.client && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
    }
    else {
      await new Promise(resolve => setTimeout(resolve, 180))
    }

    shareState.value = "success"

    toast.add({
      title: t("pages.pageDetailPage.shareSuccessTitle"),
      description: t("pages.pageDetailPage.shareSuccessDescription", {
        url: shareUrl.value,
      }),
      color: "success",
    })
  }
  catch {
    shareState.value = "error"

    toast.add({
      title: t("pages.pageDetailPage.shareErrorTitle"),
      description: t("pages.pageDetailPage.shareErrorDescription"),
      color: "error",
    })
  }
}

async function handleMessagePage() {
  if (!page.value || messageState.value === "loading") return

  messageState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 360))

    messageState.value = "success"

    toast.add({
      title: t("pages.pageDetailPage.messageSuccessTitle"),
      description: t("pages.pageDetailPage.messageSuccessDescription", {
        page: localizedPageName.value,
      }),
      color: "success",
    })
  }
  catch {
    messageState.value = "error"

    toast.add({
      title: t("pages.pageDetailPage.messageErrorTitle"),
      description: t("pages.pageDetailPage.messageErrorDescription"),
      color: "error",
    })
  }
}
</script>
