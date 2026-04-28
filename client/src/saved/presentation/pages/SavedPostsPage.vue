<template>
  <main class="saved-posts-page">
    <section
      class="saved-dashboard"
      aria-labelledby="saved-posts-title"
    >
      <div class="saved-dashboard__header">
        <div class="saved-dashboard__copy">
          <div class="saved-dashboard__title-row">
            <span class="saved-dashboard__title-icon">
              <Icon name="i-ph-bookmarks-fill" class="saved-dashboard__title-icon-svg" />
            </span>
            <span class="saved-dashboard__title-copy">
              <h1 id="saved-posts-title" class="saved-dashboard__title">
                {{ t("pages.savedPostsPage.dashboardTitle") }}
              </h1>
              <p class="saved-dashboard__description">
                {{ t("pages.savedPostsPage.dashboardDescription") }}
              </p>
            </span>
          </div>
        </div>

        <div class="saved-dashboard__actions">
          <NuxtLink
            to="/home"
            class="saved-dashboard__button saved-dashboard__button--secondary"
          >
            <Icon name="i-ph-house-simple-bold" class="saved-dashboard__button-icon" />
            {{ t("pages.savedPostsPage.backToFeed") }}
          </NuxtLink>
          <button
            v-if="visibleSavedPosts.length > 0"
            type="button"
            class="saved-dashboard__button saved-dashboard__button--primary"
            @click="removeAll"
          >
            <Icon name="i-ph-trash-bold" class="saved-dashboard__button-icon" />
            {{ t("pages.savedPostsPage.removeAll") }}
          </button>
          <button
            v-else
            type="button"
            class="saved-dashboard__button saved-dashboard__button--primary"
            @click="restoreMockData"
          >
            <Icon name="i-ph-arrow-clockwise-bold" class="saved-dashboard__button-icon" />
            {{ t("pages.savedPostsPage.restoreMock") }}
          </button>
        </div>
      </div>

      <div class="saved-dashboard__stats">
        <article
          v-for="item in dashboardStats"
          :key="item.label"
          class="saved-stat-card"
        >
          <span
            class="saved-stat-card__icon"
            :class="item.iconClass"
          >
            <Icon :name="item.icon" class="saved-stat-card__icon-svg" />
          </span>
          <span class="saved-stat-card__body">
            <span class="saved-stat-card__value">
              {{ item.value }}
            </span>
            <span class="saved-stat-card__label">
              {{ item.label }}
            </span>
          </span>
        </article>
      </div>
    </section>

    <section v-if="visibleSavedPosts.length === 0" class="saved-empty">
      <div class="saved-empty__icon">
        <Icon name="i-ph-bookmark-simple-fill" class="saved-empty__icon-svg" />
      </div>
      <h2 class="saved-empty__title">
        {{ t("pages.savedPostsPage.emptyTitle") }}
      </h2>
      <p class="saved-empty__description">
        {{ t("pages.savedPostsPage.emptyDescription") }}
      </p>
      <button
        type="button"
        class="saved-empty__button"
        @click="restoreMockData"
      >
        <Icon name="i-ph-arrow-clockwise-bold" class="saved-empty__button-icon" />
        {{ t("pages.savedPostsPage.restoreMock") }}
      </button>
    </section>

    <section v-else class="saved-posts-content">
      <nav class="saved-tabs" aria-label="Saved posts filters">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="saved-tabs__button"
          :class="{ 'saved-tabs__button--active': activeTab === tab.value }"
          :aria-pressed="activeTab === tab.value"
          :aria-current="activeTab === tab.value ? 'page' : undefined"
          @click="activeTab = tab.value"
        >
          <span>{{ tab.label }}</span>
          <span class="saved-tabs__badge">
            {{ tab.count }}
          </span>
        </button>
      </nav>

      <div v-if="displayedSavedPosts.length === 0" class="saved-empty saved-empty--compact">
        <div class="saved-empty__icon saved-empty__icon--small">
          <Icon name="i-ph-funnel-simple-bold" class="saved-empty__icon-svg" />
        </div>
        <p class="saved-empty__title saved-empty__title--small">
          {{ t("pages.savedPostsPage.noTabResultsTitle") }}
        </p>
        <p class="saved-empty__description">
          {{ t("pages.savedPostsPage.noTabResultsDescription") }}
        </p>
      </div>

      <div v-else class="saved-post-list">
        <SavedPostCard
          v-for="item in displayedSavedPosts"
          :key="item.id"
          :entry="item"
          @remove="removeSavedPost"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import SavedPostCard from "../components/PostCard.vue"
