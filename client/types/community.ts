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

export type CommunityGroupTab = "mine" | "suggested" | "joined"

export interface CommunityGroupRecord {
  id: number
  name: string
  slug: string
  summary: string
  members: number
  privacy: CommunityPrivacy
  category: string
  banner: string
  accent: string
  segment: Exclude<CommunityGroupTab, "mine">
  activityLabel: string
  ownerLabel: string
  tags: string[]
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

export const communityGroupTabs: Array<{ label: string; value: CommunityGroupTab }> = [
  { label: "Nhóm của tôi", value: "mine" },
  { label: "Các nhóm được đề xuất", value: "suggested" },
  { label: "Các nhóm đã tham gia", value: "joined" },
]

export const communityGroupRouteMap: Record<CommunityGroupTab, string> = {
  mine: "/groups",
  suggested: "/suggested-groups",
  joined: "/joined_groups",
}

export const communityGroupDirectory: CommunityGroupRecord[] = [
  {
    id: 1,
    name: "Cộng đồng Xe điện Việt",
    slug: "cong-dong-xe-dien-viet",
    summary: "Review xe điện, trạm sạc, kinh nghiệm bảo dưỡng và chia sẻ hành trình dùng xe thực tế.",
    members: 12580,
    privacy: "public",
    category: "auto",
    banner: "linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#7dd3fc_100%)",
    accent: "#1d4ed8",
    segment: "suggested",
    activityLabel: "128 bài mới tuần này",
    ownerLabel: "Quản trị bởi Studio Mobility",
    tags: ["xe điện", "trạm sạc", "review"],
  },
  {
    id: 2,
    name: "Founder Circle Vietnam",
    slug: "founder-circle-vietnam",
    summary: "Không gian trao đổi bài toán vận hành, tăng trưởng và chiến lược cho founder, C-level và builder.",
    members: 4820,
    privacy: "private",
    category: "business",
    banner: "linear-gradient(135deg,#111827_0%,#4f46e5_48%,#c4b5fd_100%)",
    accent: "#4f46e5",
    segment: "suggested",
    activityLabel: "24 thảo luận đang mở",
    ownerLabel: "Được tuyển chọn bởi VNSEEA Business",
    tags: ["founder", "growth", "networking"],
  },
  {
    id: 3,
    name: "AI Product Builders",
    slug: "ai-product-builders",
    summary: "Tập trung vào AI product, automation, dataset, prompt engineering và demo sản phẩm mới mỗi tuần.",
    members: 9310,
    privacy: "public",
    category: "technology",
    banner: "linear-gradient(135deg,#020617_0%,#2563eb_42%,#22d3ee_100%)",
    accent: "#2563eb",
    segment: "joined",
    activityLabel: "6 sự kiện trực tuyến tháng này",
    ownerLabel: "Bạn đã tham gia từ tháng 2",
    tags: ["AI", "product", "automation"],
  },
  {
    id: 4,
    name: "Đi và Học",
    slug: "di-va-hoc",
    summary: "Nhóm chia sẻ workshop, khóa học, tài liệu ôn tập và lịch meetup dành cho người đi làm.",
    members: 3680,
    privacy: "private",
    category: "education",
    banner: "linear-gradient(135deg,#164e63_0%,#0f766e_48%,#a7f3d0_100%)",
    accent: "#0f766e",
    segment: "joined",
    activityLabel: "18 tài liệu mới được chia sẻ",
    ownerLabel: "Bạn đang theo dõi 4 chủ đề con",
    tags: ["workshop", "learning", "mentoring"],
  },
  {
    id: 5,
    name: "Weekend Escape Club",
    slug: "weekend-escape-club",
    summary: "Lên kế hoạch cho các chuyến đi ngắn ngày, chia sẻ lịch trình gọn, homestay và kinh nghiệm săn vé.",
    members: 2140,
    privacy: "public",
    category: "travel",
    banner: "linear-gradient(135deg,#0f172a_0%,#0891b2_50%,#fde68a_100%)",
    accent: "#0891b2",
    segment: "suggested",
    activityLabel: "9 hành trình mới cuối tuần này",
    ownerLabel: "Được đề xuất theo sở thích du lịch",
    tags: ["du lịch", "cuối tuần", "homestay"],
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

export function getCommunityOptionLabel(
  options: CommunityOption[],
  value: string,
  fallback = "Chưa chọn",
) {
  return options.find(option => option.value === value)?.label ?? fallback
}

export function getCommunityOptionDescription(
  options: CommunityOption[],
  value: string,
  fallback = "",
) {
  return options.find(option => option.value === value)?.description ?? fallback
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
