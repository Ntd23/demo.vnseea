<!-- English description: Responsive global header with search, counters, notifications, and account controls. -->

<template>
  <header
    class="sticky top-0 z-[100] transition-transform duration-100"
    :class="{ 'header-bar--hidden': isHeaderHidden }"
  >
    <!-- ─── Desktop header ────────────────────────────────── -->
    <div class="hidden rounded-b-3xl border border-[var(--border-light)] bg-[var(--bg-surface)] px-[7.5] shadow-[var(--shadow-sm)] xl:block">
      <div class="mx-auto flex h-16 w-full max-w-[1880px] items-center gap-4 px-2.5">
        <NuxtLink
          :to="appRoutes.feed"
          class="header-home-link"
          :aria-label="$t('navigation.headerBar.home')"
          @click="handleHomeClick"
        >
          <div
            v-if="headerLogoUrl && !logoFailed"
            class="header-home-logo header-home-logo--desktop"
          >
            <img
              :src="headerLogoUrl"
              :alt="logoAlt"
              @error="logoFailed = true"
            >
          </div>
          <span v-else class="header-home-logo-fallback">{{ brandName || "VNSEEA" }}</span>
        </NuxtLink>

        <!-- Search -->
        <div class="min-w-0 max-w-195 flex-1">
          <NavigationHeaderSearchInput />
        </div>

        <!-- Right actions -->
        <div class="ml-auto flex shrink-0 items-center gap-2">

          <div class="notification-popover-root">
            <!-- <button
              class="header-action-btn"
              :class="createMenuOpen ? 'header-action-btn--active' : ''"
              type="button"
              :aria-expanded="createMenuOpen"
              aria-label="Tạo"
              @click="toggleCreateMenu"
            >
              <Icon name="i-ph-plus-circle-duotone" class="h-4.5 w-4.5" />
            </button> -->

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div v-if="createMenuOpen" class="create-menu-popover">
                <NuxtLink
                  v-for="item in createActions"
                  :key="item.id"
                  :to="item.to"
                  class="create-menu-item"
                  @click="createMenuOpen = false"
                >
                  <span class="create-menu-item__icon" :style="{ color: item.color }">
                    <Icon :name="item.icon" class="h-7 w-7" />
                  </span>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <div class="notification-popover-root">
            <!-- <button
              class="header-action-btn"
              type="button"
              :aria-label="$t('navigation.headerBar.friendRequests')"
              @click="toggleRequests"
            >
              <Icon name="i-ph-user-plus-duotone" class="h-4.5 w-4.5" />
              <span v-if="isClientReady && requestCount > 0" class="header-action-badge">
                {{ requestCount }}
              </span>
            </button> -->

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <HeaderRequestsDropdown
                v-if="requestsOpen"
                class="notification-popover"
                @navigate="requestsOpen = false"
              />
            </Transition>
          </div>

          <NuxtLink
            :to="appRoutes.messages"
            class="header-action-btn"
            :class="route.path === appRoutes.messages ? 'header-action-btn--active' : ''"
            :aria-label="$t('navigation.headerBar.messages')"
          >
            <Icon
              :name="route.path === appRoutes.messages ? 'i-ph-chat-circle-dots-bold' : 'i-ph-chat-circle-dots-bold'"
              class="h-[25px] w-[25px]"
            />
            <span v-if="isClientReady && navigationSummary.messageCount > 0" class="header-action-badge">
              {{ navigationSummary.messageCount }}
            </span>
          </NuxtLink>

          <div class="notification-popover-root">
            <button
              class="header-action-btn"
              type="button"
              :aria-label="$t('navigation.headerBar.notifications')"
              @click="toggleNotifications"
            >
              <Icon name="i-ph-bell-bold" class="h-[25px] w-[25px]" />
              <span v-if="isClientReady && notificationCount > 0" class="header-action-badge">
                {{ notificationCount }}
              </span>
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <NotificationDropdown
                v-if="notificationOpen"
                class="notification-popover"
                @navigate="notificationOpen = false"
              />
            </Transition>
          </div>

        	<ClientOnly>
  <NavigationHeaderUserMenu />

  <template #fallback>
    <div class="h-[38px] w-[156px] rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)]"></div>
  </template>
