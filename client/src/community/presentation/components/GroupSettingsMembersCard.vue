<template>
  <section class="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)]">
    <!-- Header with count and search input -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div class="flex items-center gap-3 self-start sm:self-center">
        <!-- Search bar -->
        <UInput
          v-model="searchQuery"
          type="text"
          icon="i-ph-magnifying-glass-bold"
          size="md"
          color="neutral"
          variant="outline"
          :placeholder="t('community.settings.members.searchPlaceholder')"
          class="w-full sm:w-64"
        />
      </div>
    </div>

    <!-- Members list -->
    <div v-if="loading" class="mt-6 flex flex-col items-center justify-center py-10 space-y-3">
      <Icon name="i-ph-spinner-gap-bold" class="h-8 w-8 animate-spin text-[var(--text-brand)]" />
      <p class="text-[13px] text-[var(--text-tertiary)] font-medium">Đang tải danh sách thành viên...</p>
    </div>

    <div v-else-if="filteredMembers.length > 0" class="mt-6 divide-y divide-slate-100">
      <div
        v-for="user in visibleMembers"
        :key="user.id"
        class="group flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
      >
        <!-- User Info -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="relative shrink-0">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              class="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div
              v-else
              class="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-100)_0%,color-mix(in_srgb,var(--bg-brand)_10%,transparent)_100%)] text-[13px] font-black text-[var(--text-brand)] shadow-sm"
            >
              {{ getInitials(user.name) }}
            </div>
            <span
              v-if="user.verified"
              class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-brand-hover)] text-white ring-2 ring-white"
            >
              <Icon name="i-ph-seal-check-fill" class="h-3 w-3" />
            </span>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-[13.5px] font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-brand)]">
                {{ user.name }}
              </p>
              <!-- Owner Badge -->
              <span
                v-if="user.isAdmin"
                class="rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600/90"
              >
                {{ $t("community.groupSettings.members.owner") }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-[11.5px] text-[var(--text-tertiary)]">
              @{{ user.username }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Kick/Delete Member (Only for non-admin members) -->
          <UButton
            v-if="!user.isAdmin"
            color="error"
            variant="soft"
            size="sm"
            class="rounded-full font-bold px-3 py-1.5 min-w-[120px] justify-center whitespace-nowrap"
            :loading="processingId === user.id"
            :disabled="processingId !== null"
            @click="onKick(user.id)"
          >
            <template #leading>
              <Icon name="i-ph-user-minus-bold" class="h-3.5 w-3.5" />
            </template>
            {{ t("community.settings.members.kick") }}
          </UButton>
        </div>
      </div>

      <!-- Action buttons for pagination -->
      <div v-if="hasMore || visibleCount > INITIAL_LIMIT" class="mt-5 flex items-center justify-center gap-3 pt-4">
        <UButton
          v-if="hasMore"
          color="neutral"
          variant="outline"
          size="md"
          class="rounded-full px-6 font-bold shadow-sm hover:shadow transition-all text-[12px]"
          @click="showMore"
        >
          <Icon name="i-ph-caret-double-down-bold" class="mr-1.5 h-4 w-4 text-[var(--text-secondary)]" />
          {{ $t("community.groupSettings.members.showMore") }}
        </UButton>

        <UButton
          v-if="visibleCount > INITIAL_LIMIT"
          color="neutral"
          variant="outline"
          size="md"
          class="rounded-full px-6 font-bold shadow-sm hover:shadow transition-all text-[12px]"
          @click="collapse"
        >
          <Icon name="i-ph-caret-double-up-bold" class="mr-1.5 h-4 w-4 text-[var(--text-secondary)]" />
          {{ $t("community.groupSettings.members.showLess") }}
        </UButton>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="mt-6 flex flex-col items-center justify-center rounded-[20px] bg-[var(--bg-muted)]/50 border border-dashed border-[var(--border-light)] py-10 px-4 text-center transition-all hover:bg-[var(--bg-muted)]"
    >
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--text-tertiary)] shadow-sm mb-4">
        <Icon name="i-ph-users-bold" class="h-8 w-8" />
      </div>
      <h4 class="text-[14px] font-black text-[var(--text-primary)]">
        {{ t("community.settings.members.emptyState") }}
      </h4>
      <p class="mt-1 text-[12px] text-[var(--text-tertiary)] max-w-[280px]">
        {{ searchQuery ? $t('community.groupSettings.members.emptyFiltered') : $t('community.groupSettings.members.empty') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UserRecord } from "../../../shared-kernel/domain/types/user.types"

const { t } = useI18n()

const props = defineProps<{
  members: (UserRecord & { isAdmin?: boolean })[]
  loading?: boolean
}>()

const emit = defineEmits<{
  kick: [userId: number]
}>()

const searchQuery = ref("")
const processingId = ref<number | null>(null)

const filteredMembers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return props.members

  return props.members.filter(
    member =>
      member.name.toLowerCase().includes(query) ||
      member.username.toLowerCase().includes(query),
  )
})

const INITIAL_LIMIT = 5
const visibleCount = ref(INITIAL_LIMIT)
const visibleMembers = computed(() => filteredMembers.value.slice(0, visibleCount.value))
const hasMore = computed(() => filteredMembers.value.length > visibleCount.value)

function showMore() {
  visibleCount.value += 10
}

function collapse() {
  visibleCount.value = INITIAL_LIMIT
}

watch(searchQuery, () => {
  visibleCount.value = INITIAL_LIMIT
})

async function onKick(userId: number) {
  processingId.value = userId
  try {
    await emit("kick", userId)
  } finally {
    processingId.value = null
  }
}

function getInitials(name: string): string {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase()
}
</script>
