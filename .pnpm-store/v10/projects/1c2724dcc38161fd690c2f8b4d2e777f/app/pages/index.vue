<!-- English description: Thin protected feed route wrapper for the root social feed surface. -->
<template>
  <ClientOnly>
    <FeedPresentationHomeFeedPage />

    <template v-slot:fallback>
      <div class="min-h-screen bg-[#f5f7fb]"></div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import FeedPresentationHomeFeedPage from "../../src/feed/presentation/pages/HomeFeedPage.vue"
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
