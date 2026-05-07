<!-- Description: Renders the legacy-style pages directory with a simple heading, tabs, and backend-backed list content. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <CommunityPageDirectoryTabsBar v-model:search="search" :tabs="tabItems" :active-tab="mode"
      :status-label="filterStatusLabel" />

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
      <div v-for="item in 4" :key="item" class="skeleton-card">
        <div class="skeleton-cover">
          <div class="skeleton skeleton-bg"></div>
          
          <div class="skeleton-overlay-top-left">
            <div class="skeleton skeleton-pill w-[180px] h-[28px]"></div>
          </div>

          <div class="skeleton-overlay-top-right">
            <div class="skeleton skeleton-circle h-[34px] w-[34px]"></div>
          </div>

          <div class="skeleton-overlay-info">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton-info-text">
              <div class="skeleton skeleton-text w-[70%] h-[20px]"></div>
              <div class="skeleton skeleton-text w-[40%] h-[14px]"></div>
            </div>
          </div>

          <div class="skeleton-overlay-stats">
            <div class="skeleton skeleton-pill w-[120px] h-[31px]"></div>
            <div class="skeleton skeleton-pill w-[120px] h-[31px]"></div>
          </div>

          <div class="skeleton-overlay-bottom-right">
            <div class="skeleton skeleton-circle h-[34px] w-[34px]"></div>
          </div>
        </div>
      </div>
    </div>

    <section v-else-if="visiblePages.length === 0"
      class="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <FoundationEmptyState :icon="mode === 'mine' ? 'i-ph-flag-duotone' : 'i-ph-magnifying-glass-duotone'"
        :title="mode === 'mine' ? $t('community.pagesDirectory.emptyMineTitle') : $t('community.pagesDirectory.emptyOtherTitle')"
        :description="mode === 'mine' ? $t('community.pagesDirectory.emptyMineDesc') : $t('community.pagesDirectory.emptyOtherDesc')" />
    </section>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <CommunityPageCard v-for="page in visiblePages" :key="page.id" :page="page" :action-label="actionLabel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageCard from "../components/PageCard.vue"
import CommunityPageDirectoryTabsBar from "../components/PageDirectoryTabsBar.vue"
import {
  communityPageRouteMap,
  communityPageTabs,
} from "../../domain/constants/community-options"
import type { CommunityPageTab } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})

const { t } = useI18n()
const repository = createApiCommunityRepository()

const search = ref(readQueryValue(route.query.q))
const isSearching = ref(false)
const storedSearch = useStorage<string>(
  `community:pages:${props.mode}:search`,
  "",
  undefined,
  { initOnMounted: true },
)

const { data: pagesData, status } = useAsyncData(
  () => `community:pages:${props.mode}`,
  () => repository.getPages(props.mode),
  {
    watch: [() => props.mode],
    default: () => [],
  },
)

const pending = computed(() => status.value === "pending")
const pages = computed(() => pagesData.value ?? [])

const pageTitle = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.titleSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.titleFavorite")
  return t("community.pagesDirectory.title")
})

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    to: communityPageRouteMap[tab.value],
  })),
)

const actionLabel = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.actionSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.actionFavorite")
  return t("community.pagesDirectory.actionMine")
})
</script>

<style scoped>
.skeleton-card {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.skeleton-cover {
  position: relative;
  height: 300px;
  width: 100%;
}

.skeleton {
  background: #334155;
  background: linear-gradient(
    90deg,
    #334155 25%,
    #475569 50%,
    #334155 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite linear;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-bg {
  position: absolute;
  inset: 0;
}

.skeleton-pill {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-circle {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-text {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-overlay-top-left {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 10;
}

.skeleton-overlay-top-right {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10;
}

.skeleton-overlay-info {
  position: absolute;
  bottom: 52px;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-overlay-stats {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.skeleton-overlay-bottom-right {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
}
</style>
