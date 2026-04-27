<template>
  <div class="h-full min-h-0">
    <PagesMessagesPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "messages" })

const { t } = useI18n()
useSeoMeta({
  title: () => t('pages.messagesPage.seoTitle'),
  description: () => t('pages.messagesPage.seoDescription'),
})
</script>
