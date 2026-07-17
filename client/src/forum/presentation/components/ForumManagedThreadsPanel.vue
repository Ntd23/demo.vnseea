<!-- English description: Current-user forum threads rendered with Nuxt UI Table and owner actions. -->
<template>
  <section class="forum-managed surface-card">
    <header>
      <h2>{{ t("pages.forumPage.myThreadsTitle") }}</h2>
      <p>{{ t("pages.forumPage.myThreadsDescription") }}</p>
    </header>

    <div class="forum-managed__table-shell">
      <UTable
        :data="threads"
        :columns="columns"
        :loading="pending"
        loading-color="primary"
        loading-animation="carousel"
        :caption="t('pages.forumPage.myThreadsTitle')"
        :empty="t('pages.forumPage.myThreadsEmptyTitle')"
        :ui="tableUi"
      >
        <template #title-cell="{ row }">
          <div class="forum-managed__topic">
            <NuxtLink
              class="forum-managed__title"
              :to="{ path: '/forum', query: { tab: 'my_threads', fid: String(row.original.forumId), tid: String(row.original.id) } }"
            >
              {{ row.original.title }}
            </NuxtLink>
            <div class="forum-managed__meta">
              <span>{{ t("pages.forumPage.byLabel") }}</span>
              <NuxtLink :to="row.original.authorUrl">{{ row.original.author }}</NuxtLink>
              <span aria-hidden="true">/</span>
              <span>{{ row.original.createdAt }}</span>
            </div>
          </div>
        </template>

        <template #views-cell="{ row }">
          <span class="forum-managed__count">{{ row.original.views }}</span>
        </template>

        <template #lastPostAt-cell="{ row }">
          {{ row.original.lastPostAt || t("pages.forumPage.neverLabel") }}
        </template>

        <template #actions-cell="{ row }">
          <div v-if="row.original.canManage" class="forum-managed__actions">
            <UButton
              color="neutral"
              variant="soft"
              icon="i-ph-pencil-simple-bold"
              :aria-label="t('pages.forumPage.editAction')"
              @click="$emit('edit', row.original)"
            />
            <UButton
              color="error"
              variant="soft"
              icon="i-ph-trash-bold"
              :aria-label="t('pages.forumPage.deleteAction')"
              @click="$emit('delete', row.original)"
            />
          </div>
        </template>

        <template #loading>
          <div class="forum-table__loading" :aria-label="t('pages.forumPage.tableLoadingLabel')">
            <USkeleton v-for="index in 5" :key="index" class="h-12 rounded-[10px]" />
          </div>
        </template>

        <template #empty>
          <div class="forum-table__empty">
            <Icon name="i-ph-notebook-duotone" />
            <strong>{{ t("pages.forumPage.myThreadsEmptyTitle") }}</strong>
            <span>{{ t("pages.forumPage.myThreadsEmptyDescription") }}</span>
          </div>
        </template>
      </UTable>

      <footer v-if="hasMore" class="forum-table__footer">
        <UButton color="neutral" variant="soft" :loading="loadingMore" @click="$emit('load-more')">
          {{ t("pages.forumPage.loadMore") }}
        </UButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import type { ForumThread } from "../../domain/types/forum.types"

defineProps<{
  threads: ForumThread[]
  pending: boolean
  hasMore: boolean
  loadingMore: boolean
}>()

defineEmits<{
  edit: [thread: ForumThread]
  delete: [thread: ForumThread]
  "load-more": []
}>()

const { t } = useI18n()

const columns = computed<TableColumn<ForumThread>[]>(() => [
  {
    accessorKey: "title",
    header: t("pages.forumPage.topicColumn"),
    meta: { class: { th: "min-w-[320px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "views",
    header: t("pages.forumPage.viewsLabel"),
    meta: { class: { th: "w-24 text-center", td: "text-center" } },
  },
  {
    accessorKey: "lastPostAt",
    header: t("pages.forumPage.lastPostColumn"),
    meta: { class: { th: "min-w-[150px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "id",
    id: "actions",
    header: t("pages.forumPage.actionColumn"),
    meta: { class: { th: "w-28 text-right", td: "text-right" } },
  },
])

const tableUi = {
  root: "forum-managed__table-root",
  base: "w-full min-w-[720px]",
  thead: "bg-[var(--bg-surface-hover)]",
  th: "text-xs text-[var(--text-secondary)]",
  td: "text-xs text-[var(--text-secondary)]",
  empty: "p-0",
  loading: "p-0",
}
</script>

<style scoped>
.forum-managed {
  min-width: 0;
  padding: 16px;
}

.forum-managed header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.forum-managed header p {
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.55;
}

.forum-managed__table-shell {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
}

.forum-managed__topic {
  min-width: 0;
}

.forum-managed__title {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.forum-managed__title:hover {
  color: var(--text-brand);
}

.forum-managed__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.forum-managed__meta a {
  color: var(--text-secondary);
  font-weight: 700;
  text-decoration: none;
}

.forum-managed__count {
  display: inline-flex;
  min-width: 30px;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  padding: 4px 8px;
  font-weight: 700;
}

.forum-managed__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.forum-table__loading {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.forum-table__empty {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  text-align: center;
}

.forum-table__empty :deep(svg) {
  width: 38px;
  height: 38px;
  color: var(--text-tertiary);
}

.forum-table__empty strong {
  margin-top: 9px;
  color: var(--text-primary);
  font-size: 15px;
}

.forum-table__empty span {
  max-width: 460px;
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.55;
}

.forum-table__footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-default);
  padding: 12px;
}
</style>
