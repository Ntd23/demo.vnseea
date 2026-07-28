<!-- English description: Renders the authenticated left navigation sidebar for feed and discovery routes. -->
<template>
  <div class="left-sidebar">
    <nav class="left-sidebar__nav scrollbar-hide">
      <div class="left-sidebar__items">
        <div class="left-sidebar__feed-row">
          <NavigationSidebarMenuItem
            :to="sidebarNav[0].to"
            :label="$t(sidebarNav[0].label)"
            :icon="sidebarNav[0].icon"
            :active="isItemActive(sidebarNav[0].to)"
          />

          <UPopover
            v-model:open="isFeedFilterOpen"
            :content="{ side: 'right', align: 'start', sideOffset: 8 }"
          >
            <button
              class="left-sidebar__feed-filter"
              :class="{ 'left-sidebar__feed-filter--active': activeFeedOrder === 'following' || isFeedFilterOpen }"
              type="button"
              :aria-label="$t('pages.homeFeedPage.orderTitle')"
              :aria-expanded="isFeedFilterOpen"
              @click.stop
            >
              <Icon name="i-ph-sliders-horizontal-bold" class="h-3.5 w-3.5" />
            </button>

            <template #content>
              <div class="left-sidebar__feed-filter-panel">
                <button
                  v-for="option in feedOrderOptions"
                  :key="option.key"
                  class="left-sidebar__feed-filter-option"
                  :class="{ 'left-sidebar__feed-filter-option--active': activeFeedOrder === option.key }"
                  type="button"
                  @click="selectFeedOrder(option.key)"
                >
                  <span class="left-sidebar__feed-filter-copy">
                    <strong>{{ option.label }}</strong>
                    <small>{{ option.description }}</small>
                  </span>
                  <Icon
                    v-if="activeFeedOrder === option.key"
                    name="i-ph-check-circle-fill"
                    class="left-sidebar__feed-filter-check"
                  />
                </button>
              </div>
            </template>
          </UPopover>
        </div>

        <NavigationSidebarMenuItem
          v-for="item in sidebarNav.slice(1)"
          :key="item.label"
          :to="item.to"
          :label="$t(item.label)"
          :icon="item.icon"
          :active="isItemActive(item.to)"
        />

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

      <button
        class="left-sidebar__toggle"
        type="button"
        @click="expanded = !expanded"
      >
        <span class="left-sidebar__toggle-icon">
          <Icon
            :name="expanded ? 'i-ph-caret-up-bold' : 'i-ph-caret-down-bold'"
            class="h-3.5 w-3.5"
          />
        </span>

        <span class="left-sidebar__toggle-label">
          {{ expanded ? $t('navigation.leftSidebar.showLess') : $t('navigation.leftSidebar.showMore') }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import {
  type HomeFeedOrderKey,
  useHomeFeedOrder,
} from "../../../feed/application/composables/useHomeFeedOrder"
import NavigationSidebarMenuItem from './SidebarMenuItem.vue'

const route = useRoute()
const { t } = useI18n()
const expanded = ref(false)
const isFeedFilterOpen = ref(false)
const activeFeedOrder = useHomeFeedOrder()

const feedOrderOptions = computed(() => [
  {
    key: "all" as const,
    label: t("pages.homeFeedPage.orders.allLabel"),
    description: t("pages.homeFeedPage.orders.allDescription"),
  },
  {
    key: "following" as const,
    label: t("pages.homeFeedPage.orders.followingLabel"),
    description: t("pages.homeFeedPage.orders.followingDescription"),
  },
])

const sidebarNav = [
  { label: 'navigation.leftSidebar.items.feed', icon: 'i-ph-house-simple-fill', to: '/' },
  { label: 'navigation.leftSidebar.items.searchNearby', icon: 'i-ph-map-pin-fill', to: appRoutes.searchNearby },
  { label: 'navigation.leftSidebar.items.marketplace', icon: 'i-ph-storefront-fill', to: '/products' },
  { label: 'navigation.leftSidebar.items.wallet', icon: 'i-ph-wallet-fill', to: '/wallet' },
  { label: 'navigation.leftSidebar.items.myPages', icon: 'i-ph-file-text-fill', to: '/pages' },
  { label: 'navigation.leftSidebar.items.myGroups', icon: 'i-ph-users-three-fill', to: '/groups' },
  { label: 'navigation.leftSidebar.items.jobs', icon: 'i-ph-briefcase-fill', to: '/jobs' },
  { label: 'navigation.leftSidebar.items.photos', icon: 'i-ph-images-fill', to: '/photos' },
  { label: 'navigation.leftSidebar.items.watch', icon: 'i-ph-play-circle-fill', to: '/watch' },
  { label: 'navigation.leftSidebar.items.reels', icon: 'i-ph-film-strip-fill', to: '/reels' },
  { label: 'navigation.leftSidebar.items.savedPosts', icon: 'i-ph-clock-counter-clockwise-fill', to: appRoutes.activity },
  { label: 'navigation.leftSidebar.items.popularPosts', icon: 'i-ph-fire-fill', to: '/popular' },
  { label: 'navigation.leftSidebar.items.memories', icon: 'i-ph-clock-counter-clockwise-fill', to: '/memories' },
  { label: 'navigation.leftSidebar.items.poke', icon: 'i-ph-hand-waving-fill', to: '/poke' },
]

const sidebarNavMore = [
  { label: 'navigation.leftSidebar.items.blog', icon: 'i-ph-newspaper-fill', to: '/blogs' },
  { label: 'navigation.leftSidebar.items.directory', icon: 'i-ph-squares-four-fill', to: '/directory' },
  { label: 'navigation.leftSidebar.items.events', icon: 'i-ph-calendar-dots-fill', to: '/events' },
  { label: 'navigation.leftSidebar.items.offers', icon: 'i-ph-tag-chevron-fill', to: appRoutes.offers },
  { label: 'navigation.leftSidebar.items.live', icon: 'i-ph-broadcast-fill', to: '/live' },
  { label: 'navigation.leftSidebar.items.forum', icon: 'i-ph-chats-circle-fill', to: '/forum' },
  { label: 'navigation.leftSidebar.items.movies', icon: 'i-ph-popcorn-fill', to: '/movies' },
  // { label: 'navigation.leftSidebar.items.games', icon: 'i-ph-game-controller-fill', to: '/games' },
  // { label: 'navigation.leftSidebar.items.goPro', icon: 'i-ph-crown-simple-fill', to: '/go-pro' },
  { label: 'navigation.leftSidebar.items.funding', icon: 'i-ph-hand-heart-fill', to: '/funding' }
]

const isMarketplaceRoute = () =>
  route.path === '/products'
  || route.path === '/new-product'
  || route.path === '/my-products'
  || route.path.startsWith('/edit-product/')
  || route.path.startsWith('/order/')
  || route.path.startsWith('/customer_order/')
  || route.path === '/checkout'
  || route.path === '/orders'

const isEventsRoute = () =>
  route.path === '/events'
  || route.path.startsWith('/events/')

const isOffersRoute = () =>
  route.path === appRoutes.offers

const isGroupsRoute = () =>
  route.path === '/groups'
  || route.path === '/suggested-groups'
  || route.path === '/joined_groups'
  || route.path === '/create-group'
  || route.path.startsWith('/g/')
  || route.path.startsWith('/group-setting/')

const isPagesRoute = () =>
  route.path === '/pages'
  || route.path === '/suggested-pages'
  || route.path === '/liked-pages'
  || route.path === '/create-page'
  || route.path.startsWith('/p/')
  || route.path.startsWith('/page-setting/')

const isItemActive = (to: string) => {
  const normalized = to.split('#')[0]

  if (normalized === '/') return route.path === '/' || route.path === '/home'
  if (normalized === '/products') return isMarketplaceRoute()
  if (normalized === '/events') return isEventsRoute()
  if (normalized === appRoutes.offers) return isOffersRoute()
  if (normalized === '/groups') return isGroupsRoute()
  if (normalized === '/pages') return isPagesRoute()

  return route.path === normalized
}

async function selectFeedOrder(order: HomeFeedOrderKey) {
  activeFeedOrder.value = order
  isFeedFilterOpen.value = false

  if (route.path !== appRoutes.home && route.path !== appRoutes.feed) {
    await navigateTo(appRoutes.home)
  }
}
</script>

<style scoped>
.left-sidebar {
  min-width: 0;
  height: 100%;
}

@media (min-width: 1280px) {
  .left-sidebar {
    display: flex;
    height: 100%;
    max-height: 100%;
    flex-direction: column;
    padding: 16px 12px;
  }
}

.left-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (min-width: 1280px) {
  .left-sidebar__nav {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: 32px; /* Add extra spacing at the bottom to easily scroll past the toggle button */
  }
}

.left-sidebar__items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.left-sidebar__feed-row {
  position: relative;
}

.left-sidebar__feed-row :deep(.sidebar-item) {
  gap: 8px;
  padding-right: 36px;
}

.left-sidebar__feed-row :deep(.sidebar-item__icon) {
  width: 28px;
  height: 28px;
}

.left-sidebar__feed-filter {
  position: absolute;
  top: 50%;
  right: 7px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  transform: translateY(-50%);
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.left-sidebar__feed-filter:hover,
.left-sidebar__feed-filter--active {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 8%, var(--bg-surface));
  color: var(--bg-brand);
}

.left-sidebar__feed-filter-panel {
  display: grid;
  width: min(340px, calc(100vw - 32px));
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  padding: 10px;
  box-shadow: var(--shadow-lg);
}

.left-sidebar__feed-filter-option {
  display: flex;
  width: 100%;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-muted);
  padding: 14px 16px;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.left-sidebar__feed-filter-option:hover,
.left-sidebar__feed-filter-option--active {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
}

.left-sidebar__feed-filter-copy {
  display: grid;
  gap: 4px;
}

.left-sidebar__feed-filter-copy strong {
  font-size: 15px;
  font-weight: 750;
}

.left-sidebar__feed-filter-copy small {
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary);
}

.left-sidebar__feed-filter-check {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  color: var(--bg-brand);
}

.left-sidebar__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  margin-top: 4px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.left-sidebar__toggle:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
}

.left-sidebar__toggle-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.left-sidebar__toggle:hover .left-sidebar__toggle-icon {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.left-sidebar__toggle-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.left-sidebar__toggle:hover .left-sidebar__toggle-label {
  color: var(--bg-brand);
}

.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
