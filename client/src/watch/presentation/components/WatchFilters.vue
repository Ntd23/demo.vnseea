<template>
  <section class="surface-card p-4 sm:p-5">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex-1 max-w-lg">
        <UInput
          :model-value="search"
          icon="i-ph-magnifying-glass-bold"
          size="xl"
          class="font-semibold"
          variant="outline"
          :placeholder="$t('pages.watchPage.searchPlaceholder')"
          @update:model-value="$emit('update:search', $event)"
        />
      </div>

      <div class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <UButton
          v-for="category in categories"
          :key="category.value"
          :color="selectedCategory === category.value ? 'primary' : 'gray'"
          :variant="selectedCategory === category.value ? 'solid' : 'soft'"
          size="lg"
          class="rounded-full font-bold px-5 whitespace-nowrap transition-all duration-300"
          :class="{ 'shadow-lg shadow-primary-500/20 translate-y-[-1px]': selectedCategory === category.value }"
          @click="$emit('update:selectedCategory', category.value)"
        >
          <template v-if="category.icon" #leading>
            <Icon :name="category.icon" class="h-4 w-4" />
          </template>
          {{ category.label }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchCategoryKey } from "../../application/composables/useMockWatchData"

defineProps<{
  search: string
  selectedCategory: WatchCategoryKey
  categories: ReadonlyArray<{ label: string; value: WatchCategoryKey; icon: string }>
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: WatchCategoryKey]
}>()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
