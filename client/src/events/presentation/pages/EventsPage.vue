<!-- Description: Renders the backend-backed events directory using the legacy PHP tab order and list-first layout. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 pb-10">
    <section class="wow-content">
      <div class="wo-page-heading wo-page-heading--big">
        <span class="wo-page-heading__icon">
          <Icon name="i-ph-calendar-blank-fill" class="h-5 w-5" />
        </span>
        <span>{{ $t("pages.eventsPage.title") }}</span>
      </div>
    </section>

    <section class="events-tabs-card">
      <div class="events-tabs-card__top">
        <div class="events-tabs-card__scroll">
          <div class="events-tabs-card__items">
            <NuxtLink
              v-for="tab in tabItems"
              :key="tab.key"
              :to="tabLink(tab.key)"
              class="events-tabs-card__link"
              :class="{ 'events-tabs-card__link--active': activeTab === tab.key }"
            >
              {{ tab.label }}
            </NuxtLink>
          </div>
        </div>

        <NuxtLink :to="appRoutes.createEvent" class="events-tabs-card__create">
          <Icon name="i-ph-plus-bold" class="h-4 w-4" />
          <span>{{ $t("pages.eventsPage.createEvent") }}</span>
        </NuxtLink>
      </div>

      <div class="events-tabs-card__filters">
        <div class="events-tabs-card__search">
          <Icon name="i-ph-magnifying-glass" class="events-tabs-card__search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="events-tabs-card__search-input"
            :placeholder="$t('pages.forumPage.searchPlaceholder')"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="events-tabs-card__search-clear"
            @click="searchQuery = ''"
          >
            <Icon name="i-ph-x-bold" />
          </button>
        </div>
      </div>
    </section>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
      <div
        v-for="item in 4"
        :key="item"
        class="overflow-hidden rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]"
      >
        <USkeleton class="aspect-[16/10] w-full" />
        <div class="space-y-3 p-4">
          <USkeleton class="h-5 w-3/4 rounded-xl" />
          <USkeleton class="h-4 w-full rounded-xl" />
          <USkeleton class="h-4 w-2/3 rounded-xl" />
        </div>
      </div>
    </div>

    <section v-else-if="events.length === 0" class="wow-content empty-state-wrap">
      <FoundationEmptyState
        icon="i-ph-calendar-x-fill"
        :title="$t('pages.eventsPage.emptyTitle')"
        :description="$t('pages.eventsPage.emptyDescription')"
      />
    </section>

    <section v-else-if="filteredEvents.length === 0" class="wow-content empty-state-wrap">
      <FoundationEmptyState
        icon="i-ph-magnifying-glass-duotone"
        :title="$t('pages.forumPage.searchEmptyTitle')"
        :description="$t('pages.forumPage.searchEmptyDescription')"
      />
    </section>

    <div v-else class="events-grid">
      <EventsEventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        :busy-state="busyEventId === event.id ? busyAction : null"
        @set-going="setGoing"
        @set-interested="setInterested"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { normalizeEventTab } from "../../domain/constants/events-options"
import type { EventTabKey } from "../../domain/types/events.types"
import { createApiEventsRepository } from "../../infrastructure/repositories/ApiEventsRepository"
import { useEventsPageVM } from "../../application/view-models/useEventsPageVM"
import EventsEventCard from "../components/EventCard.vue"

const route = useRoute()
const { t } = useI18n()
const repository = createApiEventsRepository()
const activeTabRef = computed<EventTabKey>(() => normalizeEventTab(String(route.query.tab || "browse")))
const { activeTab, pending, events, tabItems, refresh } = useEventsPageVM(activeTabRef, repository)
const toast = useToast()

const searchQuery = ref("")

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return events.value
  return events.value.filter(event =>
    (event.title || "").toLowerCase().includes(query) ||
    (event.location || "").toLowerCase().includes(query) ||
    (event.description || "").toLowerCase().includes(query)
  )
})

const busyEventId = ref<number | null>(null)
const busyAction = ref<"going" | "interested" | null>(null)

const tabLink = (tab: EventTabKey) =>
  tab === "browse"
    ? appRoutes.events
    : `${appRoutes.events}?tab=${encodeURIComponent(tab)}`

