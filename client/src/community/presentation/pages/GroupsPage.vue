<!-- Description: Renders the groups directory as a content-first list page that follows the PHP directory shell order. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ activeTabLabel }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.3rem]">
            {{ pageTitle }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ pageDescription }}
          </p>
        </div>

        <NuxtLink
          to="/create-group"
          class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.groups.action.createNew") }}
        </NuxtLink>
      </div>
    </section>

    <CommunityGroupsFilterBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-group"
      :status-label="filterStatusLabel"
    />

    <section class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 text-[14px] leading-6 text-slate-500 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
      <strong class="mr-2 text-[var(--text-primary)]">{{ activeTabLabel }}</strong>
      {{ activeTabHint }}
    </section>

    <div v-if="pending" class="grid gap-4 xl:grid-cols-2">
      <div
        v-for="item in 4"
        :key="item"
        class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
      >
        <USkeleton class="h-36 w-full rounded-[22px]" />
        <div class="mt-4 space-y-3">
          <USkeleton class="h-6 w-48 rounded-xl" />
          <USkeleton class="h-4 w-full rounded-xl" />
          <USkeleton class="h-4 w-2/3 rounded-xl" />
        </div>
      </div>
    </div>

    <section
      v-else-if="visibleGroups.length === 0"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-12 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <FoundationEmptyState
        :icon="mode === 'mine' ? 'i-ph-users-three-fill' : 'i-ph-magnifying-glass'"
        :title="mode === 'mine' ? $t('community.groups.empty.mineTitle') : $t('community.groups.empty.noMatchTitle')"
        :description="mode === 'mine' ? $t('community.groups.empty.mineDesc') : $t('community.groups.empty.noMatchDesc')"
      />
    </section>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <CommunityGroupCard
        v-for="group in visibleGroups"
        :key="group.id"
        :group="group"
        :action-label="cardActionLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityGroupCard from "../components/CommunityGroupCard.vue"
import CommunityGroupsFilterBar from "../components/GroupsFilterBar.vue"
import {
  communityGroupRouteMap,
  communityGroupTabs,
} from "../../domain/constants/community-options"
import { appendCommunityQuery } from "../../domain/services/community-helpers.service"
import type { CommunityGroupTab } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const repository = createApiCommunityRepository()

const props = withDefaults(defineProps<{
  mode?: CommunityGroupTab
}>(), {
  mode: "mine",
})

const mode = computed(() => props.mode)
const search = ref(readQueryValue(route.query.q))
const storedSearch = useStorage<string>(
  `community:groups:${props.mode}:search`,
  "",
  undefined,
  { initOnMounted: true },
)

const { data: groupsData, status } = useAsyncData(
  () => `community:groups:${mode.value}`,
  () => repository.getGroups(mode.value),
  {
    watch: [mode],
    default: () => [],
  },
)

const { data: countsData } = useAsyncData(
  "community:groups:counts",
  async () => {
    const [mine, suggested, joined] = await Promise.all([
      repository.getGroups("mine"),
      repository.getGroups("suggested"),
      repository.getGroups("joined"),
    ])

    return {
      mine: mine.length,
      suggested: suggested.length,
      joined: joined.length,
    }
  },
  {
    default: () => ({
      mine: 0,
      suggested: 0,
      joined: 0,
    }),
  },
)

const pending = computed(() => status.value === "pending")
const groups = computed(() => groupsData.value ?? [])

const pageTitle = computed(() => {
  if (props.mode === "suggested") return t("community.groups.titleSuggested")
  if (props.mode === "joined") return t("community.groups.titleJoined")
  return t("community.groups.title")
})

const pageDescription = computed(() => {
  if (props.mode === "suggested") return t("community.groups.descSuggested")
  if (props.mode === "joined") return t("community.groups.descJoined")
  return t("community.groups.descDefault")
})

const tabItems = computed(() =>
  communityGroupTabs.map(tab => ({
    ...tab,
    to: appendCommunityQuery(communityGroupRouteMap[tab.value], { q: search.value.trim() }),
    count: countsData.value?.[tab.value] ?? 0,
  })),
)

const visibleGroups = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return groups.value

  return groups.value.filter((group) => {
    const searchable = [
      group.name,
      group.slug,
      group.summary,
      group.ownerLabel,
      ...group.tags,
    ].join(" ").toLowerCase()

    return searchable.includes(keyword)
  })
})

const activeTabLabel = computed(() => {
  const tab = communityGroupTabs.find(tab => tab.value === props.mode)
  return tab ? t(tab.label) : t("community.groups.card.privacyFallback")
})

const activeTabHint = computed(() => {
  if (props.mode === "mine") return t("community.groups.hint.mine")
  if (props.mode === "suggested") return t("community.groups.hint.suggested")
  return t("community.groups.hint.joined")
})

const filterStatusLabel = computed(() =>
  search.value.trim()
    ? t("community.groups.filter.results", { count: visibleGroups.value.length })
    : t("community.groups.filter.resultsIdle"),
)

const cardActionLabel = computed(() => {
  if (mode.value === "suggested") return "community.groups.action.explore"
  if (mode.value === "joined") return "community.groups.action.viewUpdates"
  return "community.groups.action.viewGroup"
})

watch(
  () => route.query.q,
  (value) => {
    const nextValue = readQueryValue(value)

    if (nextValue !== search.value) {
      search.value = nextValue
    }

    if (nextValue.trim()) {
      storedSearch.value = nextValue.trim()
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (!readQueryValue(route.query.q) && storedSearch.value.trim()) {
    search.value = storedSearch.value.trim()
  }
})

watchDebounced(
  search,
  async (value) => {
    const keyword = value.trim()

    storedSearch.value = keyword

    if (keyword === readQueryValue(route.query.q)) {
      return
    }

    const nextQuery = { ...route.query }

    if (keyword) {
      nextQuery.q = keyword
    }
    else {
      delete nextQuery.q
    }

    await router.replace({ query: nextQuery })
  },
  {
    debounce: 250,
    maxWait: 1000,
  },
)
</script>
