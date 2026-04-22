<template>
  <article>
    <button class="block w-full text-left" type="button" :aria-pressed="selected" aria-controls="forum-thread-detail" @click="$emit('select', thread.id)">
      <UCard
        class="rounded-[28px] border bg-white shadow-[var(--shadow-md)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
        :class="selected ? 'border-[var(--border-strong)] ring-4 ring-[var(--color-primary-50)]' : 'border-[var(--border-default)]'"
        :ui="{ body: 'p-4 sm:p-5' }"
      >
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-bold">
              {{ thread.sectionLabel }}
            </UBadge>
            <UBadge :color="statusColor" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-bold">
              {{ statusLabel }}
            </UBadge>
            <UBadge
              v-if="selected"
              color="neutral"
              variant="soft"
              class="rounded-full px-3 py-1.5 text-[12px] font-bold"
            >
              {{ t("pages.forumPage.selectedThreadAction") }}
            </UBadge>
          </div>

          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <h3 class="text-xl font-black leading-tight text-[var(--text-primary)]">
                {{ thread.title }}
              </h3>
              <p class="mt-2 line-clamp-3 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">
                {{ thread.excerpt }}
              </p>
            </div>

            <div class="grid min-w-[190px] grid-cols-2 gap-2">
              <div class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                  {{ t("pages.forumPage.viewsLabel") }}
                </p>
                <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">
                  {{ formatForumNumber(thread.views, locale.value) }}
                </p>
              </div>
              <div class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                  {{ t("pages.forumPage.repliesLabel") }}
                </p>
                <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">
                  {{ displayReplyCount }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">
                {{ thread.authorInitials }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-[13px] font-extrabold text-[var(--text-primary)]">
                  {{ thread.author }}
                </p>
                <p class="truncate text-[12px] font-semibold text-[var(--text-tertiary)]">
                  {{ thread.authorRole }} · {{ thread.createdAt }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                v-for="tag in thread.tags"
                :key="tag"
                color="neutral"
                variant="soft"
                class="rounded-full px-2.5 py-1 text-[11px] font-bold"
              >
                #{{ tag }}
              </UBadge>
              <span class="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--color-primary-600)]">
                <Icon name="i-ph-arrow-right-bold" class="h-3.5 w-3.5" />
                {{ selected ? t("pages.forumPage.selectedThreadAction") : t("pages.forumPage.openThreadAction") }}
              </span>
            </div>
          </div>
        </div>
      </UCard>
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

defineEmits<{
  select: [id: string]
}>()

const { t, locale } = useI18n()

const displayReplyCount = computed(() =>
  props.thread.repliesCount + props.localReplyCount,
)

const statusLabel = computed(() => {
  if (props.thread.status === "pinned") return t("pages.forumPage.statusPinned")
  if (props.thread.status === "solved") return t("pages.forumPage.statusSolved")
  return t("pages.forumPage.statusOpen")
})

const statusColor = computed(() => {
  if (props.thread.status === "pinned") return "primary"
  if (props.thread.status === "solved") return "success"
  return "neutral"
})
</script>
