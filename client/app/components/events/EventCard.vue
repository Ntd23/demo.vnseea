<template>
  <article class="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
    <NuxtLink :to="`/events/${event.id}`" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <img
          :src="event.cover"
          :alt="event.title"
          class="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          loading="lazy"
          @error="handleImageError"
        >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_20%,rgba(15,23,42,0.72)_100%)]" />

        <div class="absolute left-3 top-3 rounded-[16px] bg-white text-center shadow-[var(--shadow-md)]">
          <p class="rounded-t-[16px] bg-[var(--color-primary-500)] px-3 py-1 text-[11px] font-black uppercase text-white">
            {{ event.month }}
          </p>
          <p class="px-3 py-2 text-[1.45rem] font-black leading-none text-[var(--text-primary)]">
            {{ event.day }}
          </p>
        </div>

        <div class="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
          <span class="rounded-[10px] bg-[#101828]/82 px-2.5 py-1 text-[11px] font-bold text-white">
            {{ event.categoryLabel }}
          </span>
          <span
            v-if="event.isOwner"
            class="rounded-[10px] bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[4px]"
          >
            {{ $t("pages.eventsPage.ownerBadge") }}
          </span>
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
          <div class="shrink-0 rounded-[var(--radius-full)] bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
            {{ rsvpLabel }}
          </div>
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

      <div class="mt-4 space-y-2 text-[13px] font-semibold text-[var(--text-secondary)]">
        <div class="flex items-center gap-2">
          <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
          <span class="truncate">{{ event.location }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="i-ph-users-three-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
          <span>{{ $t("pages.eventsPage.attendanceSummary", { going: formatCompact(event.stats.going), interested: formatCompact(event.stats.interested) }) }}</span>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="tag in event.tags"
          :key="tag"
          class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          class="inline-flex h-10 items-center justify-center rounded-[16px] text-[12px] font-bold transition"
          :class="rsvpState === 'going'
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-100)]'"
          type="button"
          @click="$emit('rsvp', event.id, 'going')"
        >
          {{ $t("pages.eventsPage.rsvpGoing") }}
        </button>
        <button
          class="inline-flex h-10 items-center justify-center rounded-[16px] text-[12px] font-bold transition"
          :class="rsvpState === 'interested'
            ? 'bg-[#f59e0b] text-white shadow-[var(--shadow-md)]'
            : 'bg-[#fff7ed] text-[#b45309] hover:bg-[#ffedd5]'"
          type="button"
          @click="$emit('rsvp', event.id, 'interested')"
        >
          {{ $t("pages.eventsPage.rsvpInterested") }}
        </button>
        <NuxtLink
          :to="`/events/${event.id}`"
          class="inline-flex h-10 items-center justify-center rounded-[16px] border border-[var(--border-default)] bg-white text-[12px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
        >
          {{ $t("pages.eventsPage.detail") }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { EventRsvpState, MockEvent } from "~/composables/useMockEventsData"

const props = defineProps<{
  event: MockEvent
  rsvpState: EventRsvpState
}>()

const { t, locale } = useI18n()

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

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>
