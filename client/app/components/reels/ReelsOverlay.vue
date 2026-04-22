<template>
  <div class="absolute inset-x-0 bottom-0 flex h-full items-end justify-between p-4 sm:p-6 pb-20 sm:pb-8">
    <div class="flex-1 min-w-0 pr-12">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="reel.avatar"
          :alt="reel.author"
          size="lg"
          class="ring-2 ring-white shadow-lg"
        />
        <div class="min-w-0">
          <p class="truncate text-base font-black text-white tracking-tight">{{ reel.author }}</p>
          <p class="truncate text-xs font-bold text-white/70">{{ reel.subtitle }}</p>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <h2 class="text-xl font-black text-white leading-tight sm:text-2xl drop-shadow-md">
          {{ reel.title }}
        </h2>
        <p class="line-clamp-2 text-sm font-medium leading-relaxed text-white/90 sm:max-w-md drop-shadow-sm">
          {{ reel.description }}
        </p>
      </div>
    </div>

    <!-- Actions Sidebar -->
    <div class="flex flex-col items-center gap-4 sm:gap-5 pb-2">
      <div class="flex flex-col items-center gap-1.5">
        <UButton
          icon="i-ph-heart-fill"
          size="xl"
          class="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
          :ui="{ icon: { base: 'text-red-500 w-7 h-7' } }"
          variant="ghost"
        />
        <span class="text-[11px] font-black text-white drop-shadow-md">{{ reel.likes }}</span>
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <UButton
          icon="i-ph-chat-circle-text-fill"
          size="xl"
          class="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
          :ui="{ icon: { base: 'w-7 h-7' } }"
          variant="ghost"
        />
        <span class="text-[11px] font-black text-white drop-shadow-md">{{ reel.comments }}</span>
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <UButton
          icon="i-ph-share-network-fill"
          size="xl"
          class="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
          :ui="{ icon: { base: 'w-7 h-7' } }"
          variant="ghost"
        />
        <span class="text-[11px] font-black text-white uppercase tracking-tighter drop-shadow-md">{{ $t('pages.reelsPage.share') }}</span>
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <UButton
          icon="i-ph-bookmark-simple-fill"
          size="xl"
          class="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
          :ui="{ icon: { base: 'w-7 h-7' } }"
          variant="ghost"
        />
        <span class="text-[11px] font-black text-white uppercase tracking-tighter drop-shadow-md">{{ $t('pages.reelsPage.save') }}</span>
      </div>
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
