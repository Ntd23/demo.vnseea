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
type BlogComment = {
  id: number
  author: string
  initials: string
  time: string
  body: string
}

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
</script>
