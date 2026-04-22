  <div class="mx-auto max-w-7xl space-y-8 pb-20 px-4 sm:px-6">
    <!-- Premium Hero Section -->
    <header class="surface-card p-10 relative overflow-hidden ring-1 ring-white/10 shadow-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 group/header">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div class="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-6 sm:gap-8">
          <!-- Glassmorphic Icon Wrapper -->
          <div class="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-[24px] bg-white/20 text-white border border-white/30 backdrop-blur-xl shadow-2xl transition-transform duration-700 group-hover/header:rotate-6 group-hover/header:scale-110">
            <Icon name="i-ph-flag-duotone" class="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          <div class="space-y-2">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {{ $t('community.pagesDirectory.title') }}
            </h1>
            <p class="max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-white/80">
              {{ $t('community.pagesDirectory.desc') }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Tabs/Navigation Bar -->
    <CommunityPageDirectoryTabsBar
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-page"
    />

    <!-- Empty State: Creation CTA -->
    <section
      v-if="mode === 'mine' && visiblePages.length === 0"
      class="surface-card p-12 sm:p-20 text-center ring-1 ring-secondary-100 shadow-xl relative overflow-hidden lg:min-h-[520px] flex items-center justify-center"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div class="relative z-10 mx-auto max-w-xl space-y-8">
        <FoundationEmptyState
          icon="i-ph-flag-duotone"
          :title="$t('community.pagesDirectory.emptyMineTitle')"
          :description="$t('community.pagesDirectory.emptyMineDesc')"
        />

        <div class="flex justify-center pt-4">
          <NuxtLink
            to="/create-page"
            class="group inline-flex h-14 items-center justify-center rounded-2xl bg-primary-600 px-8 text-[14px] font-black uppercase tracking-[0.15em] text-white shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:bg-primary-700 active:scale-95"
          >
            <Icon name="i-ph-plus-bold" class="mr-3 h-5 w-5 transition-transform group-hover:rotate-90" />
            {{ $t('community.pagesDirectory.createFirst') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Empty State: No Results -->
    <section
      v-else-if="visiblePages.length === 0"
      class="surface-card p-12 sm:p-20 text-center ring-1 ring-secondary-100 shadow-xl flex items-center justify-center"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass-duotone"
          :title="$t('community.pagesDirectory.emptyOtherTitle')"
          :description="$t('community.pagesDirectory.emptyOtherDesc')"
        />
      </div>
    </section>

    <!-- Page Cards Grid -->
    <div v-else class="grid gap-6 xl:grid-cols-2">
      <CommunityPageCard
        v-for="page in visiblePages"
        :key="page.id"
        :page="page"
        :action-label="actionLabel"
      />
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import {
  communityPageDirectory,
  communityPageRouteMap,
  communityPageTabs,
} from "../../../types/community"
import type { CommunityPageRecord, CommunityPageTab } from "../../../types/community"

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})

const { t } = useI18n()

const visiblePages = computed<CommunityPageRecord[]>(() => {
  if (props.mode === "mine") return []

  return communityPageDirectory.filter(page =>
    page.directoryTabs?.includes(props.mode),
  )
})

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    label: t(tab.label),
    to: communityPageRouteMap[tab.value],
  })),
)

const actionLabel = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.actionSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.actionFavorite")
  return t("community.pagesDirectory.actionMine")
})

useSeoMeta({
  title: computed(() => {
    if (props.mode === "suggested") return `${t("community.pagesDirectory.seoSuggestedTitle")} | VNSEEA`
    if (props.mode === "favorite") return `${t("community.pagesDirectory.seoFavoriteTitle")} | VNSEEA`
    return `${t("community.pagesDirectory.seoMineTitle")} | VNSEEA`
  }),
  description: computed(() => {
    if (props.mode === "suggested") {
      return t("community.pagesDirectory.seoSuggestedDesc")
    }

    if (props.mode === "favorite") {
      return t("community.pagesDirectory.seoFavoriteDesc")
    }

    return t("community.pagesDirectory.seoMineDesc")
  }),
})
</script>
