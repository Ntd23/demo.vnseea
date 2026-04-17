import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useMockSocialData } from "./useMockSocialData"
import {
  communityPageCategoryOptions,
  createCommunitySlug,
  formatCommunityFollowerCount,
  formatCommunityLikeCount,
  getCommunityOptionLabel,
  getCommunityPageBySlug,
} from "../../types/community"
import type { CommunityPageRecord } from "../../types/community"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function titleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function useCommunityPageDetail(
  slugSource: MaybeRefOrGetter<string>,
  querySource?: MaybeRefOrGetter<Record<string, unknown>>,
) {
  const { posts } = useMockSocialData()

  const slug = computed(() => String(toValue(slugSource) || "").trim())
  const query = computed(() =>
    querySource ? (toValue(querySource) as Record<string, unknown>) : {},
  )

  const page = computed<CommunityPageRecord | null>(() => {
    const basePage = getCommunityPageBySlug(slug.value)
    const queryName = readQueryValue(query.value.name).trim()
    const queryDescription = readQueryValue(query.value.description).trim()
    const queryCategory = readQueryValue(query.value.category).trim()

    const resolvedName =
      queryName
      || basePage?.name
      || (slug.value ? titleFromSlug(slug.value) : "")

    const resolvedSlug =
      slug.value
      || basePage?.slug
      || createCommunitySlug(resolvedName)
      || "fanpage-moi"

    if (!resolvedSlug && !resolvedName && !basePage) return null

    const resolvedCategory =
      queryCategory
      || basePage?.category
      || communityPageCategoryOptions[0]?.value
      || "local-business"

    return {
      id: basePage?.id ?? 0,
      name: resolvedName || "Trang mới",
      slug: resolvedSlug,
      summary:
        queryDescription
        || basePage?.summary
        || "Fanpage này đang ở chế độ xem trước. Bạn có thể dùng trang này để giới thiệu thương hiệu, dịch vụ hoặc những nội dung quan trọng với người theo dõi.",
      category: resolvedCategory,
      banner:
        basePage?.banner
        || "linear-gradient(135deg,#0f172a_0%,#0000ff_42%,#93c5fd_100%)",
      accent: basePage?.accent || "#0000ff",
      followers: basePage?.followers ?? 0,
      likes: basePage?.likes ?? 0,
      ownerLabel: basePage?.ownerLabel || "Bạn đang xem fanpage ở chế độ preview",
      responseLabel: basePage?.responseLabel || "Có thể thiết lập CTA và phản hồi ở bước tiếp theo",
      website: basePage?.website || `vnseea.vn/p/${resolvedSlug}`,
      locationLabel: basePage?.locationLabel || "Cập nhật sau khi hoàn thiện hồ sơ",
      foundedLabel: basePage?.foundedLabel || "Vừa khởi tạo",
      ctaLabel: basePage?.ctaLabel || "Theo dõi",
      canManage: basePage?.canManage ?? true,
      tags:
        basePage?.tags?.length
          ? basePage.tags
          : [resolvedCategory, "fanpage", "community"].filter(Boolean),
    }
  })

  const categoryLabel = computed(() =>
    page.value
      ? getCommunityOptionLabel(
          communityPageCategoryOptions,
          page.value.category,
          "Chưa phân loại",
        )
      : "Chưa phân loại",
  )

  const followerCountLabel = computed(() =>
    page.value
      ? formatCommunityFollowerCount(page.value.followers)
      : formatCommunityFollowerCount(0),
  )

  const likeCountLabel = computed(() =>
    page.value
      ? formatCommunityLikeCount(page.value.likes)
      : formatCommunityLikeCount(0),
  )

  const pagePosts = computed(() => {
    if (!page.value) return []

    return posts.slice(0, 3).map((post, index) => {
      const tag = page.value?.tags[index % Math.max(page.value.tags.length, 1)] || "fanpage"

      return {
        ...post,
        id: page.value.id * 100 + index + 1,
        author: page.value.name,
        role: index === 0 ? page.value.ownerLabel : `${categoryLabel.value} · Fanpage`,
        audience: page.value.name,
        time: index === 0 ? "12 phút trước" : index === 1 ? "1 giờ trước" : "Hôm qua lúc 20:30",
        text:
          index === 0
            ? `${page.value.name} vừa cập nhật một bài giới thiệu ngắn về chủ đề ${tag}. Đây là nơi fanpage chia sẻ bài viết mới, ưu đãi, case study và những cập nhật quan trọng với người theo dõi.`
            : index === 1
              ? `Một bài post mẫu khác của ${page.value.name}: tóm tắt ngắn về sản phẩm, dịch vụ hoặc nội dung nổi bật đang được đẩy lên tuần này để giữ nhịp tương tác đều hơn trên fanpage.`
              : `Fanpage ${page.value.name} cũng có thể dùng không gian này để ghim announcement, recap sự kiện hoặc câu chuyện hậu trường nhằm tạo cảm giác gần gũi hơn với người theo dõi.`,
        tags: Array.from(
          new Set([
            `#${tag}`,
            ...page.value.tags.map(item => `#${item}`),
            ...post.tags,
          ]),
        ).slice(0, 4),
      }
    })
  })

  return {
    slug,
    page,
    categoryLabel,
    followerCountLabel,
    likeCountLabel,
    pagePosts,
  }
}
