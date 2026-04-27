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
          :color="shared ? 'primary' : 'primary'"
          :variant="shared ? 'solid' : 'solid'"
          class="rounded-2xl font-black text-[11px] uppercase tracking-widest px-8 h-12 shadow-xl transition-all active:scale-95 flex-shrink-0 justify-center"
          :class="shared ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'"
          @click="$emit('share', entry.id)"
        >
          <template #leading>
            <Icon :name="shared ? 'i-ph-check-bold' : 'i-ph-share-network-duotone'" class="h-5 w-5" />
          </template>
          {{ shared ? t("pages.memoriesPage.sharedAction") : t("pages.memoriesPage.shareAction") }}
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
import type { MemoryEntry } from "../../domain/types/memories.types"

defineProps<{
  entry: MemoryEntry
  shared: boolean
}>()

const { t } = useI18n()

defineEmits<{
  share: [id: string]
}>()
</script>