import { useMockSavedPostsData } from "../../application/composables/useMockSavedPostsData"

type SavedPostsTab = "recent" | "feed" | "priority"

const { savedPosts } = useMockSavedPostsData()
const { t, locale } = useI18n()

const removedIds = ref<string[]>([])
const activeTab = ref<SavedPostsTab>("recent")

const visibleSavedPosts = computed(() =>
  savedPosts.value.filter(item => !removedIds.value.includes(item.id)),
)

const feedPosts = computed(() =>
  visibleSavedPosts.value.filter(item => item.sourceTo.startsWith("/home")),
)

const priorityPosts = computed(() =>
  visibleSavedPosts.value.filter(item => item.collectionLabel === t("pages.savedPostsPage.collectionPriority")),
)

const displayedSavedPosts = computed(() => {
  if (activeTab.value === "feed") {
    return feedPosts.value
  }

  if (activeTab.value === "priority") {
    return priorityPosts.value
  }

  return visibleSavedPosts.value
})

const tabs = computed(() => [
  { value: "recent" as const, label: t("pages.savedPostsPage.tabRecent"), count: visibleSavedPosts.value.length },
  { value: "feed" as const, label: t("pages.savedPostsPage.tabFeed"), count: feedPosts.value.length },
  { value: "priority" as const, label: t("pages.savedPostsPage.tabPriority"), count: priorityPosts.value.length },
])

const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

const dashboardStats = computed(() => [
  {
    label: t("pages.savedPostsPage.statItemsShort"),
    value: formatCount(120),
    icon: "i-ph-bookmark-simple-fill",
    iconClass: "saved-stat-card__icon--blue",
  },
  {
    label: t("pages.savedPostsPage.statAuthorsShort"),
    value: formatCount(45),
    icon: "i-ph-users-three-fill",
    iconClass: "saved-stat-card__icon--orange",
  },
  {
    label: t("pages.savedPostsPage.statCollectionsShort"),
    value: formatCount(8),
    icon: "i-ph-folder-simple-fill",
    iconClass: "saved-stat-card__icon--gray",
  },
  {
    label: t("pages.savedPostsPage.statInteractionsShort"),
    value: formatCount(342),
    icon: "i-ph-chart-line-up-duotone",
    iconClass: "saved-stat-card__icon--gray",
  },
])

function removeSavedPost(id: string) {
  if (removedIds.value.includes(id)) return
  removedIds.value = [...removedIds.value, id]
}

function removeAll() {
  removedIds.value = savedPosts.value.map(item => item.id)
}

function restoreMockData() {
  removedIds.value = []
  activeTab.value = "recent"
}

useSeoMeta({
  title: () => t("pages.savedPostsPage.seoTitle"),
  description: () => t("pages.savedPostsPage.seoDescription"),
})
</script>

<style scoped>
.saved-posts-page {
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 18px 20px 56px;
  color: #050505;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
}

.saved-dashboard {
  position: relative;
  overflow: hidden;
  border: 1px solid #ccd0d5;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.saved-dashboard::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: #1877f2;
  content: "";
}

.saved-dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.saved-dashboard__copy {
  min-width: 0;
}

.saved-dashboard__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.saved-dashboard__title-icon {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #e7f3ff;
  color: #1877f2;
  box-shadow: inset 0 0 0 1px rgba(24, 119, 242, 0.12);
}

.saved-dashboard__title-icon-svg {
  width: 25px;
  height: 25px;
}

.saved-dashboard__title-copy {
  min-width: 0;
}

