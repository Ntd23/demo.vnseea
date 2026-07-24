<!-- Description: Renders the backend-backed community group detail route with a composer-first feed and profile-style sidebar cards. -->
<template>
  <div class="profile-page pb-10">
    <!-- ── Loading skeleton ──────────────────────────────── -->
    <template v-if="status === 'pending' && !group">
      <div class="space-y-5">
        <!-- Hero Skeleton -->
        <div class="profile-page__hero">
          <USkeleton class="profile-page__cover" style="height: 350px;" />
          <div class="profile-page__identity-bar">
            <USkeleton class="profile-page__avatar rounded-full" style="width: 160px; height: 160px;" />
            <div class="profile-page__identity-meta space-y-4 pt-10">
              <USkeleton class="h-10 w-64 rounded-full" />
              <div class="flex gap-3">
                <USkeleton class="h-5 w-24 rounded-full" />
                <USkeleton class="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Body Skeleton -->
        <div class="profile-page__body">
          <aside class="profile-page__sidebar space-y-4">
            <USkeleton class="h-[200px] w-full rounded-[24px]" />
            <USkeleton class="h-[260px] w-full rounded-[24px]" />
          </aside>
          <main class="profile-page__feed space-y-4">
            <USkeleton class="h-[120px] w-full rounded-[24px]" />
            <USkeleton class="h-[400px] w-full rounded-[24px]" />
          </main>
        </div>
      </div>
    </template>

    <!-- ── Main Content ──────────────────────────────────── -->
    <div v-else-if="group" class="space-y-4" :class="{ 'opacity-50 pointer-events-none': status === 'pending' }">
      <CommunityGroupHeroBanner
        :group="group"
        :member-count-label="memberCountLabel"
        :online-count-label="onlineCountLabel"
        :privacy-label="privacyLabel"
        :category-label="categoryLabel"
        :join-state="joinState"
        :invite-state="inviteState"
        :joined="joined"
        :requested="requested"
        @join="handleJoinGroup"
        @invite="handleInviteMembers"
      />

      <!-- Grid Body (Sidebar on left, Feed on right) -->
      <div class="profile-page__body">
        <!-- LEFT: Sidebar (stickied) -->
        <aside class="profile-page__sidebar">
          <section class="profile-card profile-card--search">
            <div class="profile-card__head">
              <h2 class="profile-card__title">Tìm kiếm các bài viết</h2>
            </div>
            <UInput
              v-model="postSearchQuery"
              icon="i-ph-magnifying-glass-duotone"
              placeholder="Tìm bài viết trong nhóm..."
              size="xl"
              class="mt-3 w-full"
            />
          </section>

          <section class="profile-card">
            <div class="profile-card__head profile-card__head--bordered">
              <span class="profile-card__icon profile-card__icon--blue">
                <Icon name="i-ph-info-fill" class="h-4.5 w-4.5" />
              </span>
              <h2 class="profile-card__title">Thông tin</h2>
            </div>

            <div class="profile-card__rows">
              <div class="profile-card__intro-row">
                <Icon name="i-ph-users-three-fill" class="profile-card__row-icon" />
                <span class="profile-card__intro-value">{{ memberCountLabel }}</span>
                <span class="profile-card__weekly">+0 Tuần này</span>
              </div>
              <div class="profile-card__intro-row">
                <Icon name="i-ph-globe-hemisphere-west-fill" class="profile-card__row-icon" />
                <span class="profile-card__intro-value">{{ privacyLabel }}</span>
              </div>
              <div class="profile-card__intro-row">
                <Icon name="i-ph-tag-fill" class="profile-card__row-icon" />
                <span class="profile-card__intro-value">{{ categoryLabel }}</span>
              </div>
              <div class="profile-card__intro-row">
                <Icon name="i-ph-newspaper-clipping-fill" class="profile-card__row-icon" />
                <span class="profile-card__intro-value">{{ groupPostCountLabel }}</span>
              </div>
              <button
                type="button"
                class="profile-card__invite-row"
                :disabled="inviteState === 'loading'"
                @click="handleInviteMembers"
              >
                <Icon name="i-ph-user-plus-fill" class="profile-card__row-icon" />
                <span>Thêm bạn bè của bạn vào nhóm này</span>
              </button>
            </div>
          </section>

          <section class="profile-card">
            <div class="profile-card__head profile-card__head--bordered">
              <span class="profile-card__icon profile-card__icon--blue">
                <Icon name="i-ph-text-align-left-bold" class="h-4.5 w-4.5" />
              </span>
              <h2 class="profile-card__title">Về</h2>
            </div>
            <p class="profile-card__about-text">
              {{ groupSummary || "Chưa có mô tả." }}
            </p>
          </section>
        </aside>

        <!-- RIGHT: Feed/Content area -->
        <main class="profile-page__feed">
          <CommunityGroupFeedSection
            v-if="group"
            :group="group"
            :posts="filteredGroupPosts"
            :empty-title="postSearchQuery.trim() ? 'Không tìm thấy bài viết phù hợp' : undefined"
            :empty-description="postSearchQuery.trim() ? 'Thử tìm bằng từ khóa khác.' : undefined"
            @created="handlePostCreated"
          />
        </main>
      </div>
    </div>

    <!-- ── Empty State ───────────────────────────────────── -->
    <div v-else class="mx-auto max-w-[960px] pt-4">
      <section class="rounded-[30px] border border-[var(--border-light)] bg-[var(--bg-surface)] px-6 py-10 text-center shadow-[var(--shadow-md)] sm:px-8 sm:py-16">
        <FoundationEmptyState
          icon="i-ph-users-three-fill"
          :title="t('pages.groupDetailPage.emptyTitle')"
          :description="t('pages.groupDetailPage.emptyDescription')"
        />

        <div class="mt-6 flex justify-center">
          <UButton
            :to="emptyBackPath"
            color="primary"
            variant="solid"
            size="xl"
            class="rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_color-mix(in srgb, var(--bg-brand) 24%, transparent)]"
          >
            {{ t("pages.groupDetailPage.backToGroups") }}
          </UButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityGroupFeedSection from "../components/GroupFeedSection.vue"
