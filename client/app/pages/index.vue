<!-- English description: Thin public homepage route wrapper with indexable SEO metadata. -->
<template>
  <PublicHomePage />
</template>

<script setup lang="ts">
import PublicHomePage from "../../src/public-home/presentation/pages/PublicHomePage.vue"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"

definePageMeta({
  layout: "public",
})

const requestURL = useRequestURL()
const siteBrandingStore = useSiteBrandingStore()
const canonicalUrl = computed(() => new URL("/", requestURL.origin).toString())
const siteName = computed(() => siteBrandingStore.branding.siteName || siteBrandingStore.branding.siteTitle || "VNSEEA")
const title = computed(() => `${siteName.value} - Mạng xã hội cộng đồng, trang, nhóm và sản phẩm`)
const description = computed(() =>
  `Khám phá ${siteName.value}: nền tảng cộng đồng cho bài viết, trang, nhóm, sản phẩm, ưu đãi và kết nối địa phương.`,
)

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogUrl: () => canonicalUrl.value,
  robots: "index, follow",
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
