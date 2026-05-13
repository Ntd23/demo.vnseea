<!-- Description: Renders the secondary info and attendee lists for the backend-backed event detail page. -->
<template>
  <aside class="space-y-4">
    <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
      <div class="space-y-4">
        <div>
          <p class="text-label-secondary">{{ $t("pages.eventDetailPage.locationEyebrow") }}</p>
          <p class="mt-2 text-title-primary">{{ event.location }}</p>
        </div>

        <div class="space-y-2 text-[13px] text-[var(--text-secondary)]">
          <p><span class="font-semibold text-[var(--text-primary)]">{{ $t("pages.createEventPage.startDate") }}:</span> {{ event.startDateLabel }} {{ event.startTime }}</p>
          <p><span class="font-semibold text-[var(--text-primary)]">{{ $t("pages.createEventPage.endDate") }}:</span> {{ event.endDateLabel }} {{ event.endTime }}</p>
        </div>
      </div>
    </UCard>

    <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
      <div class="flex items-center justify-between gap-3">
        <p class="text-title-primary">{{ $t("pages.eventsPage.rsvpGoing") }}</p>
        <span class="text-caption-secondary">{{ goingAttendees.length }}</span>
      </div>

      <div v-if="goingAttendees.length > 0" class="mt-4 space-y-3">
        <div v-for="attendee in goingAttendees" :key="`going-${attendee.id}`" class="flex items-center gap-3">
          <NuxtImg
            v-if="attendee.avatarUrl"
            :src="attendee.avatarUrl"
            :alt="attendee.name"
            class="h-10 w-10 rounded-full object-cover"
          />
          <div v-else class="avatar-sm avatar-muted">EV</div>
          <div class="min-w-0">
            <p class="truncate text-title-primary">{{ attendee.name }}</p>
            <p class="text-caption-secondary">{{ attendee.username ? `@${attendee.username}` : "" }}</p>
          </div>
        </div>
      </div>
      <p v-else class="mt-4 text-body-secondary">{{ emptyGoingText }}</p>
    </UCard>

    <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
      <div class="flex items-center justify-between gap-3">
        <p class="text-title-primary">{{ $t("pages.eventsPage.rsvpInterested") }}</p>
        <span class="text-caption-secondary">{{ interestedAttendees.length }}</span>
      </div>

      <div v-if="interestedAttendees.length > 0" class="mt-4 space-y-3">
        <div v-for="attendee in interestedAttendees" :key="`interested-${attendee.id}`" class="flex items-center gap-3">
          <NuxtImg
            v-if="attendee.avatarUrl"
            :src="attendee.avatarUrl"
            :alt="attendee.name"
            class="h-10 w-10 rounded-full object-cover"
          />
          <div v-else class="avatar-sm avatar-muted">EV</div>
          <div class="min-w-0">
            <p class="truncate text-title-primary">{{ attendee.name }}</p>
            <p class="text-caption-secondary">{{ attendee.username ? `@${attendee.username}` : "" }}</p>
          </div>
        </div>
      </div>
      <p v-else class="mt-4 text-body-secondary">{{ emptyInterestedText }}</p>
    </UCard>
  </aside>
</template>

<script setup lang="ts">
import type { EventAttendeeRecord, EventRecord } from "../../domain/types/events.types"

defineProps<{
  event: EventRecord
  goingAttendees: EventAttendeeRecord[]
  interestedAttendees: EventAttendeeRecord[]
}>()

const { locale } = useI18n()

const emptyGoingText = computed(() =>
  locale.value === "vi"
    ? "Chưa có người xác nhận tham gia."
    : "No confirmed attendees yet.",
)

const emptyInterestedText = computed(() =>
  locale.value === "vi"
    ? "Chưa có người bày tỏ quan tâm."
    : "No interested attendees yet.",
)
</script>
