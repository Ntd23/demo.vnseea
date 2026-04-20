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

export interface CommunityPageRecord {
  id: number
  name: string
  slug: string
  summary: string
  category: string
  banner: string
  accent: string
  followers: number
  likes: number
  ownerLabel: string
  responseLabel: string
  website?: string
  locationLabel?: string
  foundedLabel?: string
  ctaLabel?: string
  canManage?: boolean
  directoryTabs?: Exclude<CommunityPageTab, "mine">[]
  tags: string[]
}

export type CommunityGroupTab = "mine" | "suggested" | "joined"
export type CommunityPageTab = "mine" | "suggested" | "favorite"

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
  website?: string
  locationLabel?: string
  foundedLabel?: string
  canManage?: boolean
  joinLabel?: string
  inviteLabel?: string
  guidelines?: string[]
}

export interface CommunityGroupMember {
  id: number
  name: string
  initials: string
  role: string
  meta: string
  online?: boolean
}

export interface CommunityGroupSettingsDraft {
  name: string
  slug: string
  summary: string
  website: string
  locationLabel: string
  privacy: CommunityPrivacy
  category: string
  tags: string
  guidelines: string
  joinApproval: boolean
  postApproval: boolean
  allowMemberInvites: boolean
  showMemberDirectory: boolean
  welcomePostEnabled: boolean
}

export interface CommunityPageSettingsDraft {
  name: string
  slug: string
  summary: string
  website: string
  locationLabel: string
  category: string
  ctaLabel: string
  responseLabel: string
  ownerLabel: string
  tags: string
  allowMessages: boolean
  showFollowerCount: boolean
  showLikeCount: boolean
  showWebsite: boolean
  recommendRelatedPages: boolean
}

export const communityUrlPrefix = "https://vnseea.vn/"
export const communityPageUrlPrefix = "https://vnseea.vn/p/"

export const communityPrivacyOptions: CommunityOption[] = [
  {
    label: "community.privacy.public.label",
    value: "public",
    description: "community.privacy.public.description",
    icon: "i-ph-globe-hemisphere-west-fill",
  },
  {
    label: "community.privacy.private.label",
    value: "private",
    description: "community.privacy.private.description",
    icon: "i-ph-lock-key-fill",
  },
  {
    label: "community.privacy.secret.label",
    value: "secret",
    description: "community.privacy.secret.description",
    icon: "i-ph-eye-slash-fill",
  },
]

export const communityCategoryOptions: CommunityOption[] = [
  {
    label: "community.categories.auto.label",
    value: "auto",
    description: "community.categories.auto.description",
    icon: "i-ph-car-profile-fill",
  },
  {
    label: "community.categories.business.label",
    value: "business",
    description: "community.categories.business.description",
    icon: "i-ph-briefcase-fill",
  },
  {
    label: "community.categories.technology.label",
    value: "technology",
    description: "community.categories.technology.description",
    icon: "i-ph-cpu-fill",
  },
  {
    label: "community.categories.education.label",
    value: "education",
    description: "community.categories.education.description",
    icon: "i-ph-graduation-cap-fill",
  },
  {
    label: "community.categories.travel.label",
    value: "travel",
    description: "community.categories.travel.description",
    icon: "i-ph-airplane-tilt-fill",
  },
  {
    label: "community.categories.marketplace.label",
    value: "marketplace",
    description: "community.categories.marketplace.description",
    icon: "i-ph-storefront-fill",
  },
]

