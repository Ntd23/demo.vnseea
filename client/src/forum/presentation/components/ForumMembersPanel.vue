<!-- English description: Forum member directory rendered with Nuxt UI Table, integrated search, filters, and pagination. -->
<template>
  <section class="forum-panel surface-card">
    <header class="forum-panel__header">
      <h2>{{ t("pages.forumPage.membersTitle") }}</h2>
      <p>{{ t("pages.forumPage.membersDescription") }}</p>
    </header>

    <div class="forum-members__table-shell">
      <form class="forum-members__toolbar" @submit.prevent="$emit('search')">
        <UInput
          v-model="search"
          icon="i-ph-magnifying-glass-duotone"
          :placeholder="t('pages.forumPage.memberSearchPlaceholder')"
          class="forum-members__search-input"
        />
        <UButton type="submit" color="primary" icon="i-ph-magnifying-glass-bold">
          {{ t("pages.forumPage.searchAction") }}
        </UButton>
      </form>

      <div class="forum-members__alphabet" :aria-label="t('pages.forumPage.memberAlphabetLabel')">
        <button
          v-for="letter in alphabet"
          :key="letter || 'all'"
          type="button"
          :class="{ 'forum-members__letter--active': activeLetter === letter }"
          @click="$emit('select-letter', letter)"
        >
          {{ letter ? letter.toUpperCase() : t("pages.forumPage.memberAlphabetAll") }}
        </button>
      </div>

      <UTable
        :data="members"
        :columns="columns"
        :loading="pending"
        loading-color="primary"
        loading-animation="carousel"
        :caption="t('pages.forumPage.membersTitle')"
        :empty="t('pages.forumPage.membersEmptyTitle')"
      >
        <template #name-cell="{ row }">
          <NuxtLink :to="row.original.profileUrl" class="forum-members__identity">
            <span class="forum-members__avatar">
              <img
                v-if="row.original.avatarUrl"
                :src="row.original.avatarUrl"
                :alt="row.original.name"
                loading="lazy"
              >
              <span v-else>{{ row.original.name.slice(0, 1).toUpperCase() }}</span>
            </span>
            <span>
              <strong>{{ row.original.name }}</strong>
              <small>{{ roleLabel(row.original.role) }}</small>
            </span>
          </NuxtLink>
        </template>

        <template #joinedAt-cell="{ row }">
          {{ row.original.joinedAt || "-" }}
        </template>

        <template #lastSeenAt-cell="{ row }">
          {{ row.original.lastSeenAt || "-" }}
        </template>

        <template #postCount-cell="{ row }">
          <span class="forum-members__count">{{ row.original.postCount }}</span>
        </template>

        <template #referrals-cell="{ row }">
          {{ row.original.referrals || "-" }}
        </template>

        <template #loading>
          <div class="forum-table__loading" :aria-label="t('pages.forumPage.tableLoadingLabel')">
            <USkeleton v-for="index in 5" :key="index" class="h-12 rounded-[10px]" />
          </div>
        </template>

        <template #empty>
          <div class="forum-table__empty">
            <Icon name="i-ph-users-three-duotone" />
            <strong>{{ t("pages.forumPage.membersEmptyTitle") }}</strong>
            <span>{{ t("pages.forumPage.membersEmptyDescription") }}</span>
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
import type { ForumMember } from "../../domain/types/forum.types"

defineProps<{
  members: ForumMember[]
  activeLetter: string
  pending: boolean
  hasMore: boolean
  loadingMore: boolean
}>()

defineEmits<{
  search: []
  "select-letter": [letter: string]
  "load-more": []
}>()

const search = defineModel<string>("search", { default: "" })
const { t } = useI18n()
const alphabet = ["", ..."abcdefghijklmnopqrstuvwxyz".split("")]

const columns = computed<TableColumn<ForumMember>[]>(() => [
  {
    accessorKey: "name",
    header: t("pages.forumPage.memberName"),
    meta: { class: { th: "min-w-[220px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "joinedAt",
    header: t("pages.forumPage.memberJoined"),
    meta: { class: { th: "min-w-[140px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "lastSeenAt",
    header: t("pages.forumPage.memberLastVisit"),
    meta: { class: { th: "min-w-[140px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "postCount",
    header: t("pages.forumPage.memberPostCount"),
    meta: { class: { th: "w-28 text-center", td: "text-center" } },
  },
  {
    accessorKey: "referrals",
    header: t("pages.forumPage.memberReferrals"),
    meta: { class: { th: "min-w-[120px]", td: "whitespace-normal" } },
  },
])



const roleLabel = (role: string) =>
  role === "admin"
    ? t("pages.forumPage.memberRoleAdmin")
    : t("pages.forumPage.memberRoleRegistered")
</script>

<style scoped>
.forum-panel {
  min-width: 0;
  padding: 16px;
}

.forum-panel__header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.forum-panel__header p {
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.55;
}

.forum-members__table-shell {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
}

.forum-members__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--border-default);
  padding: 12px;
}

.forum-members__search-input {
  width: 100%;
}

.forum-members__alphabet {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-default);
  padding: 10px 12px;
}

.forum-members__alphabet button {
  min-width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-surface-hover);
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.forum-members__alphabet button:hover,
.forum-members__letter--active {
  border-color: var(--border-strong) !important;
  background: var(--bg-surface-active) !important;
  color: var(--text-brand) !important;
}

.forum-members__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.forum-members__avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--bg-surface-active);
  color: var(--text-brand);
  font-size: 13px;
  font-weight: 800;
}

.forum-members__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.forum-members__identity strong,
.forum-members__identity small {
  display: block;
}

.forum-members__identity strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.forum-members__identity small {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 600;
}

.forum-members__identity:hover strong {
  color: var(--text-brand);
}

.forum-members__count {
  display: inline-flex;
  min-width: 30px;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  padding: 4px 8px;
  font-weight: 700;
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

@media (min-width: 640px) {
  .forum-members__toolbar {
    flex-direction: row;
    align-items: center;
  }

  .forum-members__search-input {
    flex: 1;
  }
}
</style>
