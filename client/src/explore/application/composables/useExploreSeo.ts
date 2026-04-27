import { computed } from "vue"
import type { ExploreView } from "../../domain/types/explore.types"
import { normalizeExploreView, readExploreQueryValue } from "../../domain/services/explore-query.service"

export function useExploreSeo() {
  const { t } = useI18n()
  const route = useRoute()
  const requestURL = useRequestURL()

  const activeView = computed<ExploreView>(() =>
    normalizeExploreView(readExploreQueryValue(route.query.view)),
  )

  const activeViewLabel = computed(() => {
    if (activeView.value === "posts") return t("pages.explorePage.viewPostsLabel")
    if (activeView.value === "users") return t("pages.explorePage.viewUsersLabel")
    if (activeView.value === "pages") return t("pages.explorePage.viewPagesLabel")
    return t("pages.explorePage.viewAllLabel")
  })

  const canonicalUrl = computed(() => {
    const url = new URL(route.path || "/explore", requestURL.origin)

    if (activeView.value !== "all") {
      url.searchParams.set("view", activeView.value)
    }

    return url.toString()
  })

  useSeoMeta({
    title: () =>
      activeView.value === "all"
        ? t("pages.explorePage.seoTitle")
        : t("pages.explorePage.filteredSeoTitle", { label: activeViewLabel.value }),
    description: () =>
      activeView.value === "all"
        ? t("pages.explorePage.seoDescription")
        : t("pages.explorePage.filteredSeoDescription", { label: activeViewLabel.value }),
    ogTitle: () =>
      activeView.value === "all"
        ? t("pages.explorePage.seoTitle")
        : t("pages.explorePage.filteredSeoTitle", { label: activeViewLabel.value }),
    ogDescription: () =>
      activeView.value === "all"
        ? t("pages.explorePage.seoDescription")
        : t("pages.explorePage.filteredSeoDescription", { label: activeViewLabel.value }),
    ogUrl: () => canonicalUrl.value,
  })

  useHead({
    link: [
      {
        rel: "canonical",
        href: canonicalUrl,
      },
    ],
  })

  return {
    activeView,
    activeViewLabel,
    canonicalUrl,
  }
}
