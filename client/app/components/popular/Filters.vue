<template>
  <section class="surface-card p-4 sm:p-5 ring-1 ring-secondary-100 shadow-xl bg-white/60 backdrop-blur-xl">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <label class="relative block">
        <Icon name="i-ph-magnifying-glass-duotone" class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--icon-primary)]" />
        <input
          :value="search"
          class="h-12 w-full rounded-2xl border border-secondary-100 bg-secondary-50/50 py-3 pl-13 pr-5 text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)] outline-none transition placeholder:text-secondary-400 placeholder:font-medium placeholder:normal-case placeholder:tracking-normal focus:border-primary-100 focus:bg-white focus:ring-4 focus:ring-primary-500/5 group"
          :placeholder="placeholder"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <div class="scrollbar-hide -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        <button
          v-for="category in categories"
          :key="category.value"
          class="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-2xl px-5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
          :class="selectedCategory === category.value 
            ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm' 
            : 'bg-white text-[var(--text-primary)] ring-1 ring-secondary-100 hover:bg-white hover:text-primary-600 hover:border-primary-100'"
          type="button"
          @click="$emit('update:selectedCategory', category.value)"
        >
          <Icon :name="category.icon.includes('duotone') ? category.icon : category.icon.replace('-bold', '-duotone')" class="h-4.5 w-4.5" />
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PopularCategory, PopularCategoryKey } from "~/composables/useMockPopularData"

defineProps<{
  categories: ReadonlyArray<PopularCategory>
  placeholder: string
  search: string
  selectedCategory: PopularCategoryKey
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: PopularCategoryKey]
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
