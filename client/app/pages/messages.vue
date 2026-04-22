<template>
  <div class="h-full min-h-0">
    <PagesMessagesPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "messages" })

const { t } = useI18n()
useHead({
  title: () => t('pages.messagesPage.seoTitle'),
})
</script>
