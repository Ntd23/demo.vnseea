<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ $t("community.pagesDirectory.title") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ pageTitle }}
        </h1>
      </div>
    </section>

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

const { data: countsData } = useAsyncData(
  "community:pages:counts",
  async () => {
    const [mine, suggested, favorite] = await Promise.all([
      repository.getPages("mine"),
      repository.getPages("suggested"),
      repository.getPages("favorite"),
    ])

    return {
      mine: mine.length,
      suggested: suggested.length,
      favorite: favorite.length,
    }
  },
  {
    default: () => ({
      mine: 0,
      suggested: 0,
      favorite: 0,
    }),
  },
)

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    to: communityPageRouteMap[tab.value],
    count: countsData.value?.[tab.value] ?? 0,
  })),
)

const actionLabel = computed(() => {
  if (props.mode === "suggested") return "community.pagesDirectory.actionSuggested"
  if (props.mode === "favorite") return "community.pagesDirectory.actionFavorite"
  return "community.pagesDirectory.actionMine"
})
</script>
