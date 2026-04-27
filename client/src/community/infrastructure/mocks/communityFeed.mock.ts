export interface CommunityFeedComment {
  id: number
  author: string
  role: string
  text: string
}

export interface CommunityFeedPost {
  id: number
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: { likes: number; comments: number; shares: number }
  media?: "double" | "single"
  comments: CommunityFeedComment[]
}

export function createCommunityFeedBasePosts(t: (key: string) => string): CommunityFeedPost[] {
  return [
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
    {
      id: 3,
      author: t("feed.storyCarousel.createStory"),
      role: "Community updates",
      audience: "Vnseea",
      time: "1 gio truoc",
      text: "Cap nhat mock feed rieng cho community de tach dependency khoi app/composables/useMockSocialData.",
      tags: ["Community", "Refactor", "DDD"],
      stats: { likes: 45, comments: 9, shares: 3 },
      comments: [
        {
          id: 31,
          author: "System",
          role: "Migration note",
          text: "Runtime community hien da co mock feed rieng trong src/community.",
        },
      ],
    },
  ]
}
