<template>
  <div v-if="event" class="space-y-5 pb-10">
    <EventsEventDetailHero
      :event="event"
      :is-missing="isMissing"
      :rsvp-state="rsvpState"
      :rsvp-label="rsvpLabel"
      :rsvp-busy="rsvpStatus === 'loading'"
      @set-rsvp="setRsvp"
      @toggle-invite="inviteOpen = !inviteOpen"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <EventsEventDetailMain
        :event="event"
        :share-open="shareOpen"
        :share-url="shareUrl"
        :share-status="shareStatus"
        :share-message="shareMessage"
        :copy-busy="shareStatus === 'loading'"
        @toggle-share="toggleShare"
        @copy-share="copyShare"
      />
      <EventsEventDetailSidebar
        :event="event"
        :all-events="events"
        :invite-open="inviteOpen"
        :invite-status="inviteStatus"
        :invite-message="inviteMessage"
        :owner-status="ownerStatus"
        :owner-message="ownerMessage"
        :action-busy="inviteStatus === 'loading' || ownerStatus === 'loading'"
        :related-events="relatedEvents"
        @close-invite="inviteOpen = false"
        @send-invite="sendInvites"
        @edit-event="editEvent"
        @delete-event="deleteEvent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState } from "~/composables/useMockEventsData"

type DetailActionStatus = "idle" | "loading" | "success" | "error"

const route = useRoute()
const requestURL = useRequestURL()
const { t } = useI18n()
const toast = useToast()
const { events, findEventById } = useMockEventsData()

const routeId = computed(() => String(route.params.id || ""))
const foundEvent = computed(() => findEventById(routeId.value))
const event = computed(() => foundEvent.value || events[0])
const isMissing = computed(() => !foundEvent.value)

const shareUrl = computed(() =>
  new URL(`/events/${event.value?.id || routeId.value || ""}`, requestURL.origin).toString(),
)

const rsvpState = ref<EventRsvpState>("none")
const rsvpStatus = ref<DetailActionStatus>("idle")
const inviteOpen = ref(false)
const inviteStatus = ref<DetailActionStatus>("idle")
const inviteMessage = ref("")
const shareOpen = ref(false)
const shareStatus = ref<DetailActionStatus>("idle")
const shareMessage = ref("")
const ownerStatus = ref<DetailActionStatus>("idle")
const ownerMessage = ref("")

watch(
  () => event.value?.id,
  () => {
    rsvpState.value = event.value?.userState || "none"
    rsvpStatus.value = "idle"
    inviteOpen.value = false
    inviteStatus.value = "idle"
    inviteMessage.value = ""
    shareOpen.value = false
    shareStatus.value = "idle"
    shareMessage.value = ""
    ownerStatus.value = "idle"
    ownerMessage.value = ""
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

function rsvpToastDescription(state: EventRsvpState) {
  if (state === "going") return t("pages.eventsPage.rsvpGoing")
  if (state === "interested") return t("pages.eventsPage.rsvpInterested")
  if (state === "invited") return t("pages.eventsPage.rsvpInvited")
  if (state === "not_interested") return t("pages.eventsPage.rsvpSkipped")
  return t("pages.eventDetailPage.rsvpPending")
}

async function setRsvp(state: EventRsvpState) {
  if (rsvpStatus.value === "loading" || rsvpState.value === state) return

  rsvpStatus.value = "loading"
  await new Promise(resolve => setTimeout(resolve, 280))
  rsvpState.value = state
  rsvpStatus.value = "success"

  toast.add({
    color: state === "not_interested" ? "neutral" : "success",
    icon: state === "not_interested" ? "i-ph-x-circle-fill" : "i-ph-check-circle-fill",
    title: event.value?.title,
    description: rsvpToastDescription(state),
  })
}

function toggleShare() {
  shareOpen.value = !shareOpen.value
  if (!shareOpen.value) {
    shareStatus.value = "idle"
    shareMessage.value = ""
  }
}

async function copyShare() {
  shareStatus.value = "loading"

  try {
    if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      throw new Error("clipboard_unavailable")
    }

    await navigator.clipboard.writeText(shareUrl.value)
    shareStatus.value = "success"
    shareMessage.value = t("pages.eventDetailPage.copyMessage")

    toast.add({
      color: "success",
      icon: "i-ph-copy-fill",
      title: t("pages.eventDetailPage.share"),
      description: t("pages.eventDetailPage.copyMessage"),
    })
  }
  catch {
    shareStatus.value = "error"
    shareMessage.value = shareUrl.value

    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("pages.eventDetailPage.share"),
      description: shareUrl.value,
    })
  }
}

async function sendInvites(ids: number[]) {
  if (ids.length === 0) {
    inviteStatus.value = "error"
    inviteMessage.value = t("pages.eventDetailPage.inviteSelectMessage")

    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("pages.eventDetailPage.sendInvite"),
      description: inviteMessage.value,
    })

    return
  }

  inviteStatus.value = "loading"
  await new Promise(resolve => setTimeout(resolve, 320))
  inviteStatus.value = "success"
  inviteMessage.value = t("pages.eventDetailPage.inviteSentMessage", {
    count: ids.length,
  })

  toast.add({
    color: "success",
    icon: "i-ph-paper-plane-tilt-fill",
    title: t("pages.eventDetailPage.sendInvite"),
    description: inviteMessage.value,
  })
}

async function editEvent() {
  ownerStatus.value = "loading"
  await new Promise(resolve => setTimeout(resolve, 220))
  ownerStatus.value = "success"
  ownerMessage.value = t("pages.eventDetailPage.editMockMessage")

  toast.add({
    color: "success",
    icon: "i-ph-pencil-simple-fill",
    title: t("pages.eventDetailPage.editEvent"),
    description: ownerMessage.value,
  })
}

async function deleteEvent() {
  ownerStatus.value = "loading"
  await new Promise(resolve => setTimeout(resolve, 220))
  ownerStatus.value = "error"
  ownerMessage.value = t("pages.eventDetailPage.deleteMockMessage")

  toast.add({
    color: "warning",
    icon: "i-ph-trash-fill",
    title: t("pages.eventDetailPage.deleteEvent"),
    description: ownerMessage.value,
  })
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

