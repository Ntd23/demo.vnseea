<template>
  <div v-if="event" class="space-y-5 pb-10">
    <EventsEventDetailHero
      :event="event"
      :is-missing="isMissing"
      :rsvp-state="rsvpState"
      :rsvp-label="rsvpLabel"
      @set-rsvp="setRsvp"
      @toggle-invite="inviteOpen = !inviteOpen"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <EventsEventDetailMain :event="event" />
      <EventsEventDetailSidebar
        :event="event"
        :all-events="events"
        :invite-open="inviteOpen"
        :related-events="relatedEvents"
        @close-invite="inviteOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState } from "~/composables/useMockEventsData"

const route = useRoute()
const { t } = useI18n()
const { events, findEventById } = useMockEventsData()

const routeId = computed(() => String(route.params.id || ""))
const foundEvent = computed(() => findEventById(routeId.value))
const event = computed(() => foundEvent.value || events[0])
const isMissing = computed(() => !foundEvent.value)

useSeoMeta({
  title: () => `${event.value?.title || t("pages.eventDetailPage.seoTitle")} | VNSEEA`,
  description: () => event.value?.summary || t("pages.eventDetailPage.seoDescription"),
})

const rsvpState = ref<EventRsvpState>("none")
const inviteOpen = ref(false)

watch(
  () => event.value?.id,
  () => {
    rsvpState.value = event.value?.userState || "none"
    inviteOpen.value = false
  },
  { immediate: true },
)

const rsvpLabel = computed(() => {
  if (rsvpState.value === "going") return t("pages.eventsPage.rsvpGoing")
  if (rsvpState.value === "interested") return t("pages.eventsPage.rsvpInterested")
  if (rsvpState.value === "invited") return t("pages.eventsPage.rsvpInvited")
  if (rsvpState.value === "not_interested") return t("pages.eventsPage.rsvpSkipped")
  return t("pages.eventDetailPage.rsvpPending")
})

const relatedEvents = computed(() => {
  if (!event.value) return []

  const sameCategory = events.filter((item) =>
    item.id !== event.value?.id && item.category === event.value?.category,
  )
  const fallback = events.filter((item) => item.id !== event.value?.id)

  return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 3)
})

const setRsvp = (state: EventRsvpState) => {
  rsvpState.value = state
}
</script>
