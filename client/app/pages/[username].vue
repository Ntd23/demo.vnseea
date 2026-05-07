<!-- English description: Thin Nuxt wrapper for normalized public profile routes. -->
<template>
  <PagesProfilePage />
</template>

<script setup lang="ts">
import PagesProfilePage from "../../src/profile/presentation/pages/ProfilePage.vue"

definePageMeta({
  layout: "default",
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

const username = computed(() => {
  return normalizeProfileUsername(route.params.username)
})

useSeoMeta({
  title: () => `${username.value} | VNSEEA`,
  description: () => "Profile page for " + username.value,
})
</script>
