<!-- Description: Renders the primary event description for the backend-backed event detail page. -->
<template>
  <section class="space-y-4">
    <UCard class="rounded-[3px] border-0 bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
      <div class="space-y-2 p-5">
        <p class="text-label-secondary">{{ $t("pages.eventDetailPage.infoEyebrow") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ $t("pages.eventDetailPage.infoTitle") }}</h2>
        <p class="text-body-primary whitespace-pre-line">{{ event.description }}</p>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { EventRecord } from "../../domain/types/events.types"

defineProps<{
  event: EventRecord
}>()
</script>
