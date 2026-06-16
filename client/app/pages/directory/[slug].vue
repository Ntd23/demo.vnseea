<!-- English description: Catch-all subpage Nuxt route wrapper for directory categories. -->
<template>
  <DirectoryPresentationDirectoryIndexPage />
</template>

<script setup lang="ts">
import DirectoryPresentationDirectoryIndexPage from "../../../src/directory/presentation/pages/DirectoryIndexPage.vue"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()

const legacyDirectoryRedirects: Record<string, string> = {
  blog: appRoutes.blogs,
  blogs: appRoutes.blogs,
  event: appRoutes.events,
  events: appRoutes.events,
  forum: appRoutes.forum,
  forums: appRoutes.forum,
  funding: appRoutes.funding,
  game: appRoutes.games,
  games: appRoutes.games,
  group: appRoutes.groups,
  groups: appRoutes.groups,
  job: appRoutes.jobs,
  jobs: appRoutes.jobs,
  market: appRoutes.products,
  movie: appRoutes.movies,
  movies: appRoutes.movies,
  page: appRoutes.pages,
  pages: appRoutes.pages,
}

const slug = String(route.params.slug || "").toLowerCase()
const redirectTo = legacyDirectoryRedirects[slug]

if (redirectTo) {
  await navigateTo(redirectTo, { replace: true })
}

useSeoMeta({
  title: () => t("pages.directoryPage.seoTitle"),
  description: () => t("pages.directoryPage.seoDescription"),
})
</script>
