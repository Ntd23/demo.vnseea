// English description: Owns read-blog article resolution, reactions, comments, related content, and reading progress.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useMockReadBlogData } from "../composables/useMockReadBlogData"
import type { BlogComment } from "../../domain/types/blog.types"

export function useReadBlogPageVM() {
  const route = useRoute()
  const { t, locale } = useI18n()
  const requestURL = useRequestURL()
  const { articles } = useMockReadBlogData()

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

  const relatedArticles = computed(() => {
    const sameCategory = articles.value.filter(
      item => item.slug !== article.value.slug && item.categoryLabel === article.value.categoryLabel,
    )
    const fallback = articles.value.filter(item => item.slug !== article.value.slug)

    return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 4)
  })

  const shareUrl = computed(() =>
    new URL(appRoutes.readBlog(article.value.slug), requestURL.origin).toString(),
  )

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

  onMounted(() => {
    window.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress()
  })

  onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress)
  })

  return {
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
