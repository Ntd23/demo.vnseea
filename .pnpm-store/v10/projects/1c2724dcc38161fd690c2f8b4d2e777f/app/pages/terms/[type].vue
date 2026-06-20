<!-- English description: Thin Nuxt route wrapper for PHP-backed public terms CMS pages. -->
<template>
  <CmsPresentationCmsPage kind="terms" :identifier="termsType" />
</template>

<script setup lang="ts">
import CmsPresentationCmsPage from "../../../src/cms/presentation/pages/CmsPage.vue"
import { normalizeCmsTermsType } from "../../../src/cms/domain/services/cms-route.service"

definePageMeta({
  layout: "public",
})

const route = useRoute()
const termsType = normalizeCmsTermsType(route.params.type)

if (!termsType) {
  throw createError({
    statusCode: 404,
    statusMessage: "CMS page not found.",
  })
}
</script>
