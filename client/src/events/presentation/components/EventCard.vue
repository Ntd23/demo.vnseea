<!-- Description: Renders a backend-backed event list card aligned with the legacy PHP event directory layout. -->
<template>
  <article class="overflow-hidden rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
    <NuxtLink :to="appRoutes.eventDetail(event.id)" class="group block">
      <div class="relative aspect-[16/10] overflow-hidden bg-[var(--bg-muted)]">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <NuxtImg
          v-if="event.coverUrl && !imageFailed"
          :src="event.coverUrl"
          :alt="event.name"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          @error="imageFailed = true"
        />

        <span class="absolute right-3 top-3 rounded-full bg-[#111827]/78 px-3 py-1 text-[12px] font-bold text-white">
          {{ event.dateBadge }}
        </span>

        <div class="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.72))] p-3 text-white">
          <p class="flex items-center gap-1.5 text-[12px] font-medium text-white/90">
            <Icon name="i-ph-map-pin-fill" class="h-3.5 w-3.5" />
            <span class="truncate">{{ event.location }}</span>
          </p>
        </div>
      </div>
    </NuxtLink>

    <div class="space-y-4 p-4">
      <div class="space-y-2">
        <NuxtLink
          :to="appRoutes.eventDetail(event.id)"
          class="text-[1.05rem] font-bold leading-7 text-[var(--text-primary)] hover:text-[var(--text-link)]"
        >
          {{ event.name }}
        </NuxtLink>
        <p class="text-[13px] leading-6 text-[var(--text-secondary)] line-clamp-2">
          {{ event.description }}
        </p>
      </div>

      <div class="space-y-1 text-[13px] text-[var(--text-secondary)]">
        <p>{{ event.dateRangeLabel }}</p>
        <p class="truncate">
          {{ event.hostName }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <span class="rounded-full bg-[var(--bg-surface-hover)] px-3 py-1.5 font-medium">
          {{ event.goingCount }} {{ $t("pages.eventsPage.rsvpGoing") }}
        </span>
        <span class="rounded-full bg-[var(--bg-surface-hover)] px-3 py-1.5 font-medium">
          {{ event.interestedCount }} {{ $t("pages.eventsPage.rsvpInterested") }}
        </span>
      </div>

      <div class="grid gap-2 sm:grid-cols-3">
        <UButton
          color="primary"
          :variant="event.rsvpState === 'going' ? 'solid' : 'soft'"
          size="sm"
          class="justify-center rounded-full"
          :loading="busyState === 'going'"
          @click.prevent="$emit('setGoing', event.id)"
        >
          {{ $t("pages.eventsPage.rsvpGoing") }}
        </UButton>
        <UButton
          color="warning"
          :variant="event.rsvpState === 'interested' ? 'solid' : 'soft'"
          size="sm"
          class="justify-center rounded-full"
          :loading="busyState === 'interested'"
          @click.prevent="$emit('setInterested', event.id)"
        >
          {{ $t("pages.eventsPage.rsvpInterested") }}
        </UButton>
        <UButton
          :to="appRoutes.eventDetail(event.id)"
          color="neutral"
          variant="outline"
          size="sm"
          class="justify-center rounded-full"
        >
          {{ $t("pages.eventsPage.detail") }}
        </UButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventRecord } from "../../domain/types/events.types"

const props = defineProps<{
  event: EventRecord
  busyState?: "going" | "interested" | null
}>()

defineEmits<{
  setGoing: [id: number]
  setInterested: [id: number]
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
