<!-- English description: Renders the full going or interested attendee list selected from an event detail query. -->
<template>
  <section class="event-attendees">
    <header class="event-attendees__header">
      <div>
        <p>{{ $t("pages.eventDetailPage.attendeesEyebrow") }}</p>
        <h2>{{ title }}</h2>
        <span>{{ $t("pages.eventDetailPage.attendeeCount", { count: attendees.length }) }}</span>
      </div>
      <UButton :to="appRoutes.eventDetail(eventId)" color="neutral" variant="soft" icon="i-ph-arrow-left-bold">
        {{ $t("pages.eventDetailPage.backToEvent") }}
      </UButton>
    </header>

    <div v-if="attendees.length > 0" class="event-attendees__grid">
      <NuxtLink
        v-for="attendee in attendees"
        :key="`${kind}-${attendee.id}`"
        :to="attendee.username ? appRoutes.profile(attendee.username) : appRoutes.eventDetail(eventId)"
        class="event-attendees__person"
      >
        <UAvatar :src="attendee.avatarUrl || undefined" :alt="attendee.name" size="lg" />
        <span>
          <strong>{{ attendee.name }}</strong>
          <small v-if="attendee.username">@{{ attendee.username }}</small>
        </span>
        <Icon name="i-ph-caret-right-bold" class="ml-auto h-4 w-4" />
      </NuxtLink>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      :icon="kind === 'going' ? 'i-ph-users-three-fill' : 'i-ph-heart-fill'"
      :title="kind === 'going' ? $t('pages.eventDetailPage.emptyGoing') : $t('pages.eventDetailPage.emptyInterested')"
    />
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventAttendeeKind, EventAttendeeRecord } from "../../domain/types/events.types"

defineProps<{
  eventId: number
  kind: EventAttendeeKind
  title: string
  attendees: EventAttendeeRecord[]
}>()
</script>

<style scoped>
.event-attendees {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.event-attendees__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-light);
  padding: 16px;
}

.event-attendees__header p,
.event-attendees__header h2,
.event-attendees__header span {
  margin: 0;
}

.event-attendees__header p {
  color: var(--text-brand);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.event-attendees__header h2 {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.event-attendees__header span {
  display: block;
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 12px;
}

.event-attendees__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--border-light);
}

.event-attendees__person {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  background: var(--bg-surface);
  padding: 13px 15px;
  color: var(--text-secondary);
  text-decoration: none;
}

.event-attendees__person:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}

.event-attendees__person > span {
  min-width: 0;
}

.event-attendees__person strong,
.event-attendees__person small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-attendees__person strong {
  color: var(--text-primary);
  font-size: 14px;
}

.event-attendees__person small {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 12px;
}

.event-attendees :deep([role="alert"]) {
  margin: 16px;
}

@media (max-width: 620px) {
  .event-attendees__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .event-attendees__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
