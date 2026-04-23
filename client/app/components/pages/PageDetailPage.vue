<template>
  <div v-if="page" class="mx-auto max-w-7xl space-y-8 pb-20 pt-4 px-4 sm:px-6">
    <CommunityPageHeroBanner
      :page="page"
      :category-label="categoryLabel"
      :follower-count-label="followerCountLabel"
      :like-count-label="likeCountLabel"
    />

    <CommunityGroupTabsBar v-model="activeTab" />

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <section class="min-w-0 space-y-8">
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

      <aside class="space-y-8">
        <CommunityPageActionCard
          :page="page"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
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

  <div v-else class="mx-auto max-w-4xl pb-20 pt-10 px-4 sm:px-6">
    <section class="surface-card p-12 text-center ring-1 ring-secondary-100 shadow-xl">
      <FoundationEmptyState
        icon="i-ph-megaphone-simple-duotone"
        :title="t('pages.pageDetailPage.emptyTitle')"
        :description="t('pages.pageDetailPage.emptyDescription')"
      />

      <div class="mt-8 flex justify-center">
        <UButton
          to="/create-page"
          size="xl"
          icon="i-ph-plus-bold"
          class="rounded-2xl bg-primary-600 px-8 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-primary-500/30 transition-all active:scale-95"
        >
          {{ t("pages.pageDetailPage.createNewPage") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageSlug?: string
}>()

const route = useRoute()
const { t } = useI18n()
const activeTab = ref<"posts" | "about">("posts")

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

watch(() => route.fullPath, () => {
  activeTab.value = "posts"
})

useSeoMeta({
  title: computed(() =>
    page.value ? `${page.value.name} | VNSEEA` : t("pages.pageDetailPage.seoFallbackTitle"),
  ),
  description: computed(() =>
    page.value?.summary || t("pages.pageDetailPage.seoFallbackDescription"),
  ),
})
</script>
