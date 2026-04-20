<template>
  <div class="space-y-5 pb-10">
    <EventsHero
      :my-events-active="activeTab === 'my'"
      :total-events="events.length"
      :stats="heroStats"
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
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4">
        <div class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 px-4 py-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              {{ $t("pages.eventsPage.results") }}
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              {{ resultHeading }}
            </h2>
            <p class="mt-1 text-body-secondary">
              {{ $t("pages.eventsPage.resultMeta", { count: visibleEvents.length, tab: activeTabLabel }) }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <NuxtLink
              to="/events/create-event"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] px-3 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-calendar-plus-fill" class="h-4 w-4" />
              {{ $t("pages.eventsPage.createEvent") }}
            </NuxtLink>
            <div class="inline-flex h-11 items-center gap-2 rounded-[18px] bg-[var(--color-primary-50)] px-3 text-[13px] font-bold text-[var(--color-primary-600)]">
              <Icon name="i-ph-funnel-fill" class="h-4 w-4" />
              {{ activeFiltersLabel }}
            </div>
            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
              {{ $t("pages.eventsPage.reset") }}
            </button>
          </div>
        </div>

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

        <section
          v-else
          class="rounded-[30px] border border-[var(--border-default)] bg-white px-5 py-12 text-center shadow-[var(--shadow-md)]"
        >
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Icon name="i-ph-calendar-x-fill" class="h-10 w-10" />
          </div>
          <h2 class="mt-5 text-heading text-[var(--text-primary)]">
            {{ $t("pages.eventsPage.emptyTitle") }}
          </h2>
          <p class="mx-auto mt-2 max-w-[520px] text-body-secondary">
            {{ $t("pages.eventsPage.emptyDescription") }}
          </p>
        </section>
      </section>

      <EventsSidebar
        :next-event="nextEvent"
        :categories="eventCategories"
        :selected-category="selectedCategory"
        :recent-attendees="recentAttendees"
        :count-by-category="countByCategory"
        @select-category="selectedCategory = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState, EventTabKey, MockEvent } from "~/composables/useMockEventsData"

const { t } = useI18n()
const { events, eventTabs, eventCategories, eventCities } = useMockEventsData()

useSeoMeta({
  title: () => t("pages.eventsPage.seoTitle"),
  description: () => t("pages.eventsPage.seoDescription"),
})

const search = ref("")
const activeTab = ref<EventTabKey>("upcoming")
const selectedCategory = ref("all")
const selectedCity = ref("all")
const selectedSort = ref<"soonest" | "going" | "interested">("soonest")
const rsvpById = ref<Record<string, EventRsvpState>>(
  Object.fromEntries(events.map((event) => [event.id, event.userState])),
)

const getCurrentState = (event: MockEvent) => rsvpById.value[event.id] ?? event.userState

const matchesTab = (event: MockEvent, tab: EventTabKey) => {
  const state = getCurrentState(event)

  if (tab === "my") return event.isOwner
  if (tab === "going") return state === "going"
  if (tab === "interested") return state === "interested"
  if (tab === "invited") return state === "invited" || event.tabKeys.includes("invited")

  return event.tabKeys.includes(tab)
}

const tabCounts = computed<Record<EventTabKey, number>>(() => ({
  upcoming: events.filter((event) => matchesTab(event, "upcoming")).length,
  my: events.filter((event) => matchesTab(event, "my")).length,
  going: events.filter((event) => matchesTab(event, "going")).length,
  invited: events.filter((event) => matchesTab(event, "invited")).length,
  interested: events.filter((event) => matchesTab(event, "interested")).length,
  past: events.filter((event) => matchesTab(event, "past")).length,
}))

const visibleEvents = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filteredEvents = events
    .filter((event) => matchesTab(event, activeTab.value))
    .filter((event) => selectedCategory.value === "all" || event.category === selectedCategory.value)
    .filter((event) => selectedCity.value === "all" || event.city === selectedCity.value)
    .filter((event) => {
      if (!keyword) return true

      return [
        event.title,
        event.host,
        event.location,
        event.categoryLabel,
        event.summary,
        ...event.tags,
      ].join(" ").toLowerCase().includes(keyword)
    })

  if (selectedSort.value === "going") {
    return filteredEvents.sort((a, b) => b.stats.going - a.stats.going)
  }

  if (selectedSort.value === "interested") {
    return filteredEvents.sort((a, b) => b.stats.interested - a.stats.interested)
  }

  return filteredEvents.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
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

const activeTabLabel = computed(() => eventTabs.find((tab) => tab.key === activeTab.value)?.label || t("pages.eventsPage.eventFallback"))

const resultHeading = computed(() => {
  if (search.value.trim()) return t("pages.eventsPage.searchResult", { query: search.value.trim() })
  return activeTabLabel.value
})

const activeFiltersLabel = computed(() => {
  const category = eventCategories.find((item) => item.value === selectedCategory.value)?.label || t("pages.eventsPage.all")
  const city = eventCities.find((item) => item.value === selectedCity.value)?.label || t("pages.eventsPage.anywhere")
  const sort = selectedSort.value === "going"
    ? t("pages.eventsPage.sortGoing")
    : selectedSort.value === "interested"
      ? t("pages.eventsPage.sortInterested")
      : t("pages.eventsPage.sortSoonest")

  return `${category} · ${city} · ${sort}`
})

const nextEvent = computed(() => events.find((event) => event.tabKeys.includes("upcoming")))
const recentAttendees = computed(() => events.flatMap((event) => event.attendees).slice(0, 6))
const countByCategory = (category: string) => events.filter((event) => event.category === category).length

const setRsvp = (id: string, state: EventRsvpState) => {
  rsvpById.value = {
    ...rsvpById.value,
    [id]: state,
  }
}

const resetFilters = () => {
  search.value = ""
  activeTab.value = "upcoming"
  selectedCategory.value = "all"
  selectedCity.value = "all"
  selectedSort.value = "soonest"
}
</script>
