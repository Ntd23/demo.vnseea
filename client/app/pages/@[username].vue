<template>
  <div>
    <PagesProfilePage />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const username = computed(() => route.params.username as string)

useHead({
  title: `${username.value} — Trang cá nhân`,
})
</script>
