<!-- English description: Nearby-search layout with the shared header and no desktop sidebars or chat widget. -->
<template>
  <div class="phone-safe min-h-screen bg-(--bg-base)">
    <NavigationHeaderBar />

    <main class="min-w-0 w-full">
      <slot />
    </main>
  </div>
</template>

<script setup>
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
</script>
