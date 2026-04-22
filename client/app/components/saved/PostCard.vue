<template>
  <article class="surface-card overflow-hidden">
    <div class="border-b border-secondary-100/50 px-6 py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <UBadge
              variant="soft"
              color="primary"
              size="sm"
              class="rounded-full px-3 font-bold"
            >
              <template #leading>
                <Icon name="i-ph-bookmark-simple-fill" class="h-4 w-4" />
              </template>
              {{ entry.savedAtLabel }}
            </UBadge>

            <UButton
              :to="entry.sourceTo"
              variant="subtle"
              color="gray"
              size="xs"
              class="rounded-full px-3 font-bold"
            >
              {{ entry.sourceLabel }}
            </UButton>

            <UBadge
              variant="outline"
              color="gray"
              size="sm"
              class="rounded-full px-3 font-bold"
            >
              {{ entry.collectionLabel }}
            </UBadge>
          </div>

          <p class="text-sm font-medium leading-relaxed text-secondary-500 italic max-w-2xl">
            "{{ entry.note }}"
          </p>
        </div>

        <UButton
          color="red"
          variant="soft"
          size="md"
          class="rounded-full font-black px-5 shadow-sm active:scale-95 transition-transform"
          @click="$emit('remove', entry.id)"
        >
          <template #leading>
            <Icon name="i-ph-bookmark-simple" class="h-4 w-4" />
          </template>
          {{ t("pages.savedPostsPage.remove") }}
        </UButton>
      </div>
    </div>

    <div class="p-4 sm:p-6 bg-secondary-50/30">
      <FeedPostCard :post="entry.post" />
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
