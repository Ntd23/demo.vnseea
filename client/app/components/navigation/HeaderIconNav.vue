<template>
  <nav class="bg-white py-2.5 shadow-sm">
    <div class="flex items-center justify-around gap-2 px-3">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="flex h-11 w-11 items-center justify-center rounded-full border-4 transition"
        :class="item.active
          ? 'border-[#0000ff] bg-[#0000ff]/8 text-[#0000ff]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#0000ff]/30 hover:text-[#0000ff]'"
        :aria-label="item.label"
      >
        <Icon :name="item.icon" class="h-5 w-5" />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  {
    label: 'Home',
    to: '/home',
    icon: 'i-ph-house-fill',
    active: route.path === '/' || route.path === '/home',
  },
  {
    label: 'Photos',
    to: '/home',
    icon: 'i-ph-image-fill',
    active: false,
  },
  {
    label: 'People',
    to: '/messages',
    icon: 'i-ph-users-fill',
    active: false,
  },
  {
    label: 'Video',
    to: '/watch',
    icon: 'i-ph-video-camera-fill',
    active: route.path === '/watch' || route.path === '/reels',
  },
  {
    label: 'Music',
    to: '/home',
    icon: 'i-ph-music-note-fill',
    active: false,
  },
])
</script>
