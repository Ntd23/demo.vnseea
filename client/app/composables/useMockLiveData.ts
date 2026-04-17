export type LiveStreamStatus = "live" | "scheduled" | "ended"

export type MockLiveHost = {
  name: string
  initials: string
  role: string
  gradient: string
}

export type MockLiveComment = {
  id: number
  author: string
  initials: string
  message: string
  time: string
  isHost?: boolean
}

export type MockLiveStream = {
  id: string
  title: string
  status: LiveStreamStatus
  category: string
  cover: string
  host: MockLiveHost
  viewers: number
  likes: number
  startedAt: string
  duration: string
  description: string
  tags: string[]
  comments: MockLiveComment[]
}

export type GoLivePayload = {
  title: string
  category: string
  privacy: "public" | "members" | "private"
  description: string
}

export const useMockLiveData = () => {
  const categories = ["Cộng đồng", "Sự kiện", "Giáo dục", "Kinh doanh", "Hỏi đáp"]

  const streams: MockLiveStream[] = [
    {
      id: "community-demo-day",
      title: "VNSEEA Community Demo Day",
      status: "live",
      category: "Sự kiện",
      cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Justin",
        initials: "JT",
        role: "Community host",
        gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      },
      viewers: 1284,
      likes: 432,
      startedAt: "Đang live · 24 phút",
      duration: "24:18",
      description: "Cập nhật demo sản phẩm, hỏi đáp cùng cộng đồng và chia sẻ các kế hoạch livestream tiếp theo.",
      tags: ["#demo", "#community", "#live"],
      comments: [
        { id: 1, author: "Hoangne", initials: "HN", message: "Âm thanh rõ rồi, phần demo nhìn ổn.", time: "Vừa xong" },
        { id: 2, author: "Justin", initials: "JT", message: "Mình sẽ trả lời câu hỏi sau phần pitch này.", time: "1 phút", isHost: true },
        { id: 3, author: "Dung1", initials: "D1", message: "Có lưu lại bản ghi không admin?", time: "2 phút" },
      ],
    },
    {
      id: "founder-office-hours",
      title: "Founder Office Hours",
      status: "live",
      category: "Kinh doanh",
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Hoangne",
        initials: "HN",
        role: "Startup mentor",
        gradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      },
      viewers: 642,
      likes: 218,
      startedAt: "Đang live · 11 phút",
      duration: "11:06",
      description: "Phiên hỏi đáp nhanh cho founder mới: pitch, khách hàng đầu tiên và checklist trước demo day.",
      tags: ["#startup", "#founder", "#qa"],
      comments: [
        { id: 4, author: "Ngọc Tokyo", initials: "NT", message: "Cho em hỏi cách validate pricing.", time: "1 phút" },
        { id: 5, author: "Nicolas", initials: "NC", message: "Phần này rất thực tế.", time: "3 phút" },
      ],
    },
    {
      id: "green-workshop",
      title: "Workshop lớp học xanh",
      status: "scheduled",
      category: "Giáo dục",
      cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Learning Guild",
        initials: "LG",
        role: "Education partner",
        gradient: "linear-gradient(135deg,var(--color-success),var(--color-primary-500))",
      },
      viewers: 0,
      likes: 96,
      startedAt: "19:30 hôm nay",
      duration: "Sắp phát",
      description: "Livestream chia sẻ cách tổ chức góc học tập xanh và minh bạch chi phí triển khai.",
      tags: ["#education", "#green", "#funding"],
      comments: [],
    },
  ]

  return {
    categories,
    streams,
  }
}
