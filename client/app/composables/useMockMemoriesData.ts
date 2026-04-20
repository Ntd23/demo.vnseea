import { useMockSocialData } from "./useMockSocialData"
import { computed } from "vue"

type SocialPost = ReturnType<typeof useMockSocialData>["posts"][number]

export interface MockMemoryEntry {
  id: string
  post: SocialPost
  happenedOnLabel: string
  memoryLabel: string
  yearOffset: number
  reflection: string
}

function createMemoryEntry(
  id: string,
  post: SocialPost | undefined,
  metadata: Omit<MockMemoryEntry, "id" | "post">,
) {
  if (!post) return null

  return {
    id,
    post,
    ...metadata,
  }
}

export function useMockMemoriesData() {
  const { t } = useI18n()
  const { posts } = useMockSocialData()

  const memoryEntries = computed(() => [
    createMemoryEntry("memory-1", posts[0], {
      happenedOnLabel: t("pages.memoriesPage.memoryOneDate"),
      memoryLabel: t("pages.memoriesPage.memoryOneLabel"),
      yearOffset: 1,
      reflection: t("pages.memoriesPage.memoryOneReflection"),
    }),
    createMemoryEntry("memory-2", posts[1], {
      happenedOnLabel: t("pages.memoriesPage.memoryTwoDate"),
      memoryLabel: t("pages.memoriesPage.memoryTwoLabel"),
      yearOffset: 2,
      reflection: t("pages.memoriesPage.memoryTwoReflection"),
    }),
  ].filter((item): item is MockMemoryEntry => item !== null))

  return {
    memoryEntries,
  }
}
