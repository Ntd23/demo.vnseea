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

useSeoMeta({
  title: 'Reels | VNSEEA',
  description: 'Khám phá video ngắn trên VNSEEA.',
})

const reels = [
  {
    id: 1,
    title: 'Cách mình dựng UI nhanh hơn với Vue + Nuxt',
    author: 'Thanh Hà',
    subtitle: 'Creator · 12 phút trước',
    description: 'Khung reels tối giản theo đúng ảnh tham chiếu: nền đen, video nằm giữa, cụm action dọc bên phải và điều hướng lên/xuống ở mép phải.',
    likes: 120,
    comments: 18,
    views: 2,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-1',
  },
  {
    id: 2,
    title: 'Reels travel: một góc yên tĩnh để tập trung',
    author: 'Minh Anh',
    subtitle: 'Community · 1 giờ trước',
    description: 'Bạn có thể nối dữ liệu thật vào đây sau, còn hiện tại UI đã bám sát bố cục trong design reels.png.',
    likes: 218,
    comments: 44,
    views: 128,
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-2',
  },
  {
    id: 3,
    title: 'Tối ưu một màn hình reels cho mobile-first',
    author: 'Hà My',
    subtitle: 'Design · 2 giờ trước',
    description: 'Swipe lên hoặc xuống để chuyển reel trên cả mobile lẫn desktop.',
    likes: 95,
    comments: 12,
    views: 64,
    cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-3',
  },
]

const activeIndex = ref(0)
const activeReel = computed(() => reels[activeIndex.value])

const nextReel = () => {
  activeIndex.value = (activeIndex.value + 1) % reels.length
}

const prevReel = () => {
  activeIndex.value = (activeIndex.value - 1 + reels.length) % reels.length
}
</script>