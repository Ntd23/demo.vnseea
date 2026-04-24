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
              :class="isHome ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-[var(--text-primary)] hover:text-primary-600 hover:bg-white'"
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
                :class="action.to === route.path || (action.label === 'navigation.headerBar.notifications' && false) ? 'bg-white text-primary-600 shadow-sm ring-1 ring-secondary-100' : 'text-[var(--icon-primary)] hover:text-primary-600 hover:bg-white'"
                :type="action.to ? undefined : 'button'"
                :aria-label="$t(action.label)"
              >
                <Icon :name="action.icon.includes('duotone') ? action.icon : action.icon.replace('-fill', '-duotone')" class="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
                <span v-if="action.badge" class="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-lg bg-primary-600 px-1 text-[9px] font-black text-white ring-2 ring-white shadow-lg shadow-primary-500/30">
                  {{ action.badge }}
                </span>
              </component>
            </div>

            <!-- Profile / User Menu -->
            <NavigationHeaderUserMenu />
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
        
        <div class="relative z-10 flex items-center justify-between gap-3">
          <NuxtLink
            to="/home"
            class="focus-ring flex h-10 min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 text-white ring-1 ring-white/10 transition-all hover:bg-white/15"
            :aria-label="$t('navigation.headerBar.home')"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-primary-700">V</span>
            <span class="hidden text-[11px] font-black uppercase tracking-[0.18em] sm:inline">VNSEEA</span>
          </NuxtLink>

          <div class="ml-auto flex min-w-0 items-center gap-2">
            <button
              type="button"
              class="focus-ring relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 ring-1 ring-white/10 transition-all active:scale-95 hover:bg-white/15 hover:text-white"
              :aria-label="$t('navigation.headerBar.notifications')"
            >
              <Icon name="i-ph-bell-duotone" class="h-5.5 w-5.5" />
              <span class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-rose-500 px-1 text-[8px] font-black text-white shadow-xl ring-1 ring-white/20">
                3
              </span>
            </button>
            <NavigationLocaleSwitcher compact />
            <button
              type="button"
              class="focus-ring relative z-20 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 transition-all active:scale-95 hover:bg-white/15"
              :aria-label="$t('navigation.headerBar.account')"
              :aria-expanded="mobileMenuOpen"
              aria-controls="mobile-navigation-menu"
              @click.stop.prevent="openMobileMenu"
              @touchend.stop.prevent="openMobileMenu"
            >
              <Icon name="i-ph-user-duotone" class="h-5.5 w-5.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <NavigationMobileMenu
    :open="mobileMenuOpen"
    @update:open="mobileMenuOpen = $event"
    @close="mobileMenuOpen = false"
  />
</template>

<script setup lang="ts">
import { NuxtLink } from "#components"

const mobileMenuOpen = ref(false)

const route = useRoute()
const isHome = computed(() => route.path === "/" || route.path === "/home")

const desktopActions = [
  { label: "navigation.headerBar.friendRequests", icon: "i-ph-user-plus-fill", badge: 1 },
  { label: "navigation.headerBar.messages", icon: "i-ph-chat-circle-dots-fill", to: "/messages" },
  { label: "navigation.headerBar.notifications", icon: "i-ph-bell-fill", badge: 3 },
]

function openMobileMenu() {
  mobileMenuOpen.value = true
}
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
