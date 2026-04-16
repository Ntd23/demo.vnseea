<template>
  <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
    <div class="min-w-0 max-w-[360px] pb-10 sm:pb-0">
      <div class="flex items-center gap-3">
        <img :src="reel.avatar" :alt="reel.author" class="h-10 w-10 rounded-full border-2 border-white object-cover shadow-lg sm:h-11 sm:w-11">
        <div class="min-w-0">
          <p class="truncate text-[0.98rem] font-bold leading-tight text-white">{{ reel.author }}</p>
          <p class="truncate text-[0.8rem] text-white/70">{{ reel.subtitle }}</p>
        </div>
      </div>

      <h1 class="mt-4 text-[1.05rem] font-black leading-tight text-white sm:text-[1.25rem]">
        {{ reel.title }}
      </h1>
      <p class="mt-2 text-[0.92rem] leading-7 text-white/82 sm:max-w-[330px]">
        {{ reel.description }}
      </p>
    </div>

    <div class="flex w-[76px] flex-col items-center justify-end gap-2 pb-1 sm:w-[82px] sm:gap-3">
      <button class="fb-action-button text-[#ff4d5a]" type="button" aria-label="Thích">
        <Icon name="i-ph-heart-fill" class="h-6 w-6" />
      </button>
      <span class="fb-action-count">{{ reel.likes }}</span>

      <button class="fb-action-button" type="button" aria-label="Bình luận">
        <Icon name="i-ph-chat-circle-text-fill" class="h-6 w-6" />
      </button>
      <span class="fb-action-count">{{ reel.comments }}</span>

      <button class="fb-action-button" type="button" aria-label="Chia sẻ">
        <Icon name="i-ph-share-network-fill" class="h-6 w-6" />
      </button>
      <span class="fb-action-count">Chia sẻ</span>

      <button class="fb-action-button" type="button" aria-label="Lưu">
        <Icon name="i-ph-bookmark-simple-fill" class="h-6 w-6" />
      </button>
      <span class="fb-action-count">Lưu</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reel: {
    title: string
    author: string
    subtitle: string
    description: string
    likes: number
    comments: number
    avatar: string
  }
}>()
</script>

<style scoped>
.fb-action-button {
  display: flex;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  backdrop-filter: blur(10px);
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.fb-action-button:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.fb-action-count {
  min-height: 14px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
}
</style>