<template>
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[1000] xl:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-menu-title"
      >
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
          aria-label="Close mobile navigation"
          @click="handleOpenChange(false)"
        />

        <aside id="mobile-navigation-menu" class="absolute inset-y-0 right-0 z-10 flex h-full w-[85vw] max-w-[400px] flex-col overflow-hidden bg-white text-[var(--text-primary)] shadow-[-12px_0_40px_rgba(0,0,0,0.5)]">
        <!-- Decor Backgrounds -->
        <div class="pointer-events-none absolute left-0 top-0 z-0 h-px w-full bg-[var(--progress-gradient)]" />
        <div class="pointer-events-none absolute -right-24 -top-24 z-0 h-64 w-64 rounded-full bg-primary-100/80 blur-[100px]" />

        <!-- Header -->
        <div class="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-light)] bg-white/90 px-6 py-5 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-primary-600 p-2 shadow-lg shadow-primary-500/20">
              <Icon name="i-ph-list-bold" class="h-5 w-5 text-white" />
            </div>
            <span id="mobile-navigation-menu-title" class="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">{{ $t("navigation.mobileMenu.title") }}</span>
          </div>
          <button
            type="button"
            class="pressable focus-ring pressable flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary-50)] text-[var(--text-secondary)] transition-all shadow-none ring-1 ring-[var(--border-light)] hover:bg-[var(--color-primary-50)] hover:text-primary-600"
            :aria-label="$t('common.close')"
            @click="handleOpenChange(false)"
          >
            <Icon name="i-ph-x-bold" class="h-5 w-5" />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="relative z-10 flex-1 overflow-y-auto no-scrollbar">
          <!-- User Profile & Stats Panel -->
          <div class="p-6">
            <div class="relative overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-6 shadow-[var(--shadow-md)]">
              <div class="relative z-10 flex flex-col gap-5">
                <div class="flex items-center gap-4">
                  <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-0.5 shadow-xl shadow-primary-500/30">
                    <div class="flex h-full w-full items-center justify-center rounded-[14px] border border-[var(--border-light)] bg-white">
                      <span class="text-xs font-black text-primary-600">VN</span>
                    </div>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-base font-black tracking-tight text-[var(--text-primary)]">{{ $t("navigation.mobileMenu.adminTitle") }}</p>
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                      <p class="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Online Now</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <NuxtLink
                    to="/wallet"
                    class="group flex flex-col gap-2 rounded-2xl border border-[var(--border-light)] bg-white p-4 transition-all hover:bg-[var(--color-primary-50)]"
                    @click="handleOpenChange(false)"
                  >
                    <Icon name="i-ph-wallet-duotone" class="h-5 w-5 text-primary-600 transition-transform group-hover:scale-110" />
                    <p class="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Balance</p>
                    <p class="truncate text-xs font-black text-[var(--text-primary)]">VND 9.9B</p>
                  </NuxtLink>
                  <div class="group flex flex-col gap-2 rounded-2xl border border-[var(--border-light)] bg-white p-4 transition-all hover:bg-[var(--color-primary-50)]">
                    <Icon name="i-ph-fire-duotone" class="h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />
                    <p class="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Points</p>
                    <p class="text-xs font-black text-[var(--text-primary)]">50 XP</p>
                  </div>
                </div>

                <div class="pt-2">
                  <NavigationLocaleSwitcher />
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Groups -->
          <div class="space-y-8 px-4 pb-12">
            <!-- Main Nav -->
            <div>
              <p class="mb-4 pl-4 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Navigation</p>
              <div class="space-y-1">
                <NuxtLink
                  v-for="item in mainNav"
                  :key="`${item.label}-${item.to}`"
                  :to="item.to"
                  class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:bg-[var(--color-primary-50)]"
                  :class="isNavItemActive(item.to) ? 'bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary-100)]' : ''"
                  @click="handleOpenChange(false)"
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-light)] bg-white transition-all group-hover:border-primary-200 group-hover:bg-white"
                    :class="isNavItemActive(item.to) ? 'border-primary-200 bg-white' : ''"
                  >
                    <Icon
                      :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')"
                      class="h-5 w-5 text-[var(--icon-primary)] group-hover:text-primary-600"
                      :class="isNavItemActive(item.to) ? 'text-primary-600' : ''"
                    />
                  </div>
                  <span
                    class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                    :class="isNavItemActive(item.to) ? 'text-primary-600' : ''"
                  >{{ $t(item.label) }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Settings -->
            <div class="border-t border-[var(--border-light)] pt-4">
              <p class="mb-4 pl-4 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Settings & Care</p>
              <div class="space-y-1">
                <NuxtLink
                  v-for="item in settingsNav"
                  :key="item.label"
                  :to="item.to"
                  class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:bg-[var(--color-primary-50)]"
                  :class="item.label.includes('logout') ? 'hover:bg-rose-50' : (isNavItemActive(item.to) ? 'bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary-100)]' : '')"
                  @click="handleOpenChange(false)"
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-light)] bg-white text-[var(--icon-primary)] transition-all"
                    :class="item.label.includes('logout') ? 'group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:text-rose-500' : (isNavItemActive(item.to) ? 'border-primary-200 bg-white text-primary-600' : 'group-hover:border-primary-200 group-hover:bg-white group-hover:text-primary-600')"
                  >
                    <Icon
                      :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')"
                      class="h-5 w-5"
                      :class="item.label.includes('logout') ? 'text-current' : (!item.label.includes('logout') && isNavItemActive(item.to) ? 'text-primary-600' : 'text-current')"
                    />
                  </div>
                  <span
                    class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]"
                    :class="item.label.includes('logout') ? 'group-hover:text-rose-500' : (isNavItemActive(item.to) ? 'text-primary-600' : 'group-hover:text-[var(--text-primary)]')"
                  >{{ $t(item.label) }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Bottom Actions -->
            <div class="grid grid-cols-3 gap-2 border-t border-[var(--border-light)] pt-4">
              <UButton
                v-for="item in bottomActions"
                :key="item.label"
                variant="soft"
                color="neutral"
                class="group flex h-auto flex-col items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white p-4 transition-all shadow-none ring-0 hover:bg-[var(--color-primary-50)]"
              >
                <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5 w-5 text-[var(--icon-primary)] group-hover:text-primary-600" />
                <span class="text-center text-[8px] font-black uppercase leading-tight tracking-widest text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">{{ $t(item.label) }}</span>
              </UButton>
            </div>
          </div>
        </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const route = useRoute()
const modelValue = defineModel<boolean>({ default: false })
const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  close: []
  "update:open": [value: boolean]
}>()

