<template>
  <aside class="space-y-4">
    <section
      v-if="inviteOpen"
      class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Mời bạn bè
          </p>
          <h2 class="mt-1 text-title-primary">
            Chọn người nhận lời mời
          </h2>
        </div>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary-100)] text-[var(--text-secondary)]"
          type="button"
          @click="$emit('closeInvite')"
        >
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </button>
      </div>

      <label class="relative mt-4 block">
        <Icon
          name="i-ph-magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          v-model="inviteSearch"
          class="h-11 w-full rounded-[16px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-10 pr-3 text-[13px] text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:bg-white"
          placeholder="Tìm bạn bè"
          type="search"
        >
      </label>

      <div class="mt-4 space-y-2">
        <label
          v-for="person in filteredInviteCandidates"
          :key="person.id"
          class="flex cursor-pointer items-center gap-3 rounded-[18px] p-2 transition hover:bg-[var(--color-primary-50)]"
        >
          <input
            v-model="selectedInviteIds"
            class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-primary-500)]"
            type="checkbox"
            :value="person.id"
          >
          <span
            class="avatar-sm text-white"
            :style="{ background: person.gradient }"
          >
            {{ person.initials }}
          </span>
          <span class="min-w-0">
            <span class="block truncate text-[13px] font-bold text-[var(--text-primary)]">{{ person.name }}</span>
            <span class="block text-[12px] text-[var(--text-secondary)]">{{ person.role }}</span>
          </span>
        </label>
      </div>

      <button
        class="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[18px] bg-[var(--color-primary-500)] text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]"
        type="button"
        @click="sendInvites"
      >
        Gửi lời mời
      </button>
      <p v-if="inviteMessage" class="mt-2 text-[12px] font-semibold text-[var(--color-primary-600)]">
        {{ inviteMessage }}
      </p>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Địa điểm
      </p>
      <h2 class="mt-1 text-title-primary">
        {{ event.location }}
      </h2>
      <div class="mt-4 flex min-h-[180px] items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,var(--color-primary-50),#ecfeff)] text-center">
        <div>
          <Icon name="i-ph-map-trifold-fill" class="mx-auto h-10 w-10 text-[var(--color-primary-600)]" />
          <p class="mt-3 text-[13px] font-semibold text-[var(--text-secondary)]">
            Map placeholder cho UI chi tiết sự kiện.
          </p>
        </div>
      </div>
    </section>

    <section
      v-if="event.isOwner"
      class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]"
    >
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Quản lý
      </p>
      <div class="mt-4 grid gap-2">
        <button
          class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white text-[13px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
          type="button"
          @click="ownerMessage = 'Đã mô phỏng mở form chỉnh sửa sự kiện.'"
        >
          Chỉnh sửa
        </button>
        <button
          class="inline-flex h-11 items-center justify-center rounded-[18px] bg-[#fee2e2] text-[13px] font-bold text-[#b91c1c] transition hover:bg-[#fecaca]"
          type="button"
          @click="ownerMessage = 'Đã mô phỏng xoá sự kiện. Chưa gọi API events.php.'"
        >
          Xoá sự kiện
        </button>
      </div>
      <p v-if="ownerMessage" class="mt-2 text-[12px] font-semibold text-[var(--color-primary-600)]">
        {{ ownerMessage }}
      </p>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Sự kiện liên quan
      </p>
      <div class="mt-4 space-y-3">
        <NuxtLink
          v-for="item in relatedEvents"
          :key="item.id"
          :to="`/events/${item.id}`"
          class="flex gap-3 rounded-[18px] p-2 transition hover:bg-[var(--color-primary-50)]"
        >
          <div class="h-16 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[var(--color-secondary-100)]">
            <img
              :src="item.cover"
              :alt="item.title"
              class="h-full w-full object-cover"
              loading="lazy"
              @error="handleImageError"
            >
          </div>
          <div class="min-w-0">
            <p class="line-clamp-2 text-[13px] font-bold leading-5 text-[var(--text-primary)]">
              {{ item.title }}
            </p>
            <p class="mt-1 text-[12px] text-[var(--text-secondary)]">
              {{ item.month }} {{ item.day }} · {{ item.city }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { EventAttendee, MockEvent } from "~/composables/useMockEventsData"

const props = defineProps<{
  event: MockEvent
  allEvents: MockEvent[]
  inviteOpen: boolean
  relatedEvents: MockEvent[]
}>()

defineEmits<{
  closeInvite: []
}>()

const inviteSearch = ref("")
const selectedInviteIds = ref<number[]>([])
const inviteMessage = ref("")
const ownerMessage = ref("")

watch(() => props.event.id, () => {
  selectedInviteIds.value = []
  inviteMessage.value = ""
  ownerMessage.value = ""
})

const inviteCandidates = computed<EventAttendee[]>(() => {
  const currentIds = new Set(props.event.attendees.map((attendee) => attendee.id))
  const people = new Map<number, EventAttendee>()

  for (const item of props.allEvents.flatMap((mockEvent) => mockEvent.attendees)) {
    if (!currentIds.has(item.id)) {
      people.set(item.id, item)
    }
  }

  return [...people.values()].slice(0, 8)
})

const filteredInviteCandidates = computed(() => {
  const keyword = inviteSearch.value.trim().toLowerCase()
  if (!keyword) return inviteCandidates.value

  return inviteCandidates.value.filter((person) =>
    [person.name, person.role].join(" ").toLowerCase().includes(keyword),
  )
})

const sendInvites = () => {
  if (selectedInviteIds.value.length === 0) {
    inviteMessage.value = "Chọn ít nhất một người để mô phỏng gửi lời mời."
    return
  }

  inviteMessage.value = `Đã mô phỏng gửi ${selectedInviteIds.value.length} lời mời.`
}

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>
