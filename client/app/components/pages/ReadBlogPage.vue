<template>
  <div class="space-y-5 pb-10">
    <section
      v-if="articleNotFound"
      class="rounded-[24px] border border-[var(--border-default)] bg-[var(--color-accent-50)] p-4 text-[13px] font-semibold text-[var(--color-accent-700)] shadow-[var(--shadow-sm)]"
    >
      Không tìm thấy slug này trong mock data, đang mở bài viết mẫu gần nhất.
    </section>

    <article class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
      <div class="relative min-h-[340px] overflow-hidden lg:min-h-[460px]">
        <div class="absolute inset-0" :style="{ background: article.imageFallback }" />
        <img
          :src="article.image"
          :alt="article.title"
          class="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          @error="handleImageError"
        >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.74)_100%)]" />

        <div class="relative z-10 flex min-h-[340px] flex-col justify-end p-5 text-white sm:p-7 lg:min-h-[460px] lg:p-8">
          <div class="max-w-[860px]">
            <div class="flex flex-wrap gap-2">
              <span class="rounded-[10px] bg-white/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-[4px]">
                {{ article.categoryLabel }}
              </span>
              <span class="rounded-[10px] bg-[#101828]/64 px-3 py-1.5 text-[11px] font-bold backdrop-blur-[4px]">
                {{ article.readMinutes }} phút đọc
              </span>
            </div>

            <h1 class="mt-4 text-display text-[2rem] leading-[1.02] text-white sm:text-[2.8rem] lg:text-[3.25rem]">
              {{ article.title }}
            </h1>
            <p class="mt-4 max-w-[760px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
              {{ article.excerpt }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <div class="avatar-md text-white" :style="{ background: article.authorGradient }">
                {{ article.authorInitials }}
              </div>
              <div>
                <p class="text-[14px] font-bold">{{ article.author }}</p>
                <p class="text-[12px] text-white/72">
                  {{ article.publishedAt }} · {{ formatCompact(article.views) }} lượt xem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
        <section class="min-w-0 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3">
            <div class="flex flex-wrap gap-2">
              <button
                class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[13px] font-bold transition"
                :class="liked
                  ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                  : 'bg-white text-[var(--text-secondary)] hover:text-[var(--color-primary-600)]'"
                type="button"
                @click="liked = !liked"
              >
                <Icon :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up'" class="h-4 w-4" />
                {{ formatCompact(displayedLikes) }}
              </button>
              <button
                class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:text-[var(--color-primary-600)]"
                type="button"
                @click="shareOpen = !shareOpen"
              >
                <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
                Chia sẻ
              </button>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <div
            v-if="shareOpen"
            class="rounded-[22px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-sm)]"
          >
            <p class="text-[13px] font-bold text-[var(--text-primary)]">
              Liên kết chia sẻ mock
            </p>
            <p class="mt-2 break-all rounded-[16px] bg-[var(--bg-surface-hover)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
              {{ shareUrl }}
            </p>
          </div>

          <div class="blog-reader-body rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-7">
            <p
              v-for="paragraph in article.body"
              :key="paragraph"
              class="text-[16px] leading-8 text-[var(--text-primary)]"
            >
              {{ paragraph }}
            </p>
          </div>

          <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-label-secondary text-[var(--color-primary-600)]">
                  Bình luận
                </p>
                <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                  {{ comments.length }} phản hồi
                </h2>
              </div>
            </div>

            <div class="mt-4 flex gap-3">
              <div class="avatar-md avatar-brand shrink-0">VN</div>
              <div class="min-w-0 flex-1">
                <textarea
                  v-model="commentText"
                  class="min-h-[96px] w-full resize-y rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
                  placeholder="Viết bình luận..."
                />
                <div class="mt-3 flex justify-end">
                  <button
                    class="inline-flex h-10 items-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-4 text-[13px] font-bold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
                    type="button"
                    @click="addComment"
                  >
                    Gửi bình luận
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
              >
                <div class="avatar-md avatar-muted shrink-0">
                  {{ comment.initials }}
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-[13px] font-bold text-[var(--text-primary)]">
                      {{ comment.author }}
                    </p>
                    <span class="text-caption-secondary">{{ comment.time }}</span>
                  </div>
                  <p class="mt-1 text-[13px] leading-6 text-[var(--text-secondary)]">
                    {{ comment.body }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>

        <aside class="space-y-4">
          <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              Tác giả
            </p>
            <div class="mt-4 flex items-center gap-3">
              <div class="avatar-lg text-white" :style="{ background: article.authorGradient }">
                {{ article.authorInitials }}
              </div>
              <div class="min-w-0">
                <p class="text-[15px] font-black text-[var(--text-primary)]">
                  {{ article.author }}
                </p>
                <p class="text-caption-secondary">
                  {{ article.categoryLabel }}
                </p>
              </div>
            </div>
            <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
              Tác giả đang đóng góp các bài viết nổi bật trong luồng Blogs của VNSEEA.
            </p>
          </section>

          <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              Bài liên quan
            </p>
            <div class="mt-4 space-y-3">
              <NuxtLink
                v-for="item in relatedArticles"
                :key="item.slug"
                :to="`/read-blog/${item.slug}`"
                class="group block rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
              >
                <p class="text-[12px] font-bold text-[var(--color-primary-600)]">
                  {{ item.categoryLabel }}
                </p>
                <h3 class="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[var(--text-primary)]">
                  {{ item.title }}
                </h3>
                <p class="mt-2 text-caption-secondary">
                  {{ item.readMinutes }} phút đọc
                </p>
              </NuxtLink>
            </div>
          </section>
        </aside>
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
    slug: "lich-su-khu-cho-ven-song",
    title: "Lịch sử những khu chợ ven sông và nhịp sống thành phố",
    excerpt: "Từ nơi trao đổi hàng hóa đến điểm hẹn văn hóa, các khu chợ ven sông vẫn giữ nhiều ký ức đô thị.",
    categoryLabel: "Lịch sử và sự kiện",
    author: "Quản Trị Viên",
    authorInitials: "QT",
    authorGradient: "linear-gradient(135deg,#b45309 0%,#f59e0b 100%)",
    publishedAt: "2 giờ trước",
    views: 8100,
    readMinutes: 7,
    likes: 188,
    tags: ["history", "city"],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#78350f 0%,#f59e0b 100%)",
    body: [
      "Các khu chợ ven sông từng là điểm nối giữa giao thương và đời sống hàng ngày. Từ thuyền hàng, bến nước đến những dãy sạp nhỏ, mỗi lớp không gian đều lưu lại một phần ký ức đô thị.",
      "Dù thành phố thay đổi nhanh, nhiều khu chợ vẫn giữ nhịp riêng qua tiếng gọi hàng, món ăn quen và các mối quan hệ lâu năm giữa người bán với người mua.",
      "Bảo tồn ký ức này không chỉ là giữ lại kiến trúc, mà còn là nhìn nhận giá trị của những thói quen cộng đồng đã tạo nên bản sắc nơi chốn.",
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
    slug: "phim-hoat-hinh-ngan-ke-chuyen-khong-loi",
    title: "Phim hoạt hình ngắn và sức mạnh của kể chuyện không lời",
    excerpt: "Nhịp hình, âm thanh và màu sắc có thể dẫn dắt cảm xúc ngay cả khi nhân vật không nói một câu nào.",
    categoryLabel: "Phim & Hoạt hình",
    author: "Lan Chi",
    authorInitials: "LC",
    authorGradient: "linear-gradient(135deg,#be123c 0%,#fb7185 100%)",
    publishedAt: "8 giờ trước",
    views: 7200,
    readMinutes: 5,
    likes: 191,
    tags: ["film", "story"],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#9f1239 0%,#fb7185 100%)",
    body: [
      "Kể chuyện không lời buộc nhà làm phim tập trung vào chuyển động, nhịp dựng và biểu cảm. Khi lời thoại biến mất, mỗi khung hình phải tự mang một phần thông tin.",
      "Âm thanh và màu sắc trở thành công cụ dẫn cảm xúc. Một thay đổi nhỏ trong ánh sáng hoặc tiết tấu cũng có thể làm người xem hiểu được bước ngoặt của nhân vật.",
      "Đó là lý do phim hoạt hình ngắn vẫn có sức nặng dù thời lượng rất ít.",
    ],
  },
  {
    slug: "meo-nha-dau-hieu-di-kham-som",
    title: "Mèo nhà và các dấu hiệu cần đưa đi khám sớm",
    excerpt: "Thay đổi thói quen ăn uống, ngủ nghỉ hoặc vận động thường là tín hiệu chủ nuôi không nên bỏ qua.",
    categoryLabel: "Thú cưng và Động vật",
    author: "Bảo Trân",
    authorInitials: "BT",
    authorGradient: "linear-gradient(135deg,#c2410c 0%,#fb923c 100%)",
    publishedAt: "10 giờ trước",
    views: 4800,
    readMinutes: 3,
    likes: 133,
    tags: ["pet", "care"],
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#9a3412 0%,#fdba74 100%)",
    body: [
      "Mèo thường che giấu sự khó chịu, vì vậy thay đổi nhỏ trong thói quen có thể là tín hiệu quan trọng. Ăn ít, ngủ nhiều bất thường hoặc tránh vận động đều cần được theo dõi.",
      "Chủ nuôi nên ghi lại thời điểm thay đổi, lượng ăn uống và các biểu hiện lạ để trao đổi với bác sĩ thú y dễ hơn.",
      "Khám sớm giúp giảm rủi ro và giữ sức khỏe ổn định cho thú cưng trong dài hạn.",
    ],
  },
  {
    slug: "cong-dong-dia-phuong-du-an-xanh",
    title: "Cộng đồng địa phương trong các dự án xanh",
    excerpt: "Khi cư dân tham gia từ đầu, kế hoạch trồng cây, phân loại rác và giữ vệ sinh công cộng dễ duy trì hơn.",
    categoryLabel: "Con người và Quốc gia",
    author: "Quỳnh Lan",
    authorInitials: "QL",
    authorGradient: "linear-gradient(135deg,#0891b2 0%,#67e8f9 100%)",
    publishedAt: "12 giờ trước",
    views: 10100,
    readMinutes: 6,
    likes: 244,
    tags: ["community", "green"],
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#0e7490 0%,#a5f3fc 100%)",
    body: [
      "Các dự án xanh thường bền hơn khi người dân địa phương được tham gia từ đầu. Họ hiểu rõ thói quen, điểm nghẽn và cách duy trì hoạt động sau giai đoạn khởi động.",
      "Một nhóm nhỏ có thể bắt đầu bằng việc trồng cây, phân loại rác hoặc làm sạch khu vực chung. Điều tạo khác biệt là lịch duy trì rõ ràng và người phụ trách cụ thể.",
      "Khi kết quả được cập nhật bằng hình ảnh và số liệu đơn giản, cộng đồng dễ nhìn thấy tiến triển và tiếp tục tham gia.",
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

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>

<style scoped>
.blog-reader-body {
  display: grid;
  gap: 1.2rem;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
