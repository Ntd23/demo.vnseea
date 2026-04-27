<template>
  <SettingsPresentationPage :page-slug="pageSlug" />
</template>

<script setup lang="ts">
import SettingsPresentationPage from "../../../src/settings/presentation/pages/SettingsPage.vue"

defineProps<{
  pageSlug?: string
}>()
/**
 * Legacy wrapper for SettingsPage.
 * Runtime and logic moved to src/settings/presentation/pages/SettingsPage.vue
 */
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

