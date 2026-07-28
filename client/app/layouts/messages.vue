<!-- English description: Messages layout with the shared global header and constrained conversation workspace. -->
<template>
  <div class="phone-safe flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-(--bg-base)">
    <NavigationHeaderBar />
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <main class="min-h-0 min-w-0 flex-1 overflow-hidden bg-(--bg-surface) rounded-3xl mt-1.5">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
</script>
