<template>
  <div class="min-w-0 space-y-8 xl:flex xl:h-full xl:flex-col">
    <nav class="space-y-1 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-1 scrollbar-hide">
      <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 pl-3 mb-4">
        {{ $t("navigation.leftSidebar.menu") || 'Menu' }}
      </p>

      <div class="space-y-0.5">
        <NavigationSidebarMenuItem
          v-for="item in sidebarNav"
          :key="item.label"
          :to="item.to"
          :label="$t(item.label)"
          :icon="item.icon"
          :active="isItemActive(item.to)"
        />

        <!-- Expandable section -->
        <template v-if="expanded">
          <NavigationSidebarMenuItem
            v-for="item in sidebarNavMore"
            :key="item.label"
            :to="item.to"
            :label="$t(item.label)"
            :icon="item.icon"
            :active="isItemActive(item.to)"
          />
        </template>
      </div>

      <!-- Show More Toggle -->
      <UButton
        variant="ghost"
        color="white"
        class="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 transition-all duration-300 hover:bg-secondary-50 shadow-none ring-0 h-auto"
        @click="expanded = !expanded"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary-100 bg-white text-secondary-400 transition-all duration-300 group-hover:border-primary-200 group-hover:text-primary-600 shadow-sm"
        >
          <Icon
            :name="expanded ? 'i-ph-caret-up-bold' : 'i-ph-caret-down-bold'"
            class="h-3.5 w-3.5"
          />
        </span>
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 group-hover:text-primary-600 transition-colors leading-none">
          {{ expanded ? $t('navigation.leftSidebar.showLess') : $t('navigation.leftSidebar.showMore') }}
        </span>
      </UButton>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const expanded = ref(false)

const sidebarNav = [
  { label: "navigation.leftSidebar.items.feed", icon: "i-ph-house-simple-fill", to: "/" },
  { label: "navigation.leftSidebar.items.photos", icon: "i-ph-images-fill", to: "/photos" },
  { label: "navigation.leftSidebar.items.watch", icon: "i-ph-play-circle-fill", to: "/watch" },
  { label: "navigation.leftSidebar.items.reels", icon: "i-ph-film-strip-fill", to: "/reels" },
  { label: "navigation.leftSidebar.items.savedPosts", icon: "i-ph-bookmark-simple-fill", to: "/saved-posts" },
  { label: "navigation.leftSidebar.items.popularPosts", icon: "i-ph-fire-fill", to: "/popular" },
  { label: "navigation.leftSidebar.items.memories", icon: "i-ph-clock-counter-clockwise-fill", to: "/memories" },
  { label: "navigation.leftSidebar.items.poke", icon: "i-ph-hand-waving-fill", to: "/poke" },
  { label: "navigation.leftSidebar.items.myGroups", icon: "i-ph-users-three-fill", to: "/groups" },
  { label: "navigation.leftSidebar.items.myPages", icon: "i-ph-file-text-fill", to: "/pages" },
]

const sidebarNavMore = [
  { label: "navigation.leftSidebar.items.blog", icon: "i-ph-newspaper-fill", to: "/blogs" },
  { label: "navigation.leftSidebar.items.marketplace", icon: "i-ph-storefront-fill", to: "/products" },
  { label: "navigation.leftSidebar.items.directory", icon: "i-ph-squares-four-fill", to: "/directory" },
  { label: "navigation.leftSidebar.items.events", icon: "i-ph-calendar-dots-fill", to: "/events" },
  { label: "navigation.leftSidebar.items.live", icon: "i-ph-broadcast-fill", to: "/live" },
  { label: "navigation.leftSidebar.items.forum", icon: "i-ph-chats-circle-fill", to: "/forum" },
  { label: "navigation.leftSidebar.items.movies", icon: "i-ph-popcorn-fill", to: "/movies" },
  { label: "navigation.leftSidebar.items.jobs", icon: "i-ph-briefcase-fill", to: "/jobs" },
  { label: "navigation.leftSidebar.items.games", icon: "i-ph-game-controller-fill", to: "/games" },
  { label: "navigation.leftSidebar.items.goPro", icon: "i-ph-crown-simple-fill", to: "/go-pro" },
  { label: "navigation.leftSidebar.items.wallet", icon: "i-ph-wallet-fill", to: "/wallet" },
  { label: "navigation.leftSidebar.items.withdrawal", icon: "i-ph-money-wavy-fill", to: "/withdrawal" },
  { label: "navigation.leftSidebar.items.funding", icon: "i-ph-hand-heart-fill", to: "/funding" },
]

const isMarketplaceRoute = () =>
  route.path === "/products"
  || route.path === "/new-product"
  || route.path === "/my-products"
  || route.path.startsWith("/edit-product/")
  || route.path.startsWith("/order/")
  || route.path.startsWith("/customer_order/")
  || route.path === "/checkout"
  || route.path === "/orders"

const isEventsRoute = () =>
  route.path === "/events"
  || route.path.startsWith("/events/")

const isGroupsRoute = () =>
  route.path === "/groups"
  || route.path === "/suggested-groups"
  || route.path === "/joined_groups"
  || route.path === "/create-group"
  || route.path.startsWith("/g/")
  || route.path.startsWith("/group-setting/")

const isPagesRoute = () =>
  route.path === "/pages"
  || route.path === "/suggested-pages"
  || route.path === "/liked-pages"
  || route.path === "/create-page"
  || route.path.startsWith("/p/")
  || route.path.startsWith("/page-setting/")

const isItemActive = (to: string) => {
  const normalized = to.split("#")[0]
  if (normalized === "/") return route.path === "/" || route.path === "/home"
  if (normalized === "/products") return isMarketplaceRoute()
  if (normalized === "/events") return isEventsRoute()
  if (normalized === "/groups") return isGroupsRoute()
  if (normalized === "/pages") return isPagesRoute()
  return route.path === normalized
}
</script>
