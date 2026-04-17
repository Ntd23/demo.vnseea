export type WatchCategoryKey = "all" | "community" | "education" | "business" | "events" | "technology"

export type WatchComment = {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
}

export type WatchVideo = {
  id: string
  title: string
  category: Exclude<WatchCategoryKey, "all">
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  date: string
  duration: string
  views: number
  likes: number
  shares: number
  cover: string
  description: string
  tags: string[]
  comments: WatchComment[]
}

export const useMockWatchData = () => {
  const categories: { label: string; value: WatchCategoryKey; icon: string }[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
    { label: "Cộng đồng", value: "community", icon: "i-ph-users-three-fill" },
    { label: "Giáo dục", value: "education", icon: "i-ph-graduation-cap-fill" },
    { label: "Kinh doanh", value: "business", icon: "i-ph-briefcase-fill" },
    { label: "Sự kiện", value: "events", icon: "i-ph-calendar-dots-fill" },
    { label: "Công nghệ", value: "technology", icon: "i-ph-cpu-fill" },
  ]

  const videos: WatchVideo[] = [
    {
      id: "vnseea-product-demo",
      title: "VNSEEA Product Demo: cập nhật giao diện cộng đồng",
      category: "technology",
      categoryLabel: "Công nghệ",
      author: "Justin",
      authorInitials: "JT",
      authorGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      date: "17/04/2026",
      duration: "18:42",
      views: 18400,
      likes: 1240,
      shares: 218,
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      description: "Bản demo tổng hợp các thay đổi UI mới, cách tổ chức component và checklist trước khi nối API posts.php cho video.",
      tags: ["#product", "#ui", "#nuxt"],
      comments: [
        { id: 1, author: "Hoangne", initials: "HN", role: "Member", message: "Player nhìn rõ, phần related video dễ chọn.", time: "5 phút trước" },
        { id: 2, author: "Dung1", initials: "D1", role: "Creator", message: "Nên giữ layout này cho desktop.", time: "12 phút trước" },
      ],
    },
    {
      id: "founder-breakfast-recap",
      title: "Founder Breakfast recap: những câu hỏi hay nhất",
      category: "business",
      categoryLabel: "Kinh doanh",
      author: "Hanoi Startup Circle",
      authorInitials: "HS",
      authorGradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      date: "16/04/2026",
      duration: "12:06",
      views: 12600,
      likes: 842,
      shares: 96,
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
      description: "Tóm tắt buổi gặp founder với các câu hỏi về khách hàng đầu tiên, pricing và pitch deck.",
      tags: ["#startup", "#founder", "#business"],
      comments: [
        { id: 3, author: "Ngọc Tokyo", initials: "NT", role: "Founder", message: "Đoạn pricing rất đáng lưu lại.", time: "1 giờ trước" },
      ],
    },
    {
      id: "green-classroom-story",
      title: "Câu chuyện lớp học xanh vùng ven",
      category: "education",
      categoryLabel: "Giáo dục",
      author: "Learning Guild",
      authorInitials: "LG",
      authorGradient: "linear-gradient(135deg,var(--color-success),var(--color-primary-500))",
      date: "15/04/2026",
      duration: "09:34",
      views: 9300,
      likes: 712,
      shares: 144,
      cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      description: "Một video ngắn về quá trình chuẩn bị góc học tập xanh, thư viện nhỏ và báo cáo minh bạch cho cộng đồng.",
      tags: ["#education", "#funding", "#community"],
      comments: [
        { id: 4, author: "Quỳnh Lan", initials: "QL", role: "Donor", message: "Nội dung rõ ràng và tạo niềm tin.", time: "2 giờ trước" },
      ],
    },
    {
      id: "event-highlight-summit",
      title: "Highlight VNSEEA Tech Community Summit",
      category: "events",
      categoryLabel: "Sự kiện",
      author: "VNSEEA Community",
      authorInitials: "VC",
      authorGradient: "linear-gradient(135deg,var(--color-primary-700),var(--color-accent-500))",
      date: "14/04/2026",
      duration: "07:18",
      views: 21800,
      likes: 1680,
      shares: 302,
      cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      description: "Các khoảnh khắc nổi bật từ summit: keynote, workshop và phần networking cuối ngày.",
      tags: ["#event", "#summit", "#tech"],
      comments: [],
    },
  ]

  return {
    categories,
    videos,
    findVideoById: (id: string) => videos.find(video => video.id === id),
  }
}

export const formatWatchNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: value >= 10000 ? "compact" : "standard" }).format(value)
