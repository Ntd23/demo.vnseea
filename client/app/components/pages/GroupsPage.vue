  <div class="mx-auto max-w-[1280px] space-y-8 pb-20">
    <!-- Premium Header Card -->
    <header class="surface-card p-8 sm:p-10 relative overflow-hidden ring-1 ring-secondary-100 shadow-2xl group/header">
      <div class="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary-500/5 to-transparent pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

      <div class="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-6">
          <!-- Multi-User Icon wrapper -->
          <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-500/30 transition-transform duration-500 group-hover/header:rotate-6 group-hover/header:scale-110">
            <Icon name="i-ph-users-three-duotone" class="h-8 w-8" />
          </div>

          <div class="space-y-2">
            <p class="text-[11px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
              {{ $t('community.groups.hub') }}
            </p>
            <h1 class="text-4xl font-black tracking-tight text-secondary-900">
              {{ pageTitle }}
            </h1>
            <p class="max-w-[600px] text-[14px] font-medium leading-relaxed text-secondary-500 pl-0.5">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid gap-4 min-w-[320px] sm:grid-cols-3">
          <div v-for="stat in [
            { label: 'community.groups.stats.suggested', value: suggestedCount },
            { label: 'community.groups.stats.joined', value: joinedCount },
          ]" :key="stat.label" class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100">
            <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ $t(stat.label) }}</p>
            <p class="text-2xl font-black text-secondary-900 tracking-tight">{{ stat.value }}</p>
          </div>
          <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100">
            <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ $t('community.groups.stats.status') }}</p>
            <p class="text-[11px] font-black uppercase text-secondary-900 tracking-widest leading-none pt-1">{{ activeTabDescription }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation & Search Bar Component -->
    <CommunityGroupsFilterBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-group"
    />

    <!-- Context Hint Card -->
    <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden group/hint">
      <div class="absolute inset-y-0 left-0 w-1 bg-primary-600" />
      
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">
            {{ activeTabLabel }}
          </p>
          <p class="text-[13px] font-medium text-secondary-500 leading-relaxed max-w-xl">
            {{ activeTabHint }}
          </p>
        </div>

        <NuxtLink
          to="/create-group"
          class="inline-flex h-12 items-center justify-center rounded-2xl bg-white border border-secondary-100 px-6 text-[13px] font-black uppercase tracking-widest text-secondary-900 transition-all hover:bg-secondary-50 hover:border-primary-200 hover:text-primary-600 shadow-sm active:scale-95 group/btn"
        >
          <Icon name="i-ph-plus-bold" class="mr-3 h-4 w-4 transition-transform group-hover/btn:rotate-90 pointer-events-none" />
          {{ $t('community.groups.action.createNew') }}
        </NuxtLink>
      </div>
    </section>

    <!-- Empty State: Creation CTA -->
    <section
      v-if="mode === 'mine' && visibleGroups.length === 0"
      class="surface-card p-12 sm:p-20 text-center ring-1 ring-secondary-100 shadow-xl relative overflow-hidden"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div class="relative z-10 mx-auto max-w-xl space-y-8">
        <FoundationEmptyState
          icon="i-ph-users-three-duotone"
          :title="$t('community.groups.empty.mineTitle')"
          :description="$t('community.groups.empty.mineDesc')"
        />

        <div class="flex justify-center pt-4">
          <NuxtLink
            to="/create-group"
            class="group inline-flex h-14 items-center justify-center rounded-2xl bg-primary-600 px-8 text-[14px] font-black uppercase tracking-[0.15em] text-white shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:bg-primary-700 active:scale-95"
          >
            <Icon name="i-ph-plus-bold" class="mr-3 h-5 w-5 transition-transform group-hover:rotate-90" />
            {{ $t('community.groups.action.createFirst') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Empty State: No Results -->
    <section
      v-else-if="visibleGroups.length === 0"
      class="surface-card p-12 sm:p-20 text-center ring-1 ring-secondary-100 shadow-xl"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass-duotone"
          :title="$t('community.groups.empty.noMatchTitle')"
          :description="$t('community.groups.empty.noMatchDesc')"
        />
      </div>
    </section>

    <!-- Group Cards Grid -->
    <div v-else class="grid gap-6 xl:grid-cols-2">
      <CommunityGroupCard
        v-for="group in visibleGroups"
        :key="group.id"
        :group="group"
        :action-label="mode === 'suggested' ? 'community.groups.action.explore' : 'community.groups.action.viewUpdates'"
      />
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import {
  communityGroupDirectory,
  communityGroupRouteMap,
  communityGroupTabs,
} from "../../../types/community"
import type { CommunityGroupTab } from "../../../types/community"

const { t } = useI18n()

const props = withDefaults(defineProps<{
  mode?: CommunityGroupTab
}>(), {
  mode: "mine",
})

const mode = computed(() => props.mode)
const search = ref("")

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
    to: communityGroupRouteMap[tab.value],
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

  return groups.filter(group =>
    [
      group.name,
      group.slug,
      group.summary,
      group.ownerLabel,
      ...group.tags,
    ].join(" ").toLowerCase().includes(keyword),
  )
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

useSeoMeta({
  title: computed(() => `${pageTitle.value} | VNSEEA`),
  description: pageDescription,
})
</script>