import CommunityGroupHeroBanner from "../components/GroupHeroBanner.vue"
import { useCommunityGroupDetailPageVM } from "../../application/view-models/useCommunityGroupDetailPageVM"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()
const postSearchQuery = ref("")
const {
  joinState,
  inviteState,
  joined,
  requested,
  group,
  privacyLabel,
  categoryLabel,
  memberCountLabel,
  onlineCountLabel,
  groupPosts,
  refreshGroupPosts,
  handleJoinGroup,
  handleInviteMembers,
  emptyBackPath,
  status,
} = useCommunityGroupDetailPageVM()

const groupSummary = computed(() =>
  group.value ? translateText(group.value.summary) : "",
)

const groupPostCount = computed(() => {
  const activityCount = Number(group.value?.activityLabel || 0)
  if (Number.isFinite(activityCount) && activityCount > 0) return activityCount
  return groupPosts.value.length
})

const groupPostCountLabel = computed(() =>
  `${groupPostCount.value} bài viết`,
)

const filteredGroupPosts = computed(() => {
  const query = postSearchQuery.value.trim().toLowerCase()
  if (!query) return groupPosts.value

  return groupPosts.value.filter((post) => {
    const searchable = [
      post.text,
      post.author,
      post.role,
      post.category,
      post.sourceLabel,
      ...(post.tags || []),
    ].join(" ").toLowerCase()

    return searchable.includes(query)
  })
})

function handlePostCreated() {
  refreshGroupPosts()
}
</script>

<style scoped>
/* ── Page shell ───────────────────────────────────────── */
.profile-page {
  min-height: 100vh;
  background: var(--bg-base);
  margin-top: 8px;
  overflow-x: hidden;
}

/* ── Body ─────────────────────────────────── */
.profile-page__body {
  display: grid;
  gap: 12px;
}

@media (min-width: 1024px) {
  .profile-page__body {
    grid-template-columns: 360px minmax(0, 1fr);
    align-items: start;
  }
}

@media (min-width: 1280px) {
  .profile-page__body {
    grid-template-columns: 380px minmax(0, 1fr);
  }
}

.profile-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

@media (min-width: 1024px) {
  .profile-page__sidebar {
    order: 1;
    position: sticky;
    top: 68px;
  }
}

.profile-page__feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

@media (min-width: 1024px) {
  .profile-page__feed {
    order: 2;
  }
}

.profile-card {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.profile-card--search {
  padding: 16px;
}

.profile-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-card__head--bordered {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
}

.profile-card__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
}

.profile-card__icon {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.profile-card__icon--blue {
  background: var(--bg-brand);
  color: var(--text-inverse);
}

.profile-card__rows {
  padding: 10px 16px 12px;
}

.profile-card__intro-row,
.profile-card__invite-row {
  display: flex;
  min-height: 28px;
  align-items: center;
  gap: 12px;
  width: 100%;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.3;
}

.profile-card__invite-row {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.profile-card__invite-row:hover {
  color: var(--bg-brand);
}

.profile-card__invite-row:disabled {
  cursor: wait;
  opacity: 0.65;
}

.profile-card__row-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: var(--text-secondary);
}

.profile-card__intro-value {
  min-width: 0;
  flex: 1;
}

.profile-card__weekly {
  margin-left: auto;
  color: var(--color-success);
  white-space: nowrap;
}

.profile-card__about-text {
  margin: 0;
  padding: 18px 16px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
