<!-- English description: Renders the event cover, start countdown, RSVP controls, and owner management actions. -->
<template>
  <section class="event-hero">
    <div class="event-hero__cover">
      <div class="event-hero__fallback" :style="{ background: event.coverFallback }" />
      <img
        v-if="event.coverUrl && !imageFailed"
        class="event-hero__image"
        :src="event.coverUrl"
        :alt="$t('pages.eventDetailPage.coverAlt', { name: event.name })"
        @error="imageFailed = true"
      />

      <label
        v-if="event.isOwner"
        class="event-hero__cover-action"
        :class="{ 'event-hero__cover-action--busy': coverUpdating }"
        :aria-label="$t('pages.eventDetailPage.changeCover')"
      >
        <Icon
          :name="coverUpdating ? 'i-lucide-loader-2' : 'i-ph-camera-fill'"
          class="h-4 w-4"
          :class="{ 'animate-spin': coverUpdating }"
        />
        <span class="event-hero__cover-action-label">{{ $t("pages.eventDetailPage.changeCover") }}</span>
        <input
          ref="coverInput"
          class="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :disabled="coverUpdating"
          @change="handleCoverChange"
        />
      </label>

      <div class="event-hero__identity">
        <span class="event-hero__date">
          <b>{{ startDay }}</b>
          <span>{{ startMonth }}</span>
        </span>
        <h1>{{ event.name }}</h1>
      </div>
    </div>

    <div class="event-hero__actions">
      <ul v-if="countdownActive" class="event-hero__countdown" :aria-label="$t('pages.eventDetailPage.countdownLabel')">
        <li>
          <strong>{{ countdown.days }}</strong>
          <span>{{ $t("pages.eventDetailPage.countdownDays") }}</span>
        </li>
        <li>
          <strong>{{ countdown.hours }}</strong>
          <span>{{ $t("pages.eventDetailPage.countdownHours") }}</span>
        </li>
        <li>
          <strong>{{ countdown.minutes }}</strong>
          <span>{{ $t("pages.eventDetailPage.countdownMinutes") }}</span>
        </li>
        <li>
          <strong>{{ countdown.seconds }}</strong>
          <span>{{ $t("pages.eventDetailPage.countdownSeconds") }}</span>
        </li>
      </ul>
      <p v-else class="event-hero__started">
        <Icon name="i-ph-calendar-check-fill" class="h-5 w-5" />
        {{ $t("pages.eventDetailPage.eventStarted") }}
      </p>

      <div class="event-hero__buttons">
        <UButton
          :color="event.isGoing || event.rsvpState === 'going' ? 'primary' : 'neutral'"
          :variant="event.isGoing || event.rsvpState === 'going' ? 'solid' : 'soft'"
          icon="i-ph-users-three-fill"
          :loading="rsvpBusy === 'going'"
          :disabled="Boolean(rsvpBusy)"
          @click="$emit('setGoing')"
        >
          {{ $t("pages.eventsPage.rsvpGoing") }}
        </UButton>
        <UButton
          :color="event.isInterested || event.rsvpState === 'interested' ? 'primary' : 'neutral'"
          :variant="event.isInterested || event.rsvpState === 'interested' ? 'solid' : 'soft'"
          icon="i-ph-heart-fill"
          :loading="rsvpBusy === 'interested'"
          :disabled="Boolean(rsvpBusy)"
          @click="$emit('setInterested')"
        >
          {{ $t("pages.eventsPage.rsvpInterested") }}
        </UButton>
        <UButton
          v-if="event.isOwner"
          :to="appRoutes.editEvent(event.id)"
          color="neutral"
          variant="soft"
          icon="i-ph-pencil-simple-bold"
        >
          {{ $t("pages.eventDetailPage.editEvent") }}
        </UButton>
        <UButton
          v-if="event.isOwner"
          color="error"
          variant="soft"
          icon="i-ph-trash-fill"
          @click="$emit('requestDelete')"
        >
          {{ $t("pages.eventDetailPage.deleteEvent") }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventRecord } from "../../domain/types/events.types"

const props = defineProps<{
  event: EventRecord
  rsvpBusy?: "going" | "interested" | null
  coverUpdating?: boolean
}>()

const emit = defineEmits<{
  setGoing: []
  setInterested: []
  requestDelete: []
  changeCover: [file: File]
}>()

const { locale } = useI18n()
const coverInput = ref<HTMLInputElement | null>(null)
const imageFailed = ref(false)
const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

