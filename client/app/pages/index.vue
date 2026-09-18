<!-- English description: Switches the root home route between reversible marketplace and original social-feed variants. -->
<template>
  <ClientOnly>
    <Suspense v-if="isMarketplaceHome">
      <ProductPresentationMarketplaceHomePage />

      <template #fallback>
        <ProductPresentationMarketplaceHomeLoadingState />
      </template>
    </Suspense>

    <Suspense v-else>
      <FeedPresentationHomeFeedPage />

      <template #fallback>
        <FeedPresentationHomeFeedLoadingState />
      </template>
    </Suspense>

    <template #fallback>
      <ProductPresentationMarketplaceHomeLoadingState v-if="isMarketplaceHome" />
      <FeedPresentationHomeFeedLoadingState v-else />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import FeedPresentationHomeFeedLoadingState from "../../src/feed/presentation/components/HomeFeedLoadingState.vue"
import FeedPresentationHomeFeedPage from "../../src/feed/presentation/pages/HomeFeedPage.vue"
import ProductPresentationMarketplaceHomeLoadingState from "../../src/product/presentation/components/MarketplaceHomeLoadingState.vue"
import ProductPresentationMarketplaceHomePage from "../../src/product/presentation/pages/MarketplaceHomePage.vue"
const { t } = useI18n()
const requestURL = useRequestURL()
const runtimeConfig = useRuntimeConfig()
const isMarketplaceHome = computed(() => runtimeConfig.public.homeVariant === "marketplace")

const canonicalUrl = computed(() =>
  new URL("/", requestURL.origin).toString(),
)

useSeoMeta({
  title: () => t(isMarketplaceHome.value ? "pages.marketplaceHome.seoTitle" : "pages.homeFeedPage.seoTitle"),
  description: () => t(isMarketplaceHome.value ? "pages.marketplaceHome.seoDescription" : "pages.homeFeedPage.seoDescription"),
  ogTitle: () => t(isMarketplaceHome.value ? "pages.marketplaceHome.seoTitle" : "pages.homeFeedPage.seoTitle"),
  ogDescription: () => t(isMarketplaceHome.value ? "pages.marketplaceHome.seoDescription" : "pages.homeFeedPage.seoDescription"),
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
