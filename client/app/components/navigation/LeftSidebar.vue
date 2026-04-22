<template>
  <div class="min-w-0">
    <nav class="space-y-0.5">
      <NuxtLink
        v-for="item in sidebarNav"
        :key="item.label"
        :to="item.to"
        class="group flex min-w-0 items-center gap-2.5 rounded-[12px] px-2.5 py-2 transition duration-150"
        :class="isActive(item.to)
          ? 'bg-[#0000ff]/8 text-[#0000ff]'
          : 'text-slate-600 hover:bg-[#0000ff]/5 hover:text-[#0000ff]'"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition duration-150"
          :class="isActive(item.to)
            ? 'bg-[#0000ff] text-white shadow-[0_4px_10px_rgba(0,0,255,0.22)]'
            : 'bg-[#0000ff]/6 text-[#0000ff]/70 group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]'"
        >
          <Icon :name="item.icon" class="h-4 w-4" />
        </span>
        <span class="truncate text-[13px] font-medium leading-tight">
          {{ $t(item.label) }}
        </span>
      </NuxtLink>

      <!-- Expandable section -->
      <template v-if="expanded">
        <NuxtLink
          v-for="item in sidebarNavMore"
          :key="item.label"
          :to="item.to"
          class="group flex min-w-0 items-center gap-2.5 rounded-[12px] px-2.5 py-2 transition duration-150"
          :class="isActive(item.to)
            ? 'bg-[#0000ff]/8 text-[#0000ff]'
            : 'text-slate-600 hover:bg-[#0000ff]/5 hover:text-[#0000ff]'"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition duration-150"
            :class="isActive(item.to)
              ? 'bg-[#0000ff] text-white shadow-[0_4px_10px_rgba(0,0,255,0.22)]'
              : 'bg-[#0000ff]/6 text-[#0000ff]/60 group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]'"
          >
            <Icon :name="item.icon" class="h-4 w-4" />
          </span>
          <span class="truncate text-[13px] font-medium leading-tight">
            {{ $t(item.label) }}
          </span>
        </NuxtLink>
      </template>

      <!-- Xem thêm / Ẩn bớt -->
      <button
        class="group flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-slate-500 transition duration-150 hover:bg-[#0000ff]/5 hover:text-[#0000ff]"
        type="button"
        @click="expanded = !expanded"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0000ff]/6 text-[#0000ff]/60 transition group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]"
        >
          <Icon
            :name="expanded ? 'i-ph-caret-up' : 'i-ph-caret-down'"
            class="h-4 w-4"
          />
        </span>
        <span class="text-[13px] font-medium">
          {{ expanded ? $t('navigation.leftSidebar.showLess') : $t('navigation.leftSidebar.showMore') }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const expanded = ref(false)

const sidebarNav = [
  { label: "navigation.leftSidebar.items.feed", icon: "i-ph-house-simple", to: "/" },
  { label: "navigation.leftSidebar.items.photos", icon: "i-ph-images", to: "/photos" },
  { label: "navigation.leftSidebar.items.watch", icon: "i-ph-play-circle", to: "/watch" },
  { label: "navigation.leftSidebar.items.reels", icon: "i-ph-film-strip", to: "/reels" },
  { label: "navigation.leftSidebar.items.savedPosts", icon: "i-ph-bookmark-simple", to: "/saved-posts" },
  { label: "navigation.leftSidebar.items.popularPosts", icon: "i-ph-fire", to: "/popular" },
  { label: "navigation.leftSidebar.items.memories", icon: "i-ph-clock-counter-clockwise", to: "/memories" },
  { label: "navigation.leftSidebar.items.poke", icon: "i-ph-hand-waving", to: "/poke" },
  { label: "navigation.leftSidebar.items.myGroups", icon: "i-ph-users-three", to: "/groups" },
  { label: "navigation.leftSidebar.items.myPages", icon: "i-ph-file-text", to: "/pages" },
]

const sidebarNavMore = [
  { label: "navigation.leftSidebar.items.blog", icon: "i-ph-newspaper", to: "/blogs" },
  { label: "navigation.leftSidebar.items.marketplace", icon: "i-ph-storefront", to: "/products" },
  { label: "navigation.leftSidebar.items.directory", icon: "i-ph-squares-four", to: "/directory" },
  { label: "navigation.leftSidebar.items.events", icon: "i-ph-calendar-dots", to: "/events" },
  { label: "navigation.leftSidebar.items.live", icon: "i-ph-broadcast", to: "/live" },
  { label: "navigation.leftSidebar.items.forum", icon: "i-ph-chats-circle", to: "/forum" },
  { label: "navigation.leftSidebar.items.movies", icon: "i-ph-popcorn", to: "/movies" },
  { label: "navigation.leftSidebar.items.jobs", icon: "i-ph-briefcase", to: "/jobs" },
  { label: "navigation.leftSidebar.items.deals", icon: "i-ph-tag", to: "/deals" },
  { label: "navigation.leftSidebar.items.findFriends", icon: "i-ph-user-plus", to: "/find-friends" },
  { label: "navigation.leftSidebar.items.games", icon: "i-ph-game-controller", to: "/games" },
  { label: "navigation.leftSidebar.items.goPro", icon: "i-ph-crown-simple", to: "/go-pro" },
  { label: "navigation.leftSidebar.items.wallet", icon: "i-ph-wallet", to: "/wallet" },
  { label: "navigation.leftSidebar.items.withdrawal", icon: "i-ph-money-wavy", to: "/withdrawal" },
  { label: "navigation.leftSidebar.items.trending", icon: "i-ph-trend-up", to: "/trending" },
  { label: "navigation.leftSidebar.items.funding", icon: "i-ph-hand-heart", to: "/funding" },
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

const isActive = (to: string) => {
  const normalized = to.split("#")[0]
  if (normalized === "/products") return isMarketplaceRoute()
  if (normalized === "/events") return isEventsRoute()
  if (normalized === "/groups") return isGroupsRoute()
  if (normalized === "/pages") return isPagesRoute()
  return route.path === normalized
}
</script>
