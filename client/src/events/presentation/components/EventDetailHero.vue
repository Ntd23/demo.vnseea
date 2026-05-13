<!-- Description: Renders the main cover header for a backend-backed event detail page. -->
<template>
  <section class="overflow-hidden rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
    <div class="relative min-h-[280px] overflow-hidden">
      <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
      <NuxtImg
        v-if="event.coverUrl && !imageFailed"
        :src="event.coverUrl"
        :alt="event.name"
        class="absolute inset-0 h-full w-full object-cover"
        @error="imageFailed = true"
      />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.72))]" />

      <div class="absolute left-4 top-4 rounded-full bg-[#111827]/78 px-3 py-1 text-[12px] font-bold text-white">
        {{ event.dateBadge }}
      </div>

      <div class="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p class="text-[13px] font-medium text-white/85">{{ event.location }}</p>
        <h1 class="mt-2 text-[2rem] font-bold leading-tight sm:text-[2.35rem]">
          {{ event.name }}
        </h1>
        <p class="mt-3 text-[14px] text-white/88">{{ event.dateRangeLabel }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 border-t border-[var(--border-default)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-3">
        <NuxtImg
          v-if="event.hostAvatarUrl"
          :src="event.hostAvatarUrl"
          :alt="event.hostName"
          class="h-12 w-12 rounded-full object-cover"
        />
        <div v-else class="avatar-md avatar-muted">EV</div>

        <div>
          <p class="text-title-primary">{{ event.hostName }}</p>
          <p class="text-caption-secondary">{{ event.hostUsername ? `@${event.hostUsername}` : "" }}</p>
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-3">
        <UButton
          color="primary"
          :variant="event.rsvpState === 'going' ? 'solid' : 'soft'"
          size="sm"
          class="justify-center rounded-full"
          :loading="rsvpBusy === 'going'"
          @click="$emit('setGoing')"
        >
          {{ $t("pages.eventsPage.rsvpGoing") }}
        </UButton>
        <UButton
          color="warning"
          :variant="event.rsvpState === 'interested' ? 'solid' : 'soft'"
          size="sm"
          class="justify-center rounded-full"
          :loading="rsvpBusy === 'interested'"
          @click="$emit('setInterested')"
        >
          {{ $t("pages.eventsPage.rsvpInterested") }}
        </UButton>
        <UButton :to="appRoutes.events" color="neutral" variant="outline" size="sm" class="justify-center rounded-full">
          {{ $t("pages.createEventPage.backToEvents") }}
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
}>()

defineEmits<{
  setGoing: []
  setInterested: []
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
