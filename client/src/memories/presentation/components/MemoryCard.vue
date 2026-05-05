<!-- Description: Renders one API-backed memory card and exposes a real share action for the original memory post. -->
<template>
  <article class="surface-card group overflow-hidden ring-1 ring-secondary-100 shadow-xl transition-all duration-500 hover:shadow-2xl hover:ring-primary-200/50">
    <!-- Memory Header -->
    <div class="border-b border-secondary-50 bg-secondary-50/30 px-6 py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <UBadge
              variant="soft"
              color="primary"
              class="rounded-full font-black text-[10px] uppercase tracking-widest px-4 py-1.5 ring-1 ring-inset ring-primary-100 shadow-sm"
            >
              <template #leading>
                <Icon name="i-ph-clock-counter-clockwise-duotone" class="h-4 w-4" />
              </template>
              {{ entry.memoryLabel }}
            </UBadge>

            <UBadge
              variant="outline"
              color="white"
              class="rounded-full font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-secondary-200 text-secondary-500 bg-white"
            >
              {{ entry.happenedOnLabel }}
            </UBadge>
          </div>

          <p class="max-w-[760px] text-sm font-medium leading-relaxed text-secondary-600 line-clamp-2">
            {{ entry.reflection }}
          </p>
        </div>

        <UButton
          size="xl"
          class="rounded-2xl bg-primary-600 px-8 h-12 flex-shrink-0 justify-center font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 hover:bg-primary-700"
          @click="$emit('share', entry.id)"
        >
          <template #leading>
            <Icon name="i-ph-share-network-duotone" class="h-5 w-5" />
          </template>
          {{ t("pages.memoriesPage.shareAction") }}
        </UButton>
      </div>
    </div>

    <!-- The Original Post Content -->
    <div class="p-4 sm:p-8 bg-white/50">
      <FeedPostCard :post="entry.post" class="!shadow-none !ring-secondary-50 !bg-white/40" />
    </div>
  </article>
</template>

<script setup lang="ts">
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import type { FeedMemoryRecord } from "../../../feed/domain/types/feed.types"

defineProps<{
  entry: FeedMemoryRecord
}>()

const { t } = useI18n()

defineEmits<{
  share: [id: string]
}>()
</script>
