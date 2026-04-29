<template>
  <UCard class="group overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]" :ui="{ body: 'p-0' }">
    <NuxtLink :to="appRoutes.eventDetail(event.id)" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <NuxtImg
          v-if="!imageFailed"
          :src="event.cover"
          :alt="event.title"
          class="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          loading="lazy"
          @error="imageFailed = true"
        />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_20%,rgba(15,23,42,0.72)_100%)]" />

        <div class="absolute left-3 top-3 rounded-[18px] bg-white text-center shadow-[var(--shadow-md)]">
          <p class="rounded-t-[18px] bg-[var(--color-primary-500)] px-3 py-1 text-[11px] font-black uppercase text-white">
            {{ event.month }}
          </p>
          <p class="px-3 py-2 text-[1.45rem] font-black leading-none text-[var(--text-primary)]">
            {{ event.day }}
          </p>
        </div>

        <div class="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
          <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-[#101828]/82 px-2.5 py-1 text-[11px] font-bold text-white">
            {{ event.categoryLabel }}
          </UBadge>
          <UBadge
            v-if="event.isOwner"
            color="primary"
            variant="subtle"
            class="rounded-full border border-white/15 bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white"
          >
            {{ $t("pages.eventsPage.ownerBadge") }}
          </UBadge>
        </div>

        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-[13px] font-bold text-white/78">
              {{ event.dateLabel }}
            </p>
            <h3 class="mt-1 line-clamp-2 text-[1.1rem] font-black leading-tight text-white">
              {{ event.title }}
            </h3>
          </div>
          <UBadge color="neutral" variant="soft" class="shrink-0 rounded-full border border-white/15 bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white">
            {{ rsvpLabel }}
          </UBadge>
        </div>
      </div>
    </NuxtLink>

    <div class="p-4">
      <div class="flex items-start gap-3">
        <div
          class="avatar-md shrink-0 text-white"
          :style="{ background: event.hostGradient }"
        >
          {{ event.hostInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-title-primary truncate">
            {{ event.host }}
          </p>
          <p class="mt-1 text-caption-secondary">
            {{ event.hostRole }} · {{ event.timeLabel }}
          </p>
        </div>
      </div>

      <p class="mt-3 min-h-[48px] text-[13px] leading-6 text-[var(--text-secondary)]">
        {{ event.summary }}
      </p>

      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]" :ui="{ body: 'p-3' }">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.location") }}
          </p>
          <p class="mt-1 truncate text-[13px] font-semibold text-[var(--text-primary)]">
            {{ event.location }}
          </p>
        </UCard>
        <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]" :ui="{ body: 'p-3' }">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">
            {{ $t("pages.eventsPage.status") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">
            {{ $t("pages.eventsPage.attendanceSummary", { going: formatCompact(event.stats.going), interested: formatCompact(event.stats.interested) }) }}
          </p>
        </UCard>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <UBadge
          v-for="tag in event.tags"
          :key="tag"
          color="primary"
          variant="subtle"
          class="rounded-full px-3 py-1.5 text-[12px] font-bold"
        >
          #{{ tag }}
        </UBadge>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-3">
        <UButton
          color="primary"
          :variant="rsvpState === 'going' ? 'solid' : 'soft'"
          size="sm"
          :disabled="rsvpState === 'going'"
          class="justify-center rounded-[16px]"
          :aria-label="`${$t('pages.eventsPage.rsvpGoing')}: ${event.title}`"
          @click="$emit('rsvp', event.id, 'going')"
        >
          {{ $t("pages.eventsPage.rsvpGoing") }}
        </UButton>
        <UButton
          color="warning"
          :variant="rsvpState === 'interested' ? 'solid' : 'soft'"
          size="sm"
          :disabled="rsvpState === 'interested'"
          class="justify-center rounded-[16px]"
          :aria-label="`${$t('pages.eventsPage.rsvpInterested')}: ${event.title}`"
          @click="$emit('rsvp', event.id, 'interested')"
        >
          {{ $t("pages.eventsPage.rsvpInterested") }}
        </UButton>
        <UButton
          :to="appRoutes.eventDetail(event.id)"
          color="neutral"
          variant="outline"
          size="sm"
          class="justify-center rounded-[16px]"
        >
          {{ $t("pages.eventsPage.detail") }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventRsvpState, MockEvent } from "../../domain/types/events.types"

const props = defineProps<{
  event: MockEvent
  rsvpState: EventRsvpState
}>()

const { t, locale } = useI18n()
const imageFailed = ref(false)

defineEmits<{
  rsvp: [id: string, state: EventRsvpState]
}>()

const rsvpLabel = computed(() => {
  if (props.rsvpState === "going") return t("pages.eventsPage.rsvpGoing")
  if (props.rsvpState === "interested") return t("pages.eventsPage.rsvpInterested")
  if (props.rsvpState === "invited") return t("pages.eventsPage.rsvpInvited")
  if (props.rsvpState === "not_interested") return t("pages.eventsPage.rsvpSkipped")
  return t("pages.eventsPage.rsvpOpen")
})

const formatCompact = (value: number) => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
}).format(value)
</script>
