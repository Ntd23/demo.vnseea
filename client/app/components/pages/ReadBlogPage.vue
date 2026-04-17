<template>
  <div class="space-y-5 pb-10">
    <article class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
      <BlogsReadBlogHero
        :article="article"
        :article-not-found="articleNotFound"
        :format-compact="formatCompact"
      />

      <div class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
        <BlogsReadBlogMain
          v-model:comment-text="commentText"
          :article="article"
          :liked="liked"
          :displayed-likes="displayedLikes"
          :share-open="shareOpen"
          :share-url="shareUrl"
          :comments="comments"
          :format-compact="formatCompact"
          @toggle-like="liked = !liked"
          @toggle-share="shareOpen = !shareOpen"
          @add-comment="addComment"
        />

        <BlogsReadBlogSidebar
          :article="article"
          :related-articles="relatedArticles"
        />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
type BlogDetail = {
  slug: string
  title: string
  excerpt: string
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  publishedAt: string
  views: number
  readMinutes: number
  likes: number
  tags: string[]
  image: string
  imageFallback: string
  body: string[]
}

type BlogComment = {
  id: number
  author: string
  initials: string
  time: string
  body: string
}

const route = useRoute()

const articles = [
  {
    slug: "recycled-plastic-granules-market-growth",
    title: "Recycled Plastic Granules Market Growth Accelerates with Global Sustainability Initiatives",
    excerpt: "Các doanh nghiệp tái chế đang mở rộng chuỗi cung ứng nhựa hạt, tập trung vào tiêu chuẩn xanh và hợp đồng dài hạn.",
    categoryLabel: "Kinh tế và Thương mại",
    author: "Justin",
    authorInitials: "JT",
    authorGradient: "linear-gradient(135deg,#0000ff 0%,#4f7cff 100%)",
    publishedAt: "15 phút trước",
    views: 18400,
    readMinutes: 5,
    likes: 412,
    tags: ["market", "recycle"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
    body: [
      "Nhu cầu nhựa tái chế đang tăng khi nhiều doanh nghiệp chuyển sang các mục tiêu phát triển bền vững rõ ràng hơn. Thay vì chỉ xem vật liệu tái chế như lựa chọn phụ, nhiều chuỗi cung ứng đã bắt đầu đưa hạt nhựa tái chế vào kế hoạch mua hàng dài hạn.",
      "Điểm thay đổi lớn nằm ở chất lượng đầu vào. Các nhà sản xuất cần nguồn nguyên liệu ổn định, quy trình phân loại minh bạch và khả năng truy xuất tốt hơn để đáp ứng tiêu chuẩn của đối tác quốc tế.",
      "Trong vài năm tới, thị trường có thể tiếp tục tăng trưởng nếu doanh nghiệp cân bằng được chi phí, chất lượng và khả năng chứng minh tác động môi trường bằng dữ liệu đáng tin cậy.",
    ],
  },
  {
    slug: "passion-hose-industrial-automotive-needs",
    title: "Passion Hose: Your Trusted Gas Hose Manufacturer for Industrial and Automotive Needs",
    excerpt: "Một góc nhìn về tiêu chuẩn an toàn, kiểm định vật liệu và cách doanh nghiệp lựa chọn nhà sản xuất ống dẫn khí.",
    categoryLabel: "Ô tô và Xe cộ",
    author: "Hoangne",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#334155 0%,#0f172a 100%)",
    publishedAt: "42 phút trước",
    views: 12600,
    readMinutes: 4,
    likes: 286,
    tags: ["industry", "auto"],
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
    body: [
      "Ống dẫn khí trong công nghiệp và ô tô không chỉ là phụ kiện thay thế. Chúng liên quan trực tiếp đến an toàn vận hành, độ bền vật liệu và khả năng chịu áp lực trong nhiều môi trường khác nhau.",
      "Khi lựa chọn nhà sản xuất, doanh nghiệp thường quan tâm đến kiểm định, tiêu chuẩn vật liệu, thời gian giao hàng và khả năng hỗ trợ theo lô sản xuất riêng.",
      "Một quy trình đánh giá rõ ràng giúp giảm rủi ro trong bảo trì và giữ hiệu suất ổn định cho hệ thống.",
    ],
  },
  {
    slug: "lop-hoc-so-sau-gio-lam",
    title: "Lớp học số sau giờ làm: cách người trẻ nâng kỹ năng mỗi tuần",
    excerpt: "Những khóa học ngắn, nhóm học nhỏ và tài liệu mở giúp người đi làm duy trì nhịp học tập bền hơn.",
    categoryLabel: "Giáo dục",
    author: "Dung 1",
    authorInitials: "D1",
    authorGradient: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
    publishedAt: "1 giờ trước",
    views: 9300,
    readMinutes: 6,
    likes: 204,
    tags: ["learning", "career"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#4338ca 0%,#06b6d4 100%)",
    body: [
      "Sau giờ làm, người trẻ thường không thiếu tài liệu mà thiếu nhịp học bền. Các lớp ngắn, mục tiêu nhỏ và nhóm học có lịch cố định giúp việc học dễ duy trì hơn.",
      "Một tuần hiệu quả không nhất thiết cần nhiều giờ học. Điều quan trọng là biết chọn đúng kỹ năng, ghi lại tiến độ và có sản phẩm nhỏ sau mỗi vòng học.",
      "Khi học tập được đặt vào lịch như một hoạt động đều đặn, áp lực giảm đi và kết quả tích lũy rõ hơn.",
    ],
  },
  {
    slug: "khong-gian-song-toi-gian",
    title: "Không gian sống tối giản cho căn hộ nhỏ",
    excerpt: "Một số lựa chọn ánh sáng, lưu trữ và màu sắc giúp căn hộ nhỏ gọn gàng nhưng vẫn có cá tính riêng.",
    categoryLabel: "Cách sống",
    author: "Ngoctokyo",
    authorInitials: "NT",
    authorGradient: "linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)",
    publishedAt: "3 giờ trước",
    views: 7600,
    readMinutes: 3,
    likes: 176,
    tags: ["home", "minimal"],
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#0f766e 0%,#99f6e4 100%)",
    body: [
      "Căn hộ nhỏ cần sự rõ ràng trong cách phân vùng. Khi mỗi món đồ có vai trò cụ thể, không gian sẽ dễ thở hơn mà không cần loại bỏ hết cá tính.",
      "Ánh sáng tự nhiên, tủ lưu trữ kín và bảng màu tiết chế giúp giảm cảm giác chật. Những điểm nhấn nhỏ như tranh, cây xanh hoặc vật liệu vải có thể giữ sự ấm áp.",
      "Tối giản hiệu quả không phải là trống rỗng, mà là giữ lại những gì thật sự được dùng và có ý nghĩa.",
    ],
  },
  {
    slug: "ai-ca-nhan-hoa-luong-doc-tin",
    title: "Bản tin công nghệ: AI cá nhân hóa luồng đọc tin",
    excerpt: "Các hệ thống gợi ý mới ưu tiên ngữ cảnh, sở thích và lịch sử tương tác thay vì chỉ dựa trên lượt xem.",
    categoryLabel: "Khoa học và Công nghệ",
    author: "Nicolas",
    authorInitials: "NC",
    authorGradient: "linear-gradient(135deg,#1e293b 0%,#4f46e5 100%)",
    publishedAt: "4 giờ trước",
    views: 15400,
    readMinutes: 5,
    likes: 520,
    tags: ["ai", "news"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    body: [
      "Cá nhân hóa luồng tin đang chuyển từ các chỉ số đơn giản sang mô hình hiểu ngữ cảnh hơn. Hệ thống không chỉ xem bài nào nhiều lượt đọc, mà còn xét cách người dùng tương tác theo thời gian.",
      "Điều này giúp nội dung phù hợp hơn, nhưng cũng đòi hỏi giao diện phải minh bạch về lý do gợi ý và cho phép người dùng điều chỉnh sở thích.",
      "Một luồng đọc tốt cần cân bằng giữa sự quen thuộc và khám phá, tránh đẩy người dùng vào một phạm vi chủ đề quá hẹp.",
    ],
  },
  {
    slug: "cung-duong-cuoi-tuan-gan-bien",
    title: "Những cung đường cuối tuần gần biển",
    excerpt: "Gợi ý các điểm dừng dễ đi, lịch trình ngắn và cách chuẩn bị để chuyến đi nhẹ nhàng hơn.",
    categoryLabel: "Du lịch và Sự kiện",
    author: "Minh Anh",
    authorInitials: "MA",
    authorGradient: "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
    publishedAt: "5 giờ trước",
    views: 6900,
    readMinutes: 4,
    likes: 149,
    tags: ["travel", "weekend"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#0369a1 0%,#7dd3fc 100%)",
    body: [
      "Một chuyến đi cuối tuần gần biển nên nhẹ về lịch trình. Chọn ít điểm dừng, ưu tiên thời gian nghỉ và chuẩn bị trước các lựa chọn ăn uống giúp hành trình thoải mái hơn.",
      "Nếu di chuyển bằng xe cá nhân, hãy kiểm tra thời tiết, tuyến đường và điểm đỗ trước khi đi. Những chi tiết nhỏ này giúp tránh mất thời gian khi đến nơi.",
      "Điều quan trọng nhất là giữ nhịp chậm vừa đủ để chuyến đi thật sự là một khoảng nghỉ.",
    ],
  },
  {
    slug: "doi-bong-phong-trao-lich-tap-deu",
    title: "Đội bóng phong trào và cách giữ lịch tập đều",
    excerpt: "Quản lý sân bãi, chia vai trò và theo dõi thể lực giúp các đội nghiệp dư giữ nhịp thi đấu ổn định.",
    categoryLabel: "Thể thao",
    author: "Thanh Sơn",
    authorInitials: "TS",
    authorGradient: "linear-gradient(135deg,#15803d 0%,#22c55e 100%)",
    publishedAt: "6 giờ trước",
    views: 5300,
    readMinutes: 4,
    likes: 118,
    tags: ["football", "team"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#22c55e 100%)",
    body: [
      "Đội bóng phong trào thường khó giữ lịch vì mỗi thành viên có thời gian khác nhau. Việc chia vai trò rõ ràng giúp giảm phụ thuộc vào một người tổ chức duy nhất.",
      "Một lịch tập đều cần sân cố định, nhóm nhắc lịch và cách theo dõi thể lực đơn giản. Các đội không cần hệ thống phức tạp để cải thiện tính kỷ luật.",
      "Khi mọi người biết mình cần có mặt lúc nào và vì sao, chất lượng buổi tập sẽ ổn định hơn.",
    ],
  },
  {
    slug: "game-indie-viet-nhom-phat-trien-nho",
    title: "Game indie Việt và những nhóm phát triển nhỏ",
    excerpt: "Từ prototype cuối tuần đến bản phát hành đầu tiên, các nhóm nhỏ đang tìm cách kể câu chuyện rất riêng.",
    categoryLabel: "Chơi game",
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#4338ca 0%,#a855f7 100%)",
    publishedAt: "Hôm qua",
    views: 8800,
    readMinutes: 5,
    likes: 268,
    tags: ["game", "indie"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#312e81 0%,#a855f7 100%)",
    body: [
      "Các nhóm phát triển game nhỏ thường bắt đầu bằng prototype rất gọn. Họ kiểm tra ý tưởng, cảm giác điều khiển và vòng chơi chính trước khi mở rộng nội dung.",
      "Điểm mạnh của game indie là khả năng kể những câu chuyện gần gũi, thử nghiệm cơ chế lạ và phản hồi nhanh với người chơi đầu tiên.",
      "Khi phạm vi được giữ rõ, một nhóm nhỏ vẫn có thể tạo ra sản phẩm có bản sắc riêng.",
    ],
  },
] satisfies BlogDetail[]

const currentSlug = computed(() => String(route.params.slug ?? ""))
const article = computed(() =>
  articles.find(item => item.slug === currentSlug.value) ?? articles[0],
)
const articleNotFound = computed(() =>
  !articles.some(item => item.slug === currentSlug.value),
)

const liked = ref(false)
const shareOpen = ref(false)
const commentText = ref("")
const comments = ref<BlogComment[]>([
  {
    id: 1,
    author: "Minh Anh",
    initials: "MA",
    time: "8 phút trước",
    body: "Bố cục bài đọc dễ theo dõi, phần liên quan bên phải cũng giúp chuyển sang bài kế tiếp nhanh.",
  },
  {
    id: 2,
    author: "Xu Nguyễn",
    initials: "XN",
    time: "22 phút trước",
    body: "Nội dung mock ổn để kiểm thử phần reader, react và comment trước khi nối API thật.",
  },
])

watch(currentSlug, () => {
  liked.value = false
  shareOpen.value = false
})

useSeoMeta({
  title: () => `${article.value.title} | VNSEEA`,
  description: () => article.value.excerpt,
})

const displayedLikes = computed(() => article.value.likes + (liked.value ? 1 : 0))

const relatedArticles = computed(() => {
  const sameCategory = articles.filter(
    item => item.slug !== article.value.slug && item.categoryLabel === article.value.categoryLabel,
  )
  const fallback = articles.filter(item => item.slug !== article.value.slug)

  return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 4)
})

const shareUrl = computed(() => `/read-blog/${article.value.slug}`)

const compactFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const formatCompact = (value: number) => compactFormatter.format(value)

const addComment = () => {
  const body = commentText.value.trim()
  if (!body) return

  comments.value.unshift({
    id: Date.now(),
    author: "Bạn",
    initials: "BN",
    time: "Vừa xong",
    body,
  })
  commentText.value = ""
}
</script>
