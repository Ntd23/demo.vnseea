<!-- English description: Reusable Nuxt UI table for forum thread listings and search results. -->
<template>
  <UTable
    :data="threads"
    :columns="columns"
    :meta="tableMeta"
    :loading="pending"
    loading-color="primary"
    loading-animation="carousel"
    :empty="emptyTitle"
    class="forum-threads-table"
    :ui="tableUi"
  >
    <template #title-cell="{ row }">
      <div class="forum-threads-table__topic">
        <button type="button" class="forum-threads-table__title" @click="emit('select', row.original)">
          {{ row.original.title }}
        </button>
        <div class="forum-threads-table__meta">
          <span>{{ t("pages.forumPage.byLabel") }}</span>
          <NuxtLink :to="row.original.authorUrl">{{ row.original.author }}</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>{{ row.original.createdAt }}</span>
        </div>
      </div>
    </template>

    <template #lastPostAt-cell="{ row }">
      {{ row.original.lastPostAt || t("pages.forumPage.neverLabel") }}
    </template>

    <template #repliesCount-cell="{ row }">
      <span class="forum-threads-table__number">{{ row.original.repliesCount }}</span>
    </template>

    <template #views-cell="{ row }">
      <span class="forum-threads-table__number">{{ row.original.views }}</span>
    </template>

    <template #loading>
      <div class="forum-threads-table__loading" :aria-label="t('pages.forumPage.tableLoadingLabel')">
        <USkeleton v-for="index in 4" :key="index" class="h-12 rounded-[10px]" />
      </div>
    </template>

    <template #empty>
      <div class="forum-threads-table__empty">
        <Icon name="i-ph-chat-dots-duotone" />
        <strong>{{ emptyTitle }}</strong>
        <span v-if="emptyDescription">{{ emptyDescription }}</span>
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui"
import type { ForumThread } from "../../domain/types/forum.types"

const props = defineProps<{
  threads: ForumThread[]
  pending: boolean
  emptyTitle: string
  emptyDescription?: string
  activeThreadId?: number
}>()

const emit = defineEmits<{
  select: [thread: ForumThread]
}>()

const { t } = useI18n()

const columns = computed<TableColumn<ForumThread>[]>(() => [
  {
    accessorKey: "title",
    header: t("pages.forumPage.topicColumn"),
    meta: { class: { th: "min-w-[300px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "lastPostAt",
    header: t("pages.forumPage.lastPostColumn"),
    meta: { class: { th: "min-w-[150px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "repliesCount",
    header: t("pages.forumPage.repliesLabel"),
    meta: { class: { th: "w-24 text-center", td: "text-center" } },
  },
  {
    accessorKey: "views",
    header: t("pages.forumPage.viewsLabel"),
    meta: { class: { th: "w-24 text-center", td: "text-center" } },
  },
])

const tableUi = {
  root: "forum-threads-table__root",
  base: "w-full min-w-[720px]",
  thead: "bg-[var(--bg-surface-hover)]",
  th: "text-xs text-[var(--text-secondary)]",
  td: "text-xs text-[var(--text-secondary)]",
  empty: "p-0",
  loading: "p-0",
}

const tableMeta = computed(() => ({
  class: {
    tr: (row: TableRow<ForumThread>) => row.original.id === props.activeThreadId
      ? "forum-threads-table__row--active"
      : "",
  },
}))
</script>

<style scoped>
.forum-threads-table {
  min-width: 0;
}

.forum-threads-table__topic {
  min-width: 0;
}

.forum-threads-table__title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-default);
}

.forum-threads-table__title:hover {
  color: var(--text-brand);
}

.forum-threads-table__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.forum-threads-table__meta a {
  color: var(--text-secondary);
  font-weight: 700;
  text-decoration: none;
}

.forum-threads-table__meta a:hover {
  color: var(--text-brand);
}

.forum-threads-table__number {
  display: inline-flex;
  min-width: 30px;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  padding: 4px 8px;
  color: var(--text-secondary);
  font-weight: 700;
}

.forum-threads-table :deep(.forum-threads-table__row--active > td) {
  background: var(--bg-surface-active);
}

.forum-threads-table__loading {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.forum-threads-table__empty {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  text-align: center;
}

.forum-threads-table__empty :deep(svg) {
  width: 38px;
  height: 38px;
  color: var(--text-tertiary);
}

.forum-threads-table__empty strong {
  margin-top: 9px;
  color: var(--text-primary);
  font-size: 15px;
}

.forum-threads-table__empty span {
  max-width: 460px;
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.55;
}
</style>
