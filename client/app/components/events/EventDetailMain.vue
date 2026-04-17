<template>
  <section class="space-y-5">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Thông tin
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            Về sự kiện này
          </h2>
        </div>
        <button
          class="inline-flex h-10 items-center justify-center gap-2 rounded-[16px] border border-[var(--border-default)] bg-white px-3 text-[12px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
          type="button"
          @click="shareOpen = !shareOpen"
        >
          <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
          Chia sẻ
        </button>
      </div>

      <p class="mt-4 text-[15px] leading-8 text-[var(--text-primary)]">
        {{ event.description }}
      </p>

      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div
          v-for="stat in detailStats"
          :key="stat.label"
          class="rounded-[20px] bg-[var(--color-secondary-100)] p-4"
        >
          <p class="text-[1.6rem] font-black leading-none text-[var(--text-primary)]">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {{ stat.label }}
          </p>
        </div>
      </div>

      <div
        v-if="shareOpen"
        class="mt-4 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-4"
      >
        <p class="text-[13px] font-bold text-[var(--text-primary)]">
          Link chia sẻ
        </p>
        <div class="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            class="h-11 min-w-0 flex-1 rounded-[16px] border border-[var(--border-default)] bg-white px-3 text-[13px] text-[var(--text-secondary)] outline-none"
            :value="shareUrl"
            readonly
          >
          <button
            class="inline-flex h-11 items-center justify-center rounded-[16px] bg-[var(--color-primary-500)] px-4 text-[13px] font-extrabold text-white"
            type="button"
            @click="shareMessage = 'Đã mô phỏng copy link sự kiện.'"
          >
            Copy
          </button>
        </div>
        <p v-if="shareMessage" class="mt-2 text-[12px] font-semibold text-[var(--color-primary-600)]">
          {{ shareMessage }}
        </p>
      </div>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Lịch trình
      </p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">
        Nội dung chính
      </h2>

      <div class="mt-5 space-y-4">
        <div
          v-for="agendaItem in event.agenda"
          :key="agendaItem.time"
          class="grid gap-3 rounded-[22px] border border-[var(--border-default)] bg-white p-4 sm:grid-cols-[82px_minmax(0,1fr)]"
        >
          <div class="inline-flex h-10 w-fit items-center justify-center rounded-[16px] bg-[var(--color-primary-50)] px-3 text-[13px] font-black text-[var(--color-primary-600)]">
            {{ agendaItem.time }}
          </div>
          <div>
            <h3 class="text-title-primary">
              {{ agendaItem.title }}
            </h3>
            <p class="mt-1 text-[13px] leading-6 text-[var(--text-secondary)]">
              {{ agendaItem.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Người tham dự
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            Danh sách attendees
          </h2>
        </div>
        <div class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-2 text-[12px] font-bold text-[var(--color-primary-600)]">
          {{ event.attendees.length }} người mẫu
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div
          v-for="attendee in event.attendees"
          :key="attendee.id"
          class="flex items-center gap-3 rounded-[22px] border border-[var(--border-default)] bg-white p-3"
        >
          <div
            class="avatar-md shrink-0 text-white"
            :style="{ background: attendee.gradient }"
          >
            {{ attendee.initials }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[14px] font-bold text-[var(--text-primary)]">
              {{ attendee.name }}
            </p>
            <p class="text-[12px] text-[var(--text-secondary)]">
              {{ attendee.role }} · {{ attendeeStatusLabel(attendee.status) }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { EventAttendee, MockEvent } from "~/composables/useMockEventsData"

const props = defineProps<{
  event: MockEvent
}>()

const shareOpen = ref(false)
const shareMessage = ref("")

const detailStats = computed(() => [
  { label: "Sẽ đi", value: props.event.stats.going },
  { label: "Quan tâm", value: props.event.stats.interested },
  { label: "Được mời", value: props.event.stats.invited },
])

const shareUrl = computed(() => `/events/${props.event.id}`)

const attendeeStatusLabel = (status: EventAttendee["status"]) => {
  if (status === "going") return "Sẽ đi"
  if (status === "interested") return "Quan tâm"
  return "Được mời"
}
</script>
