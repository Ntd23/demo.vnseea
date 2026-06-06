<!-- English description: Messages layout with the global header and mounted search palette host. -->
<template>
  <div class="phone-safe flex h-screen min-h-0 flex-col overflow-hidden bg-(--bg-base)">
    <ClientOnly>
      <HeaderSearchContent />
    </ClientOnly>
    <NavigationHeaderBar />
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <main class="min-h-0 min-w-0 flex-1 overflow-hidden bg-(--bg-surface)">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
import HeaderSearchContent from "../../src/navigation/presentation/components/HeaderSearchContent.client.vue"
</script>
