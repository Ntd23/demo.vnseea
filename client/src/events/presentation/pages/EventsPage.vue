<!-- Description: Renders the backend-backed events directory using the legacy PHP tab order and list-first layout. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
          <Icon name="i-ph-calendar-check-fill" class="h-6 w-6" />
        </span>
        <div>
          <p class="text-label-secondary">{{ $t("pages.eventsPage.title") }}</p>
          <h1 class="text-heading text-[var(--text-primary)]">{{ $t("pages.eventsPage.title") }}</h1>
        </div>
      </div>
    </section>

    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="overflow-x-auto">
          <div class="flex min-w-max items-center gap-5 border-b border-[var(--border-default)]">
            <NuxtLink
              v-for="tab in tabItems"
              :key="tab.key"
              :to="tabLink(tab.key)"
              class="border-b-[3px] px-1 pb-3 pt-1 text-[1.05rem] font-medium transition"
              :class="activeTab === tab.key
                ? 'border-[var(--text-brand)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            >
              {{ tab.label }}
            </NuxtLink>
          </div>
        </div>

        <UButton :to="appRoutes.createEvent" color="primary" size="lg" class="justify-center rounded-full px-6">
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("pages.eventsPage.createEvent") }}
        </UButton>
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

    <section
      v-else-if="events.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-calendar-x-fill"
        :title="$t('pages.eventsPage.emptyTitle')"
        :description="$t('pages.eventsPage.emptyDescription')"
      />
    </section>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <EventsEventCard
        v-for="event in events"
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

const busyEventId = ref<number | null>(null)
const busyAction = ref<"going" | "interested" | null>(null)

const tabLink = (tab: EventTabKey) =>
  tab === "browse"
    ? appRoutes.events
    : `${appRoutes.events}?tab=${encodeURIComponent(tab)}`

const updateLocalRsvp = (eventId: number, nextState: "going" | "interested" | "none") => {
  const event = events.value.find(item => item.id === eventId)
  if (!event) return

  const previousState = event.rsvpState
  event.rsvpState = nextState

  if (previousState !== "going" && nextState === "going") {
    event.goingCount += 1
  }
  else if (previousState === "going" && nextState !== "going") {
    event.goingCount = Math.max(0, event.goingCount - 1)
  }

  if (previousState !== "interested" && nextState === "interested") {
    event.interestedCount += 1
  }
  else if (previousState === "interested" && nextState !== "interested") {
    event.interestedCount = Math.max(0, event.interestedCount - 1)
  }
}

const runRsvp = async (eventId: number, action: "going" | "interested") => {
  busyEventId.value = eventId
  busyAction.value = action

  try {
    const result = action === "going"
      ? await repository.setGoing(eventId)
      : await repository.setInterested(eventId)

    updateLocalRsvp(eventId, result.rsvpState)

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
