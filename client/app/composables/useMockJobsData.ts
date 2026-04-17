export type JobCategoryKey = "engineering" | "design" | "marketing" | "sales" | "operations" | "finance"
export type JobLocationKey = "all" | "ho-chi-minh" | "ha-noi" | "da-nang" | "remote"
export type JobTypeKey = "all" | "full-time" | "part-time" | "contract" | "internship"

export type JobOption<T extends string = string> = {
  label: string
  value: T
  icon: string
}

export type MockJob = {
  id: string
  title: string
  company: string
  companyInitials: string
  companyGradient: string
  category: JobCategoryKey
  categoryLabel: string
  locationKey: Exclude<JobLocationKey, "all">
  location: string
  type: Exclude<JobTypeKey, "all">
  typeLabel: string
  salary: string
  postedAt: string
  deadline: string
  experience: string
  applicants: number
  views: number
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  isRemote: boolean
  isFeatured: boolean
  isSaved: boolean
  isOwner: boolean
}

export type JobApplicationPayload = {
  jobId: string
  name: string
  email: string
  phone: string
  message: string
  cvName: string
}

export type JobPostPayload = {
  title: string
  company: string
  category: JobCategoryKey
  locationKey: Exclude<JobLocationKey, "all">
  location: string
  type: Exclude<JobTypeKey, "all">
  salary: string
  description: string
}

