import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import type { BlogComment, ReadBlogArticle } from "../../domain/types/blog.types"
import {
  findReadArticleBySlug,
  findRelatedReadArticles,
  readArticleExists,
} from "../../domain/services/blog-query.service"
import { useReadBlogDataSource } from "../../infrastructure/adapters/readBlogData.adapter"

export function useReadBlogPage() {
  const route = useRoute()
  const { t, locale } = useI18n()
  const requestURL = useRequestURL()
  const { articles } = useReadBlogDataSource()

  const currentSlug = computed(() => String(route.params.slug ?? ""))
  const article = computed<ReadBlogArticle>(() =>
    findReadArticleBySlug(articles.value, currentSlug.value) ?? articles.value[0] as ReadBlogArticle,
  )
  const articleNotFound = computed(() => !readArticleExists(articles.value, currentSlug.value))

  const liked = ref(false)
  const shareOpen = ref(false)
  const commentText = ref("")
  const buildBaseComments = (): BlogComment[] => [
    {
      id: 1,
      author: "Minh Anh",
      initials: "MA",
      time: t("pages.readBlogPage.comment1Time"),
      body: t("pages.readBlogPage.comment1Body"),
    },
    {
      id: 2,
      author: "Xu Nguyen",
      initials: "XN",
      time: t("pages.readBlogPage.comment2Time"),
      body: t("pages.readBlogPage.comment2Body"),
    },
  ]

  const comments = ref<BlogComment[]>(buildBaseComments())

  watch(currentSlug, () => {
    liked.value = false
    shareOpen.value = false
    commentText.value = ""
    comments.value = buildBaseComments()
  })

  const displayedLikes = computed(() => article.value.likes + (liked.value ? 1 : 0))

  const relatedArticles = computed(() => findRelatedReadArticles(articles.value, article.value))

  const shareUrl = computed(() => new URL(`/read-blog/${article.value.slug}`, requestURL.origin).toString())

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

  const readingProgress = ref(0)

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    readingProgress.value = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0
  }

  const canonicalUrl = computed(() => new URL(route.fullPath || `/read-blog/${currentSlug.value}`, requestURL.origin).toString())
  const seoTitle = computed(() =>
    articleNotFound.value ? `${t("pages.readBlogPage.notFound")} | VNSEEA` : `${article.value.title} | VNSEEA`,
  )
  const seoDescription = computed(() =>
    articleNotFound.value ? t("pages.readBlogPage.notFoundDescription") : article.value.excerpt,
  )

  useSeoMeta({
    title: () => seoTitle.value,
    description: () => seoDescription.value,
    ogTitle: () => seoTitle.value,
    ogDescription: () => seoDescription.value,
    ogUrl: () => canonicalUrl.value,
    ogImage: () => article.value.image,
    ogType: "article",
    robots: () => articleNotFound.value ? "noindex, nofollow" : "index, follow",
  })

  useHead({
    link: [
      {
        rel: "canonical",
        href: canonicalUrl,
      },
    ],
  })

  onMounted(() => {
    window.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress()
  })

  onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress)
  })

  return {
    currentSlug,
    article,
    articleNotFound,
    liked,
    shareOpen,
    commentText,
    comments,
    displayedLikes,
    relatedArticles,
    shareUrl,
    formatCompact,
    addComment,
    readingProgress,
  }
}
