<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.14),transparent_32%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                {{ t("pages.savedPostsPage.heroEyebrow") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                {{ t("pages.savedPostsPage.heroTitle") }}
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                {{ t("pages.savedPostsPage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                {{ t("pages.savedPostsPage.backToFeed") }}
              </NuxtLink>

              <button
                v-if="visibleSavedPosts.length > 0"
                class="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(244,63,94,0.2)] transition hover:-translate-y-0.5 hover:bg-rose-600"
                type="button"
                @click="removeAll"
              >
                <Icon name="i-ph-trash-bold" class="mr-2 h-4 w-4" />
                {{ t("pages.savedPostsPage.removeAll") }}
              </button>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="rounded-[24px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4"
            >
              <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[13px] leading-6 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="visibleSavedPosts.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-bookmark-simple"
          :title="t('pages.savedPostsPage.emptyTitle')"
          :description="t('pages.savedPostsPage.emptyDescription')"
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
            type="button"
            @click="restoreMockData"
          >
            {{ t("pages.savedPostsPage.restoreMock") }}
          </button>

          <NuxtLink
            to="/explore"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          >
            {{ t("pages.savedPostsPage.goToExplore") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]"
    >
      <div class="flex flex-col gap-3 border-b border-[#eef2fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            {{ t("pages.savedPostsPage.listEyebrow") }}
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ t("pages.savedPostsPage.listTitle", { count: visibleSavedPosts.length }) }}
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {{ t("pages.savedPostsPage.listDescription") }}
          </p>
        </div>

        <NuxtLink
          to="/search"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4 w-4" />
          {{ t("pages.savedPostsPage.findMore") }}
        </NuxtLink>
      </div>

      <div class="mt-5 space-y-5">
        <SavedPostCard
          v-for="item in visibleSavedPosts"
          :key="item.id"
          :entry="item"
          @remove="removeSavedPost"
        />
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
