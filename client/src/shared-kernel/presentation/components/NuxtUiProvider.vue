<!-- English description: Provides Nuxt UI application context and toast host for routes that use Nuxt UI runtime components. -->
<template>
  <UApp :locale="nuxtUiLocale">
    <slot />
    <UToaster />
  </UApp>
</template>

<script setup lang="ts">
import { en_gb, vi } from "@nuxt/ui/locale"

const { locale } = useI18n()
const nuxtUiLocale = computed(() => locale.value === "vi" ? vi : en_gb)
</script>