export const communityPageCategoryOptions: CommunityOption[] = [
  {
    label: "community.categories.local-business.label",
    value: "local-business",
    description: "community.categories.local-business.description",
    icon: "i-ph-storefront-fill",
  },
  {
    label: "community.categories.creator.label",
    value: "creator",
    description: "community.categories.creator.description",
    icon: "i-ph-microphone-stage-fill",
  },
  {
    label: "community.categories.brand.label",
    value: "brand",
    description: "community.categories.brand.description",
    icon: "i-ph-megaphone-simple-fill",
  },
  {
    label: "community.categories.education.label",
    value: "education",
    description: "community.categories.education.description",
    icon: "i-ph-graduation-cap-fill",
  },
  {
    label: "community.categories.organization.label",
    value: "organization",
    description: "community.categories.organization.description",
    icon: "i-ph-buildings-fill",
  },
  {
    label: "community.categories.service.label",
    value: "service",
    description: "community.categories.service.description",
    icon: "i-ph-briefcase-fill",
  },
]

export const communityPageCtaOptions: CommunityOption[] = [
  {
    label: "community.cta.message.label",
    value: "message",
    description: "community.cta.message.description",
    icon: "i-ph-chat-circle-dots-fill",
  },
  {
    label: "community.cta.follow.label",
    value: "follow",
    description: "community.cta.follow.description",
    icon: "i-ph-bell-simple-ringing-fill",
  },
  {
    label: "community.cta.catalog.label",
    value: "catalog",
    description: "community.cta.catalog.description",
    icon: "i-ph-storefront-fill",
  },
  {
    label: "community.cta.booking.label",
    value: "booking",
    description: "community.cta.booking.description",
    icon: "i-ph-calendar-check-fill",
  },
  {
    label: "community.cta.call.label",
    value: "call",
    description: "community.cta.call.description",
    icon: "i-ph-phone-call-fill",
  },
]

export const communityGroupTabs: Array<{ label: string; value: CommunityGroupTab }> = [
  { label: "community.tabs.groups.mine", value: "mine" },
  { label: "community.tabs.groups.suggested", value: "suggested" },
  { label: "community.tabs.groups.joined", value: "joined" },
]

export const communityPageTabs: Array<{ label: string; value: CommunityPageTab }> = [
  { label: "community.tabs.pages.mine", value: "mine" },
  { label: "community.tabs.pages.suggested", value: "suggested" },
  { label: "community.tabs.pages.favorite", value: "favorite" },
]

export const communityPageRouteMap: Record<CommunityPageTab, string> = {
  mine: "/pages",
  suggested: "/suggested-pages",
  favorite: "/liked-pages",
}

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
    website: "vnseea.vn/g/cong-dong-xe-dien-viet",
    locationLabel: "Hoạt động toàn quốc",
    foundedLabel: "Thành lập từ tháng 3/2024",
    canManage: true,
    joinLabel: "Đã tham gia",
    inviteLabel: "Mời thành viên",
    guidelines: [
      "Ưu tiên review thực tế, có hình ảnh hoặc số liệu khi chia sẻ trải nghiệm.",
      "Không đăng bán hàng trực tiếp ngoài chủ đề xe điện và phụ kiện liên quan.",
      "Giữ thảo luận tôn trọng, tập trung vào giải pháp và kiến thức hữu ích.",
    ],
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
    website: "vnseea.vn/g/founder-circle-vietnam",
    locationLabel: "Hà Nội · TP.HCM · Online",
    foundedLabel: "Thành lập từ tháng 8/2023",
    canManage: false,
    joinLabel: "Gửi yêu cầu tham gia",
    inviteLabel: "Mời cộng sự",
    guidelines: [
      "Chia sẻ ngắn gọn, đi thẳng vào bài toán và bối cảnh cần góp ý.",
      "Không đăng bài tuyển dụng hoặc chào bán dịch vụ tràn lan trong feed chính.",
      "Tôn trọng nguyên tắc riêng tư với các số liệu nội bộ được chia sẻ trong nhóm.",
    ],
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
    website: "vnseea.vn/g/ai-product-builders",
    locationLabel: "Remote-first community",
    foundedLabel: "Thành lập từ tháng 1/2024",
    canManage: false,
    joinLabel: "Đã tham gia",
    inviteLabel: "Mời thành viên",
    guidelines: [
      "Ưu tiên demo có hình, video hoặc link prototype để mọi người góp ý nhanh.",
      "Gắn tag rõ mục tiêu: nghiên cứu, case study, prompt, automation hoặc launch.",
      "Tránh chia sẻ dữ liệu nhạy cảm của khách hàng và thông tin bí mật công ty.",
    ],
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
    website: "vnseea.vn/g/di-va-hoc",
    locationLabel: "Cộng đồng học tập Việt Nam",
    foundedLabel: "Thành lập từ tháng 11/2023",
    canManage: false,
    joinLabel: "Đã tham gia",
    inviteLabel: "Mời bạn bè",
    guidelines: [
      "Tài liệu đăng lên cần ghi nguồn để người sau có thể kiểm chứng và học tiếp.",
      "Khuyến khích chia sẻ note ngắn, tóm tắt key insight sau mỗi workshop.",
      "Không spam link khóa học hoặc affiliate không liên quan đến nội dung học tập.",
    ],
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
    website: "vnseea.vn/g/weekend-escape-club",
    locationLabel: "Điểm đến nội địa & Đông Nam Á",
    foundedLabel: "Thành lập từ tháng 6/2024",
    canManage: false,
    joinLabel: "Tham gia nhóm",
    inviteLabel: "Mời bạn đồng hành",
    guidelines: [
      "Khi review địa điểm nên ghi chi phí, thời gian đi và lưu ý thực tế.",
      "Tôn trọng môi trường địa phương, tránh cổ vũ hoạt động ảnh hưởng thiên nhiên.",
      "Không đăng thông tin săn tour kém uy tín hoặc không rõ nguồn gốc.",
    ],
  },
]

