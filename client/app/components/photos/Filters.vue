<template>
  <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <label class="relative block">
        <Icon name="i-ph-magnifying-glass-bold" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          :value="search"
          class="h-12 w-full rounded-full border border-[#dbe3f2] bg-[#f8fbff] py-3 pl-12 pr-4 text-[14px] font-semibold text-[#243b63] outline-none transition placeholder:text-slate-400 focus:border-[#c8d6f2] focus:bg-white"
          :placeholder="placeholder"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <div class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        <button
          v-for="category in categories"
          :key="category.value"
          class="inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-extrabold transition"
          :class="selectedCategory === category.value ? 'bg-[#0000ff] text-white shadow-[0_12px_24px_rgba(0,0,255,0.2)]' : 'bg-[#f3f6fd] text-[#243b63] hover:bg-[#e9effc]'"
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
import type { PhotoCategory, PhotoCategoryKey } from "~/composables/useMockPhotosData"

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
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
