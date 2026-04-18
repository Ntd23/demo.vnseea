export type ForumSectionKey = "all" | "announcements" | "support" | "marketplace" | "events" | "jobs" | "showcase"

export type ForumSection = {
  label: string
  value: ForumSectionKey
  icon: string
  description: string
}

export type ForumReply = {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
  accepted?: boolean
}

export type ForumThread = {
  id: string
  title: string
  section: Exclude<ForumSectionKey, "all">
  sectionLabel: string
  author: string
  authorInitials: string
  authorRole: string
  status: "open" | "solved" | "pinned"
  createdAt: string
  views: number
  repliesCount: number
  excerpt: string
  tags: string[]
  replies: ForumReply[]
}

export type ForumThreadPayload = {
  title: string
  section: Exclude<ForumSectionKey, "all">
  message: string
}

export const useMockForumData = () => {
  const sections: ForumSection[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill", description: "Toàn bộ thảo luận" },
    { label: "Thông báo", value: "announcements", icon: "i-ph-megaphone-fill", description: "Tin chính thức từ VNSEEA" },
    { label: "Hỗ trợ", value: "support", icon: "i-ph-lifebuoy-fill", description: "Câu hỏi và trợ giúp" },
    { label: "Thị trường", value: "marketplace", icon: "i-ph-storefront-fill", description: "Mua bán và vận hành shop" },
    { label: "Sự kiện", value: "events", icon: "i-ph-calendar-dots-fill", description: "Event, workshop, meetup" },
    { label: "Việc làm", value: "jobs", icon: "i-ph-briefcase-fill", description: "Tuyển dụng và nghề nghiệp" },
    { label: "Showcase", value: "showcase", icon: "i-ph-sparkle-fill", description: "Khoe sản phẩm, dự án" },
  ]

  const threads: ForumThread[] = [
    {
      id: "release-notes-april",
      title: "Cập nhật giao diện tháng 4: blogs, events, funding, games",
      section: "announcements",
      sectionLabel: "Thông báo",
      author: "VNSEEA Admin",
      authorInitials: "VA",
      authorRole: "Admin",
      status: "pinned",
      createdAt: "2 giờ trước",
      views: 1840,
      repliesCount: 18,
      excerpt: "Tổng hợp các thay đổi mới nhất của giao diện và hướng test nhanh cho từng module.",
      tags: ["#release", "#ui", "#test"],
      replies: [
        { id: 1, author: "Justin", initials: "JT", role: "Member", message: "Phần games đã rõ hơn sau khi bảng xếp hạng theo từng game.", time: "1 giờ trước" },
        { id: 2, author: "Hoangne", initials: "HN", role: "Creator", message: "Nên giữ checklist test ngay trong thread này.", time: "42 phút trước" },
      ],
    },
    {
      id: "checkout-wallet-question",
      title: "Thanh toán marketplace bằng ví nội bộ có cần xác nhận OTP không?",
      section: "support",
      sectionLabel: "Hỗ trợ",
      author: "Dung1",
      authorInitials: "D1",
      authorRole: "Seller",
      status: "open",
      createdAt: "3 giờ trước",
      views: 642,
      repliesCount: 7,
      excerpt: "Mình đang test checkout và muốn biết flow ví nội bộ sẽ đi qua xác nhận nào khi nối API.",
      tags: ["#checkout", "#wallet", "#marketplace"],
      replies: [
        { id: 3, author: "Ngoc Tokyo", initials: "NT", role: "Moderator", message: "Mock hiện chưa có OTP. Khi nối wallet.php nên thêm xác nhận cho giao dịch lớn.", time: "2 giờ trước", accepted: true },
      ],
    },
    {
      id: "event-speaker-template",
      title: "Mẫu mô tả speaker cho trang sự kiện",
      section: "events",
      sectionLabel: "Sự kiện",
      author: "Nicolas",
      authorInitials: "NC",
      authorRole: "Organizer",
      status: "solved",
      createdAt: "Hôm qua",
      views: 930,
      repliesCount: 11,
      excerpt: "Chia sẻ format ngắn để nhập speaker, agenda và FAQ cho event detail.",
      tags: ["#events", "#speaker", "#template"],
      replies: [
        { id: 4, author: "VNSEEA Admin", initials: "VA", role: "Admin", message: "Có thể dùng cấu trúc: vai trò, chủ đề, link profile và 2 dòng bio.", time: "Hôm qua", accepted: true },
      ],
    },
    {
      id: "job-posting-tips",
      title: "Làm sao viết tin tuyển dụng rõ ràng hơn?",
      section: "jobs",
      sectionLabel: "Việc làm",
      author: "Minh Anh",
      authorInitials: "MA",
      authorRole: "Recruiter",
      status: "open",
      createdAt: "2 ngày trước",
      views: 1204,
      repliesCount: 16,
      excerpt: "Mình cần checklist cho title, salary, location, requirement và benefit để ứng viên đọc nhanh.",
      tags: ["#jobs", "#hiring", "#copy"],
      replies: [
        { id: 5, author: "Justin", initials: "JT", role: "Member", message: "Nên đưa salary range và remote policy vào 3 dòng đầu.", time: "1 ngày trước" },
      ],
    },
    {
      id: "showcase-green-classroom",
      title: "Showcase: chiến dịch lớp học xanh đã đạt 70%",
      section: "showcase",
      sectionLabel: "Showcase",
      author: "Learning Guild",
      authorInitials: "LG",
      authorRole: "Partner",
      status: "open",
      createdAt: "3 ngày trước",
      views: 1540,
      repliesCount: 24,
      excerpt: "Cập nhật ảnh, tiến độ và những hạng mục chuẩn bị sau khi chiến dịch funding tăng nhanh.",
      tags: ["#funding", "#education", "#showcase"],
      replies: [
        { id: 6, author: "Quynh Lan", initials: "QL", role: "Donor", message: "Phần báo cáo chi phí minh bạch, nên ghim trong detail funding.", time: "2 ngày trước" },
      ],
    },
  ]

  return {
    sections,
    threads,
  }
}

export const formatForumNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: value >= 10000 ? "compact" : "standard" }).format(value)
