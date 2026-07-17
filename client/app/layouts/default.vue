<!-- English description: Default authenticated layout with header, sidebars, and a fixed mobile chat shortcut. -->
<template>
  <div class="phone-safe min-h-screen bg-[#f1f4fb] overflow-x-clip" :class="isReelsPage ? 'overflow-hidden' : ''">
    <ClientOnly>
      <HeaderSearchContent />
    </ClientOnly>

    <ClientOnly>
      <NavigationHeaderBar />

      <template v-slot:fallback>
        <div class="h-16 border-b border-[#dfe6ff] bg-white"></div>
      </template>
    </ClientOnly>

    <div class="w-full" :class="isReelsPage ? 'h-[calc(100dvh-65px)] overflow-hidden bg-black xl:h-[calc(100dvh-73px)]' : ''">
      <div class="mx-auto grid w-full grid-cols-1 gap-4 xl:items-start" :class="shellClass">
        <aside v-if="showLeftSidebar && !isReelsPage"
          class="hidden mt-2 bg-white rounded-[16px] min-w-0 xl:sticky xl:top-17 xl:z-10 xl:block xl:h-[calc(92dvh)] xl:overflow-hidden">
          <ClientOnly>
            <NavigationLeftSidebar v-if="!isDirectoryPage" />
            <DirectoryLeftSidebar v-else />
          </ClientOnly>
        </aside>

        <main class="relative z-0 min-w-0 w-full" :class="mainClass">
          <ClientOnly>
            <div
              v-if="showHeaderIconNav"
              class="sticky z-[50] mb-4 mt-2 rounded-b-3xl border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(13,38,76,0.05)] transition-[top] duration-100"
              :class="isHeaderHidden ? 'top-0' : 'top-[56px] xl:top-[64px]'">
              <NavigationHeaderIconNav />
            </div>
          </ClientOnly>
          <slot />
        </main>

        <aside v-if="showRightSidebar"
          class="hidden min-w-0 xl:sticky xl:top-[70px] xl:z-50 xl:block xl:h-[calc(100dvh-70px)] xl:overflow-visible">
          <ClientOnly>
            <NavigationRightSidebar />
          </ClientOnly>
        </aside>
      </div>
    </div>

  </div>
</template>

<script setup>
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import NavigationHeaderBar from "../../src/navigation/presentation/components/HeaderBar.vue"
import HeaderSearchContent from "../../src/navigation/presentation/components/HeaderSearchContent.client.vue"
import NavigationHeaderIconNav from "../../src/navigation/presentation/components/HeaderIconNav.vue"
import NavigationLeftSidebar from "../../src/navigation/presentation/components/LeftSidebar.vue"
import NavigationRightSidebar from "../../src/navigation/presentation/components/RightSidebar.vue"
import DirectoryLeftSidebar from "../../src/directory/presentation/components/LeftSidebar.vue"

const route = useRoute()

const isHeaderHidden = ref(false)
const lastScrollY = ref(0)

const handleScroll = () => {
  const currentScrollY = window.scrollY
  if (window.innerWidth >= 1280) {
    isHeaderHidden.value = false
    return
  }
  if (currentScrollY <= 5) {
    isHeaderHidden.value = false
    lastScrollY.value = currentScrollY
    return
  }
  if (currentScrollY > lastScrollY.value) {
    isHeaderHidden.value = true
  } else {
    isHeaderHidden.value = false
  }
  lastScrollY.value = currentScrollY
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll)
})
const backendUserSession = useCookie("user_id", {
  default: () => null,
  sameSite: "lax",
  path: "/",
})
const isGuestPublicContentPage = computed(() => Boolean(route.meta.publicContent) && !backendUserSession.value)
const shouldHideLeftSidebar = computed(() => Boolean(route.meta.hideLeftSidebar))
const isReelsPage = computed(() => route.path === appRoutes.reels)
const isCheckoutPage = computed(() => route.path === appRoutes.checkout)
const isSearchPage = computed(() => route.path === appRoutes.search)
const isPageDetailPage = computed(() => route.path.startsWith("/p/"))
const isBlogDetailPage = computed(() => route.path.startsWith("/read-blog/"))
const isCmsPage = computed(() => route.path.startsWith("/terms/") || route.path.startsWith("/site-pages/"))
const isDirectoryPage = computed(() => route.path.startsWith("/directory"))
const isCreateBlogPage = computed(() => route.path === appRoutes.createBlog)
const isLivePage = computed(() => route.path === appRoutes.live)
const isFundingPage = computed(() =>
  route.path === appRoutes.funding
  || route.path === appRoutes.createFunding
  || route.path.startsWith("/show_fund/")
  || route.path.startsWith("/edit_fund/")
)
const isForumPage = computed(() => route.path === appRoutes.forum)
const isHomeFeedPage = computed(() => route.path === appRoutes.home || route.path === appRoutes.feed)
const isCommunityComposerPage = computed(() =>
  route.path === appRoutes.createGroup || route.path === appRoutes.createPage,
)
const showLeftSidebar = computed(() =>
  !isGuestPublicContentPage.value
  && !shouldHideLeftSidebar.value
  && !route.path.startsWith('/@')
  && !route.path.startsWith('/g/')
)
const showRightSidebar = computed(() =>
  !isGuestPublicContentPage.value
  && !isReelsPage.value
  && !isLivePage.value
  && !isCmsPage.value
)
// HeaderIconNav only appears on the five destinations represented by its icons.
// Using a whitelist to avoid it leaking onto Groups, Events, Jobs, etc.
const iconNavPages = new Set([
  appRoutes.home,
  appRoutes.feed,
  appRoutes.searchNearby,
  appRoutes.photos,
  appRoutes.products,
])
const showHeaderIconNav = computed(() => iconNavPages.has(route.path))

const shellClass = computed(() => {
  if (isReelsPage.value) {
    return 'h-full max-w-none grid-cols-1 gap-0 px-0 xl:grid-cols-1'
  }

  if (isCheckoutPage.value) {
    return 'max-w-[1880px] xl:grid-cols-[minmax(0,1fr)_275px]'
  }

  if (isLivePage.value) {
    return 'max-w-[1880px] px-0 md:px-0 xl:grid-cols-1'
  }

  if (isCmsPage.value) {
    return 'max-w-[1200px] xl:grid-cols-1'
  }

  // All content pages share same sidebar widths → no layout shift on navigation
  return showLeftSidebar.value
    ? 'max-w-[1880px] xl:grid-cols-[220px_minmax(0,1fr)_260px] 2xl:grid-cols-[256px_minmax(0,1fr)_280px]'
    : 'max-w-[1880px] xl:grid-cols-[minmax(0,1fr)_280px]'
})

const mainClass = computed(() => {
  if (isReelsPage.value) {
    return 'h-full min-h-0 overflow-hidden'
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

  if (isLivePage.value) {
    return 'pb-0'
  }

  if (isCmsPage.value) {
    return 'pb-8'
  }

  return 'pb-10'
})

</script>