</ClientOnly>
        
        </div>
      </div>
    </div>

    <!-- ─── Mobile bar ────────────────────────────────────── -->
    <div class="mobile-bar xl:hidden rounded-b-3xl">
      <div class="mobile-bar__inner">
        <!-- LEFT GROUP: Home + Search -->
        <div class="mobile-bar__group">
          <NuxtLink
            :to="appRoutes.feed"
            class="mobile-home-link"
            :aria-label="$t('navigation.headerBar.home')"
            @click="handleHomeClick"
          >
            <div
              v-if="headerLogoUrl && !logoFailed"
              class="header-home-logo header-home-logo--mobile"
            >
              <img
                :src="headerLogoUrl"
                :alt="logoAlt"
                @error="logoFailed = true"
              >
            </div>
            <span v-else class="header-home-logo-fallback header-home-logo-fallback--mobile">
              {{ brandName || "VNSEEA" }}
            </span>
          </NuxtLink>

          <button
            class="mobile-icon-btn"
            :class="mobileSearchOpen ? 'mobile-icon-btn--active' : ''"
            type="button"
            :aria-label="$t('navigation.headerBar.search')"
            @click="toggleMobileSearch"
          >
            <Icon name="i-ph-magnifying-glass-bold" class="h-[20px] w-[20px]" />
          </button>

          <!-- <button
            class="mobile-icon-btn"
            :class="createMenuOpen ? 'mobile-icon-btn--active' : ''"
            type="button"
            :aria-expanded="createMenuOpen"
            aria-label="Tạo"
            @click="toggleCreateMenu"
          >
            <Icon name="i-ph-plus-bold" class="h-[20px] w-[20px]" />
          </button> -->
        </div>

        <!-- RIGHT GROUP: Locale + Avatar -->
        <div class="mobile-bar__group">

          <!-- <button
            class="mobile-icon-btn"
            :class="requestsOpen ? 'mobile-icon-btn--active' : ''"
            type="button"
            :aria-label="$t('navigation.headerBar.friendRequests')"
            @click="toggleRequests"
          >
            <Icon name="i-ph-user-plus-duotone" class="h-[20px] w-[20px]" />
            <span v-if="isClientReady && requestCount > 0" class="header-action-badge">
              {{ requestCount }}
            </span>
          </button> -->
          <NuxtLink
            :to="appRoutes.messages"
            class="mobile-icon-btn"
            :class="route.path === appRoutes.messages ? 'mobile-icon-btn--active' : ''"
            :aria-label="$t('navigation.headerBar.messages')"
          >
             <Icon name="i-ph-chat-circle-dots-bold" class="h-[20px] w-[20px]" />
            <span v-if="isClientReady && navigationSummary.messageCount > 0" class="header-action-badge">
              {{ navigationSummary.messageCount }}
            </span>
          </NuxtLink>

          <button
            class="mobile-icon-btn"
            type="button"
            :aria-label="$t('navigation.headerBar.notifications')"
            @click="toggleNotifications"
          >
             <Icon name="i-ph-bell-bold" class="h-[20px] w-[20px]" />
            <span v-if="isClientReady && notificationCount > 0" class="header-action-badge">
              {{ notificationCount }}
            </span>
          </button>

          <ClientOnly>
  <button
    class="mobile-icon-btn mobile-icon-btn--avatar"
    type="button"
    :aria-label="$t('navigation.headerBar.account')"
    @click="mobileMenuOpen = true"
  >
    <NuxtImg
      v-if="avatarUrl"
      :src="avatarUrl"
      :alt="currentUser?.name || 'User'"
      class="h-[20px] w-[20px] rounded-full object-cover"
      width="20"
      height="20"
    />
    <span v-else class="mobile-avatar-fallback">{{ currentUserInitials }}</span>
  </button>

  <template v-slot:fallback>
    <button
      class="mobile-icon-btn mobile-icon-btn--avatar"
      type="button"
      :aria-label="$t('navigation.headerBar.account')"
      disabled
    >
      <span class="mobile-avatar-fallback">U</span>
    </button>
  </template>