export const useMockJobsData = () => {
  const jobCategories: JobOption<"all" | JobCategoryKey>[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
    { label: "Kỹ thuật", value: "engineering", icon: "i-ph-code-fill" },
    { label: "Thiết kế", value: "design", icon: "i-ph-paint-brush-fill" },
    { label: "Marketing", value: "marketing", icon: "i-ph-megaphone-fill" },
    { label: "Kinh doanh", value: "sales", icon: "i-ph-handshake-fill" },
    { label: "Vận hành", value: "operations", icon: "i-ph-gear-six-fill" },
    { label: "Tài chính", value: "finance", icon: "i-ph-chart-line-up-fill" },
  ]

  const jobLocations: JobOption<JobLocationKey>[] = [
    { label: "Mọi địa điểm", value: "all", icon: "i-ph-map-pin-fill" },
    { label: "TP. Hồ Chí Minh", value: "ho-chi-minh", icon: "i-ph-buildings-fill" },
    { label: "Hà Nội", value: "ha-noi", icon: "i-ph-bank-fill" },
    { label: "Đà Nẵng", value: "da-nang", icon: "i-ph-waves-fill" },
    { label: "Từ xa", value: "remote", icon: "i-ph-globe-hemisphere-east-fill" },
  ]

  const jobTypes: JobOption<JobTypeKey>[] = [
    { label: "Tất cả loại hình", value: "all", icon: "i-ph-briefcase-fill" },
    { label: "Toàn thời gian", value: "full-time", icon: "i-ph-clock-fill" },
    { label: "Bán thời gian", value: "part-time", icon: "i-ph-clock-afternoon-fill" },
    { label: "Hợp đồng", value: "contract", icon: "i-ph-file-text-fill" },
    { label: "Thực tập", value: "internship", icon: "i-ph-student-fill" },
  ]

  const jobs: MockJob[] = [
    {
      id: "frontend-engineer-vnseea-labs",
      title: "Frontend Engineer",
      company: "VNSEEA Labs",
      companyInitials: "VL",
      companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      category: "engineering",
      categoryLabel: "Kỹ thuật",
      locationKey: "ho-chi-minh",
      location: "Quận 1, TP. Hồ Chí Minh",
      type: "full-time",
      typeLabel: "Toàn thời gian",
      salary: "28 - 45 triệu",
      postedAt: "12 phút trước",
      deadline: "30/05/2026",
      experience: "2+ năm",
      applicants: 38,
      views: 1280,
      description: "Xây dựng giao diện mạng xã hội, tối ưu hiệu năng Nuxt/Vue và phối hợp cùng design system để triển khai các luồng sản phẩm mới.",
      requirements: [
        "Thành thạo Vue 3, Nuxt, TypeScript và component architecture.",
        "Có kinh nghiệm tối ưu responsive UI, accessibility và performance.",
        "Biết làm việc với API, state management và thiết kế reusable component.",
      ],
      benefits: [
        "Hybrid 3 ngày mỗi tuần.",
        "Ngân sách học tập và thiết bị làm việc.",
        "Review lương theo chu kỳ sản phẩm.",
      ],
      skills: ["Vue", "Nuxt", "TypeScript", "Tailwind"],
      isRemote: false,
      isFeatured: true,
      isSaved: true,
      isOwner: false,
    },
    {
      id: "product-designer-community",
      title: "Product Designer",
      company: "Community Studio",
      companyInitials: "CS",
      companyGradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      category: "design",
      categoryLabel: "Thiết kế",
      locationKey: "remote",
      location: "Remote trong Việt Nam",
      type: "contract",
      typeLabel: "Hợp đồng",
      salary: "1.200 - 1.800 USD",
      postedAt: "1 giờ trước",
      deadline: "18/05/2026",
      experience: "3+ năm",
      applicants: 21,
      views: 940,
      description: "Thiết kế trải nghiệm cho các tính năng cộng đồng, marketplace và nội dung; chuyển yêu cầu sản phẩm thành prototype rõ ràng.",
      requirements: [
        "Có portfolio sản phẩm web/app đã triển khai thực tế.",
        "Thành thạo Figma, design system và handoff cho frontend.",
        "Ưu tiên kinh nghiệm làm social product hoặc community tool.",
      ],
      benefits: [
        "Làm từ xa linh hoạt.",
        "Tham gia định hướng UI system từ đầu.",
        "Thanh toán theo milestone rõ ràng.",
      ],
      skills: ["Figma", "Prototype", "Design System"],
      isRemote: true,
      isFeatured: true,
      isSaved: false,
      isOwner: false,
    },
    {
      id: "growth-marketing-specialist",
      title: "Growth Marketing Specialist",
      company: "Hanoi Startup Circle",
      companyInitials: "HS",
      companyGradient: "linear-gradient(135deg,var(--color-success),var(--color-accent-500))",
      category: "marketing",
      categoryLabel: "Marketing",
      locationKey: "ha-noi",
      location: "Cầu Giấy, Hà Nội",
      type: "full-time",
      typeLabel: "Toàn thời gian",
      salary: "18 - 30 triệu",
      postedAt: "3 giờ trước",
      deadline: "25/05/2026",
      experience: "2+ năm",
      applicants: 44,
      views: 1510,
      description: "Vận hành chiến dịch tăng trưởng, xây funnel nội dung và phối hợp cùng cộng đồng founder để mở rộng tệp người dùng chất lượng.",
      requirements: [
        "Có kinh nghiệm chạy campaign đa kênh.",
        "Đọc số liệu tốt, biết phân tích funnel và retention.",
        "Viết copy rõ, đo được hiệu quả.",
      ],
      benefits: [
        "Thưởng theo KPI tăng trưởng.",
        "Mentor trực tiếp từ founder.",
        "Không gian làm việc trung tâm.",
      ],
      skills: ["Growth", "Content", "Analytics"],
      isRemote: false,
      isFeatured: false,
      isSaved: false,
      isOwner: false,
    },
    {
      id: "business-development-executive",
      title: "Business Development Executive",
      company: "Market Bridge",
      companyInitials: "MB",
      companyGradient: "linear-gradient(135deg,var(--color-primary-700),var(--color-success))",
      category: "sales",
      categoryLabel: "Kinh doanh",
      locationKey: "da-nang",
      location: "Hải Châu, Đà Nẵng",
      type: "full-time",
      typeLabel: "Toàn thời gian",
      salary: "15 - 25 triệu + hoa hồng",
      postedAt: "Hôm qua",
      deadline: "12/06/2026",
      experience: "1+ năm",
      applicants: 17,
      views: 760,
      description: "Tìm kiếm đối tác, chăm sóc khách hàng doanh nghiệp và phát triển pipeline bán hàng cho các sản phẩm cộng đồng.",
      requirements: [
        "Giao tiếp tốt và chủ động trong follow-up.",
        "Có kinh nghiệm B2B hoặc partnership là lợi thế.",
        "Biết dùng CRM và báo cáo pipeline.",
      ],
      benefits: [
        "Hoa hồng rõ ràng.",
        "Đào tạo sản phẩm và kỹ năng bán hàng.",
        "Lộ trình lên team lead.",
      ],
      skills: ["B2B", "CRM", "Partnership"],
      isRemote: false,
      isFeatured: false,
      isSaved: true,
      isOwner: false,
    },
    {
      id: "finance-operations-analyst",
      title: "Finance Operations Analyst",
      company: "Green Fund",
      companyInitials: "GF",
      companyGradient: "linear-gradient(135deg,var(--color-success),var(--color-info))",
      category: "finance",
      categoryLabel: "Tài chính",
      locationKey: "ho-chi-minh",
      location: "Bình Thạnh, TP. Hồ Chí Minh",
      type: "part-time",
      typeLabel: "Bán thời gian",
      salary: "12 - 18 triệu",
      postedAt: "2 ngày trước",
      deadline: "05/06/2026",
      experience: "1+ năm",
      applicants: 12,
      views: 520,
      description: "Theo dõi ngân sách chiến dịch, đối soát giao dịch và chuẩn bị báo cáo vận hành cho các dự án gây quỹ cộng đồng.",
      requirements: [
        "Cẩn thận với số liệu và chứng từ.",
        "Biết Excel/Google Sheets nâng cao.",
        "Ưu tiên từng làm vận hành tài chính dự án.",
      ],
      benefits: [
        "Thời gian linh hoạt.",
        "Có thể chuyển full-time.",
        "Tham gia các dự án tác động xã hội.",
      ],
      skills: ["Finance", "Excel", "Reporting"],
      isRemote: false,
      isFeatured: false,
      isSaved: false,
      isOwner: true,
    },
    {
      id: "community-operations-intern",
      title: "Community Operations Intern",
      company: "VNSEEA Community",
      companyInitials: "VC",
      companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
      category: "operations",
      categoryLabel: "Vận hành",
      locationKey: "remote",
      location: "Remote, ưu tiên sinh viên năm cuối",
      type: "internship",
      typeLabel: "Thực tập",
      salary: "4 - 6 triệu",
      postedAt: "3 ngày trước",
      deadline: "01/06/2026",
      experience: "Không yêu cầu",
      applicants: 57,
      views: 1880,
      description: "Hỗ trợ vận hành nhóm, tổng hợp phản hồi thành viên, chuẩn bị sự kiện online và cập nhật dữ liệu cộng đồng.",
      requirements: [
        "Giao tiếp rõ ràng, phản hồi nhanh.",
        "Biết dùng Notion/Sheets hoặc công cụ tương tự.",
        "Có thể làm tối thiểu 20 giờ mỗi tuần.",
      ],
      benefits: [
        "Có mentor hướng dẫn.",
        "Giấy xác nhận thực tập.",
        "Cơ hội lên cộng tác viên dài hạn.",
      ],
      skills: ["Community", "Ops", "Notion"],
      isRemote: true,
      isFeatured: false,
      isSaved: false,
      isOwner: true,
    },
  ]

  return {
    jobs,
    jobCategories,
    jobLocations,
    jobTypes,
    findJobById: (id: string) => jobs.find(job => job.id === id),
  }
}
