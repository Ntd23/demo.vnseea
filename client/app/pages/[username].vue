<template>
  <div>
    <PagesProfilePage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const route = useRoute()
const { t } = useI18n()
const username = computed(() => {
  const value = route.params.username
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")
})

useSeoMeta({
  title: () => t("pages.profilePage.seoTitle", { username: username.value }),
  description: () => t("pages.profilePage.seoDescription"),
})
</script>
