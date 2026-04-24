<template>
  <div class="space-y-6 pb-10">
    <EventsHero
      :my-events-active="activeTab === 'my'"
      :total-events="events.length"
      :stats="heroStats"
      :status-label="heroStatusLabel"
      @show-my-events="activeTab = 'my'"
    />

    <EventsFilters
      v-model:search="search"
      v-model:active-tab="activeTab"
      v-model:selected-category="selectedCategory"
      v-model:selected-city="selectedCity"
      v-model:selected-sort="selectedSort"
      :tabs="eventTabs"
      :tab-counts="tabCounts"
      :categories="eventCategories"
      :cities="eventCities"
      :result-count="visibleEvents.length"
      :status-label="filtersStatusLabel"
      :can-reset="hasActiveFilters"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4">
        <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5' }">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-primary)]">
                {{ $t("pages.eventsPage.results") }}
              </p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                {{ resultHeading }}
              </h2>
              <p class="mt-1 text-body-secondary">
                {{ $t("pages.eventsPage.resultMeta", { count: visibleEvents.length, tab: activeTabLabel }) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ activeTabLabel }}
              </UBadge>
              <UBadge
                v-if="search"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
              >
                {{ search }}
              </UBadge>
              <UBadge
                v-if="selectedCategory !== 'all'"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
              >
                {{ activeCategoryLabel }}
              </UBadge>
              <UBadge
                v-if="selectedCity !== 'all'"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
              >
                {{ activeCityLabel }}
              </UBadge>
              <UBadge color="neutral" variant="outline" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ activeSortLabel }}
              </UBadge>
              <UButton
                v-if="hasActiveFilters"
                color="neutral"
                variant="outline"
                size="sm"
                class="rounded-full"
                @click="resetFilters"
              >
                <Icon name="i-ph-arrow-counter-clockwise" class="mr-1.5 h-4 w-4" />
                {{ $t("pages.eventsPage.reset") }}
              </UButton>
            </div>
          </div>
        </UCard>

        <div
          v-if="visibleEvents.length > 0"
          class="grid gap-4 lg:grid-cols-2"
        >
          <EventsEventCard
            v-for="event in visibleEvents"
            :key="event.id"
            :event="event"
            :rsvp-state="getCurrentState(event)"
            @rsvp="setRsvp"
          />
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-calendar-x-fill"
          :title="$t('pages.eventsPage.emptyTitle')"
          :description="$t('pages.eventsPage.emptyDescription')"
          class="rounded-[30px]"
        >
          <template #actions>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="hasActiveFilters"
                color="neutral"
                variant="outline"
                size="sm"
                class="rounded-full"
                @click="resetFilters"
              >
                {{ $t("pages.eventsPage.reset") }}
              </UButton>
              <UButton
                to="/events/create-event"
                color="primary"
                size="sm"
                class="rounded-full"
              >
                {{ $t("pages.eventsPage.createEvent") }}
              </UButton>
            </div>
          </template>
        </UAlert>
      </section>

      <EventsSidebar
        :next-event="nextEvent"
        :categories="eventCategories"
        :selected-category="selectedCategory"
        :counts="categoryCounts"
        :recent-attendees="recentAttendees"
        :status-label="filtersStatusLabel"
        :has-active-filters="hasActiveFilters"
        @select-category="selectedCategory = $event"
        @reset="resetFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import {
  eventCategoryKeys,
  eventCityKeys,
  eventSortKeys,
  eventTabKeys,
  type EventCategoryKey,
  type EventCityKey,
  type EventRsvpState,
  type EventSortKey,
  type EventTabKey,
  type MockEvent,
} from "~/composables/useMockEventsData"

type EventsListingFilters = {
  search: string
  tab: EventTabKey
  category: EventCategoryKey
  city: EventCityKey
  sort: EventSortKey
}

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeTab(value: string): EventTabKey {
  return eventTabKeys.includes(value as EventTabKey)
    ? value as EventTabKey
    : "upcoming"
}

