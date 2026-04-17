<template>
  <section class="relative z-10 -mt-10 rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:p-4">
    <label class="relative block">
      <Icon
        name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
      <input
        :value="search"
        class="h-14 w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-12 pr-4 text-[15px] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
        placeholder="Tìm kiếm sự kiện, địa điểm hoặc chủ đề"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_210px]">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-bold transition duration-150"
          :class="activeTab === tab.key
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('update:activeTab', tab.key)"
        >
          <Icon :name="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
          <span class="rounded-full bg-white/18 px-1.5 text-[11px]">
            {{ tabCounts[tab.key] }}
          </span>
        </button>
      </div>

      <label class="block">
        <span class="sr-only">Danh mục</span>
        <select
          :value="selectedCategory"
          class="h-11 w-full rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
          @change="$emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="category in categories"
            :key="category.value"
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="sr-only">Địa điểm</span>
        <select
          :value="selectedCity"
          class="h-11 w-full rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
          @change="$emit('update:selectedCity', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="city in cities"
            :key="city.value"
            :value="city.value"
          >
            {{ city.label }}
          </option>
        </select>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventCategory, EventTab, EventTabKey } from "~/composables/useMockEventsData"

defineProps<{
  search: string
  activeTab: EventTabKey
  selectedCategory: string
  selectedCity: string
  tabs: EventTab[]
  tabCounts: Record<EventTabKey, number>
  categories: EventCategory[]
  cities: { value: string; label: string }[]
}>()

defineEmits<{
  "update:search": [value: string]
  "update:activeTab": [value: EventTabKey]
  "update:selectedCategory": [value: string]
  "update:selectedCity": [value: string]
}>()
</script>