</ClientOnly>
        </div>
      </div>
    </div>

    <!-- ─── Mobile search — drops right below header ──────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileSearchOpen" class="mobile-search xl:hidden">
        <NavigationHeaderSearchInput autofocus />
        <button
          class="mobile-search__close"
          type="button"
          :aria-label="$t('navigation.headerBar.closeSearch')"
          @click="mobileSearchOpen = false"
        >
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </button>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="notificationOpen" class="mobile-notification-panel xl:hidden">
        <NotificationDropdown @navigate="notificationOpen = false" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="requestsOpen" class="mobile-requests-panel xl:hidden">
        <HeaderRequestsDropdown @navigate="requestsOpen = false" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="createMenuOpen" class="mobile-create-panel xl:hidden">
        <div class="create-menu-popover create-menu-popover--mobile">
          <NuxtLink
            v-for="item in createActions"
            :key="item.id"
            :to="item.to"
            class="create-menu-item"
            @click="createMenuOpen = false"
          >
            <span class="create-menu-item__icon" :style="{ color: item.color }">
              <Icon :name="item.icon" class="h-7 w-7" />
            </span>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Mobile menu drawer -->
  <ClientOnly>
    <NavigationMobileMenu
      v-model="mobileMenuOpen"
      @close="mobileMenuOpen = false"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { storeToRefs } from "pinia"
import { appRoutes } from '#shared-kernel/application/constants/route-registry'
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { useNotificationCenterStore } from "../../../notifications/application/stores/useNotificationCenterStore"
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"
import NotificationDropdown from "../../../notifications/presentation/components/NotificationDropdown.vue"
import { useHeaderNotificationSync } from "../../application/composables/useHeaderNotificationSync"
import { useNavigationGeneralStore } from "../../application/stores/useNavigationGeneralStore"
import { useNavigationRequestsStore } from "../../application/stores/useNavigationRequestsStore"
import NavigationHeaderSearchInput from './HeaderSearchInput.vue'
import HeaderRequestsDropdown from "./HeaderRequestsDropdown.vue"
import NavigationHeaderUserMenu from './HeaderUserMenu.vue'
import NavigationMobileMenu from './MobileMenu.vue'

const currentAuthUserStore = useCurrentAuthUserStore()
const siteBrandingStore = useSiteBrandingStore()
const navigationGeneralStore = useNavigationGeneralStore()
const navigationRequestsStore = useNavigationRequestsStore()
const notificationCenterStore = useNotificationCenterStore()
const headerNotificationSync = useHeaderNotificationSync()
const { branding } = storeToRefs(siteBrandingStore)
const backendSession = useCookie<string | null>("user_id", {
  default: () => null,
  sameSite: "lax",
  path: "/",
})

// await callOnce("current-auth-user", () => currentAuthUserStore.hydrate())

// if (backendSession.value) {
//   await callOnce("navigation-general", () => navigationGeneralStore.hydrate())
//   await callOnce("notification-center", () => notificationCenterStore.hydrate())
// }

