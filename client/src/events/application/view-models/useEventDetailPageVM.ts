// English description: Loads a backend-backed event detail record, attendee lists, event posts, and RSVP actions for the event detail page.

import { computed, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from "vue"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventInviteCandidate, EventRsvpState } from "../../domain/types/events.types"
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

  const {
    data: goingData,
    status: goingStatus,
    refresh: refreshGoing,
  } = useAsyncData(
    () => `events:detail:${eventId.value}:going`,
    () => repository.getAttendees(eventId.value, "going"),
    {
      watch: [eventId],
      default: () => [],
    },
  )

  const {
    data: interestedData,
    status: interestedStatus,
    refresh: refreshInterested,
  } = useAsyncData(
    () => `events:detail:${eventId.value}:interested`,
    () => repository.getAttendees(eventId.value, "interested"),
    {
      watch: [eventId],
      default: () => [],
    },
  )

  const {
    data: postsData,
    status: postsStatus,
    refresh: refreshPosts,
  } = useAsyncData(
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
  const loadingMorePosts = ref(false)
  const inviteQuery = ref("")
  const inviteCandidates = ref<EventInviteCandidate[]>([])
  const searchingInvitees = ref(false)
  const invitingUserId = ref<number | null>(null)
  const deleting = ref(false)
  const updatingCover = ref(false)
  let inviteSearchTimer: ReturnType<typeof setTimeout> | null = null
  let inviteSearchRequest = 0

  const pending = computed(
    () =>
      status.value === "pending" ||
      goingStatus.value === "pending" ||
      interestedStatus.value === "pending" ||
      postsStatus.value === "pending",
  )

  const event = computed(() => {
    if (!data.value) {
      return null
    }

    return {
      ...data.value,
      goingCount: Math.max(data.value.goingCount, goingData.value?.length ?? 0),
      interestedCount: Math.max(data.value.interestedCount, interestedData.value?.length ?? 0),
    }
  })
  const posts = computed(() => postsData.value.posts ?? [])
  const hasPosts = computed(() => posts.value.length > 0)
  const hasMorePosts = computed(() => Boolean(postsData.value.hasMore))
  const goingAttendees = computed(() => goingData.value ?? [])
  const interestedAttendees = computed(() => interestedData.value ?? [])
  const errorMessage = computed(() =>
    error.value instanceof Error ? error.value.message : t("pages.eventDetailPage.seoDescription"),
  )

  const refreshAll = async () => {
    await Promise.all([refresh(), refreshGoing(), refreshInterested(), refreshPosts()])
  }

  const loadMorePosts = async () => {
    if (loadingMorePosts.value || !postsData.value.hasMore) return

    const lastPostId = posts.value[posts.value.length - 1]?.id
    const afterPostId = postsData.value.nextOffset ?? lastPostId
    if (!afterPostId) return

    loadingMorePosts.value = true

    try {
      const nextPage = await repository.getPosts(eventId.value, {
        limit: 10,
        afterPostId,
      })
      const existingIds = new Set(posts.value.map((post) => post.id))

      postsData.value = {
        ...nextPage,
        posts: [...posts.value, ...nextPage.posts.filter((post) => !existingIds.has(post.id))],
      }
    } catch {
      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: t("pages.eventDetailPage.loadMoreError"),
      })
    } finally {
      loadingMorePosts.value = false
    }
  }

  const searchInvitees = async () => {
    const query = inviteQuery.value.trim()
    const requestId = ++inviteSearchRequest

    if (query.length < 2) {
      inviteCandidates.value = []
      searchingInvitees.value = false
      return
    }

    searchingInvitees.value = true

    try {
      const candidates = await repository.searchInviteCandidates(eventId.value, query)
      if (requestId === inviteSearchRequest) {
        inviteCandidates.value = candidates
      }
    } catch {
      if (requestId === inviteSearchRequest) {
        inviteCandidates.value = []
        toast.add({
          color: "error",
          icon: "i-ph-warning-circle-fill",
          title: t("pages.eventDetailPage.inviteSearchError"),
        })
      }
    } finally {
      if (requestId === inviteSearchRequest) {
        searchingInvitees.value = false
      }
    }
  }

  watch(inviteQuery, () => {
    if (inviteSearchTimer) {
      clearTimeout(inviteSearchTimer)
    }

    inviteSearchTimer = setTimeout(() => {
      void searchInvitees()
    }, 300)
  })

  const inviteUser = async (candidate: EventInviteCandidate) => {
    if (invitingUserId.value) return

    invitingUserId.value = candidate.id

    try {
      await repository.inviteUser(eventId.value, candidate.id)
      inviteCandidates.value = inviteCandidates.value.filter((item) => item.id !== candidate.id)

      toast.add({
        color: "success",
        icon: "i-ph-paper-plane-tilt-fill",
        title: t("pages.eventDetailPage.inviteSentTitle"),
        description: t("pages.eventDetailPage.inviteSentTo", {
          name: candidate.name,
        }),
      })
    } catch {
      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: t("pages.eventDetailPage.inviteSendError"),
      })
    } finally {
      invitingUserId.value = null
    }
  }

  const deleteEvent = async () => {
    if (!data.value?.isOwner || deleting.value) return false

    deleting.value = true

    try {
      await repository.deleteEvent(data.value.id)
      toast.add({
        color: "success",
        icon: "i-ph-trash-fill",
        title: t("pages.eventDetailPage.deleteSuccess"),
      })
      await navigateTo(appRoutes.events)
      return true
    } catch {
      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: t("pages.eventDetailPage.deleteError"),
      })
      return false
    } finally {
      deleting.value = false
    }
  }

  const updateCover = async (coverFile: File) => {
    if (!data.value?.isOwner || updatingCover.value) return false

    updatingCover.value = true

    try {
      const currentEvent = data.value
      data.value = await repository.updateEvent(currentEvent.id, {
        name: currentEvent.name,
        location: currentEvent.location,
        description: currentEvent.description,
        startDate: currentEvent.startDateValue,
        startTime: currentEvent.startTime,
        endDate: currentEvent.endDateValue,
        endTime: currentEvent.endTime,
        coverFile,
      })

      toast.add({
        color: "success",
        icon: "i-ph-image-fill",
        title: t("pages.eventDetailPage.coverUpdated"),
      })
      return true
    } catch {
      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: t("pages.eventDetailPage.coverUpdateError"),
      })
      return false
    } finally {
      updatingCover.value = false
    }
  }

  const applyRsvp = async (state: EventRsvpState) => {
    if (!data.value || rsvpBusy.value) return

    rsvpBusy.value = true
    busyAction.value = state === "interested" ? "interested" : "going"

    try {
      const result =
        state === "going" ? await repository.setGoing(data.value.id) : await repository.setInterested(data.value.id)

      if (!data.value) return

      const nextState = result.rsvpState

      if (state === "going") {
        data.value.isGoing = nextState === "going"
        data.value.rsvpState = data.value.isGoing ? "going" : data.value.isInterested ? "interested" : "none"
        data.value.goingCount =
          nextState === "going" ? Math.max(1, data.value.goingCount) : Math.max(0, data.value.goingCount - 1)
      } else {
        data.value.isInterested = nextState === "interested"
        data.value.rsvpState = data.value.isGoing ? "going" : data.value.isInterested ? "interested" : "none"
        data.value.interestedCount =
          nextState === "interested"
            ? Math.max(1, data.value.interestedCount)
            : Math.max(0, data.value.interestedCount - 1)
      }

      await Promise.all([refreshGoing(), refreshInterested()])

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: data.value.name,
        description:
          nextState === "going"
            ? t("pages.eventsPage.rsvpGoing")
            : nextState === "interested"
              ? t("pages.eventsPage.rsvpInterested")
              : t("pages.eventsPage.rsvpSkipped"),
      })
    } finally {
      rsvpBusy.value = false
      busyAction.value = null
    }
  }

  onUnmounted(() => {
    if (inviteSearchTimer) {
      clearTimeout(inviteSearchTimer)
    }
    inviteSearchRequest += 1
  })

  return {
    eventId,
    event,
    pending,
    posts,
    hasPosts,
    hasMorePosts,
    loadingMorePosts,
    errorMessage,
    goingAttendees,
    interestedAttendees,
    refreshAll,
    loadMorePosts,
    inviteQuery,
    inviteCandidates,
    searchingInvitees,
    invitingUserId,
    inviteUser,
    deleting,
    deleteEvent,
    updatingCover,
    updateCover,
    rsvpBusy,
    busyAction,
    setGoing: () => applyRsvp("going"),
    setInterested: () => applyRsvp("interested"),
  }
}
