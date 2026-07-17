<!-- English description: Renders event timing, invitations, attendance information, location map, and description. -->
<template>
  <aside class="event-sidebar">
    <section class="event-sidebar__card">
      <div class="event-sidebar__date-row">
        <Icon name="i-ph-calendar-fill" class="event-sidebar__date-icon event-sidebar__date-icon--start" />
        <p>
          <span>{{ $t("pages.createEventPage.startDate") }}</span>
          <strong>{{ event.startDateLabel }} - {{ event.startTime }}</strong>
        </p>
      </div>
      <div class="event-sidebar__date-row">
        <Icon name="i-ph-calendar-check-fill" class="event-sidebar__date-icon event-sidebar__date-icon--end" />
        <p>
          <span>{{ $t("pages.createEventPage.endDate") }}</span>
          <strong>{{ event.endDateLabel }} - {{ event.endTime }}</strong>
        </p>
      </div>

      <div class="event-sidebar__invite">
        <label for="event-invite-search">{{ $t("pages.eventDetailPage.inviteSearchLabel") }}</label>
        <UInput
          id="event-invite-search"
          :model-value="inviteQuery"
          icon="i-ph-magnifying-glass"
          :placeholder="$t('pages.eventDetailPage.inviteSearchPlaceholder')"
          :loading="searchingInvitees"
          autocomplete="off"
          class="w-full"
          @update:model-value="emit('update:inviteQuery', String($event || ''))"
        />

        <p v-if="inviteQuery.trim().length > 0 && inviteQuery.trim().length < 2" class="event-sidebar__invite-hint">
          {{ $t("pages.eventDetailPage.inviteSearchHint") }}
        </p>

        <div v-else-if="inviteCandidates.length > 0" class="event-sidebar__invite-results">
          <div v-for="candidate in inviteCandidates" :key="candidate.id" class="event-sidebar__invite-row">
            <NuxtLink :to="appRoutes.profile(candidate.username)" class="event-sidebar__person">
              <UAvatar :src="candidate.avatarUrl || undefined" :alt="candidate.name" size="sm" />
              <span>
                <strong>
                  {{ candidate.name }}
                  <Icon
                    v-if="candidate.verified"
                    name="i-ph-seal-check-fill"
                    class="h-3.5 w-3.5 text-[var(--text-brand)]"
                  />
                </strong>
                <small v-if="candidate.username">@{{ candidate.username }}</small>
              </span>
            </NuxtLink>
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              icon="i-ph-paper-plane-tilt-fill"
              :loading="invitingUserId === candidate.id"
              :disabled="invitingUserId !== null"
              @click="emit('invite', candidate)"
            >
              {{ $t("pages.eventDetailPage.inviteAction") }}
            </UButton>
          </div>
        </div>

        <p v-else-if="inviteQuery.trim().length >= 2 && !searchingInvitees" class="event-sidebar__invite-hint">
          {{ $t("pages.eventDetailPage.inviteSearchEmpty") }}
        </p>
      </div>
    </section>

    <section class="event-sidebar__card">
      <header class="event-sidebar__heading">
        <Icon name="i-ph-info-fill" class="h-5 w-5 text-[var(--text-brand)]" />
        <h2>{{ $t("pages.eventDetailPage.infoCardTitle") }}</h2>
      </header>

      <ul class="event-sidebar__facts">
        <li>
          <NuxtLink :to="attendanceLink('going')">
            <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
            <span>{{
              $t("pages.eventDetailPage.goingPeople", {
                count: event.goingCount,
              })
            }}</span>
            <Icon name="i-ph-caret-right-bold" class="ml-auto h-4 w-4" />
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="attendanceLink('interested')">
            <Icon name="i-ph-heart-fill" class="h-5 w-5" />
            <span>{{
              $t("pages.eventDetailPage.interestedPeople", {
                count: event.interestedCount,
              })
            }}</span>
            <Icon name="i-ph-caret-right-bold" class="ml-auto h-4 w-4" />
          </NuxtLink>
        </li>
        <li v-if="event.location" class="event-sidebar__address">
          <Icon name="i-ph-map-pin-fill" class="h-5 w-5" />
          <span>
            <small>{{ $t("pages.eventDetailPage.addressLabel") }}</small>
            <strong>{{ event.location }}</strong>
          </span>
        </li>
      </ul>
    </section>

    <section class="event-sidebar__card">
      <header class="event-sidebar__heading">
        <Icon name="i-ph-list-bold" class="h-5 w-5 text-[var(--text-brand)]" />
        <h2>{{ $t("pages.eventDetailPage.descriptionTitle") }}</h2>
      </header>
      <p class="event-sidebar__description">{{ event.description }}</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventInviteCandidate, EventRecord } from "../../domain/types/events.types"

const props = defineProps<{
  event: EventRecord
  inviteQuery: string
  inviteCandidates: EventInviteCandidate[]
  searchingInvitees: boolean
  invitingUserId: number | null
}>()

const emit = defineEmits<{
  "update:inviteQuery": [value: string]
  invite: [candidate: EventInviteCandidate]
}>()

const attendanceLink = (type: "going" | "interested") => ({
  path: appRoutes.eventDetail(props.event.id),
  query: { type },
})
</script>

<style scoped>
.event-sidebar {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.event-sidebar__card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.event-sidebar__date-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-light);
  padding: 15px 16px;
}

.event-sidebar__date-icon {
  height: 25px;
  width: 25px;
  flex: 0 0 auto;
}

.event-sidebar__date-icon--start {
  color: #35a853;
}

.event-sidebar__date-icon--end {
  color: #e91e63;
}

.event-sidebar__date-row p {
  min-width: 0;
  margin: 0;
}

.event-sidebar__date-row span,
.event-sidebar__date-row strong {
  display: block;
}

.event-sidebar__date-row span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.event-sidebar__date-row strong {
  margin-top: 3px;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.4;
}

.event-sidebar__invite {
  padding: 16px;
}

.event-sidebar__invite > label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.event-sidebar__invite-hint {
  margin: 9px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.event-sidebar__invite-results {
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 7px;
}

.event-sidebar__invite-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid var(--border-light);
  padding: 9px;
}

.event-sidebar__invite-row:last-child {
  border-bottom: 0;
}

.event-sidebar__person {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  color: inherit;
  text-decoration: none;
}

.event-sidebar__person > span {
  min-width: 0;
}

.event-sidebar__person strong {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-sidebar__person small {
  display: block;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-sidebar__heading {
  display: flex;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid var(--border-light);
  padding: 13px 15px;
}

.event-sidebar__heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.event-sidebar__facts {
  margin: 0;
  padding: 5px 0;
  list-style: none;
}

.event-sidebar__facts a,
.event-sidebar__address {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.event-sidebar__facts a:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}

.event-sidebar__address {
  align-items: flex-start;
  color: var(--text-primary);
}

.event-sidebar__address > span {
  min-width: 0;
}

.event-sidebar__address small,
.event-sidebar__address strong {
  display: block;
}

.event-sidebar__address small {
  margin-bottom: 2px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.event-sidebar__address strong {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.45;
}

.event-sidebar__description {
  margin: 0;
  padding: 16px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-line;
}
</style>