const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)
const notificationOpen = ref(false)
const requestsOpen = ref(false)
const createMenuOpen = ref(false)
const isClientReady = ref(false)
const logoFailed = ref(false)
const route = useRoute()
const router = useRouter()
const homeLoadingIndicator = useLoadingIndicator()
const createActions = [
  {
    id: "ads",
    label: "Tạo quảng cáo",
    to: appRoutes.adsCreate,
    icon: "i-ph-currency-circle-dollar-bold",
    color: "var(--color-warning)",
  },
  {
    id: "blog",
    label: "Tạo bài viết",
    to: appRoutes.createBlog,
    icon: "i-ph-article-bold",
    color: "var(--color-info)",
  },
  {
    id: "event",
    label: "Tạo sự kiện",
    to: appRoutes.createEvent,
    icon: "i-ph-calendar-plus-bold",
    color: "var(--color-primary-500)",
  },
  {
    id: "group",
    label: "Tạo nhóm",
    to: appRoutes.createGroup,
    icon: "i-ph-users-three-bold",
    color: "var(--color-info)",
  },
  {
    id: "page",
    label: "Tạo trang",
    to: appRoutes.createPage,
    icon: "i-ph-flag-bold",
    color: "var(--color-warning)",
  },
] as const
const brandName = computed(() => branding.value.siteName || branding.value.siteTitle)
const headerLogoUrl = computed(() => branding.value.logoUrl || branding.value.nightLogoUrl || branding.value.faviconUrl)
const logoAlt = computed(() => brandName.value ? `${brandName.value} logo` : "Site logo")
const currentUser = computed(() => currentAuthUserStore.user)
const navigationSummary = computed(() => navigationGeneralStore.summary)
const requestCount = computed(() => navigationSummary.value.friendRequestCount + navigationSummary.value.groupChatRequestCount)
const notificationCount = computed(() =>
  notificationCenterStore.hydrated
    ? notificationCenterStore.unreadCount
    : navigationSummary.value.notificationCount,
)
const avatarUrl = computed(() =>
  typeof currentUser.value?.avatarUrl === "string" && currentUser.value.avatarUrl.length > 0
    ? currentUser.value.avatarUrl
    : "",
)
const currentUserInitials = computed(() =>
  currentUser.value?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
  || "U",
)

const isHeaderHidden = ref(false)
const lastScrollY = ref(0)

function handleHomeClick(event: MouseEvent) {
  homeLoadingIndicator.start({ force: true })

  if (route.path !== appRoutes.feed) {
    return
  }

  event.preventDefault()
  router.go(0)
}

const handleScroll = () => {
  const currentScrollY = window.scrollY
  if (window.innerWidth >= 1280) {
    isHeaderHidden.value = false
    return
  }
  if (currentScrollY <= 10) {
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

watch(() => route.path, () => {
  mobileSearchOpen.value = false
  mobileMenuOpen.value = false
  notificationOpen.value = false
  requestsOpen.value = false
  createMenuOpen.value = false
})

watch(headerLogoUrl, () => {
  logoFailed.value = false
})

onMounted(async () => {
  isClientReady.value = true
  window.addEventListener("scroll", handleScroll, { passive: true })

  if (backendSession.value) {
    await currentAuthUserStore.hydrate(true)
    await navigationGeneralStore.hydrate()
    await notificationCenterStore.hydrate()
    void headerNotificationSync.startRealtime()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll)
  headerNotificationSync.stopRealtime()
})

async function toggleNotifications() {
  if (!backendSession.value) {
    await navigateTo(appRoutes.welcome)
    return
  }

  notificationOpen.value = !notificationOpen.value
  requestsOpen.value = false
  createMenuOpen.value = false

  if (notificationOpen.value) {
    await notificationCenterStore.hydrate(true)
  }
}

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value

  if (mobileSearchOpen.value) {
    createMenuOpen.value = false
    notificationOpen.value = false
    requestsOpen.value = false
  }
}

async function toggleRequests() {
  if (!backendSession.value) {
    await navigateTo(appRoutes.welcome)
    return
  }

  requestsOpen.value = !requestsOpen.value
  notificationOpen.value = false
  createMenuOpen.value = false

  if (requestsOpen.value) {
    await navigationRequestsStore.hydrate(true)
  }
}

async function toggleCreateMenu() {
  if (!backendSession.value) {
    await navigateTo(appRoutes.welcome)
    return
  }

  createMenuOpen.value = !createMenuOpen.value
  notificationOpen.value = false
  requestsOpen.value = false
  mobileSearchOpen.value = false
}
</script>

<style scoped>
/* ─── Desktop pill ─────────────────────────────────────── */
.desktop-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: var(--radius-full);
  padding: 0.45rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.15s ease;
}

.desktop-pill--active {
  background: var(--bg-brand);
  color: var(--color-on-brand);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--bg-brand) 22%, transparent);
}

.desktop-pill--inactive { color: var(--text-primary); }

