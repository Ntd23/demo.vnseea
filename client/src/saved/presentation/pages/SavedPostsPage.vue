<template>
  <main class="saved-posts-page">
    <section
      class="saved-dashboard"
      aria-labelledby="saved-posts-title"
    >
      <div class="saved-dashboard__header">
        <div class="saved-dashboard__copy">
          <h1 id="saved-posts-title" class="saved-dashboard__title">
            {{ t("pages.savedPostsPage.dashboardTitle") }}
          </h1>
          <p class="saved-dashboard__description">
            {{ t("pages.savedPostsPage.dashboardDescription") }}
          </p>
        </div>

        <div class="saved-dashboard__actions">
          <NuxtLink
            to="/home"
            class="saved-dashboard__button saved-dashboard__button--secondary"
          >
            {{ t("pages.savedPostsPage.backToFeed") }}
          </NuxtLink>
          <button
            v-if="visibleSavedPosts.length > 0"
            type="button"
            class="saved-dashboard__button saved-dashboard__button--primary"
            @click="removeAll"
          >
            {{ t("pages.savedPostsPage.removeAll") }}
          </button>
          <button
            v-else
            type="button"
            class="saved-dashboard__button saved-dashboard__button--primary"
            @click="restoreMockData"
          >
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

    <section v-if="visibleSavedPosts.length === 0" class="mt-5 rounded-xl border border-[#ccd3df] bg-white p-10 text-center shadow-sm">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F3FF] text-[#1877F2]">
        <Icon name="i-ph-bookmark-simple-fill" class="h-8 w-8" />
      </div>
      <h2 class="mt-5 text-[22px] font-extrabold text-[#050505]">
        {{ t("pages.savedPostsPage.emptyTitle") }}
      </h2>
      <p class="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#65676B]">
        {{ t("pages.savedPostsPage.emptyDescription") }}
      </p>
      <button
        type="button"
        class="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#1877F2] px-4 text-[13px] font-bold text-white transition hover:bg-[#1565C0] active:scale-95"
        @click="restoreMockData"
      >
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
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div v-if="displayedSavedPosts.length === 0" class="mt-5 rounded-xl border border-[#ccd3df] bg-white p-8 text-center shadow-sm">
        <p class="text-[15px] font-bold text-[#050505]">
          {{ t("pages.savedPostsPage.noTabResultsTitle") }}
        </p>
        <p class="mt-1 text-[13px] text-[#65676B]">
          {{ t("pages.savedPostsPage.noTabResultsDescription") }}
        </p>
      </div>

      <div v-else class="mt-5 space-y-5">
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

const displayedSavedPosts = computed(() => {
  if (activeTab.value === "feed") {
    return visibleSavedPosts.value.filter(item => item.sourceTo.startsWith("/home"))
  }

  if (activeTab.value === "priority") {
    return visibleSavedPosts.value.filter(item => item.collectionLabel === t("pages.savedPostsPage.collectionPriority"))
  }

  return visibleSavedPosts.value
})

const tabs = computed(() => [
  { value: "recent" as const, label: t("pages.savedPostsPage.tabRecent") },
  { value: "feed" as const, label: t("pages.savedPostsPage.tabFeed") },
  { value: "priority" as const, label: t("pages.savedPostsPage.tabPriority") },
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
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 12px 20px 48px;
  color: #050505;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
}

.saved-dashboard {
  border: 1px solid #ccd0d5;
  border-radius: 12px;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
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
  border-radius: 8px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease;
}

.saved-dashboard__button:active {
  transform: scale(0.98);
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
  margin-top: 18px;
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
  border: 0;
  background: transparent;
  padding: 0 18px 1px;
  color: #3f4654;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  transition: color 160ms ease;
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

.saved-tabs__button--active {
  color: #1877f2;
}

.saved-tabs__button--active::after {
  background: #1877f2;
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
}
</style>
