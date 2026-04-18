import { useMockSocialData } from "./useMockSocialData"

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
  const { posts } = useMockSocialData()

  const memoryEntries = [
    createMemoryEntry("memory-1", posts[0], {
      happenedOnLabel: "Ngày 18 tháng 4 năm 2025",
      memoryLabel: "1 năm trước",
      yearOffset: 1,
      reflection: "Khoảnh khắc cả team vừa chốt lại hướng component hóa để tăng tốc các page phụ.",
    }),
    createMemoryEntry("memory-2", posts[1], {
      happenedOnLabel: "Ngày 18 tháng 4 năm 2024",
      memoryLabel: "2 năm trước",
      yearOffset: 2,
      reflection: "Bài đăng gợi lại giai đoạn định hình visual cho profile và business page đầu tiên.",
    }),
  ].filter((item): item is MockMemoryEntry => item !== null)

  return {
    memoryEntries,
  }
}
