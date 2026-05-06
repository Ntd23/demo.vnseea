<template>
  <PagesProfilePage />
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
  title: () => `${username.value} | VNSEEA`,
  description: () => "Profile page for " + username.value,
})
</script>
