import { computed } from "vue"
import type { ExploreSection, ExploreView } from "../../domain/types/explore.types"
import {
  buildExploreQuery,
  filterExploreSections,
  hasExploreSectionContent,
  normalizeExploreView,
  readExploreQueryValue,
} from "../../domain/services/explore-query.service"
import { useExploreDataSource } from "../../infrastructure/adapters/exploreData.adapter"

export function useExplorePage() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const {
    exploreViewOptions,
    summaryCards,
    recommendedPosts,
    recommendedUsers,
    recommendedPages,
    trendingHashtags,
  } = useExploreDataSource()

  const activeView = computed<ExploreView>(() =>
    normalizeExploreView(readExploreQueryValue(route.query.view)),
  )

  const activeViewOption = computed(() =>
    exploreViewOptions.value.find(option => option.value === activeView.value) ?? exploreViewOptions.value[0],
  )

  const sections = computed<ExploreSection[]>(() => [
    {
      kind: "posts",
      label: t("pages.explorePage.sectionPostsLabel"),
      shortLabel: t("pages.explorePage.sectionPostsShort"),
      description: t("pages.explorePage.sectionPostsDescription"),
      countLabel: t("pages.explorePage.sectionPostsCount", { count: recommendedPosts.value.length }),
    },
    {
      kind: "users",
      label: t("pages.explorePage.sectionUsersLabel"),
      shortLabel: t("pages.explorePage.sectionUsersShort"),
      description: t("pages.explorePage.sectionUsersDescription"),
      countLabel: t("pages.explorePage.sectionUsersCount", { count: recommendedUsers.value.length }),
    },
    {
      kind: "pages",
      label: t("pages.explorePage.sectionPagesLabel"),
      shortLabel: t("pages.explorePage.sectionPagesShort"),
      description: t("pages.explorePage.sectionPagesDescription"),
      countLabel: t("pages.explorePage.sectionPagesCount", { count: recommendedPages.value.length }),
    },
  ])

  const visibleSections = computed(() =>
    filterExploreSections(sections.value, activeView.value),
  )

  const hasContent = computed(() =>
    hasExploreSectionContent(visibleSections.value, {
      posts: recommendedPosts.value.length,
      users: recommendedUsers.value.length,
      pages: recommendedPages.value.length,
    }),
  )

  const setView = async (view: ExploreView) => {
    await router.replace({ query: buildExploreQuery(route.query, view) })
  }

  return {
    t,
    exploreViewOptions,
    summaryCards,
    recommendedPosts,
    recommendedUsers,
    recommendedPages,
    trendingHashtags,
    activeView,
    activeViewOption,
    sections,
    visibleSections,
    hasContent,
    setView,
  }
}
