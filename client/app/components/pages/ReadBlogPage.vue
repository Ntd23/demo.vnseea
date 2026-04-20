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
const { t, locale } = useI18n()

const articles = computed(() => [
  {
    slug: "recycled-plastic-granules-market-growth",
    title: t("pages.blogsPage.article1Title"),
    excerpt: t("pages.blogsPage.article1Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryBusiness"),
    author: "Justin",
    authorInitials: "JT",
    authorGradient: "linear-gradient(135deg,#0000ff 0%,#4f7cff 100%)",
    publishedAt: t("pages.blogsPage.article1PublishedAt"),
    views: 18400,
    readMinutes: 5,
    likes: 412,
    tags: ["market", "recycle"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
    body: [
      t("pages.readBlogPage.article1Body1"),
      t("pages.readBlogPage.article1Body2"),
      t("pages.readBlogPage.article1Body3"),
    ],
  },
  {
    slug: "passion-hose-industrial-automotive-needs",
    title: t("pages.blogsPage.article2Title"),
    excerpt: t("pages.blogsPage.article2Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryVehicles"),
    author: "Hoangne",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#334155 0%,#0f172a 100%)",
    publishedAt: t("pages.blogsPage.article2PublishedAt"),
    views: 12600,
    readMinutes: 4,
    likes: 286,
    tags: ["industry", "auto"],
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
    body: [
      t("pages.readBlogPage.article2Body1"),
      t("pages.readBlogPage.article2Body2"),
      t("pages.readBlogPage.article2Body3"),
    ],
  },
  {
    slug: "lop-hoc-so-sau-gio-lam",
    title: t("pages.blogsPage.article3Title"),
    excerpt: t("pages.blogsPage.article3Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryEducation"),
    author: "Dung 1",
    authorInitials: "D1",
    authorGradient: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
    publishedAt: t("pages.blogsPage.article3PublishedAt"),
    views: 9300,
    readMinutes: 6,
    likes: 204,
    tags: ["learning", "career"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#4338ca 0%,#06b6d4 100%)",
    body: [
      t("pages.readBlogPage.article3Body1"),
      t("pages.readBlogPage.article3Body2"),
      t("pages.readBlogPage.article3Body3"),
    ],
  },
  {
    slug: "khong-gian-song-toi-gian",
    title: t("pages.blogsPage.article4Title"),
    excerpt: t("pages.blogsPage.article4Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryLifestyle"),
    author: "Ngoctokyo",
    authorInitials: "NT",
    authorGradient: "linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)",
    publishedAt: t("pages.blogsPage.article4PublishedAt"),
    views: 7600,
    readMinutes: 3,
    likes: 176,
    tags: ["home", "minimal"],
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#0f766e 0%,#99f6e4 100%)",
    body: [
      t("pages.readBlogPage.article4Body1"),
      t("pages.readBlogPage.article4Body2"),
      t("pages.readBlogPage.article4Body3"),
    ],
  },
  {
    slug: "ai-ca-nhan-hoa-luong-doc-tin",
    title: t("pages.blogsPage.article5Title"),
    excerpt: t("pages.blogsPage.article5Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryScience"),
    author: "Nicolas",
    authorInitials: "NC",
    authorGradient: "linear-gradient(135deg,#1e293b 0%,#4f46e5 100%)",
    publishedAt: t("pages.blogsPage.article5PublishedAt"),
    views: 15400,
    readMinutes: 5,
    likes: 520,
    tags: ["ai", "news"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    body: [
      t("pages.readBlogPage.article5Body1"),
      t("pages.readBlogPage.article5Body2"),
      t("pages.readBlogPage.article5Body3"),
    ],
  },
  {
    slug: "cung-duong-cuoi-tuan-gan-bien",
    title: t("pages.blogsPage.article6Title"),
    excerpt: t("pages.blogsPage.article6Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryTravel"),
    author: "Minh Anh",
    authorInitials: "MA",
    authorGradient: "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
    publishedAt: t("pages.blogsPage.article6PublishedAt"),
    views: 6900,
    readMinutes: 4,
    likes: 149,
    tags: ["travel", "weekend"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#0369a1 0%,#7dd3fc 100%)",
    body: [
      t("pages.readBlogPage.article6Body1"),
      t("pages.readBlogPage.article6Body2"),
      t("pages.readBlogPage.article6Body3"),
    ],
  },
  {
    slug: "doi-bong-phong-trao-lich-tap-deu",
    title: t("pages.blogsPage.article7Title"),
    excerpt: t("pages.blogsPage.article7Excerpt"),
    categoryLabel: t("pages.blogsPage.categorySports"),
    author: "Thanh Sơn",
    authorInitials: "TS",
    authorGradient: "linear-gradient(135deg,#15803d 0%,#22c55e 100%)",
    publishedAt: t("pages.blogsPage.article7PublishedAt"),
    views: 5300,
    readMinutes: 4,
    likes: 118,
    tags: ["football", "team"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#22c55e 100%)",
    body: [
      t("pages.readBlogPage.article7Body1"),
      t("pages.readBlogPage.article7Body2"),
      t("pages.readBlogPage.article7Body3"),
    ],
  },
  {
    slug: "game-indie-viet-nhom-phat-trien-nho",
    title: t("pages.blogsPage.article8Title"),
    excerpt: t("pages.blogsPage.article8Excerpt"),
    categoryLabel: t("pages.blogsPage.categoryGaming"),
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#4338ca 0%,#a855f7 100%)",
    publishedAt: t("pages.blogsPage.article8PublishedAt"),
    views: 8800,
    readMinutes: 5,
    likes: 268,
    tags: ["game", "indie"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
    imageFallback: "linear-gradient(135deg,#312e81 0%,#a855f7 100%)",
    body: [
      t("pages.readBlogPage.article8Body1"),
      t("pages.readBlogPage.article8Body2"),
      t("pages.readBlogPage.article8Body3"),
    ],
  },
] satisfies BlogDetail[])

const currentSlug = computed(() => String(route.params.slug ?? ""))
const article = computed(() =>
  articles.value.find(item => item.slug === currentSlug.value) ?? articles.value[0],
)
const articleNotFound = computed(() =>
  !articles.value.some(item => item.slug === currentSlug.value),
)

const liked = ref(false)
const shareOpen = ref(false)
const commentText = ref("")
const comments = ref<BlogComment[]>([
  {
    id: 1,
    author: "Minh Anh",
    initials: "MA",
    time: t("pages.readBlogPage.comment1Time"),
    body: t("pages.readBlogPage.comment1Body"),
  },
  {
    id: 2,
    author: "Xu Nguyễn",
    initials: "XN",
    time: t("pages.readBlogPage.comment2Time"),
    body: t("pages.readBlogPage.comment2Body"),
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
  const sameCategory = articles.value.filter(
    item => item.slug !== article.value.slug && item.categoryLabel === article.value.categoryLabel,
  )
  const fallback = articles.value.filter(item => item.slug !== article.value.slug)

  return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 4)
})

const shareUrl = computed(() => `/read-blog/${article.value.slug}`)

const compactFormatter = computed(() => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
}))

const formatCompact = (value: number) => compactFormatter.value.format(value)

const addComment = () => {
  const body = commentText.value.trim()
  if (!body) return

  comments.value.unshift({
    id: Date.now(),
    author: t("pages.readBlogPage.commenterYou"),
    initials: "BN",
    time: t("pages.readBlogPage.justNow"),
    body,
  })
  commentText.value = ""
}
</script>
