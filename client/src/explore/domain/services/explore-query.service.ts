import type { ExploreContentCounts, ExploreSection, ExploreSectionKind, ExploreView } from "../types/explore.types"

export function readExploreQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

export function normalizeExploreView(value: string): ExploreView {
  return value === "posts" || value === "users" || value === "pages" ? value : "all"
}

export function buildExploreQuery(
  currentQuery: Record<string, unknown>,
  view: ExploreView,
) {
  const nextQuery = { ...currentQuery }

  if (view === "all") {
    delete nextQuery.view
  }
  else {
    nextQuery.view = view
  }

  return nextQuery
}

export function filterExploreSections(
  sections: ExploreSection[],
  activeView: ExploreView,
) {
  return activeView === "all"
    ? sections
    : sections.filter(section => section.kind === activeView)
}

export function hasExploreSectionContent(
  sections: ExploreSection[],
  counts: ExploreContentCounts,
) {
  return sections.some((section) => {
    if (section.kind === "posts") return counts.posts > 0
    if (section.kind === "users") return counts.users > 0
    return counts.pages > 0
  })
}

export function toExploreSectionKind(view: ExploreView): ExploreSectionKind | null {
  return view === "all" ? null : view
}
