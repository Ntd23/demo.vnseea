<template>
  <div class="group relative overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_12px_30px_rgba(15,35,110,0.05)] transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(15,35,110,0.1)]">
    <NuxtLink :to="`/events/${event.id}`" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <NuxtImg
          v-if="!imageFailed"
          :src="event.cover"
          :alt="event.title"
          class="relative h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
          @error="imageFailed = true"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

        <!-- Date Badge -->
        <div class="absolute left-5 top-5 overflow-hidden rounded-2xl bg-white text-center shadow-2xl">
          <p class="bg-primary-600 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-white">
            {{ event.month }}
          </p>
          <p class="px-4 py-2 text-[24px] font-black leading-none text-[#0f172a]">
            {{ event.day }}
          </p>
        </div>

        <!-- Top Badges -->
        <div class="absolute right-5 top-5 flex flex-wrap justify-end gap-2">
          <span class="rounded-xl bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-xl">
            {{ event.categoryLabel }}
          </span>
          <span
            v-if="event.isOwner"
            class="rounded-xl bg-primary-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          >
            HOST
          </span>
        </div>

        <!-- Title Overlay -->
        <div class="absolute bottom-5 left-5 right-5">
          <p class="text-[12px] font-black uppercase tracking-[0.15em] text-white/70">
            {{ event.dateLabel }}
          </p>
          <h3 class="mt-1 line-clamp-2 text-[20px] font-black tracking-tight text-white leading-tight group-hover:text-primary-300 transition-colors">
            {{ event.title }}
          </h3>
        </div>
      </div>
    </NuxtLink>

    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 flex items-center justify-center rounded-xl text-white font-black text-sm shadow-lg"
          :style="{ background: event.hostGradient }"
        >
          {{ event.hostInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-[14px] font-black text-[#0f172a] truncate">
            {{ event.host }}
          </p>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
            {{ event.hostRole }} · {{ event.timeLabel }}
          </p>
        </div>
      </div>

      <p class="text-[13px] font-medium leading-relaxed text-slate-500 line-clamp-2">
        {{ event.summary }}
      </p>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ $t("pages.eventsPage.location") }}
          </p>
          <p class="mt-1 truncate text-[13px] font-black text-[#0f172a]">
            {{ event.location }}
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ $t("pages.eventsPage.status") }}
          </p>
          <p class="mt-1 truncate text-[13px] font-black text-[#0f172a]">
            {{ formatCompact(event.stats.going) }} Going
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in event.tags.slice(0, 3)"
          :key="tag"
          class="text-[11px] font-black uppercase tracking-wider text-slate-400"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="flex gap-2 pt-2 border-t border-slate-50">
        <UButton
          color="primary"
          :variant="rsvpState === 'going' ? 'solid' : 'soft'"
          size="lg"
          class="flex-1 h-12 rounded-xl font-black text-[13px] uppercase tracking-wider"
          @click="$emit('rsvp', event.id, 'going')"
        >
          {{ rsvpState === 'going' ? 'GOING' : 'GO' }}
        </UButton>
        <UButton
          color="gray"
          variant="ghost"
          size="lg"
          class="h-12 w-12 rounded-xl flex items-center justify-center p-0 ring-1 ring-slate-200"
          icon="i-ph-star-bold"
          @click="$emit('rsvp', event.id, 'interested')"
        />
        <UButton
          :to="`/events/${event.id}`"
          color="gray"
          variant="ghost"
          size="lg"
          class="h-12 px-4 rounded-xl font-black text-[11px] uppercase tracking-widest ring-1 ring-slate-200"
        >
          DETAILS
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState, MockEvent } from "~/composables/useMockEventsData"

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
