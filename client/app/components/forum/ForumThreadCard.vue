<template>
  <article
    class="rounded-[28px] border bg-white p-4 shadow-[var(--shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
    :class="selected ? 'border-[var(--border-strong)] ring-4 ring-[var(--color-primary-50)]' : 'border-[var(--border-default)]'"
  >
    <button class="block w-full text-left" type="button" @click="$emit('select', thread.id)">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ thread.sectionLabel }}</span>
            <span class="rounded-[var(--radius-full)] px-3 py-1.5 text-[12px] font-extrabold" :class="statusClass">{{ statusLabel }}</span>
          </div>
          <h3 class="mt-3 text-xl font-black leading-tight text-[var(--text-primary)]">{{ thread.title }}</h3>
          <p class="mt-2 line-clamp-2 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">{{ thread.excerpt }}</p>
        </div>

        <div class="grid min-w-[160px] grid-cols-2 gap-2">
          <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
            <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">Views</p>
            <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">{{ formatForumNumber(thread.views) }}</p>
          </div>
          <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
            <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">Replies</p>
            <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">{{ thread.repliesCount + localReplyCount }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">{{ thread.authorInitials }}</div>
          <div>
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ thread.author }}</p>
            <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">{{ thread.authorRole }} · {{ thread.createdAt }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in thread.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--bg-surface-hover)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ tag }}</span>
        </div>
      </div>
    </button>
  </article>
</template>

<script setup lang="ts">
import type { ForumThread } from "~/composables/useMockForumData"
import { formatForumNumber } from "~/composables/useMockForumData"

const props = defineProps<{
  thread: ForumThread
  selected: boolean
  localReplyCount: number
}>()

defineEmits<{ select: [id: string] }>()

const statusLabel = computed(() => {
  if (props.thread.status === "pinned") return "Ghim"
  if (props.thread.status === "solved") return "Đã giải quyết"
  return "Đang mở"
})

const statusClass = computed(() => {
  if (props.thread.status === "pinned") return "bg-[var(--color-accent-500)] text-white"
  if (props.thread.status === "solved") return "bg-[var(--color-success)]/10 text-[var(--color-success)]"
  return "bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
})
</script>