export const communityPageDirectory: CommunityPageRecord[] = [
  {
    id: 1,
    name: "Mộc Mây Studio",
    slug: "moc-may-studio",
    summary: "Fanpage giới thiệu nội thất gỗ, concept trang trí nhà ở và các dự án thi công theo phong cách tối giản hiện đại.",
    category: "local-business",
    banner: "linear-gradient(135deg,#1f2937_0%,#92400e_42%,#fde68a_100%)",
    accent: "#92400e",
    followers: 18240,
    likes: 21480,
    ownerLabel: "Trang doanh nghiệp được xác minh",
    responseLabel: "Thường phản hồi trong 30 phút",
    website: "vnseea.vn/p/moc-may-studio",
    locationLabel: "Đà Nẵng · Giao hàng toàn quốc",
    foundedLabel: "Hoạt động từ tháng 2/2022",
    ctaLabel: "Nhắn tin",
    canManage: true,
    directoryTabs: ["suggested", "favorite"],
    tags: ["noi-that", "thi-cong", "go-tu-nhien"],
  },
  {
    id: 2,
    name: "VNSEEA Mobility Lab",
    slug: "vnseea-mobility-lab",
    summary: "Trang cập nhật nghiên cứu, sự kiện và insight về giao thông điện hóa, trạm sạc và hạ tầng di chuyển xanh.",
    category: "brand",
    banner: "linear-gradient(135deg,#0f172a_0%,#1d4ed8_46%,#67e8f9_100%)",
    accent: "#1d4ed8",
    followers: 9640,
    likes: 12110,
    ownerLabel: "Fanpage thương hiệu nội dung",
    responseLabel: "Phản hồi trong ngày làm việc",
    website: "vnseea.vn/p/vnseea-mobility-lab",
    locationLabel: "Hà Nội · TP.HCM · Online",
    foundedLabel: "Khởi chạy từ tháng 5/2024",
    ctaLabel: "Theo dõi",
    canManage: true,
    directoryTabs: ["suggested"],
    tags: ["mobility", "xe-dien", "research"],
  },
  {
    id: 3,
    name: "Học Nhanh Mỗi Ngày",
    slug: "hoc-nhanh-moi-ngay",
    summary: "Fanpage chia sẻ note học tập, lịch workshop và tài liệu ngắn dành cho người đi làm muốn cập nhật kỹ năng liên tục.",
    category: "education",
    banner: "linear-gradient(135deg,#164e63_0%,#0f766e_48%,#bef264_100%)",
    accent: "#0f766e",
    followers: 27890,
    likes: 30420,
    ownerLabel: "Trang giáo dục & đào tạo",
    responseLabel: "Có đội ngũ admin hỗ trợ đều đặn",
    website: "vnseea.vn/p/hoc-nhanh-moi-ngay",
    locationLabel: "Online-first",
    foundedLabel: "Khởi tạo từ tháng 9/2021",
    ctaLabel: "Xem khóa học",
    canManage: false,
    directoryTabs: ["favorite"],
    tags: ["learning", "workshop", "career"],
  },
]

