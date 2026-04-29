<template>
  <aside class="space-y-4">
    <UCard
      v-if="inviteOpen"
      class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-4' }"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-primary)]">
            {{ $t("pages.eventDetailPage.inviteEyebrow") }}
          </p>
          <h2 class="mt-1 text-title-primary">
            {{ $t("pages.eventDetailPage.inviteTitle") }}
          </h2>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          size="xs"
          class="rounded-full"
          @click="emit('closeInvite')"
        >
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </UButton>
      </div>

      <UInput
        v-model="inviteSearch"
        icon="i-ph-magnifying-glass"
        :placeholder="$t('pages.eventDetailPage.inviteSearchPlaceholder')"
        size="lg"
        class="mt-4"
      />

      <UAlert
        v-if="inviteStatus !== 'idle' && inviteMessage"
        class="mt-4 rounded-[22px]"
        :color="inviteStatus === 'error' ? 'warning' : inviteStatus === 'success' ? 'success' : 'primary'"
        variant="subtle"
        :icon="inviteStatus === 'error'
          ? 'i-ph-warning-circle-fill'
          : inviteStatus === 'success'
            ? 'i-ph-check-circle-fill'
            : 'i-ph-spinner-gap-bold'"
        :description="inviteMessage"
      />

      <div class="mt-4 space-y-2">
        <UButton
          v-for="person in filteredInviteCandidates"
          :key="person.id"
          :color="isSelected(person.id) ? 'primary' : 'neutral'"
          :variant="isSelected(person.id) ? 'solid' : 'soft'"
          size="lg"
          class="w-full justify-between rounded-[18px] px-3 py-3 text-left"
          type="button"
          @click="toggleSelection(person.id)"
        >
          <span class="flex min-w-0 items-center gap-3">
            <span
              class="avatar-sm shrink-0 text-white"
              :style="{ background: person.gradient }"
            >
              {{ person.initials }}
            </span>
            <span class="min-w-0">
              <span class="block truncate text-[13px] font-bold">{{ person.name }}</span>
              <span class="block truncate text-[12px] opacity-75">{{ person.role }}</span>
            </span>
          </span>
          <UBadge
            :color="isSelected(person.id) ? 'neutral' : 'primary'"
            :variant="isSelected(person.id) ? 'soft' : 'subtle'"
            class="rounded-full px-2.5 py-1 text-[11px] font-bold"
          >
            {{ isSelected(person.id) ? "✓" : "+" }}
          </UBadge>
        </UButton>
      </div>

      <UButton
        color="primary"
        size="lg"
        block
        class="mt-4 rounded-[18px]"
        :loading="inviteStatus === 'loading'"
        :disabled="actionBusy"
        @click="emit('sendInvite', selectedInviteIds)"
      >
        {{ $t("pages.eventDetailPage.sendInvite") }}
      </UButton>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventDetailPage.locationEyebrow") }}
      </p>
      <h2 class="mt-1 text-title-primary">
        {{ event.location }}
      </h2>
      <div class="mt-4 flex min-h-[180px] items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,var(--color-primary-50),#ecfeff)] text-center">
        <div>
          <Icon name="i-ph-map-trifold-fill" class="mx-auto h-10 w-10 text-[var(--text-primary)]" />
          <p class="mt-3 text-[13px] font-semibold text-[var(--text-secondary)]">
            {{ $t("pages.eventDetailPage.mapPlaceholder") }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard
      v-if="event.isOwner"
      class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-4' }"
    >
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventDetailPage.managementEyebrow") }}
      </p>

      <UAlert
        v-if="ownerStatus !== 'idle' && ownerMessage"
        class="mt-4 rounded-[22px]"
        :color="ownerStatus === 'error' ? 'warning' : ownerStatus === 'success' ? 'success' : 'primary'"
        variant="subtle"
        :icon="ownerStatus === 'error'
          ? 'i-ph-warning-circle-fill'
          : ownerStatus === 'success'
            ? 'i-ph-check-circle-fill'
            : 'i-ph-spinner-gap-bold'"
        :description="ownerMessage"
      />

      <div class="mt-4 grid gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="justify-center rounded-[18px]"
          :loading="ownerStatus === 'loading'"
          :disabled="actionBusy"
          @click="emit('editEvent')"
        >
          {{ $t("pages.eventDetailPage.editEvent") }}
        </UButton>
        <UButton
          color="error"
          variant="soft"
          size="lg"
          class="justify-center rounded-[18px]"
          :loading="ownerStatus === 'loading'"
          :disabled="actionBusy"
          @click="emit('deleteEvent')"
        >
          {{ $t("pages.eventDetailPage.deleteEvent") }}
        </UButton>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.eventDetailPage.relatedEvents") }}
      </p>
      <div class="mt-4 space-y-3">
        <NuxtLink
          v-for="item in relatedEvents"
          :key="item.id"
          :to="appRoutes.eventDetail(item.id)"
          class="block rounded-[18px] border border-[var(--border-default)] p-2 transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
        >
          <div class="flex gap-3">
            <div class="relative h-16 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[var(--color-secondary-100)]">
              <div class="absolute inset-0" :style="{ background: item.coverFallback }" />
              <NuxtImg
                v-if="!failedImages[item.id]"
                :src="item.cover"
                :alt="item.title"
                class="relative h-full w-full object-cover"
                loading="lazy"
                @error="markImageFailed(item.id)"
              />
            </div>
            <div class="min-w-0">
              <p class="line-clamp-2 text-[13px] font-bold leading-5 text-[var(--text-primary)]">
                {{ item.title }}
              </p>
              <p class="mt-1 text-[12px] text-[var(--text-secondary)]">
                {{ item.dateLabel }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </UCard>
  </aside>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { EventAttendee, MockEvent } from "../../domain/types/events.types"

type DetailActionStatus = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  event: MockEvent
  allEvents: MockEvent[]
  inviteOpen: boolean
  inviteStatus: DetailActionStatus
  inviteMessage: string
  ownerStatus: DetailActionStatus
  ownerMessage: string
  actionBusy?: boolean
  relatedEvents: MockEvent[]
}>()

const emit = defineEmits<{
  closeInvite: []
  sendInvite: [ids: number[]]
  editEvent: []
  deleteEvent: []
}>()

const inviteSearch = ref("")
const selectedInviteIds = ref<number[]>([])
const failedImages = ref<Record<string, boolean>>({})

watch(() => props.event.id, () => {
  inviteSearch.value = ""
  selectedInviteIds.value = []
  failedImages.value = {}
})

watch(() => props.inviteStatus, (status) => {
  if (status === "success") {
    selectedInviteIds.value = []
  }
})

watch(() => props.inviteOpen, (isOpen) => {
  if (!isOpen) {
    inviteSearch.value = ""
    selectedInviteIds.value = []
  }
})

const inviteCandidates = computed<EventAttendee[]>(() => {
  const currentIds = new Set(props.event.attendees.map(attendee => attendee.id))
  const people = new Map<number, EventAttendee>()

  for (const item of props.allEvents.flatMap(mockEvent => mockEvent.attendees)) {
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

function isSelected(id: number) {
  return selectedInviteIds.value.includes(id)
}

function toggleSelection(id: number) {
  if (isSelected(id)) {
    selectedInviteIds.value = selectedInviteIds.value.filter(item => item !== id)
    return
  }

  selectedInviteIds.value = [...selectedInviteIds.value, id]
}

function markImageFailed(id: string) {
  failedImages.value = {
    ...failedImages.value,
    [id]: true,
  }
}
</script>