.desktop-pill--inactive:hover {
  color: var(--bg-brand);
  background: var(--bg-surface-hover);
}

.header-home-link,
.mobile-home-link {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  color: inherit;
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default);
}

.header-home-link:hover,
.mobile-home-link:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.header-home-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-brand);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  transition: background-color var(--duration-fast) var(--ease-default);
}

.header-home-logo--desktop {
  height: 38px;
  padding: 0 14px;
}

.header-home-logo--mobile {
  height: 40px;
  padding: 0 6px;
}

.header-home-link:hover .header-home-logo,
.mobile-home-link:hover .header-home-logo {
  background: var(--bg-brand-hover);
}

.header-home-logo img {
  display: block;
  max-height: 24px;
  width: 100px;
  object-fit: contain;
}

.header-home-logo--mobile img {
  max-height: 22px;
}

.header-home-logo-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-brand);
  color: var(--color-on-brand);
  border-radius: var(--radius-md);
  font-size: var(--text-title);
  font-weight: var(--weight-bold);
  line-height: 1;
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 38px;
  padding: 0 14px;
}

.header-home-logo-fallback--mobile {
  height: 40px;
  padding: 0 12px;
  font-size: var(--text-caption);
}

/* ─── Desktop action buttons ───────────────────────────── */
.header-action-btn {
  position: relative;
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.header-action-btn:hover {
  border-color: var(--border-light);
  color: var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.header-action-btn--active {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.header-action-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  border: 2px solid var(--bg-surface);
  padding: 0 4px;
  font-size: 9px;
  font-weight: 800;
  color: var(--color-on-brand);
  line-height: 1;
}

.notification-popover-root {
  position: relative;
}

.notification-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 110;
}

.create-menu-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 110;
  display: grid;
  width: 250px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  padding: 10px;
  box-shadow: var(--shadow-xl);
}

.create-menu-popover::before {
  position: absolute;
  top: -7px;
  right: 24px;
  width: 14px;
  height: 14px;
  border-top: 1px solid var(--border-default);
  border-left: 1px solid var(--border-default);
  background: var(--bg-surface);
  content: "";
  transform: rotate(45deg);
}

.create-menu-popover--mobile {
  position: relative;
  top: auto;
  right: auto;
  width: 100%;
  max-width: none;
}

.create-menu-popover--mobile::before {
  display: none;
}

.create-menu-item {
  display: flex;
  min-height: 88px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s ease;
}

.create-menu-item:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  color: var(--bg-brand);
  transform: translateY(-1px);
}

.create-menu-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mobile-notification-panel,
.mobile-requests-panel,
.mobile-create-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 12px;
  right: 12px;
  z-index: 110;
}

.mobile-notification-panel :deep(.notification-dropdown) {
  width: 100%;
}

.mobile-requests-panel :deep(.header-requests-dropdown) {
  width: 100%;
}

/* ─── Mobile bar ───────────────────────────────────────── */
.mobile-bar {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--bg-brand) 4%, transparent);
  padding: 8px 16px;
}

/* Two-group layout: left flush, right flush */
.mobile-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-bar__group {
  display: flex;
  align-items: center;
}

/* Icon button base */
.mobile-icon-btn {
  position: relative;
  display: flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.mobile-icon-btn:hover {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.mobile-icon-btn--active {
  border-color: var(--border-light);
  background: var(--bg-brand);
  color: var(--color-on-brand);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 22%, transparent);
}

.mobile-icon-btn--avatar {
  background: var(--bg-surface);
}

.mobile-avatar-fallback {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-primary);
}

/* ─── Mobile search — inline, directly below header ───── */
.mobile-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 10px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--bg-brand) 6%, transparent);
}

.mobile-search :deep(> *:first-child) {
  flex: 1;
  min-width: 0;
}

.mobile-search__close {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.12s ease;
}

.mobile-search__close:hover {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  border-color: var(--border-light);
  color: var(--bg-brand);
}

@media (max-width: 1279.98px) {
  .header-bar--hidden {
    transform: translateY(-100%);
  }
}
</style>
