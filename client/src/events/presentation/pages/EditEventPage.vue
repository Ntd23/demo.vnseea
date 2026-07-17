<!-- English description: Loads an owner event and renders the shared event form in edit mode. -->
<template>
  <div class="mx-auto max-w-[1120px] pb-10">
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-20 w-full rounded-[18px]" />
      <USkeleton class="h-[620px] w-full rounded-[18px]" />
    </div>

    <EventsCreateEventComposer
      v-else-if="event?.isOwner"
      :event="event"
    />

    <section
      v-else
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-calendar-x-duotone"
        :title="$t('pages.createEventPage.editUnavailableTitle')"
        :description="unavailableDescription"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { createApiEventsRepository } from "../../infrastructure/repositories/ApiEventsRepository"
import EventsCreateEventComposer from "../components/CreateEventComposer.vue"

const route = useRoute()
const { t } = useI18n()
const repository = createApiEventsRepository()
const eventId = computed(() => Number(route.params.id || 0))

const { data: event, pending, error } = await useAsyncData(
  `event-edit:${eventId.value}`,
  async () => {
    if (eventId.value < 1) return null
    return await repository.getEventById(eventId.value)
  },
  { watch: [eventId] },
)

const unavailableDescription = computed(() => {
  if (event.value && !event.value.isOwner) {
    return t("pages.createEventPage.editForbiddenDescription")
  }

  return error.value?.message || t("pages.createEventPage.editUnavailableDescription")
})
</script>
