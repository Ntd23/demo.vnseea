<template>
  <section class="relative z-10 -mt-10 overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-4 shadow-[var(--shadow-xl)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">
          {{ $t("pages.eventsPage.filtersEyebrow") }}
        </p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">
          {{ $t("pages.eventsPage.filtersTitle") }}
        </h2>
        <p class="mt-1 max-w-[560px] text-body-secondary">
          {{ $t("pages.eventsPage.filtersDescription") }}
        </p>
      </div>

      <NuxtLink
        to="/events/create-event"
        class="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 lg:min-w-[190px]"
      >
        <Icon name="i-ph-calendar-plus-fill" class="h-5 w-5" />
        {{ $t("pages.eventsPage.createEvent") }}
      </NuxtLink>
    </div>

    <label class="relative mt-5 block">
      <Icon
        name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
      <input
        :value="search"
        class="h-16 w-full rounded-[22px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:font-medium placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
        :placeholder="$t('pages.eventsPage.searchPlaceholder')"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="rounded-[24px] bg-[var(--color-secondary-50)] p-3">
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.status") }}
          </p>
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.optionCount", { count: tabs.length }) }}
          </span>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex min-h-12 items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left transition duration-150"
            :class="activeTab === tab.key
              ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
              : 'bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
            type="button"
            @click="$emit('update:activeTab', tab.key)"
          >
            <span class="inline-flex min-w-0 items-center gap-2 text-[13px] font-extrabold">
              <Icon :name="tab.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ tab.label }}</span>
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-black"
              :class="activeTab === tab.key ? 'bg-white/18 text-white' : 'bg-[var(--color-secondary-100)] text-[var(--text-secondary)]'"
            >
              {{ tabCounts[tab.key] }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.category") }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category.value"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-extrabold transition"
              :class="selectedCategory === category.value
                ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
              type="button"
              @click="$emit('update:selectedCategory', category.value)"
            >
              <Icon :name="category.icon" class="h-4 w-4" />
              {{ category.label }}
            </button>
          </div>
        </div>

        <div>
          <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.location") }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="city in cities"
              :key="city.value"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-extrabold transition"
              :class="selectedCity === city.value
                ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
              type="button"
              @click="$emit('update:selectedCity', city.value)"
            >
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4" />
              {{ city.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 rounded-[24px] border border-[var(--border-default)] bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          {{ $t("pages.eventsPage.sort") }}
        </p>
        <p class="mt-1 truncate text-[13px] font-semibold text-[var(--text-secondary)]">
          {{ $t("pages.eventsPage.sortDescription") }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="sortOption in sortOptions"
          :key="sortOption.value"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] px-4 text-[13px] font-extrabold transition"
          :class="selectedSort === sortOption.value
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('update:selectedSort', sortOption.value)"
        >
          <Icon :name="sortOption.icon" class="h-4 w-4" />
          {{ sortOption.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventCategory, EventTab, EventTabKey } from "~/composables/useMockEventsData"

type EventSortKey = "soonest" | "going" | "interested"

defineProps<{
  search: string
  activeTab: EventTabKey
  selectedCategory: string
  selectedCity: string
  selectedSort: EventSortKey
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
  "update:selectedSort": [value: EventSortKey]
}>()

const { t } = useI18n()

const sortOptions = computed<{ value: EventSortKey; label: string; icon: string }[]>(() => [
  { value: "soonest", label: t("pages.eventsPage.sortSoonest"), icon: "i-ph-clock-countdown-fill" },
  { value: "going", label: t("pages.eventsPage.sortGoing"), icon: "i-ph-users-three-fill" },
  { value: "interested", label: t("pages.eventsPage.sortInterested"), icon: "i-ph-star-fill" },
])
</script>
