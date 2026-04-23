<template>
  <article class="surface-card group/saved overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-white hover:shadow-3xl transition-all duration-500 rounded-3xl">
    <div class="border-b border-secondary-100/50 px-8 py-8 bg-secondary-50/30">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-3">
            <UBadge
              variant="soft"
              size="lg"
              class="rounded-2xl px-4 py-2 font-black uppercase tracking-widest bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm"
            >
              <template #leading>
                <Icon name="i-ph-bookmark-simple-duotone" class="h-4 w-4 mr-2" />
              </template>
              {{ entry.savedAtLabel }}
            </UBadge>

            <UButton
              :to="entry.sourceTo"
              variant="soft"
              class="rounded-2xl px-4 h-9 font-black text-[10px] uppercase tracking-widest bg-secondary-100 text-secondary-600 ring-1 ring-secondary-200/50 hover:bg-secondary-200 transition-all border-none"
            >
              <template #leading>
                <Icon name="i-ph-link-duotone" class="h-4 w-4 mr-1" />
              </template>
              {{ entry.sourceLabel }}
            </UButton>

            <div class="flex items-center gap-2 px-4 h-9 rounded-2xl bg-white/50 ring-1 ring-secondary-200/50 transition-all group-hover/saved:ring-primary-200">
               <Icon name="i-ph-folder-simple-duotone" class="h-4 w-4 text-secondary-400 group-hover/saved:text-primary-500" />
               <span class="text-[10px] font-black uppercase tracking-widest text-secondary-500 group-hover/saved:text-primary-600">{{ entry.collectionLabel }}</span>
            </div>
          </div>

          <p class="text-base font-medium leading-relaxed text-secondary-500 italic max-w-3xl border-l-4 border-primary-500/20 pl-6 group-hover/saved:border-primary-500 transition-all duration-500">
            "{{ entry.note }}"
          </p>
        </div>

        <UButton
          size="xl"
          class="h-14 rounded-2xl bg-secondary-50 text-red-500 ring-1 ring-red-100 hover:bg-red-50 hover:text-red-700 hover:ring-red-200 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm px-8"
          @click="$emit('remove', entry.id)"
        >
          <template #leading>
            <Icon name="i-ph-bookmark-simple" class="h-5 w-5 mr-2" />
          </template>
          {{ t("pages.savedPostsPage.remove") }}
        </UButton>
      </div>
    </div>

    <div class="p-8 sm:p-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/saved:opacity-100 transition-opacity duration-1000" />
      <div class="relative z-10">
        <FeedPostCard :post="entry.post" class="shadow-none ring-0 bg-transparent" />
      </div>
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
