<!-- Description: Provides the thin Nuxt route wrapper for the profile page runtime with optional Boneyard skeleton support. -->
<template>
  <Skeleton
    name="profile-page"
    :loading="skeletonLoading"
    animate="pulse"
    :transition="200"
    color="rgba(255,255,255,1)"
  >
    <PagesProfilePage />
  </Skeleton>
</template>

<script setup lang="ts">
import Skeleton from "boneyard-js/vue"
import PagesProfilePage from "../../src/profile/presentation/pages/ProfilePage.vue"

// import.meta.glob("./bones/registry.*", { eager: true })

const skeletonLoading = ref(false)

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

<style scoped>
.profile-route-fallback {
  min-height: 100vh;
  background: #f0f2f5;
}

.profile-route-fallback__body {
  display: grid;
  gap: 12px;
  padding: 12px;
}

@media (min-width: 640px) {
  .profile-route-fallback__body {
    padding: 16px;
  }
}
</style>
