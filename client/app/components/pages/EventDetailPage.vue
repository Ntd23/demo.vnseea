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
const { events, findEventById } = useMockEventsData()

const routeId = computed(() => String(route.params.id || ""))
const foundEvent = computed(() => findEventById(routeId.value))
const event = computed(() => foundEvent.value || events[0])
const isMissing = computed(() => !foundEvent.value)

useSeoMeta({
  title: () => `${event.value?.title || "Chi tiết sự kiện"} | VNSEEA`,
  description: () => event.value?.summary || "Chi tiết sự kiện cộng đồng trên VNSEEA.",
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
  if (rsvpState.value === "going") return "Sẽ tham gia"
  if (rsvpState.value === "interested") return "Đang quan tâm"
  if (rsvpState.value === "invited") return "Được mời"
  if (rsvpState.value === "not_interested") return "Không quan tâm"
  return "Chưa phản hồi"
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
