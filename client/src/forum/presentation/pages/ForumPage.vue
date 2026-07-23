<!-- English description: Five-tab backend forum workspace matching legacy PHTML data, links, search, and owner actions. -->
<template>
  <main class="forum-page mt-1.5">
    <nav class="forum-tabs surface-card" :aria-label="t('pages.forumPage.tabsLabel')">
      <button
        v-for="tab in tabItems"
        :key="tab.value"
        type="button"
        :class="{ 'forum-tab--active': activeTab === tab.value }"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      :title="String(error.message || error)"
    />

    <template v-if="activeTab === 'browse'">
      <section v-if="!isForumDrilldown" class="forum-toolbar surface-card">
        <form class="forum-toolbar__search" @submit.prevent="syncBrowseQuery">
          <UInput
            v-model="browseSearch"
            icon="i-ph-magnifying-glass-duotone"
            :placeholder="t('pages.forumPage.searchPlaceholder')"
            class="w-full"
          />
          <UButton type="submit" color="primary" icon="i-ph-magnifying-glass-bold" class="forum-toolbar__search-btn">
            {{ t("pages.forumPage.searchAction") }}
          </UButton>
          <UButton
            v-if="browseSearch || activeForumId"
            type="button"
            color="neutral"
            variant="soft"
            icon="i-ph-arrow-counter-clockwise-bold"
            class="forum-toolbar__reset-btn"
            @click="resetFilters"
          >
            {{ t("pages.forumPage.resetFilters") }}
          </UButton>
        </form>

        <UButton
          v-if="canCreate && forums.length"
          color="primary"
          icon="i-ph-plus-bold"
          class="forum-toolbar__create-btn"
          @click="openCreate"
        >
          {{ t("pages.forumPage.createThreadButton") }}
        </UButton>
      </section>

      <section
        class="forum-browse"
        :class="{
          'forum-browse--root': !isForumDrilldown,
          'forum-browse--forum': isForumDrilldown && !isThreadDetail,
          'forum-browse--thread': isForumDrilldown && isThreadDetail,
        }"
      >
        <aside v-if="isForumDrilldown" class="forum-sidebar surface-card">
          <header>
            <p>{{ t("pages.forumPage.sectionsEyebrow") }}</p>
            <h2>{{ t("pages.forumPage.sectionsTitle") }}</h2>
          </header>

          <div class="forum-sidebar__sections">
            <section v-for="section in sections" :key="section.id">
              <h3>{{ section.title }}</h3>
              <button
                v-for="forum in section.forums"
                :key="forum.id"
                type="button"
                :class="{ 'forum-sidebar__forum--active': forum.id === activeForumId }"
                @click="selectForum(forum.id)"
              >
                <span class="forum-list-icon"><Icon name="i-ph-chat-centered-text-duotone" /></span>
                <span>
                  <strong>{{ forum.title }}</strong>
                  <small>{{ forum.posts }} {{ t("pages.forumPage.repliesLabel") }}</small>
                </span>
              </button>
            </section>
          </div>
        </aside>

        <section class="forum-browse__main">
          <div v-if="tabPending && !sections.length && !threads.length" class="forum-skeletons">
            <USkeleton v-for="index in 4" :key="index" class="h-44 rounded-[16px]" />
          </div>

          <div v-else-if="!isForumDrilldown" class="forum-section-grid">
            <article v-for="section in sections" :key="section.id" class="forum-section-card surface-card">
              <header>
                <div>
                  <p>{{ t("pages.forumPage.sectionsEyebrow") }}</p>
                  <h2>{{ section.title }}</h2>
                </div>
                <span>{{ section.forums.length }}</span>
              </header>
              <p v-if="section.description">{{ section.description }}</p>

              <button
                v-for="forum in section.forums"
                :key="forum.id"
                type="button"
                class="forum-section-card__forum"
                @click="selectForum(forum.id)"
              >
                <span class="forum-list-icon"><Icon name="i-ph-chat-centered-text-duotone" /></span>
                <span>
                  <strong>{{ forum.title }}</strong>
                  <small>{{ forum.description }}</small>
                </span>
                <em>{{ forum.posts }}</em>
              </button>
            </article>
          </div>

          <div v-else class="forum-thread-table-shell surface-card">
            <div class="forum-thread-table-shell__toolbar">
              <form class="forum-toolbar__search" @submit.prevent="syncBrowseQuery">
                <UInput
                  v-model="browseSearch"
                  icon="i-ph-magnifying-glass-duotone"
                  :placeholder="t('pages.forumPage.searchPlaceholder')"
                  class="w-full"
                />
                <UButton type="submit" color="primary" icon="i-ph-magnifying-glass-bold" class="forum-toolbar__search-btn">
                  {{ t("pages.forumPage.searchAction") }}
                </UButton>
                <UButton
                  v-if="browseSearch || activeForumId"
                  type="button"
                  color="neutral"
                  variant="soft"
                  icon="i-ph-arrow-counter-clockwise-bold"
                  class="forum-toolbar__reset-btn"
                  @click="resetFilters"
                >
                  {{ t("pages.forumPage.resetFilters") }}
                </UButton>
              </form>

              <UButton
                v-if="canCreate"
                color="primary"
                icon="i-ph-plus-bold"
                class="forum-toolbar__create-btn"
                @click="openCreate"
              >
                {{ t("pages.forumPage.createThreadButton") }}
              </UButton>
            </div>

            <ForumThreadsTable
              :threads="threads"
              :pending="tabPending && !threads.length"
              :active-thread-id="activeThreadId"
              :empty-title="t('pages.forumPage.emptyTitle')"
              :empty-description="t('pages.forumPage.emptyDescription')"
              @select="selectThread($event.id, $event.forumId)"
            />

            <footer v-if="hasMoreThreads" class="forum-thread-table-shell__footer">
              <UButton color="neutral" variant="soft" :loading="loadingMore" @click="loadMoreThreads">
                {{ t("pages.forumPage.loadMore") }}
              </UButton>
            </footer>
          </div>
        </section>

        <ForumThreadDetail
          v-if="isThreadDetail"
          :thread="selectedThread"
          :replies="selectedThread?.replies ?? []"
          :status-label="selectedThread ? t('pages.forumPage.detailStatus', { title: selectedThread.title, count: selectedThread.repliesCount }) : ''"
          :submitting="replying"
          @reply="replyThread"
        />
      </section>
    </template>

    <ForumMembersPanel
      v-else-if="activeTab === 'members'"
      v-model:search="memberSearch"
      :members="members"
      :active-letter="memberLetter"
      :pending="tabPending"
      :has-more="hasMoreMembers"
      :loading-more="loadingMore"
      @search="syncMemberQuery"
      @select-letter="selectMemberLetter"
      @load-more="loadMoreMembers"
    />

    <section v-else-if="activeTab === 'search'" class="forum-split" :class="{ 'forum-split--detail': isThreadDetail }">
      <ForumSearchPanel
        v-model:term="advancedSearchTerm"
        v-model:scope="advancedSearchScope"
        v-model:include-content="advancedSearchContent"
        v-model:section-id="advancedSearchSectionId"
        :catalog-sections="sections"
        :sections="searchSections"
        :threads="searchThreads"
        :result-type="searchResultType"
        :pending="tabPending && shouldSearch && !isThreadDetail"
        :searched="shouldSearch"
        :has-more="hasMoreSearchResults"
        :loading-more="loadingMore"
        :active-thread-id="activeThreadId"
        @submit="submitAdvancedSearch"
        @reset="resetFilters"
        @select-forum="selectForum"
        @select-thread="selectThread"
        @load-more="loadMoreSearchResults"
      />

      <ForumThreadDetail
        v-if="isThreadDetail"
        :thread="selectedThread"
        :replies="selectedThread?.replies ?? []"
        :status-label="selectedThread ? t('pages.forumPage.detailStatus', { title: selectedThread.title, count: selectedThread.repliesCount }) : ''"
        :submitting="replying"
        @reply="replyThread"
      />
    </section>

    <section v-else-if="activeTab === 'my_threads'" class="forum-split" :class="{ 'forum-split--detail': isThreadDetail }">
      <ForumManagedThreadsPanel
        :threads="myThreads"
        :pending="tabPending && !isThreadDetail"
        :has-more="hasMoreThreads"
        :loading-more="loadingMore"
        @edit="openThreadEdit"
        @delete="openThreadDelete"
        @load-more="loadMoreThreads"
      />

      <ForumThreadDetail
        v-if="isThreadDetail"
        :thread="selectedThread"
        :replies="selectedThread?.replies ?? []"
        :status-label="selectedThread ? t('pages.forumPage.detailStatus', { title: selectedThread.title, count: selectedThread.repliesCount }) : ''"
        :submitting="replying"
        @reply="replyThread"
      />
    </section>

    <section v-else class="forum-split" :class="{ 'forum-split--detail': isThreadDetail }">
      <ForumMessagesPanel
        :messages="myMessages"
        :pending="tabPending && !isThreadDetail"
        :has-more="hasMoreMessages"
        :loading-more="loadingMore"
        @edit="openReplyEdit"
        @delete="openReplyDelete"
        @load-more="loadMoreMessages"
      />

      <ForumThreadDetail
        v-if="isThreadDetail"
        :thread="selectedThread"
        :replies="selectedThread?.replies ?? []"
        :status-label="selectedThread ? t('pages.forumPage.detailStatus', { title: selectedThread.title, count: selectedThread.repliesCount }) : ''"
        :submitting="replying"
        @reply="replyThread"
      />
    </section>

    <CreateThreadModal
      :open="createOpen"
      :forums="forums"
      :default-forum-id="activeForumId || forums[0]?.id"
      :submitting="creating"
      @close="closeCreate"
      @create="createThread"
    />

    <UModal v-model:open="editOpen" :title="editModalTitle">
      <template #body>
        <UForm :state="{ title: editTitle, message: editMessage }" class="forum-modal-form" @submit="submitEdit">
          <UFormField :label="editTitleLabel" :error="editTitleError || undefined">
            <UInput v-model="editTitle" class="w-full" />
          </UFormField>
          <UFormField :label="t('pages.forumPage.editContentLabel')" :error="editMessageError || undefined">
            <UTextarea v-model="editMessage" :rows="7" autoresize class="w-full" />
          </UFormField>
          <div class="forum-modal-actions">
            <UButton type="button" color="neutral" variant="soft" @click="editTarget = null">
              {{ t("pages.forumPage.cancelAction") }}
            </UButton>
            <UButton type="submit" color="primary" :loading="saving">
              {{ t("pages.forumPage.saveAction") }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="deleteOpen" :title="t('pages.forumPage.deleteConfirmTitle')">
      <template #body>
        <p class="forum-delete-copy">
          {{ t("pages.forumPage.deleteConfirmDescription", { title: deleteTarget?.title || "-" }) }}
        </p>
      </template>
      <template #footer>
        <div class="forum-modal-actions">
          <UButton color="neutral" variant="soft" @click="deleteTarget = null">
            {{ t("pages.forumPage.cancelAction") }}
          </UButton>
          <UButton color="error" :loading="deleting" @click="submitDelete">
            {{ t("pages.forumPage.deleteAction") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import type {
  ForumMessage,
  ForumPageTab,
  ForumThread,
} from "../../domain/types/forum.types"
import { useForumPageVM } from "../../application/view-models/useForumPageVM"
import CreateThreadModal from "../components/CreateThreadModal.vue"
import ForumManagedThreadsPanel from "../components/ForumManagedThreadsPanel.vue"
import ForumMembersPanel from "../components/ForumMembersPanel.vue"
import ForumMessagesPanel from "../components/ForumMessagesPanel.vue"
import ForumSearchPanel from "../components/ForumSearchPanel.vue"
import ForumThreadDetail from "../components/ForumThreadDetail.vue"
import ForumThreadsTable from "../components/ForumThreadsTable.vue"

type EditTarget = {
  kind: "thread" | "reply"
  id: number
  title: string
  message: string
}

type DeleteTarget = {
  kind: "thread" | "reply"
  id: number
  title: string
}

const { t } = useI18n()
const {
  activeTab,
  activeForumId,
  activeThreadId,
  memberLetter,
  browseSearch,
  memberSearch,
  advancedSearchTerm,
  advancedSearchScope,
  advancedSearchContent,
  advancedSearchSectionId,
  createOpen,
  creating,
  replying,
  saving,
  deleting,
  loadingMore,
  sections,
  forums,
  myThreads,
  members,
  searchSections,
  searchThreads,
  searchResultType,
  myMessages,
  threads,
  selectedThread,
  canCreate,
  hasMoreThreads,
  hasMoreMembers,
  hasMoreMessages,
  hasMoreSearchResults,
  tabPending,
  error,
  totalForumCount,
  totalThreadCount,
  isForumDrilldown,
  isThreadDetail,
  shouldSearch,
  selectTab,
  syncBrowseQuery,
  syncMemberQuery,
  selectMemberLetter,
  submitAdvancedSearch,
  selectForum,
  selectThread,
  resetFilters,
  openCreate,
  closeCreate,
  createThread,
  replyThread,
  updateThread,
  updateReply,
  deleteThread,
  deleteReply,
  loadMoreThreads,
  loadMoreMembers,
  loadMoreMessages,
  loadMoreSearchResults,
} = useForumPageVM()

const tabItems = computed<Array<{ value: ForumPageTab; label: string }>>(() => [
  { value: "browse", label: t("pages.forumPage.tabForumList") },
  { value: "members", label: t("pages.forumPage.tabMembers") },
  { value: "search", label: t("pages.forumPage.tabSearch") },
  { value: "my_threads", label: t("pages.forumPage.tabMyThreads") },
  { value: "my_messages", label: t("pages.forumPage.tabMyMessages") },
])

const editTarget = ref<EditTarget | null>(null)
const deleteTarget = ref<DeleteTarget | null>(null)
const editTitle = ref("")
const editMessage = ref("")

const editOpen = computed({
  get: () => Boolean(editTarget.value),
  set: value => {
    if (!value) editTarget.value = null
  },
})

const deleteOpen = computed({
  get: () => Boolean(deleteTarget.value),
  set: value => {
    if (!value) deleteTarget.value = null
  },
})

const editModalTitle = computed(() =>
  editTarget.value?.kind === "reply"
    ? t("pages.forumPage.editReplyTitle")
    : t("pages.forumPage.editThreadTitle"),
)

const editTitleLabel = computed(() =>
  editTarget.value?.kind === "reply"
    ? t("pages.forumPage.replySubjectLabel")
    : t("pages.forumPage.threadSubjectLabel"),
)

const editTitleError = computed(() =>
  editTarget.value && editTitle.value.trim().length < 10
    ? t("pages.forumPage.editTitleError")
    : "",
)

const editMessageError = computed(() =>
  editTarget.value && !editMessage.value.trim()
    ? t("pages.forumPage.editContentError")
    : "",
)

watch(editTarget, (target) => {
  editTitle.value = target?.title || ""
  editMessage.value = target?.message || ""
})

const openThreadEdit = (thread: ForumThread) => {
  editTarget.value = {
    kind: "thread",
    id: thread.id,
    title: thread.editableTitle || thread.title,
    message: thread.editableMessage || thread.excerpt,
  }
}

const openReplyEdit = (message: ForumMessage) => {
  editTarget.value = {
    kind: "reply",
    id: message.id,
    title: message.editableSubject || message.subject,
    message: message.editableMessage || message.message,
  }
}

const openThreadDelete = (thread: ForumThread) => {
  deleteTarget.value = { kind: "thread", id: thread.id, title: thread.title }
}

const openReplyDelete = (message: ForumMessage) => {
  deleteTarget.value = { kind: "reply", id: message.id, title: message.subject }
}

const submitEdit = async () => {
  const target = editTarget.value
  const title = editTitle.value.trim()
  const message = editMessage.value.trim()
  if (!target || title.length < 10 || !message) return

  const saved = target.kind === "thread"
    ? await updateThread({ id: target.id, title, message })
    : await updateReply({ id: target.id, subject: title, message })

  if (saved) editTarget.value = null
}

const submitDelete = async () => {
  const target = deleteTarget.value
  if (!target) return

  const deleted = target.kind === "thread"
    ? await deleteThread(target.id)
    : await deleteReply(target.id)

  if (deleted) deleteTarget.value = null
}
</script>

<style scoped>
.forum-page {
  display: grid;
  width: min(100%, 1320px);
  gap: 16px;
}

.forum-hero,
.forum-toolbar {
  padding: 16px;
}

.forum-hero {
  display: grid;
  gap: 16px;
}

.forum-hero__copy {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.forum-hero__icon,
.forum-list-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.forum-hero__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.forum-hero__icon :deep(svg) {
  width: 26px;
  height: 26px;
}

.forum-hero__copy p,
.forum-sidebar header p,
.forum-section-card header p {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.forum-hero__copy h1 {
  margin-top: 4px;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.forum-hero__copy span {
  display: block;
  margin-top: 6px;
  color: #000000;
  font-size: 14px;
  line-height: 1.6;
}

.forum-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.forum-hero__stats div {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfe;
  padding: 12px;
}

.forum-hero__stats strong,
.forum-hero__stats span {
  display: block;
}

.forum-hero__stats strong {
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}

.forum-hero__stats span {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.forum-tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border: 1px solid var(--border-default) !important;
  border-radius: var(--radius-lg) !important;
  background: var(--bg-surface) !important;
  padding: 12px 14px 16px !important; /* Bottom padding for scrollbar on mobile */
  box-shadow: var(--shadow-sm) !important;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

@media (min-width: 640px) {
  .forum-tabs {
    overflow-x: visible;
    padding: 12px 14px !important; /* Reset padding on desktop */
  }
}

.forum-tabs button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.forum-tabs button:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.forum-tab--active {
  color: var(--text-brand) !important;
  background: var(--bg-surface-active) !important;
  font-weight: 700 !important;
}

.forum-toolbar,
.forum-toolbar__search {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.forum-thread-table-shell {
  min-width: 0;
  overflow: hidden;
}

.forum-thread-table-shell__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--border-default);
  padding: 12px;
}

.forum-thread-table-shell__footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-default);
  padding: 12px;
}

.forum-browse,
.forum-split {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.forum-sidebar {
  align-self: start;
  padding: 16px;
}

.forum-sidebar header h2 {
  margin-top: 3px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.forum-sidebar__sections {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.forum-sidebar__sections section {
  display: grid;
  gap: 7px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.forum-sidebar__sections h3 {
  color: #000000;
  font-size: 13px;
  font-weight: 700;
}

.forum-sidebar__sections button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  padding: 9px;
  text-align: left;
}

.forum-sidebar__sections button:hover,
.forum-sidebar__forum--active {
  border-color: color-mix(in srgb, var(--bg-brand) 12%, transparent) !important;
  background: #fafbfe !important;
}

.forum-list-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.forum-sidebar__sections strong,
.forum-sidebar__sections small,
.forum-section-card__forum strong,
.forum-section-card__forum small {
  display: block;
}

.forum-sidebar__sections strong,
.forum-section-card__forum strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.forum-sidebar__sections small,
.forum-section-card__forum small {
  margin-top: 2px;
  color: #64748b;
  font-size: 11px;
}

.forum-browse__main,
.forum-thread-list,
.forum-skeletons {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 12px;
}

.forum-section-grid {
  display: grid;
  gap: 12px;
}

.forum-section-card {
  padding: 16px;
}

.forum-section-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.forum-section-card h2 {
  margin-top: 3px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
}

.forum-section-card header > span {
  border-radius: 999px;
  background: #fafbfe;
  padding: 5px 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.forum-section-card > p {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
}

.forum-section-card__forum {
  display: grid;
  width: 100%;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
  text-align: left;
}

.forum-section-card__forum:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 16%, transparent);
  background: #fafbfe;
}

.forum-section-card__forum em {
  color: var(--bg-brand);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.forum-load-more {
  display: flex;
  justify-content: center;
}

.forum-empty {
  padding: 44px 18px;
  text-align: center;
}

.forum-empty :deep(svg) {
  width: 42px;
  height: 42px;
  color: #94a3b8;
}

.forum-empty h2 {
  margin-top: 10px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.forum-empty p {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.forum-modal-form {
  display: grid;
  gap: 14px;
}

.forum-modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.forum-delete-copy {
  color: #000000;
  font-size: 14px;
  line-height: 1.6;
}

@media (min-width: 720px) {
  .forum-hero {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: center;
  }

  .forum-toolbar,
  .forum-toolbar__search {
    flex-direction: row;
    align-items: center;
  }

  .forum-toolbar {
    justify-content: space-between;
  }

  .forum-toolbar__search {
    flex: 1;
  }

  .forum-thread-table-shell__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .forum-section-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1120px) {
  .forum-browse--forum {
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }

  .forum-browse--thread {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
  }

  .forum-browse--thread .forum-sidebar {
    display: none !important;
  }

  .forum-split--detail {
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: start;
  }
}

@media (max-width: 1119px) {
  .forum-browse--thread .forum-sidebar,
  .forum-browse--thread .forum-browse__main,
  .forum-split--detail > *:first-child {
    display: none !important;
  }

  .forum-browse--thread,
  .forum-split--detail {
    grid-template-columns: 1fr;
  }
}

/* Deep styles to override Nuxt UI inputs inside the forum context */
.forum-page :deep(input:not([type="file"])),
.forum-page :deep(select),
.forum-page :deep(textarea) {
  border-radius: 12px !important;
  border: 1px solid var(--border-default) !important;
  background-color: var(--bg-surface-hover) !important;
  color: var(--text-primary) !important;
  transition: border-color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default) !important;
}

.forum-page :deep(input:not([type="file"]):focus),
.forum-page :deep(select:focus),
.forum-page :deep(textarea:focus) {
  border-color: var(--border-brand) !important;
  background-color: var(--bg-surface) !important;
}

/* Style the UButton components in forum to look like the canonical design system */
.forum-page :deep(button[type="submit"]),
.forum-page :deep(button[class*="bg-primary"]),
.forum-page :deep(button[class*="bg-[var(--ui-primary)]"]),
.forum-page :deep(.forum-toolbar__search-btn),
.forum-page :deep(.forum-toolbar__create-btn) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  min-height: 38px !important;
  border-radius: 12px !important;
  background: var(--bg-brand) !important;
  padding: 0 16px !important;
  color: var(--text-inverse) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  box-shadow: var(--shadow-brand) !important;
  border: none !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default) !important;
}

.forum-page :deep(button[type="submit"]:hover),
.forum-page :deep(button[class*="bg-primary"]:hover),
.forum-page :deep(button[class*="bg-[var(--ui-primary)]"]:hover),
.forum-page :deep(.forum-toolbar__search-btn:hover),
.forum-page :deep(.forum-toolbar__create-btn:hover) {
  transform: translateY(-1px) !important;
  background: var(--bg-brand-hover) !important;
  color: var(--text-inverse) !important;
}

/* Style soft buttons (like Reset/Cancel) and ensure all buttons bo góc 12px and nowrap */
.forum-page :deep(.forum-toolbar__reset-btn),
.forum-page :deep(button) {
  border-radius: 12px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}
</style>

<style>
/* Global CSS block to style the webkit scrollbar for Forum Tabs */
.forum-tabs::-webkit-scrollbar {
  height: 6px !important;
  background-color: #e2e8f0 !important;
  display: block !important;
}

.forum-tabs::-webkit-scrollbar-track {
  background-color: #e2e8f0 !important;
  border-radius: 999px !important;
}

.forum-tabs::-webkit-scrollbar-thumb {
  background-color: #475569 !important; /* Higher contrast slate-600 */
  border-radius: 999px !important;
}

.forum-tabs::-webkit-scrollbar-thumb:hover {
  background-color: #1e293b !important;
}
</style>