export const communityGroupMembers: Record<string, CommunityGroupMember[]> = {
  "cong-dong-xe-dien-viet": [
    { id: 1, name: "Hoàng Minh", initials: "HM", role: "Quản trị viên", meta: "Điều hành cộng đồng", online: true },
    { id: 2, name: "Lan Phương", initials: "LP", role: "Moderator", meta: "Phụ trách hỏi đáp sạc xe", online: true },
    { id: 3, name: "Tuấn Vũ", initials: "TV", role: "Thành viên tích cực", meta: "24 bài viết tháng này" },
    { id: 4, name: "Anh Khoa", initials: "AK", role: "Reviewer", meta: "Chuyên thử xe và phụ kiện", online: true },
    { id: 5, name: "Bích Ngân", initials: "BN", role: "Thành viên", meta: "Tham gia từ tháng 5/2024" },
  ],
  "founder-circle-vietnam": [
    { id: 6, name: "Khánh Vũ", initials: "KV", role: "Host", meta: "Founder SaaS B2B", online: true },
    { id: 7, name: "Thanh Hà", initials: "TH", role: "Moderator", meta: "Growth & community lead" },
    { id: 8, name: "Minh Anh", initials: "MA", role: "Thành viên", meta: "Điều hành startup giáo dục", online: true },
    { id: 9, name: "Phú Lê", initials: "PL", role: "Thành viên", meta: "Builder hệ thống nội bộ" },
  ],
  "ai-product-builders": [
    { id: 10, name: "Bảo Trân", initials: "BT", role: "Host", meta: "AI product consultant", online: true },
    { id: 11, name: "Nam Phạm", initials: "NP", role: "Moderator", meta: "Chuyên automation workflow" },
    { id: 12, name: "Linh Đào", initials: "LĐ", role: "Thành viên", meta: "Thiết kế trải nghiệm AI", online: true },
    { id: 13, name: "Quỳnh Lê", initials: "QL", role: "Thành viên", meta: "Làm prototyping và prompt" },
  ],
  "di-va-hoc": [
    { id: 14, name: "Thu Hà", initials: "TH", role: "Host", meta: "Điều phối workshop", online: true },
    { id: 15, name: "Ngọc Lễ", initials: "NL", role: "Mentor", meta: "Hướng dẫn lộ trình học" },
    { id: 16, name: "Huyền Trang", initials: "HT", role: "Thành viên", meta: "Chia sẻ tài liệu kỹ năng", online: true },
    { id: 17, name: "Mai Anh", initials: "MA", role: "Thành viên", meta: "Tham gia từ tháng 1/2024" },
  ],
  "weekend-escape-club": [
    { id: 18, name: "Xu Nguyễn", initials: "XN", role: "Host", meta: "Lên lịch trình cuối tuần", online: true },
    { id: 19, name: "An Nhiên", initials: "AN", role: "Thành viên tích cực", meta: "Review homestay & quán ăn" },
    { id: 20, name: "Gia Bảo", initials: "GB", role: "Thành viên", meta: "Chia sẻ ảnh và tips di chuyển", online: true },
    { id: 21, name: "Mỹ Hậu", initials: "MH", role: "Thành viên", meta: "Đi nhiều tour trekking" },
  ],
}

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

