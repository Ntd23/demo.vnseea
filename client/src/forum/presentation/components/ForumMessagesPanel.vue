<!-- English description: Current-user forum replies rendered with Nuxt UI Table and owner actions. -->
<template>
  <section class="forum-messages surface-card">
    <header>
      <h2>{{ t("pages.forumPage.myMessagesTitle") }}</h2>
      <p>{{ t("pages.forumPage.myMessagesDescription") }}</p>
    </header>

    <div class="forum-messages__table-shell">
      <UTable
        :data="messages"
        :columns="columns"
        :loading="pending"
        loading-color="primary"
        loading-animation="carousel"
        :caption="t('pages.forumPage.myMessagesTitle')"
        :empty="t('pages.forumPage.myMessagesEmptyTitle')"
      >
        <template #subject-cell="{ row }">
          <div class="forum-messages__topic">
            <NuxtLink :to="row.original.url" class="forum-messages__subject">
              {{ row.original.subject }}
            </NuxtLink>
            <p v-if="row.original.message">{{ row.original.message }}</p>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div v-if="row.original.canManage" class="forum-messages__actions">
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
            <Icon name="i-ph-chat-centered-dots-duotone" />
            <strong>{{ t("pages.forumPage.myMessagesEmptyTitle") }}</strong>
            <span>{{ t("pages.forumPage.myMessagesEmptyDescription") }}</span>
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
import type { ForumMessage } from "../../domain/types/forum.types"

defineProps<{
  messages: ForumMessage[]
  pending: boolean
  hasMore: boolean
  loadingMore: boolean
}>()

defineEmits<{
  edit: [message: ForumMessage]
  delete: [message: ForumMessage]
  "load-more": []
}>()

const { t } = useI18n()

const columns = computed<TableColumn<ForumMessage>[]>(() => [
  {
    accessorKey: "subject",
    header: t("pages.forumPage.subjectColumn"),
    meta: { class: { th: "min-w-[320px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "forumLabel",
    header: t("pages.forumPage.forumColumn"),
    meta: { class: { th: "min-w-[150px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "postedAt",
    header: t("pages.forumPage.postedColumn"),
    meta: { class: { th: "min-w-[140px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "id",
    id: "actions",
    header: t("pages.forumPage.actionColumn"),
    meta: { class: { th: "w-28 text-right", td: "text-right" } },
  },
])


</script>

<style scoped>
.forum-messages {
  min-width: 0;
  padding: 16px;
}

.forum-messages header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.forum-messages header p {
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.55;
}

.forum-messages__table-shell {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
}

.forum-messages__topic {
  min-width: 0;
}

.forum-messages__subject {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.forum-messages__subject:hover {
  color: var(--text-brand);
}

.forum-messages__topic p {
  display: -webkit-box;
  overflow: hidden;
  max-width: 420px;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.forum-messages__actions {
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
