<template>
  <div class="phone-safe flex h-screen min-h-0 flex-col overflow-hidden bg-[#f1f4fb]">
    <NavigationHeaderBar @toggle-menu="menuOpen = !menuOpen" />
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <main class="min-h-0 flex-1 overflow-hidden bg-white">
        <slot />
      </main>
    </div>
    <NavigationMobileMenu :open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<script setup>
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
import NavigationMobileMenu from "../../src/navigation/presentation/components/MobileMenu.vue"

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
