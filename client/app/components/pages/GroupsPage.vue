<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 ring-1 ring-[#dbe3f2] sm:p-7">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
                {{ $t("community.groups.hub") }}
              </span>
              <span class="inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[12px] font-extrabold text-white">
                {{ heroMainStat.value }} {{ heroMainStat.label }}
              </span>
            </div>

            <div class="space-y-3">
              <h1 class="max-w-[760px] text-[34px] font-black leading-tight text-[var(--text-primary)] sm:text-[48px]">
                {{ pageTitle }}
              </h1>
              <p class="max-w-xl text-[15px] font-medium leading-7 text-slate-600">
                {{ pageDescription }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <NuxtLink
              to="/create-group"
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary-600 px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-plus-bold" class="mr-2 h-5 w-5 shrink-0" />
              {{ $t("community.groups.action.createNew") }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[24px] border border-[#dbe3f2] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase text-white/52">
                  {{ heroMainStat.label }}
                </p>
                <p class="mt-2 text-[34px] font-black leading-none">
                  {{ heroMainStat.value }}
                </p>
                <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-white/68">
                  {{ heroMainStat.description }}
                </p>
              </div>

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0f172a]">
                <Icon name="i-ph-users-three-fill" class="h-7 w-7" />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article
              v-for="item in heroSecondaryStats"
              :key="item.label"
              class="rounded-[20px] border border-[#dbe3f2] bg-white p-4"
            >
              <p class="text-[10px] font-extrabold uppercase text-slate-500">
                {{ item.label }}
              </p>
              <p class="mt-2 break-words text-[22px] font-black leading-tight text-[var(--text-primary)]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[12px] font-semibold leading-5 text-slate-500">
                {{ item.description }}
              </p>
            </article>
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

const heroMainStat = computed(() => ({
  label: activeTabLabel.value,
  value: String(visibleGroups.value.length),
  description: activeTabHint.value,
}))

const heroSecondaryStats = computed(() => [
  {
    label: t("community.groups.stats.suggested"),
    value: String(suggestedCount.value),
    description: t("community.groups.descSuggested"),
  },
  {
    label: t("community.groups.stats.joined"),
    value: String(joinedCount.value),
    description: t("community.groups.descJoined"),
  },
  {
    label: t("community.groups.stats.status"),
    value: activeTabDescription.value,
    description: activeTabHint.value,
  },
])

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


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

