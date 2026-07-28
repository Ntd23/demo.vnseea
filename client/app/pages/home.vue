<!-- English description: Home feed route with SEO metadata and a theme-aware hydration skeleton. -->
<template>
  <ClientOnly>
    <FeedPresentationHomeFeedPage />

    <template v-slot:fallback>
      <div
        class="min-h-screen space-y-4 bg-[var(--bg-base)] py-2"
        role="status"
        aria-busy="true"
        :aria-label="$t('pages.homeFeedPage.loadingMore')"
      >
        <section class="flex gap-3 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4">
          <div v-for="index in 6" :key="`story-${index}`" class="flex shrink-0 flex-col items-center gap-2">
            <USkeleton class="h-14 w-14 rounded-full" />
            <USkeleton class="h-2.5 w-12 rounded-full" />
          </div>
        </section>

        <section class="rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4">
          <div class="flex items-center gap-3">
            <USkeleton class="h-10 w-10 shrink-0 rounded-full" />
            <USkeleton class="h-10 flex-1 rounded-[var(--radius-lg)]" />
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <USkeleton v-for="index in 4" :key="`action-${index}`" class="h-9 w-9 rounded-full" />
          </div>
        </section>

        <article
          v-for="index in 2"
          :key="`post-${index}`"
          class="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--bg-surface)]"
        >
          <div class="flex items-center gap-3 p-4">
            <USkeleton class="h-11 w-11 shrink-0 rounded-full" />
            <div class="min-w-0 flex-1 space-y-2">
              <USkeleton class="h-3.5 w-32 rounded-full" />
              <USkeleton class="h-3 w-24 rounded-full" />
            </div>
          </div>
          <div class="space-y-2 px-4 pb-4">
            <USkeleton class="h-3.5 w-full rounded-full" />
            <USkeleton class="h-3.5 w-3/4 rounded-full" />
          </div>
          <USkeleton class="aspect-video w-full rounded-none" />
        </article>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import FeedPresentationHomeFeedPage from "../../src/feed/presentation/pages/HomeFeedPage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const requestURL = useRequestURL()

const canonicalUrl = computed(() =>
  new URL("/", requestURL.origin).toString(),
)

useSeoMeta({
  title: () => t("pages.homeFeedPage.seoTitle"),
  description: () => t("pages.homeFeedPage.seoDescription"),
  ogTitle: () => t("pages.homeFeedPage.seoTitle"),
  ogDescription: () => t("pages.homeFeedPage.seoDescription"),
  ogUrl: () => canonicalUrl.value,
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
})
</script>
