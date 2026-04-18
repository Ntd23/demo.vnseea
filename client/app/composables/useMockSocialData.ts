type NavItem = {
  label: string
  icon: string
  to: string
  badge?: number
}

type SidebarNavItem = {
  label: string
  icon: string
  to: string
}

type Story = {
  id: number
  author: string
  avatar: string
  gradient: string
  isMe?: boolean
  title?: string
  caption?: string
  media?: string
  meta?: string
}

type Contact = {
  id: number
  name: string
  avatar: string
  online: boolean
}

type SuggestedUser = {
  id: number
  name: string
  avatar: string
  mutual: number
  role: string
}

type BirthdayItem = {
  id: number
  name: string
  avatar: string
  today: boolean
}

type WidgetItem = {
  title: string
  subtitle: string
}

type Comment = {
  id: number
  author: string
  role: string
  text: string
}

type Post = {
  id: number
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: { likes: number; comments: number; shares: number }
  media?: "double" | "single"
  comments: Comment[]
}

type Conversation = {
  id: number
  name: string
  title: string
  lastMessage: string
  time: string
  unread: number
  active?: boolean
}

type Message = {
  id: number
  author: string
  text: string
  side: "me" | "them"
  time: string
}

export const useMockSocialData = () => {
  const primaryNav: NavItem[] = [
    { label: "Trang chu", icon: "i-lucide-house", to: "/" },
    { label: "Tin nhan", icon: "i-lucide-message-square", to: "/messages", badge: 4 },
    { label: "Kham pha", icon: "i-lucide-compass", to: "/discover" },
    { label: "Bang tin", icon: "i-lucide-newspaper", to: "/feed" },
    { label: "Dang xuat", icon: "i-lucide-log-out", to: "/welcome" },
  ]

  const stories: Story[] = [
    {
      id: 0,
      author: "Tạo tin",
      avatar: "VN",
      gradient: "linear-gradient(135deg,#0000ff 0%,#6666ff 100%)",
      isMe: true,
      title: "Tạo story mới",
      caption: "Chia sẻ khoảnh khắc của bạn",
      meta: "Story · của bạn",
      media: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 1,
      author: "Thu Ha",
      avatar: "TH",
      gradient: "linear-gradient(135deg,#0000cc 0%,#3333ff 100%)",
      title: "Một buổi sáng yên tĩnh để lên ý tưởng",
      caption: "Story viewer theo style dự án, giữ cảm giác gần Facebook nhưng vẫn bám palette và spacing của VNSEEA.",
      meta: "Story · 2 phút trước",
      media: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      author: "Bao Tran",
      avatar: "BT",
      gradient: "linear-gradient(135deg,#1a1aff 0%,#8080ff 100%)",
      title: "Đoạn chill ngắn cho một ngày dài",
      caption: "Vuốt trái/phải để chuyển story, bấm nút để điều hướng nhanh hơn trên desktop.",
      meta: "Story · 15 phút trước",
      media: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      author: "Nam Pham",
      avatar: "NP",
      gradient: "linear-gradient(135deg,#0000ee 0%,#4444ff 100%)",
      title: "Mẫu story full-screen cho mobile-first",
      caption: "Phù hợp cả ảnh và video, sau này có thể nối API story thật từ backend.",
      meta: "Story · 1 giờ trước",
      media: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 4,
      author: "Linh Dao",
      avatar: "LD",
      gradient: "linear-gradient(135deg,#0000dd 0%,#5555ff 100%)",
      title: "Story hướng dẫn nội bộ",
      caption: "Cách dùng story để highlight thông báo và nội dung nhanh.",
      meta: "Story · 3 giờ trước",
      media: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 5,
      author: "Quynh Le",
      avatar: "QL",
      gradient: "linear-gradient(135deg,#0000bb 0%,#2222ff 100%)",
      title: "Story du lịch",
      caption: "Một góc ảnh nhẹ nhàng, hợp style Facebook nhưng vẫn rất VNSEEA.",
      meta: "Story · 5 giờ trước",
      media: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 6,
      author: "Xu Nguyen",
      avatar: "XN",
      gradient: "linear-gradient(135deg,#111199 0%,#4444dd 100%)",
      title: "Story về sản phẩm",
      caption: "Tập trung vào một thông điệp ngắn, rõ, đẹp.",
      meta: "Story · 7 giờ trước",
      media: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    },
  ]

  const sidebarNav: SidebarNavItem[] = [
    { label: "Nguồn cấp tin tức", icon: "i-ph-house-simple", to: "/" },
    { label: "Tập ảnh", icon: "i-ph-images", to: "/photos" },
    { label: "Xem", icon: "i-ph-play-circle", to: "/watch" },
    { label: "Cuộn phim", icon: "i-ph-film-strip", to: "/reels" },
    { label: "Bài đã lưu", icon: "i-ph-bookmark-simple", to: "/saved" },
    { label: "Bài viết phổ biến", icon: "i-ph-fire", to: "/popular" },
    { label: "Ký ức", icon: "i-ph-clock-counter-clockwise", to: "/memories" },
    { label: "Chọc", icon: "i-ph-hand-waving", to: "/pokes" },
    { label: "Nhóm của tôi", icon: "i-ph-users-three", to: "/groups" },
    { label: "Trang của tôi", icon: "i-ph-file-text", to: "/pages" },
  ]

  const sidebarNavMore: SidebarNavItem[] = [
    { label: "Blog", icon: "i-ph-newspaper", to: "/blogs" },
    { label: "Thị trường", icon: "i-ph-storefront", to: "/products" },
    { label: "Danh mục", icon: "i-ph-squares-four", to: "/categories" },
    { label: "Sự kiện", icon: "i-ph-calendar-dots", to: "/events" },
    { label: "Live", icon: "i-ph-broadcast", to: "/live" },
    { label: "Diễn đàn", icon: "i-ph-chats-circle", to: "/forum" },
    { label: "Phim", icon: "i-ph-popcorn", to: "/movies" },
    { label: "Việc làm", icon: "i-ph-briefcase", to: "/jobs" },
    { label: "Ưu đãi", icon: "i-ph-tag", to: "/deals" },
    { label: "Tìm bạn", icon: "i-ph-user-plus", to: "/find-friends" },
    { label: "Trò chơi", icon: "i-ph-game-controller", to: "/games" },
    { label: "Go Pro", icon: "i-ph-crown-simple", to: "/go-pro" },
    { label: "Trending", icon: "i-ph-trend-up", to: "/trending" },
    { label: "Kinh phí", icon: "i-ph-hand-heart", to: "/funding" },
  ]

  const contacts: Contact[] = [
    { id: 1, name: "Xu Nguyễn", avatar: "XN", online: true },
    { id: 2, name: "Quỳnh Lan", avatar: "QL", online: false },
    { id: 3, name: "Ngọc Lễ", avatar: "NL", online: true },
    { id: 4, name: "Lương Huyền Trang", avatar: "LT", online: true },
    { id: 5, name: "Us Meo", avatar: "UM", online: false },
    { id: 6, name: "Nguyen Ngoc Maii", avatar: "NM", online: true },
    { id: 7, name: "Thạch Thị Mỹ Hậu", avatar: "TH", online: false },
    { id: 8, name: "Duong Bao Nam", avatar: "DN", online: true },
    { id: 9, name: "Hoàng Huy", avatar: "HH", online: true },
    { id: 10, name: "Thao Hackers", avatar: "TH", online: false },
    { id: 11, name: "An Nguyen", avatar: "AN", online: true },
    { id: 12, name: "Linh Phương", avatar: "LP", online: false },
  ]

  const suggestedUsers: SuggestedUser[] = [
    { id: 101, name: "Miên Trần", avatar: "MT", mutual: 8, role: "Designer" },
    { id: 102, name: "Khánh Vũ", avatar: "KV", mutual: 5, role: "Frontend Dev" },
    { id: 103, name: "Thanh Hà", avatar: "TH", mutual: 12, role: "Product" },
    { id: 104, name: "Phú Lê", avatar: "PL", mutual: 3, role: "Backend" },
  ]

  const birthdays: BirthdayItem[] = [
    { id: 1, name: "Xu Nguyễn", avatar: "XN", today: true },
    { id: 2, name: "Minh Anh", avatar: "MA", today: true },
    { id: 3, name: "Quỳnh Lan", avatar: "QL", today: false },
  ]

  const widgets: { title: string; items: WidgetItem[] }[] = [
    {
      title: "Nguoi ban goi y",
      items: [
        { title: "Le Minh Anh", subtitle: "8 ban chung • Designer" },
        { title: "Bao Tran", subtitle: "12 ban chung • Partnerships" },
      ],
    },
    {
      title: "Xu huong hom nay",
      items: [
        { title: "#NuxtMigration", subtitle: "42 bai dang moi" },
        { title: "#VnseeaCommunity", subtitle: "Tang tuong tac 18%" },
      ],
    },
    {
      title: "Loi tat nhanh",
      items: [
        { title: "Cong dong san pham", subtitle: "Mo bang tin nhom va cap nhat" },
        { title: "Thu vien media", subtitle: "Xem tat ca tai nguyen vua tai len" },
      ],
    },
  ]

  const posts: Post[] = [
    {
      id: 1,
      author: "Thu Ha",
      role: "Community lead",
      audience: "Cong khai",
      time: "12 phut truoc",
      text: "Hom nay team da chot duoc huong UI moi: tap trung vao he component va trang mau de validate. Minh dang tong hop feedback de tuan toi vao phase profile va settings.",
      tags: ["Migration", "Design system", "Nuxt"],
      stats: { likes: 124, comments: 28, shares: 7 },
      media: "double",
      comments: [
        {
          id: 11,
          author: "Nam Pham",
          role: "Frontend",
          text: "Huong nay on. Neu bo shell va feed core on thi cac page sau se vao nhanh hon rat nhieu.",
        },
        {
          id: 12,
          author: "Linh Dao",
          role: "Product",
          text: "Phan /welcome hien nhin da ra chat san pham hon roi.",
        },
      ],
    },
    {
      id: 2,
      author: "Bao Tran",
      role: "Partnerships",
      audience: "Thanh vien",
      time: "35 phut truoc",
      text: "Minh dang mock lai hero cho profile va business page. Muc tieu la giu tinh chuyen nghiep nhung van co cam giac cong dong.",
      tags: ["Profile", "Branding"],
      stats: { likes: 89, comments: 16, shares: 4 },
      media: "single",
      comments: [
        {
          id: 21,
          author: "Quynh Le",
          role: "Designer",
          text: "Nen giu palette xanh lam chu dao va dung accent am de tranh qua lanh.",
        },
      ],
    },
  ]

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Team UI",
      title: "Kenh phoi hop",
      lastMessage: "Mai minh rap xong shell cho /messages.",
      time: "20:05",
      unread: 3,
      active: true,
    },
    {
      id: 2,
      name: "Van Hanh",
      title: "Operations",
      lastMessage: "Cho minh ban preview cua /welcome nhe.",
      time: "19:42",
      unread: 1,
    },
    {
      id: 3,
      name: "Design review",
      title: "Weekly sync",
      lastMessage: "Version card moi da on hon ban cu.",
      time: "18:10",
      unread: 0,
    },
  ]

  const thread: Message[] = [
    { id: 1, author: "Team UI", text: "Phan shell da len khung xong, toi dang chinh spacing mobile.", side: "them", time: "19:54" },
    { id: 2, author: "Ban", text: "OK, uu tien giup minh /welcome va /messages dep truoc de team demo.", side: "me", time: "19:56" },
    { id: 3, author: "Team UI", text: "Da ro. Feed mock cung dang duoc ghep bang shared components.", side: "them", time: "20:03" },
  ]

  const profileChips = ["Cong dong", "Ket noi", "Su kien", "Noi dung"]

  return {
    primaryNav,
    stories,
    sidebarNav,
    sidebarNavMore,
    contacts,
    suggestedUsers,
    birthdays,
    widgets,
    posts,
    conversations,
    thread,
    profileChips,
  }
}
