<!-- English description: Composes the backend event detail hero, attendee views, event feed, invitations, and owner actions. -->
<template>
  <main class="event-detail-page">
    <section v-if="!pending && !event" class="event-detail-page__state">
      <FoundationEmptyState
        icon="i-ph-calendar-x-fill"
        :title="$t('pages.eventDetailPage.notFoundTitle')"
        :description="errorMessage"
      />
    </section>

    <template v-else-if="event">
      <EventsEventDetailHero
        :event="event"
        :rsvp-busy="busyAction"
        :cover-updating="updatingCover"
        @set-going="setGoing"
        @set-interested="setInterested"
        @request-delete="deleteOpen = true"
        @change-cover="handleCoverChange"
      />

      <div class="event-detail-page__layout">
        <div class="event-detail-page__main">
          <EventsEventAttendeesPanel
            v-if="attendeeKind"
            :event-id="event.id"
            :kind="attendeeKind"
            :title="attendeeTitle"
            :attendees="activeAttendees"
          />

          <template v-else>
            <FeedPublisherBox :event-id="event.id" @created="handlePostCreated" />

            <ClientOnly>
              <div class="event-detail-page__icon-nav">
                <NavigationHeaderIconNav />
              </div>
            </ClientOnly>

            <section v-if="posts.length === 0" class="event-detail-page__state">
              <FoundationEmptyState
                icon="i-ph-calendar-dots-fill"
                :title="$t('pages.eventDetailPage.emptyPostsTitle')"
                :description="
                  $t('pages.eventDetailPage.emptyPostsDescription', {
                    name: event.name,
                  })
                "
              />
            </section>

            <template v-else>
              <FeedPostCard v-for="post in posts" :key="post.id" :post="post" />

              <div
                v-if="hasMorePosts"
                ref="loadMoreSentinel"
                class="event-detail-page__load-more"
                :aria-label="$t('pages.eventDetailPage.loadingMore')"
              >
                <template v-if="loadingMorePosts">
                  <USkeleton class="h-4 w-2/5 rounded" />
                  <USkeleton class="h-28 w-full rounded-[8px]" />
                </template>
              </div>
            </template>
          </template>
        </div>

        <EventsEventDetailSidebar
          :event="event"
          :invite-query="inviteQuery"
          :invite-candidates="inviteCandidates"
          :searching-invitees="searchingInvitees"
          :inviting-user-id="invitingUserId"
          @update:invite-query="inviteQuery = $event"
          @invite="inviteUser"
        />
      </div>
    </template>

    <div v-else class="event-detail-page__skeleton">
      <USkeleton class="h-[390px] w-full rounded-[8px]" />
      <div class="event-detail-page__layout">
        <div class="space-y-4">
          <USkeleton class="h-[180px] w-full rounded-[8px]" />
          <USkeleton class="h-[280px] w-full rounded-[8px]" />
        </div>
        <USkeleton class="h-[480px] w-full rounded-[8px]" />
      </div>
    </div>

    <UModal v-model:open="deleteOpen" :title="$t('pages.eventDetailPage.deleteConfirmTitle')">
      <template #body>
        <p class="event-detail-page__delete-copy">
          {{
            $t("pages.eventDetailPage.deleteConfirmDescription", {
              name: event?.name || "",
            })
          }}
        </p>
      </template>
      <template #footer>
        <div class="event-detail-page__modal-actions">
          <UButton color="neutral" variant="soft" @click="deleteOpen = false">
            {{ $t("pages.eventDetailPage.cancel") }}
          </UButton>
          <UButton color="error" icon="i-ph-trash-fill" :loading="deleting" @click="submitDelete">
            {{ $t("pages.eventDetailPage.deleteEvent") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import NavigationHeaderIconNav from "../../../navigation/presentation/components/HeaderIconNav.vue"
import { useEventDetailPageVM } from "../../application/view-models/useEventDetailPageVM"
import type { EventAttendeeKind } from "../../domain/types/events.types"
import EventsEventAttendeesPanel from "../components/EventAttendeesPanel.vue"
import EventsEventDetailHero from "../components/EventDetailHero.vue"
import EventsEventDetailSidebar from "../components/EventDetailSidebar.vue"

const route = useRoute()
const { t } = useI18n()
const {
  event,
  pending,
  posts,
  hasMorePosts,
  loadingMorePosts,
  errorMessage,
  goingAttendees,
  interestedAttendees,
  busyAction,
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
  setGoing,
  setInterested,
} = useEventDetailPageVM(computed(() => String(route.params.id || "")))

const deleteOpen = ref(false)
const loadMoreSentinel = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null

const attendeeKind = computed<EventAttendeeKind | null>(() => {
  const type = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type
  return type === "going" || type === "interested" ? type : null
})

const activeAttendees = computed(() =>
  attendeeKind.value === "interested" ? interestedAttendees.value : goingAttendees.value,
)

const attendeeTitle = computed(() =>
  attendeeKind.value === "interested"
    ? t("pages.eventDetailPage.interestedListTitle")
    : t("pages.eventDetailPage.goingListTitle"),
)

const handlePostCreated = async () => {
  await refreshAll()
}

const handleCoverChange = async (file: File) => {
  await updateCover(file)
}

const submitDelete = async () => {
  const deleted = await deleteEvent()
  if (deleted) deleteOpen.value = false
}

watch(
  loadMoreSentinel,
  (element) => {
    loadMoreObserver?.disconnect()
    loadMoreObserver = null

    if (!element || typeof IntersectionObserver === "undefined") return

    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMorePosts()
        }
      },
      { rootMargin: "320px 0px" },
    )
    loadMoreObserver.observe(element)
  },
  { flush: "post" },
)

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect()
})
</script>

<style scoped>
.event-detail-page {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding-bottom: 40px;
}

.event-detail-page > * + * {
  margin-top: 16px;
}

.event-detail-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.event-detail-page__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.event-detail-page__icon-nav {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.event-detail-page__state {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface);
  padding: 36px 24px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.event-detail-page__load-more {
  display: flex;
  min-height: 64px;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.event-detail-page__skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-detail-page__delete-copy {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.event-detail-page__modal-actions {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1000px) {
  .event-detail-page__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .event-detail-page {
    padding-bottom: 24px;
  }

  .event-detail-page__state {
    padding: 28px 16px;
  }
}
</style>
