<!-- Description: Provides the thin Nuxt route wrapper for the profile page runtime. -->
<template>
  <div>
    <PagesProfilePage />
  </div>
</template>

<script setup lang="ts">
import PagesProfilePage from "../../src/profile/presentation/pages/ProfilePage.vue"

definePageMeta({
  layout: "default",
})

const route = useRoute()

const username = computed(() => {
  const value = route.params.username
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")
})

useSeoMeta({
  title: () => `${username.value || "profile"} | VNSEEA`,
  description: () => "Profile timeline aligned to the legacy PHP cover, tabs, and content order.",
})
</script>