const controlledOpen = computed(() => props.open ?? modelValue.value)

const drawerOpen = computed(() => Boolean(controlledOpen.value))

function isNavItemActive(to: string) {
  const normalized = to.split("?")[0].split("#")[0]

  if (normalized === "/home") return route.path === "/" || route.path === "/home"
  if (normalized === "/products") return route.path === "/products" || route.path === "/my-products" || route.path === "/new-product" || route.path.startsWith("/edit-product/")
  if (normalized === "/events") return route.path === "/events" || route.path.startsWith("/events/")
  if (normalized === "/groups") return route.path === "/groups" || route.path === "/suggested-groups" || route.path === "/joined_groups" || route.path === "/create-group" || route.path.startsWith("/g/") || route.path.startsWith("/group-setting/")
  if (normalized === "/pages") return route.path === "/pages" || route.path === "/suggested-pages" || route.path === "/liked-pages" || route.path === "/create-page" || route.path.startsWith("/p/") || route.path.startsWith("/page-setting/")
  if (to.includes("mine=1")) return route.path === "/blogs" && route.query.mine === "1"

  return route.path === normalized
}

function handleOpenChange(value: boolean) {
  modelValue.value = value
  emit("update:open", value)

  if (!value) {
    emit("close")
  }
}

const mainNav = [
  { label: "navigation.mobileMenu.mainNav.search", icon: "i-ph-magnifying-glass", to: "/search" },
  { label: "navigation.mobileMenu.mainNav.pages", icon: "i-ph-flag", to: "/pages" },
  { label: "navigation.mobileMenu.mainNav.myProducts", icon: "i-ph-package", to: "/my-products" },
  { label: "navigation.mobileMenu.mainNav.marketplace", icon: "i-ph-storefront", to: "/products" },
  { label: "navigation.mobileMenu.mainNav.blog", icon: "i-ph-newspaper", to: "/blogs" },
  { label: "navigation.mobileMenu.mainNav.createBlog", icon: "i-ph-pencil-simple-line", to: "/create-blog" },
  { label: "navigation.mobileMenu.mainNav.myArticles", icon: "i-ph-article", to: "/blogs?mine=1" },
  { label: "navigation.mobileMenu.mainNav.movies", icon: "i-ph-film-strip", to: "/movies" },
  { label: "navigation.mobileMenu.mainNav.events", icon: "i-ph-calendar-blank", to: "/events" },
  { label: "navigation.mobileMenu.mainNav.createEvent", icon: "i-ph-calendar-plus", to: "/events/create-event" },
  { label: "navigation.mobileMenu.mainNav.live", icon: "i-ph-broadcast", to: "/live" },
  { label: "navigation.mobileMenu.mainNav.myGroups", icon: "i-ph-users-three", to: "/groups" },
  { label: "navigation.mobileMenu.mainNav.forum", icon: "i-ph-chats-circle", to: "/forum" },
  { label: "navigation.mobileMenu.mainNav.photos", icon: "i-ph-images", to: "/photos" },
  { label: "navigation.mobileMenu.mainNav.watch", icon: "i-ph-play-circle", to: "/watch" },
  { label: "navigation.mobileMenu.mainNav.savedPosts", icon: "i-ph-bookmark-simple", to: "/saved-posts" },
  { label: "navigation.mobileMenu.mainNav.poke", icon: "i-ph-hand-waving", to: "/poke" },
  { label: "navigation.mobileMenu.mainNav.explore", icon: "i-ph-compass", to: "/explore" },
  { label: "navigation.mobileMenu.mainNav.popularPosts", icon: "i-ph-fire", to: "/popular" },
  { label: "navigation.mobileMenu.mainNav.games", icon: "i-ph-game-controller", to: "/games" },
  { label: "navigation.mobileMenu.mainNav.jobs", icon: "i-ph-briefcase", to: "/jobs" },
  { label: "navigation.mobileMenu.mainNav.goPro", icon: "i-ph-crown-simple", to: "/go-pro" },
  { label: "navigation.mobileMenu.mainNav.wallet", icon: "i-ph-wallet", to: "/wallet" },
  { label: "navigation.mobileMenu.mainNav.withdrawal", icon: "i-ph-money-wavy", to: "/withdrawal" },
  { label: "navigation.mobileMenu.mainNav.directory", icon: "i-ph-squares-four", to: "/directory" },
  { label: "navigation.mobileMenu.mainNav.funding", icon: "i-ph-hand-heart", to: "/funding" },
  { label: "navigation.mobileMenu.mainNav.memories", icon: "i-ph-clock-counter-clockwise", to: "/memories" },
]

const settingsNav = [
  { label: "navigation.mobileMenu.settingsNav.settings", icon: "i-ph-gear", to: "/setting" },
  { label: "navigation.mobileMenu.settingsNav.logout", icon: "i-ph-sign-out", to: "/welcome" },
]

const bottomActions = [
  { label: "navigation.mobileMenu.bottomActions.switchAccount", icon: "i-ph-arrows-left-right" },
  { label: "navigation.mobileMenu.bottomActions.keyboardShortcuts", icon: "i-ph-keyboard" },
  { label: "navigation.mobileMenu.bottomActions.darkMode", icon: "i-ph-moon" },
]
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 180ms ease;
}

.mobile-menu-enter-active #mobile-navigation-menu,
.mobile-menu-leave-active #mobile-navigation-menu {
  transition: transform 220ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from #mobile-navigation-menu,
.mobile-menu-leave-to #mobile-navigation-menu {
  transform: translateX(24px);
}
</style>
