<template>
  <MessagesRoutePage />
</template>

<script setup lang="ts">
import MessagesRoutePage from "../components/pages/MessagesPage.vue"

definePageMeta({
  layout: "messages",
})

const { t } = useI18n()
useSeoMeta({
  title: () => t("pages.messagesPage.seoTitle"),
  description: () => t("pages.messagesPage.seoDescription"),
})
</script>
