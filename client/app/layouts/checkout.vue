<!-- English description: Checkout layout with the shared site header and a focused full-width purchase workspace. -->
<template>
  <div class="phone-safe min-h-screen overflow-x-clip bg-[#f1f4fb]">
    <ClientOnly>
      <NavigationHeaderBar />

      <template #fallback>
        <div class="h-16 border-b border-[#dfe6ff] bg-white" />
      </template>
    </ClientOnly>

    <main class="min-w-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
</script>
