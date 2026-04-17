<template>
  <div class="space-y-5">
    <section
      v-if="isMissing"
      class="rounded-[var(--radius-xl)] border border-[#f59e0b]/25 bg-[#fff7ed] p-4 text-[13px] font-semibold text-[#92400e] shadow-[var(--shadow-sm)]"
    >
      Không tìm thấy sự kiện theo đường dẫn hiện tại. Trang đang hiển thị sự kiện mẫu đầu tiên để bạn vẫn test được layout chi tiết.
    </section>

    <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
      <div class="relative min-h-[360px] overflow-hidden sm:min-h-[430px]">
        <div class="absolute inset-0" :style="{ background: event.coverFallback }" />
        <img
          :src="event.cover"
          :alt="event.title"
          class="absolute inset-0 h-full w-full object-cover"
          @error="handleImageError"
        >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_8%,rgba(15,23,42,0.78)_100%)]" />

        <div class="absolute left-5 top-5 rounded-[18px] bg-white text-center shadow-[var(--shadow-lg)]">
          <p class="rounded-t-[18px] bg-[var(--color-primary-500)] px-4 py-1.5 text-[12px] font-black uppercase text-white">
            {{ event.month }}
          </p>
          <p class="px-4 py-3 text-[2rem] font-black leading-none text-[var(--text-primary)]">
            {{ event.day }}
          </p>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
          <div class="flex flex-wrap gap-2">
            <span class="rounded-[10px] bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[4px]">
              {{ event.categoryLabel }}
            </span>
            <span
              v-if="event.isOwner"
              class="rounded-[10px] bg-[#fde7b2] px-2.5 py-1 text-[11px] font-black text-[#27345f]"
            >
              Bạn quản lý
            </span>
            <span class="rounded-[10px] bg-[#101828]/74 px-2.5 py-1 text-[11px] font-bold text-white">
              {{ rsvpLabel }}
            </span>
          </div>

          <h1 class="mt-4 max-w-[840px] text-display text-[2.1rem] leading-[0.98] text-white sm:text-[3rem]">
            {{ event.title }}
          </h1>

          <div class="mt-5 flex flex-wrap gap-3 text-[13px] font-semibold text-white/86">
            <span class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white/14 px-3 py-2 backdrop-blur-[4px]">
              <Icon name="i-ph-calendar-check-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ event.dateLabel }} · {{ event.timeLabel }}
            </span>
            <span class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white/14 px-3 py-2 backdrop-blur-[4px]">
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ event.location }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-3 border-t border-[var(--border-default)] bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div class="flex items-center gap-3">
          <div
            class="avatar-lg shrink-0 text-white"
            :style="{ background: event.hostGradient }"
          >
            {{ event.hostInitials }}
          </div>
          <div class="min-w-0">
            <p class="text-title-primary truncate">
              {{ event.host }}
            </p>
            <p class="mt-1 text-caption-secondary">
              {{ event.hostRole }} · {{ event.stats.going }} người sẽ tham gia
            </p>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-4">
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] px-4 text-[13px] font-extrabold transition"
            :class="rsvpState === 'going'
              ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
              : 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-100)]'"
            type="button"
            @click="$emit('setRsvp', 'going')"
          >
            Sẽ đi
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] px-4 text-[13px] font-extrabold transition"
            :class="rsvpState === 'interested'
              ? 'bg-[#f59e0b] text-white shadow-[var(--shadow-md)]'
              : 'bg-[#fff7ed] text-[#b45309] hover:bg-[#ffedd5]'"
            type="button"
            @click="$emit('setRsvp', 'interested')"
          >
            Quan tâm
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('setRsvp', 'not_interested')"
          >
            Bỏ qua
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('toggleInvite')"
          >
            Mời bạn bè
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { EventRsvpState, MockEvent } from "~/composables/useMockEventsData"

defineProps<{
  event: MockEvent
  isMissing: boolean
  rsvpState: EventRsvpState
  rsvpLabel: string
}>()

defineEmits<{
  setRsvp: [state: EventRsvpState]
  toggleInvite: []
}>()

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>
