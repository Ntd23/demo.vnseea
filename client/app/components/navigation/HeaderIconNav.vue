<template>
  <nav class="bg-white py-2.5 shadow-sm border-b border-secondary-100">
    <div class="flex items-center justify-around gap-2 px-3">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all duration-300 group"
        :class="item.active
          ? 'border-primary-600 bg-primary-50 text-primary-600 shadow-lg shadow-primary-500/10'
          : 'border-secondary-100 bg-white text-secondary-400 hover:border-primary-400 hover:text-primary-600'"
        :aria-label="$t(item.label)"
      >
        <Icon :name="item.active ? item.icon : item.icon.replace('-fill', '-duotone')" class="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
        <span
          v-if="item.logoBadge"
          class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-lg border border-white bg-primary-600 px-1 text-[9px] font-black text-white shadow-lg shadow-primary-500/20"
        >
          {{ item.logoBadge }}
        </span>
        
        <div v-if="item.active" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-600" />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  {
    label: 'navigation.headerIconNav.home',
    to: '/home',
    icon: 'i-ph-house-fill',
    active: route.path === '/' || route.path === '/home',
  },
  {
    label: 'navigation.headerIconNav.photos',
    to: '/photos',
    icon: 'i-ph-image-fill',
    active: route.path === '/photos',
  },
  {
    label: 'navigation.headerIconNav.reels',
    to: '/reels',
    icon: 'i-ph-film-strip-fill',
    active: route.path === '/reels',
    logoBadge: 'V',
  },
  {
    label: 'navigation.headerIconNav.video',
    to: '/watch',
    icon: 'i-ph-video-camera-fill',
    active: route.path === '/watch',
  },
  {
    label: 'navigation.headerIconNav.music',
    to: '/home',
    icon: 'i-ph-music-note-fill',
    active: false,
  },
])
</script>