const updateLocalRsvp = (
  eventId: number,
  action: "going" | "interested",
  nextState: "going" | "interested" | "none",
) => {
  const event = events.value.find(item => item.id === eventId)
  if (!event) return

  if (action === "going") {
    event.isGoing = nextState === "going"
    event.rsvpState = event.isGoing
      ? "going"
      : event.isInterested
        ? "interested"
        : "none"
    event.goingCount = nextState === "going"
      ? Math.max(1, event.goingCount)
      : Math.max(0, event.goingCount - 1)
    return
  }

  event.isInterested = nextState === "interested"
  event.rsvpState = event.isGoing
    ? "going"
    : event.isInterested
      ? "interested"
      : "none"
  event.interestedCount = nextState === "interested"
    ? Math.max(1, event.interestedCount)
    : Math.max(0, event.interestedCount - 1)
}

const runRsvp = async (eventId: number, action: "going" | "interested") => {
  busyEventId.value = eventId
  busyAction.value = action

  try {
    const result = action === "going"
      ? await repository.setGoing(eventId)
      : await repository.setInterested(eventId)

    updateLocalRsvp(eventId, action, result.rsvpState)

    toast.add({
      color: "success",
      icon: "i-ph-check-circle-fill",
      title: events.value.find(item => item.id === eventId)?.name || "Event",
      description: result.rsvpState === "going"
        ? t("pages.eventsPage.rsvpGoing")
        : result.rsvpState === "interested"
          ? t("pages.eventsPage.rsvpInterested")
          : t("pages.eventsPage.rsvpSkipped"),
    })

    await refresh()
  }
  finally {
    busyEventId.value = null
    busyAction.value = null
  }
}

const setGoing = (eventId: number) => runRsvp(eventId, "going")
const setInterested = (eventId: number) => runRsvp(eventId, "interested")
</script>

<style scoped>
.wow-content {
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-default);
}

.wo-page-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 20px;
  color: var(--text-primary);
  font-weight: 700;
}

.wo-page-heading--big {
  font-size: 22px;
}

.wo-page-heading__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-brand);
}

.events-tabs-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}

.events-tabs-card__top {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.events-tabs-card__scroll {
  min-width: 0;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
  padding-bottom: 8px; /* Room for scrollbar on mobile */
  flex: 1;
}

.events-tabs-card__items {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}

.events-tabs-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.events-tabs-card__link:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.events-tabs-card__link--active {
  color: var(--text-brand) !important;
  background: var(--bg-surface-active) !important;
}

.events-tabs-card__create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--bg-brand);
  padding: 0 14px;
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: var(--shadow-brand);
  white-space: nowrap;
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.events-tabs-card__create:hover {
  transform: translateY(-1px);
  background: var(--bg-brand-hover);
}

.events-tabs-card__filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.events-tabs-card__search {
  position: relative;
  flex: 1;
}

.events-tabs-card__search-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface-hover);
  padding: 0 40px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--duration-fast) var(--ease-default);
}

.events-tabs-card__search-input:focus {
  outline: none;
  border-color: var(--border-brand);
  background: var(--bg-surface);
}

.events-tabs-card__search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 18px;
}

.events-tabs-card__search-clear {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.events-tabs-card__search-clear:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.empty-state-wrap {
  padding: 40px 20px;
  text-align: center;
}

@media (max-width: 760px) {
  .events-tabs-card__top {
    flex-direction: column;
    align-items: stretch;
  }

  .events-tabs-card__create {
    width: 100%;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}

/* Webkit scrollbar for horizontal tabs scroll */
.events-tabs-card__scroll::-webkit-scrollbar {
  height: 6px !important;
  background-color: #e2e8f0 !important;
  display: block !important;
}

.events-tabs-card__scroll::-webkit-scrollbar-track {
  background-color: #e2e8f0 !important;
  border-radius: 999px !important;
}

.events-tabs-card__scroll::-webkit-scrollbar-thumb {
  background-color: #475569 !important;
  border-radius: 999px !important;
}

.events-tabs-card__scroll::-webkit-scrollbar-thumb:hover {
  background-color: #1e293b !important;
}
</style>
