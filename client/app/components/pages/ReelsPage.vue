<template>
  <div class="relative h-[calc(100dvh-72px)] overflow-hidden bg-black text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.02)_18%,transparent_48%)]" />

    <div class="relative flex h-full w-full items-stretch justify-center px-0 sm:px-4 lg:px-6">
      <ReelsPlayer
        :reel="activeReel"
        @next="nextReel"
        @prev="prevReel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ReelsPlayer from '~/components/reels/ReelsPlayer.vue'

const { t } = useI18n()
useSeoMeta({
  title: () => t('pages.reelsPage.seoTitle'),
  description: () => t('pages.reelsPage.seoDescription'),
})

const reels = computed(() => [
  {
    id: 1,
    title: t('pages.reelsPage.reelOneTitle'),
    author: 'Thanh Hà',
    subtitle: t('pages.reelsPage.reelOneSubtitle'),
    description: t('pages.reelsPage.reelOneDescription'),
    likes: 120,
    comments: 18,
    views: 2,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-1',
  },
  {
    id: 2,
    title: t('pages.reelsPage.reelTwoTitle'),
    author: 'Minh Anh',
    subtitle: t('pages.reelsPage.reelTwoSubtitle'),
    description: t('pages.reelsPage.reelTwoDescription'),
    likes: 218,
    comments: 44,
    views: 128,
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-2',
  },
  {
    id: 3,
    title: t('pages.reelsPage.reelThreeTitle'),
    author: 'Hà My',
    subtitle: t('pages.reelsPage.reelThreeSubtitle'),
    description: t('pages.reelsPage.reelThreeDescription'),
    likes: 95,
    comments: 12,
    views: 64,
    cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-3',
  },
])

const activeIndex = ref(0)
const activeReel = computed(() => reels.value[activeIndex.value])

const nextReel = () => {
  activeIndex.value = (activeIndex.value + 1) % reels.value.length
}

const prevReel = () => {
  activeIndex.value = (activeIndex.value - 1 + reels.value.length) % reels.value.length
}
</script>
