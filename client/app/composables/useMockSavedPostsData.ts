import { useMockSocialData } from "./useMockSocialData"

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
  const { posts } = useMockSocialData()

  const savedPosts = [
    createSavedPostEntry("saved-post-1", posts[0], {
      savedAtLabel: "Đã lưu 14 phút trước",
      sourceLabel: "Lưu từ bảng tin",
      sourceTo: "/home",
      collectionLabel: "Ưu tiên tuần này",
      note: "Giữ lại để tham chiếu khi hoàn thiện luồng page phụ và các shared component cho social feed.",
    }),
    createSavedPostEntry("saved-post-2", posts[1], {
      savedAtLabel: "Đã lưu hôm nay",
      sourceLabel: "Lưu từ khám phá",
      sourceTo: "/explore?view=posts",
      collectionLabel: "Brand & Profile",
      note: "Dùng làm cảm hứng cho các block hero và nhịp nội dung mang thiên hướng thương hiệu cộng đồng.",
    }),
  ].filter((item): item is MockSavedPostEntry => item !== null)

  return {
    savedPosts,
  }
}
