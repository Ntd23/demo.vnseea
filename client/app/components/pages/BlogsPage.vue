<template>
  <div class="space-y-5 pb-10">
    <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,var(--color-primary-600)_0%,#5663d7_55%,var(--color-accent-500)_130%)] px-5 pb-16 pt-7 text-white shadow-[var(--shadow-xl)] sm:px-7 lg:px-8">
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.14)_100%)]" />

      <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-[760px]">
          <p class="text-label-secondary text-white/72">
            P-24 · Blogs
          </p>
          <h1 class="mt-4 text-display text-[2.25rem] leading-[0.95] text-white sm:text-[3rem]">
            Các bài báo gần đây nhất
          </h1>
          <p class="mt-4 max-w-[620px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
            Theo dõi các câu chuyện mới, góc nhìn cộng đồng và những chủ đề đang được quan tâm trên VNSEEA.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <button
              class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] px-5 text-[14px] font-extrabold shadow-[var(--shadow-lg)] transition hover:-translate-y-0.5"
              :class="mineOnly
                ? 'bg-white text-[var(--color-primary-600)]'
                : 'bg-[#fde7b2] text-[#27345f]'"
              type="button"
              @click="mineOnly = !mineOnly"
            >
              <Icon name="i-ph-article-fill" class="mr-2 h-4 w-4" />
              Bài báo của tôi
            </button>

            <NuxtLink
              to="/create-blog"
              class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-white px-5 text-[14px] font-extrabold text-[var(--color-primary-600)] shadow-[var(--shadow-lg)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-pencil-simple-line-fill" class="mr-2 h-4 w-4" />
              Viết blog
            </NuxtLink>

            <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/90">
              <Icon name="i-ph-newspaper-clipping-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ articles.length }} bài đang hiển thị
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
          <div
            v-for="item in heroStats"
            :key="item.label"
            class="rounded-[var(--radius-xl)] border border-white/15 bg-white/10 p-4 backdrop-blur-[6px]"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
              {{ item.label }}
            </p>
            <p class="mt-2 text-[1.6rem] font-black leading-none text-white">
              {{ item.value }}
            </p>
            <p class="mt-1 text-[13px] leading-5 text-white/74">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 -mt-10 rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:p-4">
      <label class="relative block">
        <Icon
          name="i-ph-magnifying-glass"
          class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          v-model="search"
          class="h-14 w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-12 pr-4 text-[15px] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
          placeholder="Tìm kiếm các bài báo"
          type="search"
        >
      </label>

      <div class="mt-4 flex flex-wrap gap-2.5">
        <button
          v-for="category in categoryOptions"
          :key="category.value"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-bold transition duration-150"
          :class="selectedCategory === category.value
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="selectedCategory = category.value"
        >
          <Icon :name="category.icon" class="h-4 w-4" />
          {{ category.label }}
        </button>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section class="space-y-4">
        <div class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 px-4 py-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              Kết quả
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              {{ resultHeading }}
            </h2>
            <p class="mt-1 text-body-secondary">
              {{ filteredArticles.length }} bài viết phù hợp · {{ currentSortLabel }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label class="sr-only" for="blog-sort">Sắp xếp</label>
            <select
              id="blog-sort"
              v-model="sortBy"
              class="h-11 rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
              Đặt lại
            </button>
          </div>
        </div>

        <div
          v-if="pageArticles.length > 0"
          class="grid gap-4 md:grid-cols-2"
        >
          <article
            v-for="article in pageArticles"
            :key="article.id"
            class="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
          >
            <NuxtLink :to="article.href" class="block">
              <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
                <div class="absolute inset-0" :style="{ background: article.imageFallback }" />
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                  loading="lazy"
                  @error="handleImageError"
                >
                <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(15,23,42,0.56)_100%)]" />

                <div class="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span class="rounded-[10px] bg-[#101828]/82 px-2.5 py-1 text-[11px] font-bold text-white">
                    {{ article.categoryLabel }}
                  </span>
                  <span
                    v-if="article.mine"
                    class="rounded-[10px] bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[4px]"
                  >
                    Của tôi
                  </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                  <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-[4px]">
                    <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5" />
                    {{ formatCompact(article.views) }}
                  </div>
                  <div class="rounded-[var(--radius-full)] bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
                    {{ article.readMinutes }} phút đọc
                  </div>
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-start gap-3">
                  <div
                    class="avatar-md shrink-0 text-white"
                    :style="{ background: article.authorGradient }"
                  >
                    {{ article.authorInitials }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="blog-card-title text-[1.1rem] font-black leading-tight tracking-[-0.035em] text-[var(--text-primary)]">
                      {{ article.title }}
                    </h3>
                    <p class="mt-1 text-caption-secondary">
                      {{ article.author }} · {{ article.publishedAt }}
                    </p>
                  </div>
                </div>

                <p class="mt-3 min-h-[72px] text-[13px] leading-6 text-[var(--text-secondary)]">
                  {{ article.excerpt }}
                </p>

                <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in article.tags"
                      :key="tag"
                      class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                  <span class="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--color-primary-600)]">
                    Đọc tiếp
                    <Icon name="i-ph-arrow-right-bold" class="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <div
          v-else
          class="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-white/90 px-6 py-12 text-center shadow-[var(--shadow-md)]"
        >
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Icon name="i-ph-newspaper-clipping-fill" class="h-7 w-7" />
          </div>
          <h3 class="mt-4 text-[1.3rem] font-black tracking-[-0.04em] text-[var(--text-primary)]">
            Chưa có bài phù hợp
          </h3>
          <p class="mx-auto mt-2 max-w-[460px] text-body-secondary">
            Hãy đổi từ khóa, chọn lại chủ đề hoặc bỏ lọc bài báo của tôi.
          </p>
          <button
            class="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            type="button"
            @click="resetFilters"
          >
            <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
            Xem tất cả
          </button>
        </div>

        <nav
          v-if="filteredArticles.length > pageSize"
          class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 p-3 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
          aria-label="Phân trang blogs"
        >
          <p class="text-caption-secondary px-2">
            Trang {{ currentPage }} / {{ totalPages }}
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              class="blog-page-btn"
              :disabled="currentPage === 1"
              type="button"
              @click="currentPage -= 1"
            >
              Trước
            </button>
            <button
              v-for="page in visiblePageNumbers"
              :key="page"
              class="blog-page-btn"
              :class="currentPage === page ? 'blog-page-btn--active' : ''"
              type="button"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button
              class="blog-page-btn"
              :disabled="currentPage === totalPages"
              type="button"
              @click="currentPage += 1"
            >
              Sau
            </button>
          </div>
        </nav>
      </section>

      <aside class="space-y-4">
        <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Chủ đề nổi bật
          </p>
          <div class="mt-4 space-y-2.5">
            <button
              v-for="topic in trendingTopics"
              :key="topic.value"
              class="flex w-full items-center justify-between rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 py-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
              type="button"
              @click="selectedCategory = topic.value"
            >
              <span class="flex min-w-0 items-center gap-2">
                <Icon :name="topic.icon" class="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
                <span class="truncate text-[13px] font-bold text-[var(--text-primary)]">
                  {{ topic.label }}
                </span>
              </span>
              <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
                {{ topic.count }}
              </span>
            </button>
          </div>
        </section>

        <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--color-primary-50)_100%)] p-4 shadow-[var(--shadow-md)]">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            Tác giả tuần này
          </p>
          <div class="mt-4 space-y-3">
            <div
              v-for="author in featuredAuthors"
              :key="author.name"
              class="flex items-center gap-3"
            >
              <div class="avatar-md text-white" :style="{ background: author.gradient }">
                {{ author.initials }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-[13px] font-bold text-[var(--text-primary)]">
                  {{ author.name }}
                </p>
                <p class="text-caption-secondary">
                  {{ author.count }} bài · {{ author.topic }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
type BlogCategory =
  | "all"
  | "vehicles"
  | "comedy"
  | "business"
  | "education"
  | "entertainment"
  | "movies"
  | "gaming"
  | "history"
  | "lifestyle"
  | "nature"
  | "politics"
  | "people"
  | "pets"
  | "places"
  | "science"
  | "sports"
  | "travel"
  | "other"

type SortValue = "latest" | "popular" | "views" | "reading"

type BlogArticle = {
  id: number
  title: string
  excerpt: string
  category: Exclude<BlogCategory, "all">
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  publishedAt: string
  publishedHoursAgo: number
  views: number
  readMinutes: number
  likes: number
  tags: string[]
  image: string
  imageFallback: string
  href: string
  mine?: boolean
}

useSeoMeta({
  title: "Blogs | VNSEEA",
  description: "Danh sách bài báo mới, chủ đề nổi bật và các bài viết cộng đồng trên VNSEEA.",
})

const route = useRoute()

const search = ref("")
const selectedCategory = ref<BlogCategory>("all")
const sortBy = ref<SortValue>("latest")
const currentPage = ref(1)
const mineOnly = ref(route.query.mine === "1")
const pageSize = 6

watch(() => route.query.mine, (value) => {
  mineOnly.value = value === "1"
})

watch([search, selectedCategory, sortBy, mineOnly], () => {
  currentPage.value = 1
})

const categoryOptions = [
  { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
  { label: "Ô tô và Xe cộ", value: "vehicles", icon: "i-ph-car-profile" },
  { label: "Hài kịch", value: "comedy", icon: "i-ph-smiley" },
  { label: "Kinh tế và Thương mại", value: "business", icon: "i-ph-trend-up" },
  { label: "Giáo dục", value: "education", icon: "i-ph-graduation-cap" },
  { label: "Giải trí", value: "entertainment", icon: "i-ph-confetti" },
  { label: "Phim & Hoạt hình", value: "movies", icon: "i-ph-film-slate" },
  { label: "Chơi game", value: "gaming", icon: "i-ph-game-controller" },
  { label: "Lịch sử và sự kiện", value: "history", icon: "i-ph-landmark" },
  { label: "Cách sống", value: "lifestyle", icon: "i-ph-house-line" },
  { label: "Thiên nhiên", value: "nature", icon: "i-ph-leaf" },
  { label: "Tin tức và Chính trị", value: "politics", icon: "i-ph-megaphone" },
  { label: "Con người và Quốc gia", value: "people", icon: "i-ph-globe-hemisphere-east" },
  { label: "Thú cưng và Động vật", value: "pets", icon: "i-ph-paw-print" },
  { label: "Địa điểm và Khu vực", value: "places", icon: "i-ph-map-pin" },
  { label: "Khoa học và Công nghệ", value: "science", icon: "i-ph-microscope" },
  { label: "Thể thao", value: "sports", icon: "i-ph-soccer-ball" },
  { label: "Du lịch và Sự kiện", value: "travel", icon: "i-ph-airplane-tilt" },
  { label: "Khác", value: "other", icon: "i-ph-dots-three-circle" },
] satisfies { label: string; value: BlogCategory; icon: string }[]

const sortOptions = [
  { label: "Mới nhất", value: "latest" },
  { label: "Được quan tâm", value: "popular" },
  { label: "Nhiều lượt xem", value: "views" },
  { label: "Đọc nhanh", value: "reading" },
] satisfies { label: string; value: SortValue }[]

const articles = [
  {
    id: 1,
    title: "Recycled Plastic Granules Market Growth Accelerates with Global Sustainability Initiatives",
    excerpt: "Các doanh nghiệp tái chế đang mở rộng chuỗi cung ứng nhựa hạt, tập trung vào tiêu chuẩn xanh và hợp đồng dài hạn.",
    category: "business",
    categoryLabel: "Kinh tế và Thương mại",
    author: "Justin",
    authorInitials: "JT",
    authorGradient: "linear-gradient(135deg,#0000ff 0%,#4f7cff 100%)",
    publishedAt: "15 phút trước",
    publishedHoursAgo: 0.25,
    views: 18400,
    readMinutes: 5,
    likes: 412,
    tags: ["market", "recycle"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
    href: "/read-blog/recycled-plastic-granules-market-growth",
    mine: true,
  },
  {
    id: 2,
    title: "Passion Hose: Your Trusted Gas Hose Manufacturer for Industrial and Automotive Needs",
    excerpt: "Một góc nhìn về tiêu chuẩn an toàn, kiểm định vật liệu và cách doanh nghiệp lựa chọn nhà sản xuất ống dẫn khí.",
    category: "vehicles",
    categoryLabel: "Ô tô và Xe cộ",
    author: "Hoangne",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#334155 0%,#0f172a 100%)",
    publishedAt: "42 phút trước",
    publishedHoursAgo: 0.7,
    views: 12600,
    readMinutes: 4,
    likes: 286,
    tags: ["industry", "auto"],
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
    href: "/read-blog/passion-hose-industrial-automotive-needs",
  },
  {
    id: 3,
    title: "Lớp học số sau giờ làm: cách người trẻ nâng kỹ năng mỗi tuần",
    excerpt: "Những khóa học ngắn, nhóm học nhỏ và tài liệu mở giúp người đi làm duy trì nhịp học tập bền hơn.",
    category: "education",
    categoryLabel: "Giáo dục",
    author: "Dung 1",
    authorInitials: "D1",
    authorGradient: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
    publishedAt: "1 giờ trước",
    publishedHoursAgo: 1,
    views: 9300,
    readMinutes: 6,
    likes: 204,
    tags: ["learning", "career"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#4338ca 0%,#06b6d4 100%)",
    href: "/read-blog/lop-hoc-so-sau-gio-lam",
  },
  {
    id: 4,
    title: "Lịch sử những khu chợ ven sông và nhịp sống thành phố",
    excerpt: "Từ nơi trao đổi hàng hóa đến điểm hẹn văn hóa, các khu chợ ven sông vẫn giữ nhiều ký ức đô thị.",
    category: "history",
    categoryLabel: "Lịch sử và sự kiện",
    author: "Quản Trị Viên",
    authorInitials: "QT",
    authorGradient: "linear-gradient(135deg,#b45309 0%,#f59e0b 100%)",
    publishedAt: "2 giờ trước",
    publishedHoursAgo: 2,
    views: 8100,
    readMinutes: 7,
    likes: 188,
    tags: ["history", "city"],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#78350f 0%,#f59e0b 100%)",
    href: "/read-blog/lich-su-khu-cho-ven-song",
    mine: true,
  },
  {
    id: 5,
    title: "Không gian sống tối giản cho căn hộ nhỏ",
    excerpt: "Một số lựa chọn ánh sáng, lưu trữ và màu sắc giúp căn hộ nhỏ gọn gàng nhưng vẫn có cá tính riêng.",
    category: "lifestyle",
    categoryLabel: "Cách sống",
    author: "Ngoctokyo",
    authorInitials: "NT",
    authorGradient: "linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)",
    publishedAt: "3 giờ trước",
    publishedHoursAgo: 3,
    views: 7600,
    readMinutes: 3,
    likes: 176,
    tags: ["home", "minimal"],
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0f766e 0%,#99f6e4 100%)",
    href: "/read-blog/khong-gian-song-toi-gian",
  },
  {
    id: 6,
    title: "Bản tin công nghệ: AI cá nhân hóa luồng đọc tin",
    excerpt: "Các hệ thống gợi ý mới ưu tiên ngữ cảnh, sở thích và lịch sử tương tác thay vì chỉ dựa trên lượt xem.",
    category: "science",
    categoryLabel: "Khoa học và Công nghệ",
    author: "Nicolas",
    authorInitials: "NC",
    authorGradient: "linear-gradient(135deg,#1e293b 0%,#4f46e5 100%)",
    publishedAt: "4 giờ trước",
    publishedHoursAgo: 4,
    views: 15400,
    readMinutes: 5,
    likes: 520,
    tags: ["ai", "news"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    href: "/read-blog/ai-ca-nhan-hoa-luong-doc-tin",
  },
  {
    id: 7,
    title: "Những cung đường cuối tuần gần biển",
    excerpt: "Gợi ý các điểm dừng dễ đi, lịch trình ngắn và cách chuẩn bị để chuyến đi nhẹ nhàng hơn.",
    category: "travel",
    categoryLabel: "Du lịch và Sự kiện",
    author: "Minh Anh",
    authorInitials: "MA",
    authorGradient: "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
    publishedAt: "5 giờ trước",
    publishedHoursAgo: 5,
    views: 6900,
    readMinutes: 4,
    likes: 149,
    tags: ["travel", "weekend"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0369a1 0%,#7dd3fc 100%)",
    href: "/read-blog/cung-duong-cuoi-tuan-gan-bien",
  },
  {
    id: 8,
    title: "Đội bóng phong trào và cách giữ lịch tập đều",
    excerpt: "Quản lý sân bãi, chia vai trò và theo dõi thể lực giúp các đội nghiệp dư giữ nhịp thi đấu ổn định.",
    category: "sports",
    categoryLabel: "Thể thao",
    author: "Thanh Sơn",
    authorInitials: "TS",
    authorGradient: "linear-gradient(135deg,#15803d 0%,#22c55e 100%)",
    publishedAt: "6 giờ trước",
    publishedHoursAgo: 6,
    views: 5300,
    readMinutes: 4,
    likes: 118,
    tags: ["football", "team"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#22c55e 100%)",
    href: "/read-blog/doi-bong-phong-trao-lich-tap-deu",
  },
  {
    id: 9,
    title: "Phim hoạt hình ngắn và sức mạnh của kể chuyện không lời",
    excerpt: "Nhịp hình, âm thanh và màu sắc có thể dẫn dắt cảm xúc ngay cả khi nhân vật không nói một câu nào.",
    category: "movies",
    categoryLabel: "Phim & Hoạt hình",
    author: "Lan Chi",
    authorInitials: "LC",
    authorGradient: "linear-gradient(135deg,#be123c 0%,#fb7185 100%)",
    publishedAt: "8 giờ trước",
    publishedHoursAgo: 8,
    views: 7200,
    readMinutes: 5,
    likes: 191,
    tags: ["film", "story"],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#9f1239 0%,#fb7185 100%)",
    href: "/read-blog/phim-hoat-hinh-ngan-ke-chuyen-khong-loi",
  },
  {
    id: 10,
    title: "Mèo nhà và các dấu hiệu cần đưa đi khám sớm",
    excerpt: "Thay đổi thói quen ăn uống, ngủ nghỉ hoặc vận động thường là tín hiệu chủ nuôi không nên bỏ qua.",
    category: "pets",
    categoryLabel: "Thú cưng và Động vật",
    author: "Bảo Trân",
    authorInitials: "BT",
    authorGradient: "linear-gradient(135deg,#c2410c 0%,#fb923c 100%)",
    publishedAt: "10 giờ trước",
    publishedHoursAgo: 10,
    views: 4800,
    readMinutes: 3,
    likes: 133,
    tags: ["pet", "care"],
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#9a3412 0%,#fdba74 100%)",
    href: "/read-blog/meo-nha-dau-hieu-di-kham-som",
  },
  {
    id: 11,
    title: "Cộng đồng địa phương trong các dự án xanh",
    excerpt: "Khi cư dân tham gia từ đầu, kế hoạch trồng cây, phân loại rác và giữ vệ sinh công cộng dễ duy trì hơn.",
    category: "people",
    categoryLabel: "Con người và Quốc gia",
    author: "Quỳnh Lan",
    authorInitials: "QL",
    authorGradient: "linear-gradient(135deg,#0891b2 0%,#67e8f9 100%)",
    publishedAt: "12 giờ trước",
    publishedHoursAgo: 12,
    views: 10100,
    readMinutes: 6,
    likes: 244,
    tags: ["community", "green"],
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0e7490 0%,#a5f3fc 100%)",
    href: "/read-blog/cong-dong-dia-phuong-du-an-xanh",
  },
  {
    id: 12,
    title: "Game indie Việt và những nhóm phát triển nhỏ",
    excerpt: "Từ prototype cuối tuần đến bản phát hành đầu tiên, các nhóm nhỏ đang tìm cách kể câu chuyện rất riêng.",
    category: "gaming",
    categoryLabel: "Chơi game",
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#4338ca 0%,#a855f7 100%)",
    publishedAt: "Hôm qua",
    publishedHoursAgo: 24,
    views: 8800,
    readMinutes: 5,
    likes: 268,
    tags: ["game", "indie"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#312e81 0%,#a855f7 100%)",
    href: "/read-blog/game-indie-viet-nhom-phat-trien-nho",
    mine: true,
  },
] satisfies BlogArticle[]

const heroStats = computed(() => [
  {
    label: "Bài mới hôm nay",
    value: String(articles.filter(article => article.publishedHoursAgo <= 12).length),
    description: "Các bài đã được cập nhật trong ngày.",
  },
  {
    label: "Chủ đề",
    value: String(categoryOptions.length - 1),
    description: "Danh mục theo luồng nội dung hiện có.",
  },
  {
    label: "Của tôi",
    value: String(articles.filter(article => article.mine).length),
    description: "Bài báo bạn có thể lọc nhanh.",
  },
])

const currentSortLabel = computed(
  () => sortOptions.find(option => option.value === sortBy.value)?.label ?? "Mới nhất",
)

const resultHeading = computed(() => {
  if (mineOnly.value) return "Bài báo của tôi"
  if (selectedCategory.value === "all") return "Danh sách bài báo đang được quan tâm"
  return categoryOptions.find(category => category.value === selectedCategory.value)?.label ?? "Danh sách bài báo"
})

const filteredArticles = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filtered = articles.filter((article) => {
    const matchesKeyword = keyword.length === 0 || [
      article.title,
      article.excerpt,
      article.categoryLabel,
      article.author,
      ...article.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory =
      selectedCategory.value === "all" || article.category === selectedCategory.value

    const matchesMine = !mineOnly.value || article.mine

    return matchesKeyword && matchesCategory && matchesMine
  })

  return filtered.slice().sort((left, right) => {
    switch (sortBy.value) {
      case "popular":
        return right.likes - left.likes || right.views - left.views
      case "views":
        return right.views - left.views
      case "reading":
        return left.readMinutes - right.readMinutes
      case "latest":
      default:
        return left.publishedHoursAgo - right.publishedHoursAgo
    }
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / pageSize)))

const pageArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const visiblePageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)

const trendingTopics = computed(() =>
  categoryOptions
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: articles.filter(article => article.category === category.value).length,
    }))
    .filter(topic => topic.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"))
    .slice(0, 6),
)

const featuredAuthors = computed(() =>
  articles
    .slice()
    .sort((left, right) => right.likes - left.likes)
    .slice(0, 4)
    .map(article => ({
      name: article.author,
      initials: article.authorInitials,
      gradient: article.authorGradient,
      count: articles.filter(item => item.author === article.author).length,
      topic: article.categoryLabel,
    })),
)

const compactFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const formatCompact = (value: number) => compactFormatter.format(value)

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  sortBy.value = "latest"
  mineOnly.value = false
  currentPage.value = 1
}

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>

<style scoped>
.blog-card-title {
  display: -webkit-box;
  min-height: 2.75rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.blog-page-btn {
  display: inline-flex;
  min-width: 42px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  padding: 0 12px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  transition: all var(--duration-fast) var(--ease-default);
}

.blog-page-btn:hover:not(:disabled),
.blog-page-btn--active {
  border-color: var(--border-strong);
  background: var(--color-primary-500);
  color: var(--text-inverse);
}

.blog-page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
