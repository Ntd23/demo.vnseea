<template>
  <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
    <div class="space-y-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-[640px]">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ $t("pages.eventsPage.filtersEyebrow") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ $t("pages.eventsPage.filtersTitle") }}
          </h2>
          <p class="mt-1 text-body-secondary">
            {{ $t("pages.eventsPage.filtersDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
            {{ $t("pages.eventsPage.resultMeta", { count: resultCount, tab: activeTabLabel }) }}
          </UBadge>
          <UButton
            to="/events/create-event"
            color="primary"
            size="sm"
            class="rounded-full"
          >
            <Icon name="i-ph-calendar-plus-fill" class="mr-1.5 h-4 w-4" />
            {{ $t("pages.eventsPage.createEvent") }}
          </UButton>
          <UButton
            v-if="canReset"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="emit('reset')"
          >
            <Icon name="i-ph-arrow-counter-clockwise" class="mr-1.5 h-4 w-4" />
            {{ $t("pages.eventsPage.reset") }}
          </UButton>
        </div>
      </div>

      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-ph-faders-horizontal-bold"
        :title="$t('pages.eventsPage.status')"
        :description="statusLabel"
        class="rounded-[24px]"
      />

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <UInput
          v-model="searchModel"
          :placeholder="$t('pages.eventsPage.searchPlaceholder')"
          :aria-label="$t('pages.eventsPage.searchPlaceholder')"
          icon="i-ph-magnifying-glass-bold"
          size="xl"
          class="flex-1"
        />

        <UButton
          v-if="searchModel"
          color="neutral"
          variant="outline"
          size="xl"
          class="rounded-full"
          :aria-label="$t('pages.eventsPage.reset')"
          @click="searchModel = ''"
        >
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </UButton>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.status") }}
          </p>
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.optionCount", { count: tabs.length }) }}
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="tab in tabs"
            :key="tab.key"
            :color="activeTabModel === tab.key ? 'primary' : 'neutral'"
            :variant="activeTabModel === tab.key ? 'solid' : 'soft'"
            size="md"
            class="rounded-full px-4 text-[13px] font-bold"
            type="button"
            @click="activeTabModel = tab.key"
          >
            <Icon :name="tab.icon" class="mr-2 h-4 w-4" />
            <span>{{ tab.label }}</span>
            <UBadge
              color="neutral"
              :variant="activeTabModel === tab.key ? 'soft' : 'subtle'"
              class="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold"
            >
              {{ tabCounts[tab.key] }}
            </UBadge>
          </UButton>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <UFormField :label="$t('pages.eventsPage.category')" size="xl" class="space-y-2">
          <USelect
            v-model="selectedCategoryModel"
            :items="categories"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('pages.eventsPage.location')" size="xl" class="space-y-2">
          <USelect
            v-model="selectedCityModel"
            :items="cities"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('pages.eventsPage.sort')" size="xl" class="space-y-2">
          <USelect
            v-model="selectedSortModel"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type {
  EventCategory,
  EventCategoryKey,
  EventCity,
  EventCityKey,
  EventSortKey,
  EventTab,
  EventTabKey,
} from "~/composables/useMockEventsData"

const { t } = useI18n()

const props = defineProps<{
  tabs: EventTab[]
  tabCounts: Record<EventTabKey, number>
  categories: EventCategory[]
  cities: EventCity[]
  resultCount: number
  statusLabel: string
  canReset?: boolean
}>()

const searchModel = defineModel<string>("search", {
  default: "",
})

const activeTabModel = defineModel<EventTabKey>("activeTab", {
  default: "upcoming",
})

const selectedCategoryModel = defineModel<EventCategoryKey>("selectedCategory", {
  default: "all",
})

const selectedCityModel = defineModel<EventCityKey>("selectedCity", {
  default: "all",
})

const selectedSortModel = defineModel<EventSortKey>("selectedSort", {
  default: "soonest",
})

const emit = defineEmits<{
  reset: []
}>()

const activeTabLabel = computed(() =>
  props.tabs.find(tab => tab.key === activeTabModel.value)?.label
  ?? t("pages.eventsPage.tabUpcoming"),
)

const sortOptions = computed<{ value: EventSortKey; label: string }[]>(() => [
  { value: "soonest", label: t("pages.eventsPage.sortSoonest") },
  { value: "going", label: t("pages.eventsPage.sortGoing") },
  { value: "interested", label: t("pages.eventsPage.sortInterested") },
])
</script>
