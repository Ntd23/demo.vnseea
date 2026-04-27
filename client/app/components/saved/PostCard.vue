<template>
  <article class="group/saved overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
    <div class="border-b border-[var(--border-light)] bg-[var(--color-secondary-50)] px-4 py-4 sm:px-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              variant="soft"
              class="rounded-[12px] bg-[var(--color-primary-50)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-primary-600)] ring-1 ring-[var(--color-primary-100)]"
            >
              <Icon name="i-ph-bookmark-simple-fill" class="mr-1.5 h-3.5 w-3.5" />
              {{ entry.savedAtLabel }}
            </UBadge>

            <UButton
              :to="entry.sourceTo"
              variant="soft"
              size="xs"
              class="h-8 rounded-[12px] border-none bg-white px-3 text-[11px] font-bold text-[var(--text-secondary)] ring-1 ring-[var(--border-light)] transition-all hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]"
            >
              <Icon name="i-ph-link-simple-bold" class="mr-1 h-3.5 w-3.5" />
              {{ entry.sourceLabel }}
            </UButton>

            <div class="flex h-8 items-center gap-1.5 rounded-[12px] bg-white px-3 ring-1 ring-[var(--border-light)] transition-all group-hover/saved:ring-[var(--color-primary-100)]">
              <Icon name="i-ph-folder-simple-fill" class="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover/saved:text-[var(--color-primary-600)]" />
              <span class="text-[11px] font-bold text-[var(--text-secondary)] group-hover/saved:text-[var(--text-primary)]">{{ entry.collectionLabel }}</span>
            </div>
          </div>

          <p class="max-w-3xl border-l-2 border-[var(--color-primary-200)] pl-3 text-[13.5px] leading-[1.65] text-[var(--text-secondary)] transition-all duration-200 group-hover/saved:border-[var(--color-primary-500)]">
            {{ entry.note }}
          </p>
        </div>

        <UButton
          color="neutral"
          variant="outline"
          size="md"
          class="h-10 shrink-0 rounded-[var(--radius-full)] border-red-100 px-4 text-[12px] font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
          @click="$emit('remove', entry.id)"
        >
          <Icon name="i-ph-bookmark-simple" class="mr-1.5 h-4 w-4" />
          {{ t("pages.savedPostsPage.remove") }}
        </UButton>
      </div>
    </div>

    <div class="bg-white p-3 sm:p-4">
      <FeedPostCard :post="entry.post" class="!rounded-[18px] !border-0 !shadow-none" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockSavedPostEntry } from "~/composables/useMockSavedPostsData"

defineProps<{
  entry: MockSavedPostEntry
}>()

const { t } = useI18n()

defineEmits<{
  remove: [id: string]
}>()
</script>
