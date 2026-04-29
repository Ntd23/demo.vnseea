<template>
  <div class="sticky top-[74px] flex h-[calc(100vh-98px)] w-full flex-col">
    <div class="flex-1 overflow-hidden rounded-[18px] border border-[rgba(0,0,255,0.04)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <NavigationChatWidget class="h-full w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationChatWidget from "./ChatWidget.vue"
</script>
