<template>
  <nav class="bg-white py-2.5 shadow-sm">
    <div class="flex items-center justify-around gap-2 px-3">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="relative flex h-11 w-11 items-center justify-center rounded-full border-4 transition"
        :class="item.active
          ? 'border-[#0000ff] bg-[#0000ff]/8 text-[#0000ff]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#0000ff]/30 hover:text-[#0000ff]'"
        :aria-label="$t(item.label)"
      >
        <Icon :name="item.icon" class="h-5 w-5" />
        <span
          v-if="item.logoBadge"
          class="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-[#0000ff] px-1 text-[9px] font-black text-white shadow-[0_6px_12px_rgba(0,0,255,0.22)]"
        >
          {{ item.logoBadge }}
        </span>
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
    to: '/home',
    icon: 'i-ph-image-fill',
    active: false,
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
