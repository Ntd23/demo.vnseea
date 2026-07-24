<!-- English description: Advanced forum search with filters embedded in Nuxt UI Table result tooling. -->
<template>
  <section class="forum-search-panel surface-card">
    <header>
      <h2>{{ t("pages.forumPage.searchTitle") }}</h2>
      <p>{{ t("pages.forumPage.searchDescription") }}</p>
    </header>

    <div class="forum-search-panel__table-shell">
      <form class="forum-search-panel__toolbar" @submit.prevent="$emit('submit')">
        <UFormField :label="t('pages.forumPage.searchTermsLabel')" class="forum-search-panel__terms">
          <UTextarea
            v-model="term"
            :rows="2"
            autoresize
            :placeholder="t('pages.forumPage.searchTermsPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('pages.forumPage.searchTypeLabel')">
          <USelect v-model="searchType" :items="searchTypeOptions" class="w-full" />
        </UFormField>

        <UFormField :label="t('pages.forumPage.searchScopeLabel')">
          <USelect v-model="scope" :items="scopeOptions" class="w-full" />
        </UFormField>

        <UFormField :label="t('pages.forumPage.searchSectionLabel')">
          <USelect v-model="sectionId" :items="sectionOptions" class="w-full" />
        </UFormField>

        <div class="forum-search-panel__actions">
          <UButton type="submit" color="primary" icon="i-ph-magnifying-glass-bold">
            {{ t("pages.forumPage.searchAction") }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-ph-arrow-counter-clockwise-bold"
            @click="$emit('reset')"
          >
            {{ t("pages.forumPage.resetFilters") }}
          </UButton>
        </div>
      </form>

      <UTable
        v-if="resultType === 'forums'"
        :data="forumRows"
        :columns="forumColumns"
        :loading="pending"
        loading-color="primary"
        loading-animation="carousel"
        :caption="t('pages.forumPage.searchTitle')"
        :empty="t('pages.forumPage.searchEmptyTitle')"
      >
        <template #title-cell="{ row }">
          <button type="button" class="forum-search-panel__forum-link" @click="$emit('select-forum', row.original.id)">
            <strong>{{ row.original.title }}</strong>
            <small v-if="row.original.description">{{ row.original.description }}</small>
          </button>
        </template>

        <template #posts-cell="{ row }">
          <span class="forum-search-panel__count">{{ row.original.posts }}</span>
        </template>

        <template #loading>
          <div class="forum-table__loading" :aria-label="t('pages.forumPage.tableLoadingLabel')">
            <USkeleton v-for="index in 4" :key="index" class="h-12 rounded-[10px]" />
          </div>
        </template>

        <template #empty>
          <SearchEmptyState :searched="searched" />
        </template>
      </UTable>

      <ForumThreadsTable
        v-else-if="resultType === 'threads'"
        :threads="threads"
        :pending="pending"
        :active-thread-id="activeThreadId"
        :empty-title="searched ? t('pages.forumPage.searchEmptyTitle') : t('pages.forumPage.searchReadyTitle')"
        :empty-description="searched ? t('pages.forumPage.searchEmptyDescription') : t('pages.forumPage.searchReadyDescription')"
        @select="$emit('select-thread', $event.id, $event.forumId)"
      />

      <div v-else class="forum-search-panel__message-result">
        <div v-if="pending" class="forum-table__loading" :aria-label="t('pages.forumPage.tableLoadingLabel')">
          <USkeleton v-for="index in 4" :key="index" class="h-12 rounded-[10px]" />
        </div>
        <div v-else-if="searched && activeThreadId" class="forum-search-panel__message-status">
          <Icon name="i-ph-arrow-square-out-duotone" />
          <strong>{{ t("pages.forumPage.searchMessageOpened") }}</strong>
        </div>
        <SearchEmptyState v-else :searched="searched" />
      </div>

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
import type {
  ForumSearchScope,
  ForumSummarySection,
  ForumThread,
} from "../../domain/types/forum.types"
import ForumThreadsTable from "./ForumThreadsTable.vue"

type ForumSearchTableRow = {
  id: number
  sectionTitle: string
  title: string
  description: string
  posts: number
}

const props = defineProps<{
  catalogSections: ForumSummarySection[]
  sections: ForumSummarySection[]
  threads: ForumThread[]
  pending: boolean
  searched: boolean
  hasMore: boolean
  loadingMore: boolean
  activeThreadId: number
  resultType: ForumSearchScope
}>()

defineEmits<{
  submit: []
  reset: []
  "select-forum": [id: number]
  "select-thread": [id: number, forumId: number]
  "load-more": []
}>()

const term = defineModel<string>("term", { default: "" })
const scope = defineModel<ForumSearchScope>("scope", { default: "threads" })
const includeContent = defineModel<boolean>("includeContent", { default: false })
const sectionId = defineModel<number>("sectionId", { default: 0 })
const { t } = useI18n()

const searchType = computed({
  get: () => includeContent.value ? "content" : "subject",
  set: value => {
    includeContent.value = value === "content"
  },
})

const searchTypeOptions = computed(() => [
  { label: t("pages.forumPage.searchSubjectOnly"), value: "subject" },
  { label: t("pages.forumPage.searchSubjectAndContent"), value: "content" },
])

const scopeOptions = computed(() => [
  { label: t("pages.forumPage.searchInForums"), value: "forums" },
  { label: t("pages.forumPage.searchInThreads"), value: "threads" },
  { label: t("pages.forumPage.searchInMessages"), value: "messages" },
])

const sectionOptions = computed(() => [
  { label: t("pages.forumPage.searchAllSections"), value: 0 },
  ...props.catalogSections.map(section => ({ label: section.title, value: section.id })),
])

const forumRows = computed<ForumSearchTableRow[]>(() =>
  props.sections.flatMap(section => section.forums.map(forum => ({
    id: forum.id,
    sectionTitle: section.title,
    title: forum.title,
    description: forum.description,
    posts: forum.posts,
  }))),
)

const forumColumns = computed<TableColumn<ForumSearchTableRow>[]>(() => [
  {
    accessorKey: "sectionTitle",
    header: t("pages.forumPage.sectionColumn"),
    meta: { class: { th: "min-w-[160px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "title",
    header: t("pages.forumPage.forumColumn"),
    meta: { class: { th: "min-w-[320px]", td: "whitespace-normal" } },
  },
  {
    accessorKey: "posts",
    header: t("pages.forumPage.postsColumn"),
    meta: { class: { th: "w-28 text-center", td: "text-center" } },
  },
])



const SearchEmptyState = defineComponent({
  props: {
    searched: { type: Boolean, default: false },
  },
  setup(emptyProps) {
    return () => h("div", { class: "forum-search-panel__empty" }, [
      h(resolveComponent("Icon"), { name: "i-ph-magnifying-glass-minus-duotone" }),
      h("strong", emptyProps.searched
        ? t("pages.forumPage.searchEmptyTitle")
        : t("pages.forumPage.searchReadyTitle")),
      h("span", emptyProps.searched
        ? t("pages.forumPage.searchEmptyDescription")
        : t("pages.forumPage.searchReadyDescription")),
    ])
  },
})
</script>

<style scoped>
.forum-search-panel {
  min-width: 0;
  padding: 16px;
}

.forum-search-panel header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.forum-search-panel header p {
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.55;
}

.forum-search-panel__table-shell {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
}

.forum-search-panel__toolbar {
  display: grid;
  gap: 12px;
  border-bottom: 1px solid var(--border-default);
  padding: 12px;
}

.forum-search-panel__terms {
  min-width: 0;
}

.forum-search-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.forum-search-panel__forum-link {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.forum-search-panel__forum-link strong,
.forum-search-panel__forum-link small {
  display: block;
}

.forum-search-panel__forum-link strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.forum-search-panel__forum-link small {
  margin-top: 3px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.forum-search-panel__forum-link:hover strong {
  color: var(--text-brand);
}

.forum-search-panel__count {
  display: inline-flex;
  min-width: 30px;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  padding: 4px 8px;
  font-weight: 700;
}

.forum-search-panel__message-result {
  min-height: 190px;
}

.forum-search-panel__message-status,
.forum-search-panel__empty {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  text-align: center;
}

.forum-search-panel__message-status :deep(svg),
.forum-search-panel__empty :deep(svg) {
  width: 38px;
  height: 38px;
  color: var(--text-tertiary);
}

.forum-search-panel__message-status strong,
.forum-search-panel__empty :deep(strong) {
  margin-top: 9px;
  color: var(--text-primary);
  font-size: 15px;
}

.forum-search-panel__empty :deep(span) {
  max-width: 460px;
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.55;
}

.forum-table__loading {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.forum-table__footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-default);
  padding: 12px;
}

@media (min-width: 760px) {
  .forum-search-panel__toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .forum-search-panel__terms,
  .forum-search-panel__actions {
    grid-column: 1 / -1;
  }
}
</style>
