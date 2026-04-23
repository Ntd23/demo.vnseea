<template>
  <UDrawer
    v-model="modelValue"
    side="right"
    :ui="{
      width: 'w-[85vw] max-w-[400px]',
      container: 'flex flex-col h-full bg-primary-950 text-white shadow-[-12px_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative',
      overlay: {
        base: 'fixed inset-0 z-[60] bg-primary-950/60 backdrop-blur-md',
      }
    }"
  >
    <!-- Decor Backgrounds -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-600/10 to-transparent pointer-events-none z-0" />
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none z-0" />

    <!-- Header -->
    <div class="sticky top-0 z-20 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-primary-950/80 backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/20">
          <Icon name="i-ph-list-bold" class="h-5 w-5 text-white" />
        </div>
        <span class="text-sm font-black uppercase tracking-[0.2em] text-white">{{ $t("navigation.mobileMenu.title") }}</span>
      </div>
      <UButton
        color="white"
        variant="ghost"
        icon="i-ph-x-bold"
        class="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all shadow-none"
        @click="modelValue = false"
      />
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto no-scrollbar relative z-10">
      <!-- User Profile & Stats Panel -->
      <div class="p-6">
        <div class="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-2xl">
          <div class="relative z-10 flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-0.5 shadow-xl shadow-primary-500/30">
                <div class="h-full w-full rounded-[14px] bg-primary-950 flex items-center justify-center border border-white/10">
                  <span class="text-xs font-black">VN</span>
                </div>
              </div>
              <div class="space-y-0.5">
                <p class="text-base font-black text-white tracking-tight">{{ $t("navigation.mobileMenu.adminTitle") }}</p>
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-white/50">Online Now</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <NuxtLink
                to="/wallet"
                class="flex flex-col gap-2 rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 group"
                @click="modelValue = false"
              >
                <Icon name="i-ph-wallet-duotone" class="h-5 w-5 text-primary-400 group-hover:scale-110 transition-transform" />
                <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Balance</p>
                <p class="text-xs font-black text-white truncate">VND 9.9B</p>
              </NuxtLink>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 group">
                <Icon name="i-ph-fire-duotone" class="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Points</p>
                <p class="text-xs font-black text-white">50 XP</p>
              </div>
            </div>

            <div class="pt-2">
              <NavigationLocaleSwitcher />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Groups -->
      <div class="px-4 pb-12 space-y-8">
        <!-- Main Nav -->
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 pl-4 mb-4">Navigation</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in mainNav"
              :key="`${item.label}-${item.to}`"
              :to="item.to"
              class="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 group hover:bg-white/5"
              @click="modelValue = false"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-all group-hover:border-primary-500/50 group-hover:bg-primary-600/10">
                <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5 w-5 text-white/40 group-hover:text-primary-400" />
              </div>
              <span class="text-xs font-black uppercase tracking-widest text-white/70 group-hover:text-white">{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Settings -->
        <div class="pt-4 border-t border-white/5">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 pl-4 mb-4">Settings & Care</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in settingsNav"
              :key="item.label"
              :to="item.to"
              class="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 group hover:bg-white/5"
              :class="item.label.includes('logout') ? 'hover:bg-rose-500/10' : ''"
              @click="modelValue = false"
            >
              <div 
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-all"
                :class="item.label.includes('logout') ? 'group-hover:border-rose-500/50 group-hover:text-rose-400' : 'group-hover:border-primary-500/50 group-hover:text-primary-400'"
              >
                <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5 w-5 text-white/40" />
              </div>
              <span 
                class="text-xs font-black uppercase tracking-widest text-white/70"
                :class="item.label.includes('logout') ? 'group-hover:text-rose-400' : 'group-hover:text-white'"
              >{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
          <UButton
            v-for="item in bottomActions"
            :key="item.label"
            variant="soft"
            color="white"
            class="flex flex-col items-center gap-3 rounded-2xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 group h-auto shadow-none ring-0"
          >
            <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5 w-5 text-white/40 group-hover:text-primary-400" />
            <span class="text-[8px] font-black uppercase tracking-widest text-white/30 text-center leading-tight group-hover:text-white/60">{{ $t(item.label) }}</span>
          </UButton>
        </div>
      </div>
    </div>
  </UDrawer>
</template>

<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false })

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
  { label: "navigation.mobileMenu.mainNav.myGroupsPlaceholder", icon: "i-ph-users-three", to: "#" },
  { label: "navigation.mobileMenu.mainNav.eventsPlaceholder", icon: "i-ph-calendar-blank", to: "#" },
  { label: "navigation.mobileMenu.mainNav.myGroups", icon: "i-ph-users-three", to: "/groups" },
  { label: "navigation.mobileMenu.mainNav.forum", icon: "i-ph-chats-circle", to: "/forum" },
  { label: "navigation.mobileMenu.mainNav.ads", icon: "i-ph-megaphone", to: "#" },
  { label: "navigation.mobileMenu.mainNav.photos", icon: "i-ph-images", to: "/photos" },
  { label: "navigation.mobileMenu.mainNav.watch", icon: "i-ph-play-circle", to: "/watch" },
  { label: "navigation.mobileMenu.mainNav.reelsShortcut", icon: "i-ph-film-reel", to: "#" },
  { label: "navigation.mobileMenu.mainNav.savedPosts", icon: "i-ph-bookmark-simple", to: "/saved-posts" },
  { label: "navigation.mobileMenu.mainNav.poke", icon: "i-ph-hand-waving", to: "/poke" },
  { label: "navigation.mobileMenu.mainNav.explore", icon: "i-ph-compass", to: "/explore" },
  { label: "navigation.mobileMenu.mainNav.popularPosts", icon: "i-ph-fire", to: "/popular" },
  { label: "navigation.mobileMenu.mainNav.findFriends", icon: "i-ph-user-plus", to: "#" },
  { label: "navigation.mobileMenu.mainNav.games", icon: "i-ph-game-controller", to: "/games" },
  { label: "navigation.mobileMenu.mainNav.jobs", icon: "i-ph-briefcase", to: "/jobs" },
  { label: "navigation.mobileMenu.mainNav.goPro", icon: "i-ph-crown-simple", to: "/go-pro" },
  { label: "navigation.mobileMenu.mainNav.wallet", icon: "i-ph-wallet", to: "/wallet" },
  { label: "navigation.mobileMenu.mainNav.withdrawal", icon: "i-ph-money-wavy", to: "/withdrawal" },
  { label: "navigation.mobileMenu.mainNav.directory", icon: "i-ph-squares-four", to: "/directory" },
  { label: "navigation.mobileMenu.mainNav.trending", icon: "i-ph-trend-up", to: "#" },
  { label: "navigation.mobileMenu.mainNav.funding", icon: "i-ph-hand-heart", to: "/funding" },
  { label: "navigation.mobileMenu.mainNav.memories", icon: "i-ph-clock-counter-clockwise", to: "/memories" },
  { label: "navigation.mobileMenu.mainNav.deals", icon: "i-ph-tag", to: "#" },
]

const settingsNav = [
  { label: "navigation.mobileMenu.settingsNav.settings", icon: "i-ph-gear", to: "/setting" },
  { label: "navigation.mobileMenu.settingsNav.register", icon: "i-ph-clipboard-text", to: "#" },
  { label: "navigation.mobileMenu.settingsNav.adminArea", icon: "i-ph-shield-check", to: "#" },
  { label: "navigation.mobileMenu.settingsNav.logout", icon: "i-ph-sign-out", to: "/welcome" },
]

const bottomActions = [
  { label: "navigation.mobileMenu.bottomActions.switchAccount", icon: "i-ph-arrows-left-right" },
  { label: "navigation.mobileMenu.bottomActions.keyboardShortcuts", icon: "i-ph-keyboard" },
  { label: "navigation.mobileMenu.bottomActions.darkMode", icon: "i-ph-moon" },
]
</script>
