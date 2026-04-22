<template>
  <div class="mx-auto max-w-[1280px] space-y-8 pb-16 pt-8 px-4 sm:px-6">
    <section class="surface-card overflow-hidden">
      <div class="relative px-6 py-8 sm:px-8">
        <!-- Background decoration -->
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_34%),radial-gradient(circle_at_bottom_left,var(--tw-gradient-to),transparent_32%)] from-primary-500/10 to-primary-600/5" />

        <div class="relative space-y-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-micro font-bold uppercase tracking-[0.2em] text-primary-600">
                {{ t("pages.savedPostsPage.heroEyebrow") }}
              </p>
              <h1 class="text-display mt-2 text-3xl font-black text-secondary-900 sm:text-4xl">
                {{ t("pages.savedPostsPage.heroTitle") }}
              </h1>
              <p class="text-body-secondary mt-3 text-sm leading-relaxed">
                {{ t("pages.savedPostsPage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <UButton
                to="/home"
                variant="soft"
                color="gray"
                size="md"
                class="rounded-full font-bold px-5"
              >
                <template #leading>
                  <Icon name="i-ph-house-line-fill" class="h-4 w-4" />
                </template>
                {{ t("pages.savedPostsPage.backToFeed") }}
              </UButton>

              <UButton
                v-if="visibleSavedPosts.length > 0"
                color="red"
                size="md"
                class="rounded-full font-black px-6 shadow-lg shadow-red-500/20"
                @click="removeAll"
              >
                <template #leading>
                  <Icon name="i-ph-trash-bold" class="h-4 w-4" />
                </template>
                {{ t("pages.savedPostsPage.removeAll") }}
              </UButton>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="rounded-2xl border border-secondary-100 bg-secondary-50/50 p-5 transition-all hover:bg-white hover:shadow-md"
            >
              <p class="text-micro font-bold uppercase tracking-wider text-primary-600">
                {{ item.label }}
              </p>
              <p class="mt-2 text-2xl font-black text-secondary-900 tracking-tight">
                {{ item.value }}
              </p>
              <p class="mt-2 text-xs font-medium text-secondary-400 leading-tight">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section
      v-if="visibleSavedPosts.length === 0"
      class="surface-card p-12 sm:p-20"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-bookmark-simple-duotone"
          :title="t('pages.savedPostsPage.emptyTitle')"
          :description="t('pages.savedPostsPage.emptyDescription')"
        />

        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <UButton
            color="primary"
            size="lg"
            class="rounded-full font-black px-10 shadow-lg shadow-primary-500/20"
            @click="restoreMockData"
          >
            {{ t("pages.savedPostsPage.restoreMock") }}
          </UButton>

          <UButton
            to="/explore"
            variant="soft"
            color="gray"
            size="lg"
            class="rounded-full font-bold px-8"
          >
            {{ t("pages.savedPostsPage.goToExplore") }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- List Section -->
    <section
      v-else
      class="surface-card p-0 overflow-hidden"
    >
      <div class="flex flex-col gap-4 border-b border-secondary-100/50 p-6 sm:p-8 sm:flex-row sm:items-center sm:justify-between bg-secondary-50/30">
        <div>
          <p class="text-micro font-bold uppercase tracking-widest text-primary-600">
            {{ t("pages.savedPostsPage.listEyebrow") }}
          </p>
          <h2 class="text-xl font-black text-secondary-900 leading-tight mt-1">
            {{ t("pages.savedPostsPage.listTitle", { count: visibleSavedPosts.length }) }}
          </h2>
          <p class="text-body-secondary text-sm">
            {{ t("pages.savedPostsPage.listDescription") }}
          </p>
        </div>

        <UButton
          to="/search"
          variant="soft"
          color="primary"
          size="md"
          class="rounded-full font-black px-6"
        >
          <template #leading>
            <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4" />
          </template>
          {{ t("pages.savedPostsPage.findMore") }}
        </UButton>
      </div>

      <div class="divide-y divide-secondary-100/30">
        <div 
          v-for="item in visibleSavedPosts" 
          :key="item.id"
          class="p-4 sm:p-6 transition hover:bg-secondary-50/20"
        >
          <SavedPostCard
            :entry="item"
            @remove="removeSavedPost"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { savedPosts } = useMockSavedPostsData()
const { t, locale } = useI18n()

const removedIds = ref<string[]>([])

const visibleSavedPosts = computed(() =>
  savedPosts.value.filter(item => !removedIds.value.includes(item.id)),
)

const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

const summaryCards = computed(() => {
  const authors = new Set(visibleSavedPosts.value.map(item => item.post.author))
  const collections = new Set(visibleSavedPosts.value.map(item => item.collectionLabel))
  const interactionCount = visibleSavedPosts.value.reduce(
    (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
    0,
  )

  return [
    {
      label: t("pages.savedPostsPage.statSaved"),
      value: formatCount(visibleSavedPosts.value.length),
      description: t("pages.savedPostsPage.statSavedDescription"),
    },
    {
      label: t("pages.savedPostsPage.statAuthors"),
      value: formatCount(authors.size),
      description: t("pages.savedPostsPage.statAuthorsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statCollections"),
      value: formatCount(collections.size),
      description: t("pages.savedPostsPage.statCollectionsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statInteractions"),
      value: formatCount(interactionCount),
      description: t("pages.savedPostsPage.statInteractionsDescription"),
    },
  ]
})

function removeSavedPost(id: string) {
  if (removedIds.value.includes(id)) return
  removedIds.value = [...removedIds.value, id]
}

function removeAll() {
  removedIds.value = savedPosts.value.map(item => item.id)
}

function restoreMockData() {
  removedIds.value = []
}

useSeoMeta({
  title: () => t("pages.savedPostsPage.seoTitle"),
  description: () => t("pages.savedPostsPage.seoDescription"),
})
</script>