function normalizeCategory(value: string): EventCategoryKey {
  return eventCategoryKeys.includes(value as EventCategoryKey)
    ? value as EventCategoryKey
    : "all"
}

function normalizeCity(value: string): EventCityKey {
  return eventCityKeys.includes(value as EventCityKey)
    ? value as EventCityKey
    : "all"
}

function normalizeSort(value: string): EventSortKey {
  return eventSortKeys.includes(value as EventSortKey)
    ? value as EventSortKey
    : "soonest"
}

const defaultFilters: EventsListingFilters = {
  search: "",
  tab: "upcoming",
  category: "all",
  city: "all",
  sort: "soonest",
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { events, eventTabs, eventCategories, eventCities } = useMockEventsData()

const storedFilters = useStorage<EventsListingFilters>(
  "events:listing-filters",
  defaultFilters,
  undefined,
  { initOnMounted: true },
)

const search = ref(readQueryValue(route.query.q).trim())
const activeTab = ref<EventTabKey>(normalizeTab(readQueryValue(route.query.tab)))
const selectedCategory = ref<EventCategoryKey>(normalizeCategory(readQueryValue(route.query.category)))
const selectedCity = ref<EventCityKey>(normalizeCity(readQueryValue(route.query.city)))
const selectedSort = ref<EventSortKey>(normalizeSort(readQueryValue(route.query.sort)))
const rsvpById = ref<Record<string, EventRsvpState>>(
  Object.fromEntries(events.map(event => [event.id, event.userState])),
)

const getCurrentState = (event: MockEvent) =>
  rsvpById.value[event.id] ?? event.userState

const matchesKeyword = (event: MockEvent, keyword: string) => {
  if (!keyword) return true

  return [
    event.title,
    event.host,
    event.location,
    event.categoryLabel,
    event.summary,
    ...event.tags,
  ].join(" ").toLowerCase().includes(keyword)
}

const matchesTab = (event: MockEvent, tab: EventTabKey) => {
  const state = getCurrentState(event)

  if (tab === "my") return event.isOwner
  if (tab === "going") return state === "going"
  if (tab === "interested") return state === "interested"
  if (tab === "invited") return state === "invited" || event.tabKeys.includes("invited")

  return event.tabKeys.includes(tab)
}

const matchesListingState = (
  event: MockEvent,
  overrides: Partial<Pick<EventsListingFilters, "tab" | "category" | "city">> = {},
) => {
  const keyword = search.value.trim().toLowerCase()
  const tab = overrides.tab ?? activeTab.value
  const category = overrides.category ?? selectedCategory.value
  const city = overrides.city ?? selectedCity.value

  return matchesTab(event, tab)
    && (category === "all" || event.category === category)
    && (city === "all" || event.city === city)
    && matchesKeyword(event, keyword)
}

const activeTabLabel = computed(() =>
  eventTabs.find(tab => tab.key === activeTab.value)?.label
  ?? t("pages.eventsPage.eventFallback"),
)

const activeCategoryLabel = computed(() =>
  eventCategories.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.eventsPage.all"),
)

const activeCityLabel = computed(() =>
  eventCities.find(city => city.value === selectedCity.value)?.label
  ?? t("pages.eventsPage.anywhere"),
)

const activeSortLabel = computed(() => {
  if (selectedSort.value === "going") return t("pages.eventsPage.sortGoing")
  if (selectedSort.value === "interested") return t("pages.eventsPage.sortInterested")
  return t("pages.eventsPage.sortSoonest")
})

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0
  || activeTab.value !== "upcoming"
  || selectedCategory.value !== "all"
  || selectedCity.value !== "all"
  || selectedSort.value !== "soonest",
)

const tabCounts = computed<Record<EventTabKey, number>>(() => ({
  upcoming: events.filter(event => matchesListingState(event, { tab: "upcoming" })).length,
  my: events.filter(event => matchesListingState(event, { tab: "my" })).length,
  going: events.filter(event => matchesListingState(event, { tab: "going" })).length,
  invited: events.filter(event => matchesListingState(event, { tab: "invited" })).length,
  interested: events.filter(event => matchesListingState(event, { tab: "interested" })).length,
  past: events.filter(event => matchesListingState(event, { tab: "past" })).length,
}))

