<template>
  <aside class="space-y-4">
    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-primary)]">
            {{ $t("pages.eventsPage.latestSchedule") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ nextEvent?.title || $t("pages.eventsPage.noSchedule") }}
          </h2>
        </div>

        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
          @click="emit('reset')"
        >
          {{ $t("pages.eventsPage.reset") }}
        </UButton>
      </div>

      <UAlert
        class="mt-4 rounded-[22px]"
        color="neutral"
        variant="subtle"
        icon="i-ph-calendar-star-fill"
        :title="$t('pages.eventsPage.status')"
        :description="statusLabel"
      />

      <div class="mt-4 rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-4">
        <p class="text-[13px] font-semibold text-[var(--text-secondary)]">
          {{ nextEvent?.dateLabel }}<span v-if="nextEvent"> · {{ nextEvent?.timeLabel }}</span>
        </p>
        <UButton
          v-if="nextEvent"
          :to="`/events/${nextEvent.id}`"
          color="primary"
          size="sm"
          block
          class="mt-4 rounded-full"
        >
          {{ $t("pages.eventsPage.viewDetail") }}
        </UButton>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventsPage.featuredCategories") }}
      </p>

      <div class="mt-4 space-y-2">
        <UButton
          v-for="category in categories.slice(1)"
          :key="category.value"
          :color="selectedCategory === category.value ? 'primary' : 'neutral'"
          :variant="selectedCategory === category.value ? 'solid' : 'soft'"
          size="lg"
          class="w-full justify-between rounded-[20px] px-3 py-3 text-left"
          type="button"
          @click="emit('selectCategory', category.value)"
        >
          <span class="inline-flex min-w-0 items-center gap-2 text-[13px] font-bold">
            <Icon :name="category.icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ category.label }}</span>
          </span>
          <UBadge
            :color="selectedCategory === category.value ? 'neutral' : 'primary'"
            :variant="selectedCategory === category.value ? 'soft' : 'subtle'"
            class="rounded-full px-2.5 py-1 text-[11px] font-bold"
          >
            {{ counts[category.value] ?? 0 }}
          </UBadge>
        </UButton>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventsPage.recentAttendees") }}
      </p>

      <div class="mt-4 space-y-3">
        <div
          v-for="attendee in recentAttendees"
          :key="attendee.id"
          class="flex items-center gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
        >
          <div
            class="avatar-sm text-white"
            :style="{ background: attendee.gradient }"
          >
            {{ attendee.initials }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[13px] font-bold text-[var(--text-primary)]">
              {{ attendee.name }}
            </p>
            <p class="text-[12px] text-[var(--text-secondary)]">
              {{ attendee.role }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </aside>
</template>

<script setup lang="ts">
import type {
  EventAttendee,
  EventCategory,
  EventCategoryKey,
  MockEvent,
} from "../../domain/types/events.types"

defineProps<{
  nextEvent?: MockEvent
  categories: EventCategory[]
  selectedCategory: EventCategoryKey
  counts: Record<string, number>
  recentAttendees: EventAttendee[]
  statusLabel: string
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  selectCategory: [value: EventCategoryKey]
  reset: []
}>()
</script>
