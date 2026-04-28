<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0 space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">{{ video.title }}</h2>
        <div class="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <span>{{ $t("pages.watchPage.viewsCount", { count: formatWatchNumber(video.views, locale) }) }}</span>
          <span class="text-secondary-300">•</span>
          <span>{{ video.date }}</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 sm:gap-3">
        <UButton
          :color="liked ? 'primary' : 'gray'"
          :variant="liked ? 'solid' : 'soft'"
          size="lg"
          class="rounded-full font-bold px-5"
          @click="$emit('like')"
        >
          <template #leading>
            <Icon name="i-ph-thumbs-up-fill" class="h-5 w-5" />
          </template>
          {{ formatWatchNumber(video.likes + localLikes) }}
        </UButton>
        
        <UButton
          color="gray"
          variant="soft"
          size="lg"
          class="rounded-full font-bold px-5"
          @click="$emit('share')"
        >
          <template #leading>
            <Icon name="i-ph-share-network-fill" class="h-5 w-5" />
          </template>
          {{ $t("pages.watchPage.share") }}
        </UButton>
      </div>
    </div>

    <!-- Author Card -->
    <div class="mt-6 flex items-center gap-4 rounded-2xl bg-secondary-50/50 p-4 border border-secondary-100/30">
      <UAvatar
        :alt="video.author"
        size="lg"
        :ui="{ background: video.authorGradient }"
        class="font-black text-white"
        :text="video.authorInitials"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-[15px] font-black text-[var(--text-primary)]">{{ video.author }}</p>
        <p class="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{{ $t("pages.watchPage.creatorMeta") }}</p>
      </div>
      <UButton
        color="primary"
        variant="ghost"
        size="sm"
        class="rounded-full font-bold"
      >
        Follow
      </UButton>
    </div>

    <div class="mt-6 space-y-4">
      <p class="text-body-primary text-[15px] leading-relaxed">{{ video.description }}</p>
      
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in video.tags"
          :key="tag"
          color="primary"
          variant="soft"
          size="sm"
          class="rounded-full px-3 font-bold"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>

    <UAlert
      v-if="shareMessage"
      color="primary"
      variant="soft"
      icon="i-ph-link"
      :title="shareMessage"
      class="mt-6 rounded-xl"
    />
  </section>
</template>

<script setup lang="ts">
import type { WatchVideo } from "../../application/composables/useMockWatchData"
import { formatWatchNumber } from "../../application/composables/useMockWatchData"

const { locale } = useI18n()

defineProps<{
  video: WatchVideo
  liked: boolean
  localLikes: number
  shareMessage: string
}>()

defineEmits<{ like: []; share: [] }>()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
