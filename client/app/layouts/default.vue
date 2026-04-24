<template>
  <div class="phone-safe min-h-screen bg-[#f1f4fb]" :class="isReelsPage ? 'overflow-hidden bg-black' : ''">
    <NavigationHeaderBar v-model:menu-open="menuOpen" />

    <div class="w-full" :class="isReelsPage ? 'h-[calc(100vh-56px)]' : ''">
      <div
        class="mx-auto grid w-full grid-cols-1 gap-4 xl:items-start"
        :class="shellClass"
      >
        <aside
          v-if="showLeftSidebar && !isReelsPage"
          class="hidden min-w-0 xl:sticky xl:top-[74px] xl:block xl:h-[calc(100dvh-98px)] xl:overflow-hidden"
        >
          <NavigationLeftSidebar />
        </aside>

        <main class="min-w-0 w-full" :class="mainClass">
          <div v-if="showHeaderIconNav" class="sticky top-[56px] z-20 mb-4 mt-2 xl:block">
            <div class="overflow-hidden rounded-[1.4rem] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(13,38,76,0.05)]">
              <NavigationHeaderIconNav />
            </div>
          </div>
          <slot />
        </main>

        <aside v-if="showRightSidebar" class="hidden min-w-0 xl:sticky xl:top-[74px] xl:block">
          <NavigationRightSidebar />
        </aside>
      </div>
    </div>

    <!-- Mobile: Full page menu -->
    <NavigationMobileMenu v-model="menuOpen" />

    <!-- Mobile: Floating chat button -->
    <Teleport to="body">
      <button
        v-if="!isReelsPage"
        class="fixed bottom-4 right-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#0000ff] text-white shadow-[0_4px_20px_rgba(0,0,255,0.35)] transition hover:scale-105 xl:hidden"
        style="margin-bottom: env(safe-area-inset-bottom, 0px);"
        type="button"
        @click="chatOpen = !chatOpen"
      >
        <Icon :name="chatOpen ? 'i-ph-x-bold' : 'i-ph-chat-circle-dots-fill'" class="h-5 w-5" />
      </button>
    </Teleport>
  </div>
</template>

<script setup>
const menuOpen = ref(false)
const chatOpen = ref(false)

const route = useRoute()
const isReelsPage = computed(() => route.path === '/reels')
const isCheckoutPage = computed(() => route.path === '/checkout')
const isSearchPage = computed(() => route.path === '/search')
const isCommunityComposerPage = computed(() =>
  route.path === '/create-group' || route.path === '/create-page',
)
const showLeftSidebar = computed(() =>
  !route.path.startsWith('/@')
  && !isCheckoutPage.value
  && !isSearchPage.value,
)
const showRightSidebar = computed(() => !isReelsPage.value)
const showHeaderIconNav = computed(() =>
  !isReelsPage.value
  && !isCheckoutPage.value
  && !isCommunityComposerPage.value
  && !isSearchPage.value
)

const shellClass = computed(() => {
  if (isReelsPage.value) {
    return 'max-w-[1880px] px-5 h-full grid-cols-1 gap-0 xl:grid-cols-1'
  }

  if (isCheckoutPage.value) {
    return 'max-w-[1880px] px-4 md:px-6 xl:px-8 xl:grid-cols-[minmax(0,1fr)_295px]'
  }

  return showLeftSidebar.value
    ? 'max-w-[1880px] px-5 xl:grid-cols-[220px_minmax(0,1fr)_250px]'
    : 'max-w-[1880px] px-5 xl:grid-cols-[minmax(0,1fr)_250px]'
})

const mainClass = computed(() => {
  if (isReelsPage.value) {
    return 'h-full xl:sticky xl:top-[74px]'
  }

  if (isCheckoutPage.value) {
    return 'pb-6'
  }

  if (isCommunityComposerPage.value) {
    return 'pb-8'
  }

  if (isSearchPage.value) {
    return 'pb-8'
  }

  return 'xl:sticky xl:top-[74px]'
})

watch(() => route.fullPath, () => {
  menuOpen.value = false
  if (route.path !== '/reels') chatOpen.value = false
})
</script>
