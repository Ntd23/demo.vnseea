<template>
  <PagesSettingsPage />
</template>

<script setup lang="ts">
import PagesSettingsPage from "../../../src/settings/presentation/pages/SettingsPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => `${t("settings.hero.title")} | VNSEEA`,
})
</script>