const parseTimeParts = (value: string) => {
  const [hours = "0", minutes = "0", seconds = "0"] = value.split(":")

  return {
    hours: Number(hours) || 0,
    minutes: Number(minutes) || 0,
    seconds: Number(seconds) || 0,
  }
}

const normalizeYear = (value: string) => {
  if (value.length === 4) return Number(value)

  const year = Number(value)
  return year >= 70 ? 1900 + year : 2000 + year
}

const parseEventDate = (dateValue: string, timeValue: string) => {
  const date = dateValue.trim()
  const timeParts = parseTimeParts(timeValue.trim() || "00:00:00")
  const parts = date
    .split(/[-/]/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 3) {
    const [first = "", second = "", third = ""] = parts
    const yearFirst = first.length === 4
    const dayFirst = !yearFirst && (third.length === 4 || Number(first) > 12)
    const parsedDate = yearFirst
      ? new Date(
          Number(first),
          Number(second) - 1,
          Number(third),
          timeParts.hours,
          timeParts.minutes,
          timeParts.seconds,
        )
      : dayFirst
        ? new Date(
            normalizeYear(third),
            Number(second) - 1,
            Number(first),
            timeParts.hours,
            timeParts.minutes,
            timeParts.seconds,
          )
        : new Date(
            normalizeYear(first),
            Number(second) - 1,
            Number(third),
            timeParts.hours,
            timeParts.minutes,
            timeParts.seconds,
          )

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  const parsed = new Date(`${date} ${timeValue}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const startDate = computed(() =>
  parseEventDate(props.event.startDateValue || props.event.startDateLabel, props.event.startTime),
)

const startDay = computed(() => {
  const date = startDate.value
  return date ? String(date.getDate()).padStart(2, "0") : props.event.dateBadge.slice(0, 2)
})

const startMonth = computed(() => {
  const date = startDate.value
  if (!date) return props.event.dateBadge.slice(3, 5)

  return new Intl.DateTimeFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
    month: "short",
  })
    .format(date)
    .replace(".", "")
})

const countdownActive = computed(
  () => now.value !== null && Boolean(startDate.value) && (startDate.value?.getTime() ?? 0) > now.value,
)

const countdown = computed(() => {
  const distance =
    countdownActive.value && startDate.value && now.value !== null
      ? Math.max(0, startDate.value.getTime() - now.value)
      : 0

  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
  }
})

const handleCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) emit("changeCover", file)
  input.value = ""
}

watch(
  () => [props.event.id, props.event.coverUrl],
  () => {
    imageFailed.value = false
  },
  { immediate: true },
)

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.event-hero {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.event-hero__cover {
  position: relative;
  height: clamp(260px, 38vw, 430px);
  overflow: hidden;
  background: var(--bg-muted);
}

.event-hero__fallback,
.event-hero__image {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.event-hero__image {
  object-fit: cover;
}

.event-hero__cover-action {
  position: absolute;
  z-index: 2;
  top: 14px;
  right: 14px;
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.78);
  padding: 8px 11px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.event-hero__cover-action--busy {
  cursor: wait;
  opacity: 0.75;
}

.event-hero__identity {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 70px 24px 20px;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.82));
  color: #fff;
}

.event-hero__date {
  display: flex;
  width: 58px;
  min-width: 58px;
  flex-direction: column;
  overflow: hidden;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.event-hero__date b {
  padding: 8px 4px 5px;
  font-size: 24px;
  line-height: 1;
}

.event-hero__date span {
  background: var(--bg-brand);
  padding: 4px;
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.event-hero__identity h1 {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.4);
}

.event-hero__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
}

.event-hero__countdown {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-hero__countdown li {
  display: flex;
  min-width: 66px;
  flex-direction: column;
  align-items: center;
  border-radius: 7px;
  background: var(--bg-muted);
  padding: 7px 9px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.event-hero__countdown strong {
  color: var(--text-primary);
  font-size: 18px;
  line-height: 1.1;
}

.event-hero__started {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
}

.event-hero__buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 760px) {
  .event-hero__cover {
    height: 280px;
  }

  .event-hero__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .event-hero__buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .event-hero__buttons :deep(.ui-button) {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .event-hero__cover-action-label {
    display: none;
  }

  .event-hero__identity {
    padding-inline: 16px;
  }

  .event-hero__countdown {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .event-hero__countdown li {
    min-width: 0;
    padding-inline: 4px;
  }
}
</style>
