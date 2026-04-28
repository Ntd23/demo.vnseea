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

  const savedPosts = computed<MockSavedPostEntry[]>(() => {
    const firstPost = posts[0]
      ? {
          ...posts[0],
          author: "Jane Doe",
          role: "Senior UX Designer",
          time: "2h ago",
          text: "Just published a comprehensive guide on transitioning from Vue 2 to Vue 3 using Nuxt. It covers all the major pain points and architectural decisions we had to make. Let me know your thoughts!",
          tags: ["Migration", "Design system", "Nuxt"],
          stats: { likes: 124, comments: 23, shares: 0 },
          media: "single" as const,
        }
      : undefined

    const secondPost = posts[1]
      ? {
          ...posts[1],
          author: "John Smith",
          role: "Product Manager",
          time: "5h ago",
          text: "Exploring the new design system updates. The subtle tonal layering really adds depth without clutter. Excellent work by the design team to keep things scalable and accessible.",
          tags: ["Design system", "UIUX"],
          stats: { likes: 89, comments: 12, shares: 0 },
          media: undefined,
        }
      : undefined

    return [
      createSavedPostEntry("saved-post-1", firstPost, {
        savedAtLabel: t("pages.savedPostsPage.savedAtFirst"),
        sourceLabel: t("pages.savedPostsPage.sourceFeed"),
        sourceTo: "/home",
        collectionLabel: t("pages.savedPostsPage.collectionPriority"),
        note: t("pages.savedPostsPage.noteFirst"),
      }),
      createSavedPostEntry("saved-post-2", secondPost, {
        savedAtLabel: t("pages.savedPostsPage.savedAtSecond"),
        sourceLabel: t("pages.savedPostsPage.sourceExplore"),
        sourceTo: "/explore?view=posts",
        collectionLabel: t("pages.savedPostsPage.collectionBrandProfile"),
        note: t("pages.savedPostsPage.noteSecond"),
      }),
    ].filter((item): item is MockSavedPostEntry => item !== null)
  })

  return {
    savedPosts,
  }
}
