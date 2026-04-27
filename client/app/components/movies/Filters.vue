<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <label class="relative block">
        <Icon name="i-ph-magnifying-glass-bold" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--icon-primary)]" />
        <input
          :value="search"
          class="h-12 w-full rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] py-3 pl-12 pr-4 text-[14px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:bg-white"
          :placeholder="placeholder"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <div class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        <button
          v-for="category in categories"
          :key="category.value"
          class="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[13px] font-extrabold transition"
          :class="selectedCategory === category.value ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('update:selectedCategory', category.value)"
        >
          <Icon :name="category.icon" class="h-4 w-4" />
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MovieCategory, MovieCategoryKey } from "~/composables/useMockMoviesData"

defineProps<{
  categories: ReadonlyArray<MovieCategory>
  placeholder: string
  search: string
  selectedCategory: MovieCategoryKey
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: MovieCategoryKey]
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
