import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useMockSocialData } from "../../../feed/application/composables/useMockSocialData"
import { computed } from "vue"

type SocialPost = ReturnType<typeof useMockSocialData>["posts"][number]

export interface MockSavedPostEntry {
  id: string
  post: SocialPost
  savedAtLabel: string
  sourceLabel: string
  sourceTo: string
  collectionLabel: string
  note: string
}

function createSavedPostEntry(
  id: string,
  post: SocialPost | undefined,
  metadata: Omit<MockSavedPostEntry, "id" | "post">,
) {
  if (!post) return null

  return {
    id,
    post,
    ...metadata,
  }
}

export function useMockSavedPostsData() {
  const { t } = useI18n()
  const { posts } = useMockSocialData()

  const savedPosts = computed<MockSavedPostEntry[]>(() => [
    createSavedPostEntry("saved-post-1", posts[0], {
      savedAtLabel: t("pages.savedPostsPage.savedAtFirst"),
      sourceLabel: t("pages.savedPostsPage.sourceFeed"),
      sourceTo: appRoutes.feed,
      collectionLabel: t("pages.savedPostsPage.collectionPriority"),
      note: t("pages.savedPostsPage.noteFirst"),
    }),
    createSavedPostEntry("saved-post-2", posts[1], {
      savedAtLabel: t("pages.savedPostsPage.savedAtSecond"),
      sourceLabel: t("pages.savedPostsPage.sourceExplore"),
      sourceTo: `${appRoutes.explore}?view=posts`,
      collectionLabel: t("pages.savedPostsPage.collectionBrandProfile"),
      note: t("pages.savedPostsPage.noteSecond"),
    }),
  ].filter((item): item is MockSavedPostEntry => item !== null))

  return {
    savedPosts,
  }
}
