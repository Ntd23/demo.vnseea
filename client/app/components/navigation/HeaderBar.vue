<template>
  <header class="sticky top-0 z-40">
    <!-- Desktop Header -->
    <div class="hidden xl:block">
      <div class="border-b border-secondary-100 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div class="mx-auto flex h-[72px] w-full max-w-[1920px] items-center gap-6 px-8">
          <!-- Home Navigation Pill -->
          <div class="flex shrink-0 items-center gap-2 rounded-2xl border border-secondary-100 bg-secondary-50/50 p-1.5 ring-1 ring-inset ring-white/50">
            <NuxtLink 
              to="/home"
              class="flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group"
              :class="isHome ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-secondary-500 hover:text-primary-600 hover:bg-white'"
            >
              <Icon :name="isHome ? 'i-ph-house-fill' : 'i-ph-house-duotone'" class="h-5 w-5 transition-transform group-hover:scale-110" />
              <span class="text-[11px] font-black uppercase tracking-[0.2em]">{{ $t("navigation.headerBar.home") }}</span>
            </NuxtLink>
          </div>

          <!-- Search Input Section -->
          <div class="min-w-0 max-w-[840px] flex-1">
            <NavigationHeaderSearchInput />
          </div>

          <!-- Action Buttons Section -->
          <div class="ml-auto flex shrink-0 items-center gap-3">
            <NavigationLocaleSwitcher compact />
            
            <div class="flex items-center gap-1.5 p-1 bg-secondary-50/50 border border-secondary-100 rounded-2xl">
              <component
                :is="action.to ? NuxtLink : 'button'"
                v-for="action in desktopActions"
                :key="action.label"
                :to="action.to"
                class="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 group"
                :class="action.to === route.path || (action.label === 'navigation.headerBar.notifications' && false) ? 'bg-white text-primary-600 shadow-sm ring-1 ring-secondary-100' : 'text-secondary-400 hover:text-primary-600 hover:bg-white'"
                :type="action.to ? undefined : 'button'"
                :aria-label="$t(action.label)"
              >
                <Icon :name="action.icon.includes('duotone') ? action.icon : action.icon.replace('-fill', '-duotone')" class="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
                <span v-if="action.badge" class="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-lg bg-primary-600 px-1 text-[9px] font-black text-white ring-2 ring-white shadow-lg shadow-primary-500/30">
                  {{ action.badge }}
                </span>
              </component>
            </div>

            <!-- Profile / User Menu Trigger -->
            <button 
              class="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-[2px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20" 
              type="button" 
              :aria-label="$t('navigation.headerBar.account')" 
              @click="$emit('toggle-menu')"
            >
              <div class="flex h-full w-full items-center justify-center rounded-[14px] bg-white text-primary-600 transition-colors group-hover:bg-primary-50">
                <Icon name="i-ph-user-duotone" class="h-6 w-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Header -->
    <div class="xl:hidden">
      <div class="relative overflow-hidden bg-primary-950 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <!-- Visual Decor -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-950 to-secondary-950 z-0 opacity-50" />
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div class="relative z-10 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
          <div class="flex items-center gap-1">
            <NuxtLink
              v-for="item in mobileIconItems.slice(0, -1)"
              :key="item.label"
              :to="item.to"
              class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300"
              :class="item.active ? 'bg-white/15 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'"
              :aria-label="$t(item.label)"
            >
              <Icon :name="item.active ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5.5 w-5.5" />
              <span v-if="item.logoBadge" class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-white px-1 text-[8px] font-black text-primary-600 shadow-xl ring-1 ring-white/20">
                {{ item.logoBadge }}
              </span>
              <span v-if="item.badge" class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-rose-500 px-1 text-[8px] font-black text-white shadow-xl ring-1 ring-white/20">
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2 pl-2 border-l border-white/10">
            <NavigationLocaleSwitcher compact />
            <button
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all active:scale-95 ring-1 ring-white/10"
              type="button"
              :aria-label="$t('navigation.headerBar.account')"
              @click="$emit('toggle-menu')"
            >
              <Icon name="i-ph-user-duotone" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components"

defineEmits<{ "toggle-menu": [] }>()

const route = useRoute()
const isHome = computed(() => route.path === "/" || route.path === "/home")

const desktopActions = [
  { label: "navigation.headerBar.friendRequests", icon: "i-ph-user-plus-fill", badge: 1 },
  { label: "navigation.headerBar.messages", icon: "i-ph-chat-circle-dots-fill", to: "/messages" },
  { label: "navigation.headerBar.notifications", icon: "i-ph-bell-fill", badge: 3 },
]

const mobileIconItems = computed(() => [
  { label: "navigation.headerBar.home", to: "/home", icon: "i-ph-house-fill", active: route.path === "/" || route.path === "/home" },
  { label: "navigation.headerBar.search", to: "/search", icon: "i-ph-magnifying-glass-bold", active: route.path === "/search" },
  { label: "navigation.headerBar.reels", to: "/reels", icon: "i-ph-film-strip-fill", active: route.path === "/reels", logoBadge: "V" },
  { label: "navigation.headerBar.video", to: "/watch", icon: "i-ph-video-camera-fill", active: route.path === "/watch" },
  { label: "navigation.headerBar.notifications", to: "/home", icon: "i-ph-bell-fill", active: false },
  { label: "navigation.headerBar.profile", to: "/@me", icon: "i-ph-handshake-fill", active: route.path.includes("/@") },
])
</script>

<style scoped>
.desktop-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 9999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 800;
  transition: all 0.15s ease;
}

.desktop-pill--active {
  background: linear-gradient(180deg, #2749ff 0%, #0000ff 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 255, 0.22);
}

.desktop-pill--inactive {
  color: #4a5c7a;
}

.desktop-pill--inactive:hover {
  color: #0000ff;
  background: #eef3ff;
}

.mobile-icon-btn {
  position: relative;
  display: flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.92);
  transition: all 0.15s ease;
}

.mobile-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.mobile-icon-btn--active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.mobile-icon-btn--avatar {
  background: rgba(255, 255, 255, 0.12);
}

.mobile-icon-badge {
  position: absolute;
  right: 0.15rem;
  top: 0.15rem;
  display: inline-flex;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #ff3b30;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 59, 48, 0.28);
}

.mobile-icon-logo {
  position: absolute;
  right: -0.2rem;
  top: -0.15rem;
  display: inline-flex;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  background: #0000ff;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 900;
  color: #fff;
  box-shadow: 0 6px 14px rgba(0, 0, 255, 0.26);
}

.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
