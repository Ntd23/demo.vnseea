<!-- Description: Renders the primary event description and participation summaries for the backend-backed event detail page. -->
<template>
  <section class="space-y-4">
    <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
      <div class="space-y-2">
        <p class="text-label-secondary">{{ $t("pages.eventDetailPage.infoEyebrow") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ $t("pages.eventDetailPage.infoTitle") }}</h2>
        <p class="text-body-primary whitespace-pre-line">{{ event.description }}</p>
      </div>
    </UCard>

    <div class="grid gap-4 sm:grid-cols-2">
      <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
        <p class="text-label-secondary">{{ $t("pages.eventsPage.rsvpGoing") }}</p>
        <p class="mt-2 text-[2rem] font-bold leading-none text-[var(--text-primary)]">{{ event.goingCount }}</p>
      </UCard>
      <UCard class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" :ui="{ body: 'p-5' }">
        <p class="text-label-secondary">{{ $t("pages.eventsPage.rsvpInterested") }}</p>
        <p class="mt-2 text-[2rem] font-bold leading-none text-[var(--text-primary)]">{{ event.interestedCount }}</p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventRecord } from "../../domain/types/events.types"

defineProps<{
  event: EventRecord
}>()
</script>
