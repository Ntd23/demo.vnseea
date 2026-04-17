export type CommunityPrivacy = "public" | "private" | "secret"

export interface CommunityOption {
  label: string
  value: string
  description?: string
  icon?: string
}

export interface CommunityDraft {
  name: string
  slug: string
  description: string
  privacy: CommunityPrivacy
  category: string
}

export const communityUrlPrefix = "https://vnseea.vn/"

export const communityPrivacyOptions: CommunityOption[] = [
  {
    label: "Công cộng",
    value: "public",
    description: "Ai cũng có thể tìm thấy nhóm và xem nội dung cơ bản.",
    icon: "i-ph-globe-hemisphere-west-fill",
  },
  {
    label: "Riêng tư",
    value: "private",
    description: "Nhóm hiển thị công khai nhưng chỉ thành viên mới xem được bài đăng.",
    icon: "i-ph-lock-key-fill",
  },
  {
    label: "Bí mật",
    value: "secret",
    description: "Chỉ người được mời mới nhìn thấy và tham gia được nhóm.",
    icon: "i-ph-eye-slash-fill",
  },
]

export const communityCategoryOptions: CommunityOption[] = [
  {
    label: "Ô tô và Xe cộ",
    value: "auto",
    description: "Dành cho thảo luận xe mới, bảo dưỡng, review và phụ kiện.",
    icon: "i-ph-car-profile-fill",
  },
  {
    label: "Kinh doanh",
    value: "business",
    description: "Tập trung vào hợp tác, bán hàng, quản trị và phát triển doanh nghiệp.",
    icon: "i-ph-briefcase-fill",
  },
  {
    label: "Công nghệ",
    value: "technology",
    description: "Phù hợp cho cộng đồng yêu thích phần mềm, AI, thiết bị và lập trình.",
    icon: "i-ph-cpu-fill",
  },
  {
    label: "Giáo dục",
    value: "education",
    description: "Chia sẻ kiến thức, tài liệu học tập, workshop và mentoring.",
    icon: "i-ph-graduation-cap-fill",
  },
  {
    label: "Du lịch",
    value: "travel",
    description: "Dùng để tổ chức chuyến đi, chia sẻ lịch trình và kinh nghiệm thực tế.",
    icon: "i-ph-airplane-tilt-fill",
  },
  {
    label: "Mua bán",
    value: "marketplace",
    description: "Hợp với nhóm trao đổi sản phẩm, ưu đãi và nhu cầu mua chung.",
    icon: "i-ph-storefront-fill",
  },
]

export function getCommunityCompletionCount(
  draft: CommunityDraft,
  options?: { includePrivacy?: boolean },
) {
  const includePrivacy = options?.includePrivacy ?? true

  return [
    draft.name.trim(),
    draft.slug.trim(),
    draft.description.trim(),
    includePrivacy ? draft.privacy : "skip",
    draft.category,
  ].filter(Boolean).length
}

export function getCommunityCompletionTotal(includePrivacy = true) {
  return includePrivacy ? 5 : 4
}

export function createCommunitySlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
}
