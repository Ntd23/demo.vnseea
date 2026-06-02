<!-- English description: Thin Nuxt route wrapper for PHP-backed public custom CMS pages. -->
<template>
  <CmsPresentationCmsPage kind="custom" :identifier="pageName" />
</template>

<script setup lang="ts">
import CmsPresentationCmsPage from "../../../src/cms/presentation/pages/CmsPage.vue"
import { normalizeCmsPageName } from "../../../src/cms/domain/services/cms-route.service"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const pageName = normalizeCmsPageName(route.params.pageName)

if (!pageName) {
  throw createError({
    statusCode: 404,
    statusMessage: "CMS page not found.",
  })
}
</script>
