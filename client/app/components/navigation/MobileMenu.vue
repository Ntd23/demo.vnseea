<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div v-if="open" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]" @click="$emit('close')" />
        <div class="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[380px] overflow-y-auto bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]">
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <span class="text-[17px] font-bold text-slate-800">{{ $t("navigation.mobileMenu.title") }}</span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              type="button"
              :aria-label="$t('navigation.mobileMenu.close')"
              @click="$emit('close')"
            >
              <Icon name="i-ph-x-bold" class="h-4 w-4" />
            </button>
          </div>

          <div class="mx-4 mt-3 rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div class="flex items-center justify-between">
              <span class="text-[15px] font-bold text-slate-800">{{ $t("navigation.mobileMenu.adminTitle") }}</span>
              <span class="text-xl">🤝</span>
            </div>
            <div class="mt-2 space-y-1">
              <NuxtLink
                to="/wallet"
                class="flex items-center gap-2 rounded-lg text-[13px] text-slate-500 transition hover:text-[var(--color-primary-600)]"
                @click="$emit('close')"
              >
                <Icon name="i-ph-wallet" class="h-4 w-4" />
                <span>{{ $t("navigation.mobileMenu.walletBalance", { amount: "VND9.999.999.999" }) }}</span>
              </NuxtLink>
              <div class="flex items-center gap-2 text-[13px] text-slate-500">
                <Icon name="i-ph-coin" class="h-4 w-4" />
                <span>{{ $t("navigation.mobileMenu.points", { points: 50 }) }}</span>
              </div>
            </div>
            <div class="mt-4">
              <NavigationLocaleSwitcher />
            </div>
          </div>

          <div class="mt-3 px-4">
            <NuxtLink
              v-for="item in mainNav"
              :key="`${item.label}-${item.to}`"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
              @click="$emit('close')"
            >
              <Icon :name="item.icon" class="h-5 w-5 text-slate-600" />
              <span class="text-[14px] text-slate-700">{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>

          <div class="mx-4 my-2 border-t border-slate-100" />

          <div class="px-4">
            <NuxtLink
              v-for="item in settingsNav"
              :key="item.label"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
              @click="$emit('close')"
            >
              <Icon :name="item.icon" class="h-5 w-5 text-slate-600" />
              <span class="text-[14px] text-slate-700">{{ $t(item.label) }}</span>
            </NuxtLink>
          </div>

          <div class="mx-4 my-2 border-t border-slate-100" />

          <div class="px-4 pb-8">
            <button
              v-for="item in bottomActions"
              :key="item.label"
              class="flex w-full items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
              type="button"
            >
              <span class="text-[14px] text-slate-600">{{ $t(item.label) }}</span>
              <Icon :name="item.icon" class="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

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
  { label: "navigation.mobileMenu.mainNav.photos", icon: "i-ph-images", to: "#" },
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
