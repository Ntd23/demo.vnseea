<template>
  <section class="space-y-5">
    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--text-primary)]">
            {{ $t("pages.eventDetailPage.infoEyebrow") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ $t("pages.eventDetailPage.infoTitle") }}
          </h2>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-[16px]"
          @click="$emit('toggleShare')"
        >
          <Icon name="i-ph-share-network-fill" class="mr-1.5 h-4 w-4" />
          {{ $t("pages.eventDetailPage.share") }}
        </UButton>
      </div>

      <p class="mt-4 text-[15px] leading-8 text-[var(--text-primary)]">
        {{ event.description }}
      </p>

      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <UCard
          v-for="stat in detailStats"
          :key="stat.label"
          class="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]"
          :ui="{ body: 'p-4' }"
        >
          <p class="text-[1.6rem] font-black leading-none text-[var(--text-primary)]">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {{ stat.label }}
          </p>
        </UCard>
      </div>

      <UAlert
        v-if="shareOpen && shareStatus !== 'idle' && shareMessage"
        class="mt-4 rounded-[22px]"
        :color="shareStatus === 'error' ? 'warning' : 'success'"
        variant="subtle"
        :icon="shareStatus === 'error' ? 'i-ph-warning-circle-fill' : 'i-ph-check-circle-fill'"
        :description="shareMessage"
      />

      <div
        v-if="shareOpen"
        class="mt-4 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-4"
      >
        <p class="text-[13px] font-bold text-[var(--text-primary)]">
          {{ $t("pages.eventDetailPage.shareLink") }}
        </p>
        <div class="mt-2 flex flex-col gap-2 sm:flex-row">
          <UInput
            :model-value="shareUrl"
            readonly
            color="primary"
            size="lg"
            class="min-w-0 flex-1"
          />
          <UButton
            color="primary"
            size="lg"
            class="rounded-[16px]"
            :loading="copyBusy"
            :disabled="copyBusy"
            @click="$emit('copyShare')"
          >
            {{ $t("pages.eventDetailPage.copy") }}
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventDetailPage.agendaEyebrow") }}
      </p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">
        {{ $t("pages.eventDetailPage.agendaTitle") }}
      </h2>

      <div class="mt-5 space-y-4">
        <UCard
          v-for="agendaItem in event.agenda"
          :key="agendaItem.time"
          class="rounded-[22px] border border-[var(--border-default)] bg-white"
          :ui="{ body: 'p-4' }"
        >
          <div class="grid gap-3 sm:grid-cols-[82px_minmax(0,1fr)]">
            <div class="inline-flex h-10 w-fit items-center justify-center rounded-[16px] bg-[var(--color-primary-50)] px-3 text-[13px] font-black text-[var(--text-primary)]">
              {{ agendaItem.time }}
            </div>
            <div>
              <h3 class="text-title-primary">
                {{ agendaItem.title }}
              </h3>
              <p class="mt-1 text-[13px] leading-6 text-[var(--text-secondary)]">
                {{ agendaItem.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-5 sm:p-6' }">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--text-primary)]">
            {{ $t("pages.eventDetailPage.attendeesEyebrow") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ $t("pages.eventDetailPage.attendeesTitle") }}
          </h2>
        </div>
        <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-2 text-[12px] font-bold">
          {{ $t("pages.eventDetailPage.attendeeCount", { count: event.attendees.length }) }}
        </UBadge>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <UCard
          v-for="attendee in event.attendees"
          :key="attendee.id"
          class="rounded-[22px] border border-[var(--border-default)] bg-white"
          :ui="{ body: 'p-3' }"
        >
          <div class="flex items-center gap-3">
            <div
              class="avatar-md shrink-0 text-white"
              :style="{ background: attendee.gradient }"
            >
              {{ attendee.initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-[14px] font-bold text-[var(--text-primary)]">
                {{ attendee.name }}
              </p>
              <p class="text-[12px] text-[var(--text-secondary)]">
                {{ attendee.role }} · {{ attendeeStatusLabel(attendee.status) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { EventAttendee, MockEvent } from "../../domain/types/events.types"

type DetailActionStatus = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  event: MockEvent
  shareOpen: boolean
  shareUrl: string
  shareStatus: DetailActionStatus
  shareMessage: string
  copyBusy?: boolean
}>()

defineEmits<{
  toggleShare: []
  copyShare: []
}>()

const { t } = useI18n()

const detailStats = computed(() => [
  { label: t("pages.eventsPage.rsvpGoing"), value: props.event.stats.going },
  { label: t("pages.eventsPage.rsvpInterested"), value: props.event.stats.interested },
  { label: t("pages.eventsPage.rsvpInvited"), value: props.event.stats.invited },
])

const attendeeStatusLabel = (status: EventAttendee["status"]) => {
  if (status === "going") return t("pages.eventsPage.rsvpGoing")
  if (status === "interested") return t("pages.eventsPage.rsvpInterested")
  return t("pages.eventsPage.rsvpInvited")
}
</script>