const visibleEvents = computed(() => {
  const filteredEvents = events.filter(event => matchesListingState(event))

  if (selectedSort.value === "going") {
    return [...filteredEvents].sort((a, b) => b.stats.going - a.stats.going)
  }

  if (selectedSort.value === "interested") {
    return [...filteredEvents].sort((a, b) => b.stats.interested - a.stats.interested)
  }

  return [...filteredEvents].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
})

const categoryCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {
    all: events.filter(event => matchesListingState(event, { category: "all" })).length,
  }

  for (const category of eventCategories) {
    if (category.value === "all") continue
    counts[category.value] = events.filter(event =>
      matchesListingState(event, { category: category.value }),
    ).length
  }

  return counts
})

const heroStats = computed(() => [
  {
    label: t("pages.eventsPage.statUpcoming"),
    value: tabCounts.value.upcoming,
    description: t("pages.eventsPage.statUpcomingDescription"),
  },
  {
    label: t("pages.eventsPage.statGoing"),
    value: tabCounts.value.going,
    description: t("pages.eventsPage.statGoingDescription"),
  },
  {
    label: t("pages.eventsPage.statInvited"),
    value: tabCounts.value.invited,
    description: t("pages.eventsPage.statInvitedDescription"),
  },
])

const resultHeading = computed(() => {
  if (search.value.trim()) {
    return t("pages.eventsPage.searchResult", { query: search.value.trim() })
  }

  return activeTabLabel.value
})

const filtersStatusLabel = computed(() => {
  const parts = [
    t("pages.eventsPage.resultMeta", {
      count: visibleEvents.value.length,
      tab: activeTabLabel.value,
    }),
  ]

  if (search.value.trim()) {
    parts.push(t("pages.eventsPage.searchResult", { query: search.value.trim() }))
  }

  if (selectedCategory.value !== "all") {
    parts.push(activeCategoryLabel.value)
  }

  if (selectedCity.value !== "all") {
    parts.push(activeCityLabel.value)
  }

  parts.push(activeSortLabel.value)

  return parts.join(" · ")
})

const heroStatusLabel = computed(() => {
  const parts = [
    t("pages.eventsPage.resultMeta", {
      count: visibleEvents.value.length,
      tab: activeTabLabel.value,
    }),
  ]

  if (search.value.trim()) {
    parts.push(t("pages.eventsPage.searchResult", { query: search.value.trim() }))
  }

  if (selectedCategory.value !== "all") {
    parts.push(activeCategoryLabel.value)
  }

  if (selectedCity.value !== "all") {
    parts.push(activeCityLabel.value)
  }

  return parts.join(" · ")
})

const nextEvent = computed(() => {
  const scopedEvent = visibleEvents.value.find(event => event.tabKeys.includes("upcoming"))
  if (scopedEvent) return scopedEvent

  const fallbackScopedEvent = events.find(event =>
    matchesListingState(event, { tab: "upcoming" }),
  )
  if (fallbackScopedEvent) return fallbackScopedEvent

  return events.find(event => event.tabKeys.includes("upcoming"))
})

const recentAttendees = computed(() => {
  const scopedAttendees = visibleEvents.value.flatMap(event => event.attendees)
  if (scopedAttendees.length > 0) return scopedAttendees.slice(0, 6)
  return events.flatMap(event => event.attendees).slice(0, 6)
})

watch(() => route.query.q, (value) => {
  const nextSearch = readQueryValue(value).trim()
  if (nextSearch !== search.value) {
    search.value = nextSearch
  }
})

watch(() => route.query.tab, (value) => {
  const nextTab = normalizeTab(readQueryValue(value))
  if (nextTab !== activeTab.value) {
    activeTab.value = nextTab
  }
})

watch(() => route.query.category, (value) => {
  const nextCategory = normalizeCategory(readQueryValue(value))
  if (nextCategory !== selectedCategory.value) {
    selectedCategory.value = nextCategory
  }
})

