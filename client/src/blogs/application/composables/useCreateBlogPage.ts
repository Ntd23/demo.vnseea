import { computed, ref } from "vue"
import type {
  BlogEditorAction,
  BlogOption,
  BlogStat,
  CreateBlogCategoryValue,
  CreateBlogChecklistItem,
} from "../../domain/types/blog.types"
import {
  appendEditorToken,
  calculateBlogReadMinutes,
  calculateCreateBlogCompletion,
  createBlogPreviewExcerpt,
  parseBlogTags,
} from "../../domain/services/create-blog.service"

const thumbnailBackgrounds = [
  "linear-gradient(135deg,#1e3a8a 0%,#2563eb 46%,#bfdbfe 100%)",
  "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
  "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
  "linear-gradient(135deg,#9f1239 0%,#fb7185 100%)",
] as const

export function useCreateBlogPage() {
  const { t } = useI18n()

  const title = ref("")
  const content = ref("")
  const category = ref<CreateBlogCategoryValue>("business")
  const tagsInput = ref("")
  const thumbnailName = ref("")
  const thumbnailIndex = ref(0)
  const submitMessage = ref("")

  const categoryOptions = computed<BlogOption<CreateBlogCategoryValue>[]>(() => [
    { label: t("pages.blogsPage.categoryBusiness"), value: "business" },
    { label: t("pages.blogsPage.categoryEducation"), value: "education" },
    { label: t("pages.blogsPage.categoryMovies"), value: "movies" },
    { label: t("pages.blogsPage.categoryGaming"), value: "gaming" },
    { label: t("pages.blogsPage.categoryHistory"), value: "history" },
    { label: t("pages.blogsPage.categoryLifestyle"), value: "lifestyle" },
    { label: t("pages.blogsPage.categoryPeople"), value: "people" },
    { label: t("pages.blogsPage.categoryPets"), value: "pets" },
    { label: t("pages.blogsPage.categoryScience"), value: "science" },
    { label: t("pages.blogsPage.categorySports"), value: "sports" },
    { label: t("pages.blogsPage.categoryTravel"), value: "travel" },
    { label: t("pages.blogsPage.categoryOther"), value: "other" },
  ])

  const editorActions = computed<BlogEditorAction[]>(() => [
    { label: t("pages.createBlogPage.actionBold"), icon: "i-ph-text-b-bold", token: t("pages.createBlogPage.tokenBold") },
    { label: t("pages.createBlogPage.actionHeading"), icon: "i-ph-text-h-bold", token: t("pages.createBlogPage.tokenHeading") },
    { label: t("pages.createBlogPage.actionQuote"), icon: "i-ph-quotes-fill", token: t("pages.createBlogPage.tokenQuote") },
    { label: t("pages.createBlogPage.actionList"), icon: "i-ph-list-bullets-bold", token: t("pages.createBlogPage.tokenList") },
  ])

  const tagList = computed(() => parseBlogTags(tagsInput.value))

  const selectedCategoryLabel = computed(
    () => categoryOptions.value.find(option => option.value === category.value)?.label ?? t("pages.blogsPage.categoryOther"),
  )

  const thumbnailBackground = computed(
    () => thumbnailBackgrounds[thumbnailIndex.value % thumbnailBackgrounds.length],
  )

  const readMinutes = computed(() => calculateBlogReadMinutes(content.value))

  const completionCount = computed(() =>
    calculateCreateBlogCompletion({
      title: title.value,
      content: content.value,
      category: category.value,
      tags: tagList.value,
      hasThumbnail: thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
    }),
  )

  const completionText = computed(() => t("pages.createBlogPage.completionText", { count: completionCount.value }))

  const heroStats = computed<BlogStat[]>(() => [
    {
      label: t("pages.createBlogPage.statCompletion"),
      value: `${completionCount.value}/5`,
      description: t("pages.createBlogPage.statCompletionDescription"),
    },
    {
      label: t("pages.createBlogPage.statReading"),
      value: t("pages.createBlogPage.statReadingValue", { count: readMinutes.value }),
      description: t("pages.createBlogPage.statReadingDescription"),
    },
    {
      label: t("pages.createBlogPage.tagsLabel"),
      value: String(tagList.value.length),
      description: t("pages.createBlogPage.statTagsDescription"),
    },
  ])

  const previewExcerpt = computed(() =>
    createBlogPreviewExcerpt(content.value, t("pages.createBlogPage.emptyPreviewExcerpt")),
  )

  const checklistItems = computed<CreateBlogChecklistItem[]>(() => [
    {
      label: t("pages.createBlogPage.checkTitle"),
      description: t("pages.createBlogPage.checkTitleDescription"),
      done: title.value.trim().length >= 12,
    },
    {
      label: t("pages.createBlogPage.checkContent"),
      description: t("pages.createBlogPage.checkContentDescription"),
      done: content.value.trim().length >= 80,
    },
    {
      label: t("pages.createBlogPage.checkTopicTags"),
      description: t("pages.createBlogPage.checkTopicTagsDescription"),
      done: Boolean(category.value) && tagList.value.length > 0,
    },
    {
      label: t("pages.createBlogPage.checkThumbnail"),
      description: t("pages.createBlogPage.checkThumbnailDescription"),
      done: thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
    },
  ])

  const applyEditorToken = (token: string) => {
    content.value = appendEditorToken(content.value, token)
  }

  const cycleThumbnail = () => {
    thumbnailIndex.value += 1
  }

  const onThumbnailChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    thumbnailName.value = file.name
    cycleThumbnail()
  }

  const saveDraft = () => {
    submitMessage.value = t("pages.createBlogPage.draftSaved")
  }

  const publishMock = () => {
    submitMessage.value = completionCount.value >= 5
      ? t("pages.createBlogPage.publishComplete")
      : t("pages.createBlogPage.publishMissing")
  }

  const quickFillDemo = () => {
    title.value = t("pages.createBlogPage.demoTitle")
    content.value = t("pages.createBlogPage.demoContent")
    category.value = "people"
    tagsInput.value = "community, green, local"
    thumbnailName.value = "community-green.jpg"
    thumbnailIndex.value = 2
    submitMessage.value = ""
  }

  return {
    title,
    content,
    category,
    tagsInput,
    thumbnailName,
    thumbnailIndex,
    submitMessage,
    categoryOptions,
    editorActions,
    tagList,
    selectedCategoryLabel,
    thumbnailBackground,
    readMinutes,
    completionCount,
    completionText,
    heroStats,
    previewExcerpt,
    checklistItems,
    applyEditorToken,
    cycleThumbnail,
    onThumbnailChange,
    saveDraft,
    publishMock,
    quickFillDemo,
  }
}
