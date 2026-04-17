export type FundingCategoryKey = "community" | "education" | "health" | "environment" | "startup"
export type FundingStatusKey = "all" | "active" | "ending" | "funded" | "mine"

export type FundingOption<T extends string = string> = {
  label: string
  value: T
  icon: string
}

export type FundingDonor = {
  id: number
  name: string
  initials: string
  gradient: string
  amount: number
  message: string
  donatedAt: string
}

export type MockFundingCampaign = {
  id: string
  title: string
  category: FundingCategoryKey
  categoryLabel: string
  owner: string
  ownerInitials: string
  ownerGradient: string
  location: string
  goalAmount: number
  raisedAmount: number
  backers: number
  daysLeft: number
  status: Exclude<FundingStatusKey, "all">
  cover: string
  coverFallback: string
  summary: string
  description: string
  impact: string[]
  rewards: string[]
  donors: FundingDonor[]
  isOwner: boolean
  isFeatured: boolean
}

export type DonationPayload = {
  campaignId: string
  amount: number
  paymentMethod: "wallet" | "card" | "bank"
  message: string
}

export type FundingCreatePayload = {
  title: string
  category: FundingCategoryKey
  goalAmount: number
  imageName: string
  description: string
}

export const useMockFundingData = () => {
  const fundingCategories: FundingOption<"all" | FundingCategoryKey>[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
    { label: "Cộng đồng", value: "community", icon: "i-ph-users-three-fill" },
    { label: "Giáo dục", value: "education", icon: "i-ph-graduation-cap-fill" },
    { label: "Sức khỏe", value: "health", icon: "i-ph-heartbeat-fill" },
    { label: "Môi trường", value: "environment", icon: "i-ph-leaf-fill" },
    { label: "Khởi nghiệp", value: "startup", icon: "i-ph-rocket-launch-fill" },
  ]

  const fundingStatuses: FundingOption<FundingStatusKey>[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-list-bullets-fill" },
    { label: "Đang gây quỹ", value: "active", icon: "i-ph-lightning-fill" },
    { label: "Sắp kết thúc", value: "ending", icon: "i-ph-hourglass-high-fill" },
    { label: "Đã đạt mục tiêu", value: "funded", icon: "i-ph-check-circle-fill" },
    { label: "Của tôi", value: "mine", icon: "i-ph-user-circle-check-fill" },
  ]

  const campaigns: MockFundingCampaign[] = [
    {
      id: "green-classroom-kit",
      title: "Bộ lớp học xanh cho trường vùng ven",
      category: "education",
      categoryLabel: "Giáo dục",
      owner: "Learning Guild",
      ownerInitials: "LG",
      ownerGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-success))",
      location: "Long An",
      goalAmount: 120000000,
      raisedAmount: 84500000,
      backers: 238,
      daysLeft: 18,
      status: "active",
      cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
      coverFallback: "linear-gradient(135deg,var(--color-primary-500),var(--color-success))",
      summary: "Trang bị bàn học tái chế, cây xanh và góc đọc sách cho ba lớp học vùng ven.",
      description: "Chiến dịch hướng đến việc tạo một không gian học tập sáng hơn, xanh hơn và có tài nguyên đọc cơ bản cho học sinh tiểu học vùng ven.",
      impact: [
        "120 học sinh có góc đọc sách mới.",
        "3 lớp học được bổ sung cây xanh và bàn học tái chế.",
        "Giáo viên có bộ tài liệu hoạt động ngoài giờ.",
      ],
      rewards: ["Thư cảm ơn từ lớp học", "Báo cáo hình ảnh sau triển khai", "Tên nhà tài trợ trong bảng tri ân"],
      donors: [
        { id: 1, name: "Thu Hà", initials: "TH", gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-success))", amount: 2500000, message: "Ủng hộ các em có thêm góc học tập đẹp.", donatedAt: "12 phút trước" },
        { id: 2, name: "Bảo Trần", initials: "BT", gradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))", amount: 1000000, message: "Chúc chiến dịch sớm đạt mục tiêu.", donatedAt: "1 giờ trước" },
      ],
      isOwner: true,
      isFeatured: true,
    },
    {
      id: "community-health-check",
      title: "Ngày khám sức khỏe cộng đồng",
      category: "health",
      categoryLabel: "Sức khỏe",
      owner: "Care Bridge",
      ownerInitials: "CB",
      ownerGradient: "linear-gradient(135deg,var(--color-error),var(--color-accent-500))",
      location: "TP. Hồ Chí Minh",
      goalAmount: 90000000,
      raisedAmount: 64000000,
      backers: 176,
      daysLeft: 9,
      status: "ending",
      cover: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80",
      coverFallback: "linear-gradient(135deg,var(--color-error),var(--color-accent-500))",
      summary: "Tổ chức một ngày khám tổng quát và tư vấn sức khỏe miễn phí cho người lao động.",
      description: "Nguồn quỹ dùng để thuê thiết bị, chuẩn bị thuốc cơ bản và mời đội ngũ y tế tình nguyện.",
      impact: ["300 lượt khám miễn phí.", "100 phần thuốc cơ bản.", "Tài liệu tư vấn sức khỏe sau chương trình."],
      rewards: ["Cập nhật danh sách hạng mục chi", "Ảnh chương trình", "Thư cảm ơn của ban tổ chức"],
      donors: [
        { id: 3, name: "Quỳnh Lan", initials: "QL", gradient: "linear-gradient(135deg,var(--color-error),var(--color-primary-500))", amount: 3000000, message: "Mong chương trình đến được nhiều người.", donatedAt: "3 giờ trước" },
      ],
      isOwner: false,
      isFeatured: true,
    },
    {
      id: "river-cleanup-weekend",
      title: "Cuối tuần dọn rác ven sông",
      category: "environment",
      categoryLabel: "Môi trường",
      owner: "Green Neighborhood",
      ownerInitials: "GN",
      ownerGradient: "linear-gradient(135deg,var(--color-success),var(--color-info))",
      location: "Đà Nẵng",
      goalAmount: 45000000,
      raisedAmount: 47500000,
      backers: 312,
      daysLeft: 0,
      status: "funded",
      cover: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1400&q=80",
      coverFallback: "linear-gradient(135deg,var(--color-success),var(--color-info))",
      summary: "Chuẩn bị dụng cụ, bao phân loại và xe thu gom cho hoạt động làm sạch ven sông.",
      description: "Chiến dịch đã đạt mục tiêu và bước vào giai đoạn chuẩn bị triển khai cùng đội tình nguyện địa phương.",
      impact: ["500kg rác được thu gom dự kiến.", "50 tình nguyện viên tham gia.", "Bộ ảnh báo cáo sau hoạt động."],
      rewards: ["Sticker chiến dịch", "Báo cáo minh bạch chi phí", "Lời cảm ơn trên trang cộng đồng"],
      donors: [
        { id: 4, name: "Hải Nam", initials: "HN", gradient: "linear-gradient(135deg,var(--color-success),var(--color-primary-500))", amount: 500000, message: "Cảm ơn đội tình nguyện.", donatedAt: "Hôm qua" },
      ],
      isOwner: false,
      isFeatured: false,
    },
    {
      id: "local-founder-grant",
      title: "Quỹ nhỏ cho founder địa phương",
      category: "startup",
      categoryLabel: "Khởi nghiệp",
      owner: "Startup Circle",
      ownerInitials: "SC",
      ownerGradient: "linear-gradient(135deg,var(--color-primary-700),var(--color-accent-500))",
      location: "Hà Nội",
      goalAmount: 180000000,
      raisedAmount: 52000000,
      backers: 92,
      daysLeft: 32,
      status: "active",
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
      coverFallback: "linear-gradient(135deg,var(--color-primary-700),var(--color-accent-500))",
      summary: "Hỗ trợ micro-grant cho các nhóm founder mới thử nghiệm sản phẩm đầu tiên.",
      description: "Quỹ dùng để trao các khoản hỗ trợ nhỏ, mentor và chi phí thử nghiệm thị trường cho nhóm founder giai đoạn đầu.",
      impact: ["6 nhóm founder nhận micro-grant.", "3 buổi mentor nhóm.", "Demo day cuối chiến dịch."],
      rewards: ["Vé tham dự demo day", "Báo cáo tiến độ dự án", "Tên nhà tài trợ trên landing chiến dịch"],
      donors: [
        { id: 5, name: "Minh Anh", initials: "MA", gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))", amount: 2000000, message: "Ủng hộ founder mới.", donatedAt: "2 ngày trước" },
      ],
      isOwner: true,
      isFeatured: false,
    },
  ]

  return {
    campaigns,
    fundingCategories,
    fundingStatuses,
    findCampaignById: (id: string) => campaigns.find(campaign => campaign.id === id),
  }
}

export const formatFundingCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