watch(() => route.query.city, (value) => {
  const nextCity = normalizeCity(readQueryValue(value))
  if (nextCity !== selectedCity.value) {
    selectedCity.value = nextCity
  }
})

watch(() => route.query.sort, (value) => {
  const nextSort = normalizeSort(readQueryValue(value))
  if (nextSort !== selectedSort.value) {
    selectedSort.value = nextSort
  }
})

onMounted(() => {
  const hasRouteFilters = [
    route.query.q,
    route.query.tab,
    route.query.category,
    route.query.city,
    route.query.sort,
  ].some(value => readQueryValue(value).trim().length > 0)

  if (!hasRouteFilters) {
    search.value = storedFilters.value.search.trim()
    activeTab.value = normalizeTab(storedFilters.value.tab)
    selectedCategory.value = normalizeCategory(storedFilters.value.category)
    selectedCity.value = normalizeCity(storedFilters.value.city)
    selectedSort.value = normalizeSort(storedFilters.value.sort)
  }

  syncRoute()
})

watchDebounced(search, () => {
  const normalizedSearch = search.value.trim()

  if (normalizedSearch !== search.value) {
    search.value = normalizedSearch
    return
  }

  storedFilters.value = {
    ...storedFilters.value,
    search: normalizedSearch,
  }
  syncRoute()
}, { debounce: 250, maxWait: 800 })

watch([activeTab, selectedCategory, selectedCity, selectedSort], ([tab, category, city, sort]) => {
  storedFilters.value = {
    search: search.value.trim(),
    tab,
    category,
    city,
    sort,
  }
  syncRoute()
})

function stateLabel(state: EventRsvpState) {
  if (state === "going") return t("pages.eventsPage.rsvpGoing")
  if (state === "interested") return t("pages.eventsPage.rsvpInterested")
  if (state === "invited") return t("pages.eventsPage.rsvpInvited")
  if (state === "not_interested") return t("pages.eventsPage.rsvpSkipped")
  return t("pages.eventsPage.rsvpOpen")
}

function setRsvp(id: string, state: EventRsvpState) {
  if (rsvpById.value[id] === state) return

  rsvpById.value = {
    ...rsvpById.value,
    [id]: state,
  }

  const event = events.find(item => item.id === id)

  toast.add({
    color: state === "not_interested" ? "neutral" : "success",
    icon: state === "not_interested" ? "i-ph-x-circle-fill" : "i-ph-check-circle-fill",
    title: stateLabel(state),
    description: event?.title,
  })
}

function resetFilters() {
  search.value = ""
  activeTab.value = "upcoming"
  selectedCategory.value = "all"
  selectedCity.value = "all"
  selectedSort.value = "soonest"
}

function syncRoute() {
  const nextSearch = search.value.trim()
  const nextTab = activeTab.value === "upcoming" ? "" : activeTab.value
  const nextCategory = selectedCategory.value === "all" ? "" : selectedCategory.value
  const nextCity = selectedCity.value === "all" ? "" : selectedCity.value
  const nextSort = selectedSort.value === "soonest" ? "" : selectedSort.value

  if (
    readQueryValue(route.query.q).trim() === nextSearch
    && readQueryValue(route.query.tab) === nextTab
    && readQueryValue(route.query.category) === nextCategory
    && readQueryValue(route.query.city) === nextCity
    && readQueryValue(route.query.sort) === nextSort
  ) {
    return
  }

  const nextQuery = { ...route.query }

  if (nextSearch) {
    nextQuery.q = nextSearch
  }
  else {
    delete nextQuery.q
  }

  if (nextTab) {
    nextQuery.tab = nextTab
  }
  else {
    delete nextQuery.tab
  }

  if (nextCategory) {
    nextQuery.category = nextCategory
  }
  else {
    delete nextQuery.category
  }

  if (nextCity) {
    nextQuery.city = nextCity
  }
  else {
    delete nextQuery.city
  }

  if (nextSort) {
    nextQuery.sort = nextSort
  }
  else {
    delete nextQuery.sort
  }

  router.replace({ query: nextQuery })
}
</script>
