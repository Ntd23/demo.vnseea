<template>
  <aside class="space-y-4">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Lịch gần nhất
          </p>
          <h2 class="mt-1 text-title-primary">
            {{ nextEvent?.title || "Không có lịch" }}
          </h2>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          <Icon name="i-ph-calendar-star-fill" class="h-6 w-6" />
        </div>
      </div>
      <p class="mt-3 text-[13px] leading-6 text-[var(--text-secondary)]">
        {{ nextEvent?.dateLabel }} · {{ nextEvent?.timeLabel }}
      </p>
      <NuxtLink
        v-if="nextEvent"
        :to="`/events/${nextEvent.id}`"
        class="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-[var(--color-primary-500)] text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
      >
        Xem chi tiết
      </NuxtLink>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Danh mục nổi bật
      </p>
      <div class="mt-4 space-y-2">
        <button
          v-for="category in categories.slice(1)"
          :key="category.value"
          class="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition"
          :class="selectedCategory === category.value
            ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('selectCategory', category.value)"
        >
          <span class="inline-flex items-center gap-2 text-[13px] font-bold">
            <Icon :name="category.icon" class="h-4 w-4" />
            {{ category.label }}
          </span>
          <span class="text-[12px] font-black">
            {{ countByCategory(category.value) }}
          </span>
        </button>
      </div>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Người tham gia gần đây
      </p>
      <div class="mt-4 space-y-3">
        <div
          v-for="attendee in recentAttendees"
          :key="attendee.id"
          class="flex items-center gap-3"
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
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { EventAttendee, EventCategory, MockEvent } from "~/composables/useMockEventsData"

defineProps<{
  nextEvent?: MockEvent
  categories: EventCategory[]
  selectedCategory: string
  recentAttendees: EventAttendee[]
  countByCategory: (category: string) => number
}>()

defineEmits<{
  selectCategory: [value: string]
}>()
</script>
