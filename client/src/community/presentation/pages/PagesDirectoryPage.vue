<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <CommunityPageDirectoryTabsBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      :status-label="filterStatusLabel"
      :create-to="appRoutes.createPage"
    />

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

    <CommunityPageDirectoryTabsBar
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-page"
    />

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
      <div
        v-for="item in 4"
        :key="item"
        class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]"
      >
        <div class="flex items-start gap-4">
          <USkeleton class="h-16 w-16 rounded-[16px]" />
          <div class="min-w-0 flex-1 space-y-3">
            <USkeleton class="h-5 w-44 rounded-xl" />
            <USkeleton class="h-4 w-28 rounded-xl" />
            <USkeleton class="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <section
      v-else-if="pages.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        :icon="mode === 'mine' ? 'i-ph-flag-duotone' : 'i-ph-magnifying-glass-duotone'"
        :title="mode === 'mine' ? $t('community.pagesDirectory.emptyMineTitle') : $t('community.pagesDirectory.emptyOtherTitle')"
        :description="mode === 'mine' ? $t('community.pagesDirectory.emptyMineDesc') : $t('community.pagesDirectory.emptyOtherDesc')"
      />
    </section>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <CommunityPageCard
        v-for="page in pages"
        :key="page.id"
        :page="page"
        :action-label="actionLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageCard from "../components/PageCard.vue"
import CommunityPageDirectoryTabsBar from "../components/PageDirectoryTabsBar.vue"
import type { CommunityPageTab } from "../../domain/types/community.types"
import { useCommunityPagesDirectoryVM } from "../../application/view-models/useCommunityPagesDirectoryVM"

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})

const {
  mode,
  search,
  pending,
  visiblePages,
  tabItems,
  actionLabel,
  filterStatusLabel,
} = useCommunityPagesDirectoryVM(computed(() => props.mode))
</script>
