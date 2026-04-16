<template>
  <div class="phone-safe min-h-screen bg-[#f1f4fb]">
    <NavigationHeaderBar @toggle-menu="menuOpen = !menuOpen" />

    <!-- Mobile sub-header: circular filter icons -->
    <div class="sticky top-[56px] z-20 xl:hidden">
      <NavigationHeaderIconNav />
    </div>

    <div class="w-full">
      <div
        class="grid grid-cols-1 gap-4 xl:items-start"
        :class="showLeftSidebar ? 'xl:grid-cols-[220px_minmax(0,1fr)_250px]' : 'xl:grid-cols-[minmax(0,1fr)_250px]'"
      >
        <aside v-if="showLeftSidebar" class="hidden min-w-0 xl:sticky xl:top-[74px] xl:block">
          <NavigationLeftSidebar />
        </aside>
        <main class="min-w-0 w-full">
          <slot />
        </main>
        <aside class="hidden min-w-0 xl:sticky xl:top-[74px] xl:block">
          <NavigationRightSidebar />
        </aside>
      </div>
    </div>

    <!-- Mobile: Full page menu -->
    <NavigationMobileMenu :open="menuOpen" @close="menuOpen = false" />

    <!-- Mobile: Floating chat button -->
    <Teleport to="body">
      <button
        class="fixed bottom-4 right-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#0000ff] text-white shadow-[0_4px_20px_rgba(0,0,255,0.35)] transition hover:scale-105 xl:hidden"
        style="margin-bottom: env(safe-area-inset-bottom, 0px);"
        type="button"
        @click="chatOpen = !chatOpen"
      >
        <Icon :name="chatOpen ? 'i-ph-x-bold' : 'i-ph-chat-circle-dots-fill'" class="h-5 w-5" />
      </button>

      <!-- Mobile chat popup -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-90 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-90 translate-y-4"
      >
        <div
          v-if="chatOpen"
          class="fixed bottom-[72px] right-3 z-30 w-[calc(100vw-24px)] max-w-[360px] xl:hidden"
          style="max-height: calc(100vh - 140px); margin-bottom: env(safe-area-inset-bottom, 0px);"
        >
          <NavigationChatWidget class="shadow-[0_8px_40px_rgba(0,0,255,0.18)]" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const menuOpen = ref(false)
const chatOpen = ref(false)

const route = useRoute()
const showLeftSidebar = computed(() => !route.path.startsWith('/@'))
watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>
