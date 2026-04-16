<template>
  <div class="h-full min-h-0">
    <PagesMessagesPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "messages" })

useHead({
  title: "Tin nhắn | VNSEEA",
})
</script>
