<!-- English description: Thin Nuxt wrapper for normalized public profile routes. -->
<template>
  <ProfilePage />
</template>

<script setup lang="ts">
import ProfilePage from "../../src/profile/presentation/pages/ProfilePage.vue"
import { usePublicSeoMeta } from "../../src/seo/application/composables/usePublicSeoMeta"
import { createApiPublicSeoRepository } from "../../src/seo/infrastructure/repositories/ApiPublicSeoRepository"

definePageMeta({
  layout: "default",
  publicContent: true,
})

const route = useRoute()

const normalizeProfileUsername = (value: unknown) => {
  const raw = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")

  try {
    return decodeURIComponent(raw).trim().replace(/^@+/, "")
  } catch {
    return raw.trim().replace(/^@+/, "")
  }
}

const reservedBackendProfileSegments = new Set(["ads", "advertise"])

const username = computed(() => {
  return normalizeProfileUsername(route.params.username)
})

if (reservedBackendProfileSegments.has(username.value.toLowerCase())) {
  throw createError({
    statusCode: 404,
    statusMessage: "Route is reserved by the backend.",
  })
}

const seoRepository = createApiPublicSeoRepository()
const { data: seoMeta, error: seoError } = await useAsyncData(
  () => `seo:profile:${username.value}`,
  () => username.value
    ? seoRepository.getPublicSeo({ routeType: "profile", identifier: username.value })
    : Promise.resolve(null),
  {
    watch: [username],
    default: () => null,
  },
)

if (seoError.value) {
  throw createError({
    statusCode: seoError.value.statusCode || 404,
    statusMessage: seoError.value.statusMessage || "Profile not found.",
  })
}

usePublicSeoMeta(seoMeta)
</script>