.saved-dashboard__title {
  margin: 0;
  color: #050505;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

.saved-dashboard__description {
  margin: 4px 0 0;
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.saved-dashboard__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.saved-dashboard__button {
  display: inline-flex;
  height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease;
}

.saved-dashboard__button:focus-visible {
  outline: 3px solid rgba(24, 119, 242, 0.22);
  outline-offset: 2px;
}

.saved-dashboard__button:active {
  transform: scale(0.98);
}

.saved-dashboard__button-icon {
  width: 16px;
  height: 16px;
}

.saved-dashboard__button--primary {
  border: 1px solid #1877f2;
  background: #1877f2;
  color: #ffffff;
}

.saved-dashboard__button--primary:hover {
  border-color: #1565c0;
  background: #1565c0;
}

.saved-dashboard__button--secondary {
  border: 1px solid #1877f2;
  background: #ffffff;
  color: #1877f2;
}

.saved-dashboard__button--secondary:hover {
  background: #f0f6ff;
}

.saved-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.saved-stat-card {
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 12px;
  border: 1px solid #ccd0d5;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.saved-stat-card:hover {
  border-color: #b7c0cf;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}

.saved-stat-card__icon {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.saved-stat-card__icon-svg {
  width: 22px;
  height: 22px;
}

.saved-stat-card__body {
  min-width: 0;
}

.saved-stat-card__value {
  display: block;
  color: #050505;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.saved-stat-card__label {
  display: block;
  margin-top: 5px;
  color: #65676b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.saved-stat-card__icon--blue) {
  background: #e7f3ff;
  color: #1877f2;
}

:deep(.saved-stat-card__icon--orange) {
  background: #ffe4d2;
  color: #c05621;
}

:deep(.saved-stat-card__icon--gray) {
  background: #e4e6eb;
  color: #65676b;
}

.saved-posts-content {
  margin-top: 22px;
}

.saved-tabs {
  display: flex;
  height: 56px;
  align-items: flex-end;
  gap: 28px;
  border-bottom: 1px solid #c7ccd8;
  padding: 0 10px;
}

.saved-tabs__button {
  position: relative;
  display: inline-flex;
  height: 56px;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 0 18px 1px;
  color: #3f4654;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  transition: color 160ms ease;
}

.saved-tabs__button:focus-visible {
  outline: 3px solid rgba(24, 119, 242, 0.2);
  outline-offset: -8px;
}

.saved-tabs__button::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: transparent;
  content: "";
}

.saved-tabs__button:hover {
  color: #1877f2;
}

.saved-tabs__badge {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e4e6eb;
  padding: 0 7px;
  color: #3f4654;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.saved-tabs__button--active {
  color: #1877f2;
}

.saved-tabs__button--active .saved-tabs__badge {
  background: #1877f2;
  color: #ffffff;
}

.saved-tabs__button--active::after {
  background: #1877f2;
}

.saved-empty {
  margin-top: 22px;
  border: 1px solid #ccd0d5;
  border-radius: 12px;
  background: #ffffff;
  padding: 42px 24px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.saved-empty--compact {
  padding: 32px 24px;
}

.saved-empty__icon {
  display: flex;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e7f3ff;
  color: #1877f2;
}

.saved-empty__icon--small {
  width: 48px;
  height: 48px;
}

.saved-empty__icon-svg {
  width: 30px;
  height: 30px;
}

.saved-empty__title {
  margin: 18px 0 0;
  color: #050505;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.saved-empty__title--small {
  font-size: 17px;
}

.saved-empty__description {
  max-width: 520px;
  margin: 8px auto 0;
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.saved-empty__button {
  display: inline-flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
  border: 1px solid #1877f2;
  border-radius: 8px;
  background: #1877f2;
  padding: 0 16px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  transition: background-color 160ms ease, border-color 160ms ease, transform 120ms ease;
}

.saved-empty__button:hover {
  border-color: #1565c0;
  background: #1565c0;
}

.saved-empty__button:focus-visible {
  outline: 3px solid rgba(24, 119, 242, 0.22);
  outline-offset: 2px;
}

.saved-empty__button:active {
  transform: scale(0.98);
}

.saved-empty__button-icon {
  width: 16px;
  height: 16px;
}

.saved-post-list {
  display: grid;
  gap: 20px;
  margin-top: 22px;
}

@media (max-width: 820px) {
  .saved-dashboard__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .saved-posts-page {
    padding-inline: 12px;
  }

  .saved-dashboard__header {
    flex-direction: column;
  }

  .saved-dashboard__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .saved-dashboard__button {
    flex: 1 1 140px;
  }

  .saved-dashboard__stats {
    grid-template-columns: 1fr;
  }

  .saved-tabs {
    gap: 14px;
    overflow-x: auto;
    padding: 0 2px;
  }

  .saved-tabs__button {
    flex: 0 0 auto;
    padding-inline: 12px;
    font-size: 15px;
  }

  .saved-empty {
    padding: 32px 18px;
  }
}
</style>
