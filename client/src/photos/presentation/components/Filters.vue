<!-- English description: Renders photos-page filters using normalized API-backed category options. -->
<template>
  <section class="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-md)] sm:p-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <!-- Search bar -->
      <label class="relative block flex-1">
        <Icon name="i-ph-magnifying-glass-bold" class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          :value="search"
          class="h-11 w-full rounded-full border border-[var(--border-light)] bg-[var(--bg-muted)] py-2.5 pl-11 pr-4 text-[13.5px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:shadow-[var(--shadow-sm)]"
          :placeholder="placeholder"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <!-- Category chips: horizontal scroll -->
      <div class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        <button
          v-for="category in categories"
          :key="category.value"
          class="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-extrabold transition-all duration-150"
          :class="selectedCategory === category.value
            ? 'bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)]'
            : 'bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-brand)]'"
          type="button"
          @click="$emit('update:selectedCategory', category.value)"
        >
          <Icon :name="category.icon" class="h-3.5 w-3.5" />
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PhotoCategory, PhotoCategoryKey } from "../../application/composables/usePhotosData"

defineProps<{
  categories: ReadonlyArray<PhotoCategory>
  placeholder: string
  search: string
  selectedCategory: PhotoCategoryKey
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: PhotoCategoryKey]
}>()
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
