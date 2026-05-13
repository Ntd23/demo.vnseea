// English description: Loads a backend-backed event detail record, attendee lists, event posts, and RSVP actions for the event detail page.

import { computed, ref, toValue, type MaybeRefOrGetter } from "vue"
import type { EventRsvpState } from "../../domain/types/events.types"
import { createApiEventsRepository } from "../../infrastructure/repositories/ApiEventsRepository"

export function useEventDetailPageVM(
  idSource: MaybeRefOrGetter<string | number>,
  repository = createApiEventsRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()
  const eventId = computed(() => String(toValue(idSource)))

  const { data, status, error, refresh } = useAsyncData(
    () => `events:detail:${eventId.value}`,
    () => repository.getEventById(eventId.value),
    {
      watch: [eventId],
      default: () => null,
    },
  )

  const { data: goingData, status: goingStatus, refresh: refreshGoing } = useAsyncData(
    () => `events:detail:${eventId.value}:going`,
    () => repository.getAttendees(eventId.value, "going"),
    {
      watch: [eventId],
      default: () => [],
    },
  )

  const { data: interestedData, status: interestedStatus, refresh: refreshInterested } = useAsyncData(
    () => `events:detail:${eventId.value}:interested`,
    () => repository.getAttendees(eventId.value, "interested"),
    {
      watch: [eventId],
      default: () => [],
    },
  )

  const { data: postsData, status: postsStatus, refresh: refreshPosts } = useAsyncData(
    () => `events:detail:${eventId.value}:posts`,
    () => repository.getPosts(eventId.value, { limit: 10 }),
    {
      watch: [eventId],
      default: () => ({
        posts: [],
        hasMore: false,
        nextOffset: null,
      }),
    },
  )

  const rsvpBusy = ref(false)
  const busyAction = ref<"going" | "interested" | null>(null)

  const pending = computed(() =>
    status.value === "pending"
    || goingStatus.value === "pending"
    || interestedStatus.value === "pending"
    || postsStatus.value === "pending"
  )

  const event = computed(() => data.value)
  const posts = computed(() => postsData.value.posts ?? [])
  const hasPosts = computed(() => posts.value.length > 0)
  const goingAttendees = computed(() => goingData.value ?? [])
  const interestedAttendees = computed(() => interestedData.value ?? [])
  const errorMessage = computed(() =>
    error.value instanceof Error
      ? error.value.message
      : t("pages.eventDetailPage.seoDescription"),
  )

  const refreshAll = async () => {
    await Promise.all([refresh(), refreshGoing(), refreshInterested(), refreshPosts()])
  }

  const applyRsvp = async (state: EventRsvpState) => {
    if (!event.value || rsvpBusy.value) return

    rsvpBusy.value = true
    busyAction.value = state === "interested" ? "interested" : "going"

    try {
      const result = state === "going"
        ? await repository.setGoing(event.value.id)
        : await repository.setInterested(event.value.id)

      if (!event.value) return

      const previousState = event.value.rsvpState
      const nextState = result.rsvpState

      event.value.rsvpState = nextState

      if (previousState !== "going" && nextState === "going") {
        event.value.goingCount += 1
      }
      else if (previousState === "going" && nextState !== "going") {
        event.value.goingCount = Math.max(0, event.value.goingCount - 1)
      }

      if (previousState !== "interested" && nextState === "interested") {
        event.value.interestedCount += 1
      }
      else if (previousState === "interested" && nextState !== "interested") {
        event.value.interestedCount = Math.max(0, event.value.interestedCount - 1)
      }

      await Promise.all([refreshGoing(), refreshInterested()])

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: event.value.name,
        description: nextState === "going"
          ? t("pages.eventsPage.rsvpGoing")
          : nextState === "interested"
            ? t("pages.eventsPage.rsvpInterested")
            : t("pages.eventsPage.rsvpSkipped"),
      })
    }
    finally {
      rsvpBusy.value = false
      busyAction.value = null
    }
  }

  return {
    eventId,
    event,
    pending,
    posts,
    hasPosts,
    errorMessage,
    goingAttendees,
    interestedAttendees,
    refreshAll,
    rsvpBusy,
    busyAction,
    setGoing: () => applyRsvp("going"),
    setInterested: () => applyRsvp("interested"),
  }
}
