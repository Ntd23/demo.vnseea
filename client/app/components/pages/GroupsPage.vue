<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0000ff_100%)] text-white shadow-[0_14px_30px_rgba(0,0,255,0.22)]">
            <Icon name="i-ph-users-three-fill" class="h-7 w-7" />
          </div>

          <div>
            <p class="text-[12px] font-bold uppercase tracking-[0.22em] text-[#0000ff]/65">
              {{ $t("community.groups.hub") }}
            </p>
            <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63]">
              {{ pageTitle }}
            </h1>
            <p class="mt-2 max-w-[720px] text-[14px] leading-7 text-slate-500">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.groups.stats.suggested") }}
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ suggestedCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.groups.stats.joined") }}
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ joinedCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.groups.stats.status") }}
            </p>
            <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
              {{ activeTabDescription }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <CommunityGroupsFilterBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-group"
      :status-label="filterStatusLabel"
    />

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/65">
            {{ activeTabLabel }}
          </p>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            {{ activeTabHint }}
          </p>
        </div>

        <UButton
          to="/create-group"
          color="neutral"
          variant="outline"
          size="lg"
          class="rounded-full text-[13px] font-bold"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.groups.action.createNew") }}
        </UButton>
      </div>
    </section>

    <section
      v-if="mode === 'mine' && visibleGroups.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-users-three-fill"
          :title="$t('community.groups.empty.mineTitle')"
          :description="$t('community.groups.empty.mineDesc')"
        />

        <div class="mt-6 flex justify-center">
          <NuxtLink
            to="/create-group"
            class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
          >
            <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
            {{ $t("community.groups.action.createFirst") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else-if="visibleGroups.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass"
          :title="$t('community.groups.empty.noMatchTitle')"
          :description="$t('community.groups.empty.noMatchDesc')"
        />
      </div>
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
import {
  appendCommunityQuery,
  communityGroupDirectory,
  communityGroupRouteMap,
  communityGroupTabs,
} from "../../../types/community"
import type { CommunityGroupTab } from "../../../types/community"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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

const suggestedCount = computed(() =>
  communityGroupDirectory.filter(group => group.segment === "suggested").length,
)

const joinedCount = computed(() =>
  communityGroupDirectory.filter(group => group.segment === "joined").length,
)

const tabItems = computed(() =>
  communityGroupTabs.map(tab => ({
    ...tab,
    to: appendCommunityQuery(communityGroupRouteMap[tab.value], { q: search.value.trim() }),
    count:
      tab.value === "mine"
        ? 0
        : communityGroupDirectory.filter(group => group.segment === tab.value).length,
  })),
)

const visibleGroups = computed(() => {
  const groups =
    props.mode === "mine"
      ? []
      : communityGroupDirectory.filter(group => group.segment === props.mode)

  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return groups

  return groups.filter(group => {
    const searchable = [
      t(group.name),
      group.slug,
      t(group.summary),
      t(group.ownerLabel),
      ...group.tags.map(tag => t(tag)),
    ].join(" ").toLowerCase()

    return searchable.includes(keyword)
  })
})

const activeTabLabel = computed(() => {
  const tab = communityGroupTabs.find(tab => tab.value === props.mode)
  return tab ? t(tab.label) : t("community.groups.card.privacyFallback")
})

const activeTabDescription = computed(() => {
  if (props.mode === "mine") return t("community.groups.status.none")
  if (props.mode === "suggested") return t("community.groups.status.suggestedCount", { count: suggestedCount.value })
  return t("community.groups.status.joinedCount", { count: joinedCount.value })
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
