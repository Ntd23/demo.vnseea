<!-- Description: Renders the legacy-style groups directory with a simple heading, tabs, and backend-backed list content. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ $t("community.groups.hub") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ pageTitle }}
        </h1>
      </div>
    </section>

    <CommunityGroupsFilterBar
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-group"
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
      v-else-if="groups.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        :icon="mode === 'mine' ? 'i-ph-users-three-fill' : 'i-ph-magnifying-glass'"
        :title="mode === 'mine' ? $t('community.groups.empty.mineTitle') : $t('community.groups.empty.noMatchTitle')"
        :description="mode === 'mine' ? $t('community.groups.empty.mineDesc') : $t('community.groups.empty.noMatchDesc')"
      />
    </section>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <CommunityGroupCard
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :action-label="cardActionLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityGroupCard from "../components/CommunityGroupCard.vue"
import CommunityGroupsFilterBar from "../components/GroupsFilterBar.vue"
import {
  communityGroupRouteMap,
  communityGroupTabs,
} from "../../domain/constants/community-options"
import type { CommunityGroupTab } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

const props = withDefaults(defineProps<{
  mode?: CommunityGroupTab
}>(), {
  mode: "mine",
})

const { t } = useI18n()
const repository = createApiCommunityRepository()

const mode = computed(() => props.mode)

const { data: groupsData, status } = useAsyncData(
  () => `community:groups:${mode.value}`,
  () => repository.getGroups(mode.value),
  {
    watch: [mode],
    default: () => [],
  },
)

const pending = computed(() => status.value === "pending")
const groups = computed(() => groupsData.value ?? [])

const pageTitle = computed(() => {
  if (props.mode === "suggested") return t("community.groups.titleSuggested")
  if (props.mode === "joined") return t("community.groups.titleJoined")
  return t("community.groups.title")
})

const tabItems = computed(() =>
  communityGroupTabs.map(tab => ({
    ...tab,
    to: communityGroupRouteMap[tab.value],
  })),
)

const cardActionLabel = computed(() => {
  if (mode.value === "suggested") return "community.groups.action.explore"
  if (mode.value === "joined") return "community.groups.action.viewUpdates"
  return "community.groups.action.viewGroup"
})
</script>
