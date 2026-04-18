import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { createCommunitySlug } from "../../types/community"
import { useMockSocialData } from "./useMockSocialData"

type MockSocialPost = ReturnType<typeof useMockSocialData>["posts"][number]

export interface HashtagChip {
  label: string
  slug: string
  count: number
  to: string
}

function humanizeHashtagSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function normalizeHashtagValue(value: string) {
  return createCommunitySlug(
    String(value || "")
      .replace(/^#/, "")
      .trim(),
  )
}

export function formatHashtagLabel(value: string) {
  const trimmed = String(value || "").replace(/^#/, "").trim()
  return trimmed ? `#${trimmed}` : "#hashtag"
}

export function createHashtagPath(value: string) {
  const slug = normalizeHashtagValue(value)
  return slug ? `/hashtag/${slug}` : "/search"
}

function pushHashtagCount(
  accumulator: Map<string, { label: string; slug: string; count: number }>,
  label: string,
  excludedSlug?: string,
) {
  const slug = normalizeHashtagValue(label)
  if (!slug || slug === excludedSlug) return

  const existing = accumulator.get(slug)
  if (existing) {
    existing.count += 1
    return
  }

  accumulator.set(slug, {
    label: label.replace(/^#/, "").trim(),
    slug,
    count: 1,
  })
}

function collectHashtagCounts(posts: MockSocialPost[], excludedSlug?: string) {
  const map = new Map<string, { label: string; slug: string; count: number }>()

  posts.forEach((post) => {
    post.tags.forEach(tag => pushHashtagCount(map, tag, excludedSlug))
  })

  return Array.from(map.values())
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"))
}

export function useMockHashtagData(tagSource: MaybeRefOrGetter<string>) {
  const { posts, widgets } = useMockSocialData()

  const tagSlug = computed(() => normalizeHashtagValue(String(toValue(tagSource) || "")))

  const matchingPosts = computed(() =>
    posts.filter(post =>
      post.tags.some(tag => normalizeHashtagValue(tag) === tagSlug.value),
    ),
  )

  const canonicalTag = computed(() => {
    for (const post of matchingPosts.value) {
      const matched = post.tags.find(tag => normalizeHashtagValue(tag) === tagSlug.value)
      if (matched) return matched
    }

    return humanizeHashtagSlug(tagSlug.value || "hashtag")
  })

  const hashtagLabel = computed(() => formatHashtagLabel(canonicalTag.value))
  const hasMatches = computed(() => matchingPosts.value.length > 0)

  const authorCount = computed(() =>
    new Set(matchingPosts.value.map(post => post.author)).size,
  )

  const interactionCount = computed(() =>
    matchingPosts.value.reduce(
      (sum, post) => sum + post.stats.likes + post.stats.comments + post.stats.shares,
      0,
    ),
  )

  const relatedHashtags = computed<HashtagChip[]>(() =>
    collectHashtagCounts(matchingPosts.value, tagSlug.value).map(item => ({
      ...item,
      to: createHashtagPath(item.slug),
    })),
  )

  const suggestedHashtags = computed<HashtagChip[]>(() => {
    const map = new Map<string, { label: string; slug: string; count: number }>()

    collectHashtagCounts(posts, tagSlug.value).forEach((item) => {
      map.set(item.slug, { ...item })
    })

    widgets
      .flatMap(section => section.items)
      .forEach((item) => {
        if (!item.title.startsWith("#")) return
        pushHashtagCount(map, item.title, tagSlug.value)
      })

    return Array.from(map.values())
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"))
      .map(item => ({
        ...item,
        to: createHashtagPath(item.slug),
      }))
  })

  const heroStats = computed(() => [
    {
      label: "Bài viết",
      value: matchingPosts.value.length,
      description: "Số bài trong mock social feed chứa hashtag này.",
    },
    {
      label: "Tác giả",
      value: authorCount.value,
      description: "Số người đã đăng nội dung có gắn hashtag tương ứng.",
    },
    {
      label: "Tương tác",
      value: interactionCount.value,
      description: "Tổng lượt thích, bình luận và chia sẻ của các bài liên quan.",
    },
    {
      label: "Liên quan",
      value: hasMatches.value ? relatedHashtags.value.length : suggestedHashtags.value.length,
      description: hasMatches.value
        ? "Hashtag khác thường xuất hiện cùng chủ đề này."
        : "Hashtag gợi ý để tiếp tục khám phá khi chưa có kết quả.",
    },
  ])

  return {
    tagSlug,
    canonicalTag,
    hashtagLabel,
    hasMatches,
    matchingPosts,
    relatedHashtags,
    suggestedHashtags,
    heroStats,
  }
}