export function getCommunityInitials(name: string, limit = 2) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, limit)
    .map(part => part[0])
    .join("")
    .toUpperCase()
}

export function formatCommunityMemberCount(count: number) {
  return `${count.toLocaleString("vi-VN")} thành viên`
}

export function formatCommunityFollowerCount(count: number) {
  return `${count.toLocaleString("vi-VN")} người theo dõi`
}

export function formatCommunityLikeCount(count: number) {
  return `${count.toLocaleString("vi-VN")} lượt thích`
}

export function getCommunityGroupPath(slug: string) {
  return `/g/${slug}`
}

export function getCommunityGroupSettingsPath(slug: string) {
  return `/group-setting/${slug}`
}

export function getCommunityPagePath(slug: string) {
  return `/p/${slug}`
}

export function getCommunityPageSettingsPath(slug: string) {
  return `/page-setting/${slug}`
}

export function getCommunityGroupBySlug(slug: string) {
  return communityGroupDirectory.find(group => group.slug === slug)
}

export function getCommunityPageBySlug(slug: string) {
  return communityPageDirectory.find(page => page.slug === slug)
}

export function appendCommunityQuery(path: string, query: Record<string, unknown>) {
  const search = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => search.append(key, String(item)))
      return
    }

    if (value !== undefined && value !== null && String(value).trim()) {
      search.append(key, String(value))
    }
  })

  const queryString = search.toString()

  return `${path}${queryString ? `?${queryString}` : ""}`
}

export function getCommunityGroupMembers(slug: string) {
  return communityGroupMembers[slug] ?? []
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

export function createCommunityGroupSettingsDraft(
  group?: CommunityGroupRecord,
): CommunityGroupSettingsDraft {
  return {
    name: group?.name ?? "",
    slug: group?.slug ?? "",
    summary: group?.summary ?? "",
    website: group?.website ?? "",
    locationLabel: group?.locationLabel ?? "",
    privacy: group?.privacy ?? "public",
    category: group?.category ?? communityCategoryOptions[0]?.value ?? "auto",
    tags: group?.tags.join(", ") ?? "",
    guidelines: group?.guidelines?.join("\n") ?? "",
    joinApproval: group?.privacy !== "public",
    postApproval: group?.privacy === "private" || group?.privacy === "secret",
    allowMemberInvites: true,
    showMemberDirectory: true,
    welcomePostEnabled: true,
  }
}

export function createCommunityPageSettingsDraft(
  page?: CommunityPageRecord,
): CommunityPageSettingsDraft {
  return {
    name: page?.name ?? "",
    slug: page?.slug ?? "",
    summary: page?.summary ?? "",
    website: page?.website ?? "",
    locationLabel: page?.locationLabel ?? "",
    category: page?.category ?? communityPageCategoryOptions[0]?.value ?? "local-business",
    ctaLabel: page?.ctaLabel ?? "Theo dõi",
    responseLabel: page?.responseLabel ?? "Phản hồi trong ngày làm việc",
    ownerLabel: page?.ownerLabel ?? "Fanpage công khai",
    tags: page?.tags.join(", ") ?? "",
    allowMessages: true,
    showFollowerCount: true,
    showLikeCount: true,
    showWebsite: true,
    recommendRelatedPages: true,
  }
}

export function createCommunityPageDraft(page?: CommunityPageRecord): CommunityDraft {
  return {
    name: page?.name ?? "",
    slug: page?.slug ?? "",
    description: page?.summary ?? "",
    privacy: "public",
    category: page?.category ?? communityPageCategoryOptions[0]?.value ?? "local-business",
  }
}
