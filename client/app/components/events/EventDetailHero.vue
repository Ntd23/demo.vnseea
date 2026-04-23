<template>
  <div class="space-y-5">
    <UAlert
      v-if="isMissing"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      :description="$t('pages.eventDetailPage.missingNotice')"
      class="rounded-[24px]"
    />

    <UCard class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]" :ui="{ body: 'p-0' }">
      <div class="relative min-h-[360px] overflow-hidden sm:min-h-[430px]">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <NuxtImg
          v-if="!imageFailed"
          :src="event.cover"
          :alt="event.title"
          class="absolute inset-0 h-full w-full object-cover"
          @error="imageFailed = true"
        />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_8%,rgba(15,23,42,0.78)_100%)]" />

        <div class="absolute left-5 top-5 rounded-[18px] bg-white text-center shadow-[var(--shadow-lg)]">
          <p class="rounded-t-[18px] bg-[var(--color-primary-500)] px-4 py-1.5 text-[12px] font-black uppercase text-white">
            {{ event.month }}
          </p>
          <p class="px-4 py-3 text-[2rem] font-black leading-none text-[var(--text-primary)]">
            {{ event.day }}
          </p>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white">
              {{ event.categoryLabel }}
            </UBadge>
            <UBadge
              v-if="event.isOwner"
              color="warning"
              variant="solid"
              class="rounded-full px-2.5 py-1 text-[11px] font-black text-[#27345f]"
            >
              {{ $t("pages.eventDetailPage.ownerBadge") }}
            </UBadge>
            <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-[#101828]/74 px-2.5 py-1 text-[11px] font-bold text-white">
              {{ rsvpLabel }}
            </UBadge>
          </div>

          <h1 class="mt-4 max-w-[840px] text-display text-[2.1rem] leading-[0.98] text-white sm:text-[3rem]">
            {{ event.title }}
          </h1>

          <div class="mt-5 flex flex-wrap gap-3 text-[13px] font-semibold text-white/86">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-2 backdrop-blur-[4px]">
              <Icon name="i-ph-calendar-check-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ event.dateLabel }} · {{ event.timeLabel }}
            </span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-2 backdrop-blur-[4px]">
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ event.location }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-4 border-t border-[var(--border-default)] bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div class="flex items-center gap-3">
          <div
            class="avatar-lg shrink-0 text-white"
            :style="{ background: event.hostGradient }"
          >
            {{ event.hostInitials }}
          </div>
          <div class="min-w-0">
            <p class="text-title-primary truncate">
              {{ event.host }}
            </p>
            <p class="mt-1 text-caption-secondary">
              {{ $t("pages.eventDetailPage.hostAttendance", { role: event.hostRole, count: event.stats.going }) }}
            </p>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-4">
          <UButton
            color="primary"
            :variant="rsvpState === 'going' ? 'solid' : 'soft'"
            size="sm"
            class="justify-center rounded-[18px]"
            :loading="rsvpBusy && rsvpState !== 'going'"
            :disabled="rsvpBusy || rsvpState === 'going'"
            @click="$emit('setRsvp', 'going')"
          >
            {{ $t("pages.eventsPage.rsvpGoing") }}
          </UButton>
          <UButton
            color="warning"
            :variant="rsvpState === 'interested' ? 'solid' : 'soft'"
            size="sm"
            class="justify-center rounded-[18px]"
            :loading="rsvpBusy && rsvpState !== 'interested'"
            :disabled="rsvpBusy || rsvpState === 'interested'"
            @click="$emit('setRsvp', 'interested')"
          >
            {{ $t("pages.eventsPage.rsvpInterested") }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="justify-center rounded-[18px]"
            :disabled="rsvpBusy"
            @click="$emit('setRsvp', 'not_interested')"
          >
            {{ $t("pages.eventDetailPage.actionSkip") }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="justify-center rounded-[18px]"
            :disabled="rsvpBusy"
            @click="$emit('toggleInvite')"
          >
            {{ $t("pages.eventDetailPage.actionInvite") }}
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState, MockEvent } from "~/composables/useMockEventsData"

const props = defineProps<{
  event: MockEvent
  isMissing: boolean
  rsvpState: EventRsvpState
  rsvpLabel: string
  rsvpBusy?: boolean
}>()

defineEmits<{
  setRsvp: [state: EventRsvpState]
  toggleInvite: []
}>()

const imageFailed = ref(false)

watch(
  () => props.event.id,
  () => {
    imageFailed.value = false
  },
  { immediate: true },
)
</script>
