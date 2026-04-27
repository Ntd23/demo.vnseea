import type { ComputedRef, MaybeRefOrGetter } from "vue"
import { useMockHashtagData } from "../../../../app/composables/useMockHashtagData"
import type { BlogStat, HashtagChip } from "../../domain/types/blog.types"

export function useHashtagDataSource(tagSource: MaybeRefOrGetter<string>) {
  const data = useMockHashtagData(tagSource)

  return {
    tagSlug: data.tagSlug,
    canonicalTag: data.canonicalTag,
    hashtagLabel: data.hashtagLabel,
    hasMatches: data.hasMatches,
    matchingPosts: data.matchingPosts,
    relatedHashtags: data.relatedHashtags as ComputedRef<HashtagChip[]>,
    suggestedHashtags: data.suggestedHashtags as ComputedRef<HashtagChip[]>,
    heroStats: data.heroStats as ComputedRef<BlogStat[]>,
  }
}
