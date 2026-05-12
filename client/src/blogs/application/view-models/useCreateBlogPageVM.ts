// English description: Owns create-blog draft state, preview derivations, checklist, and backend submit actions.

import type { BlogCreateDraft } from "../../domain/types/blog.types"
import { createApiBlogRepository } from "../../infrastructure/repositories/ApiBlogRepository"

type BlogCategoryValue =
  | "business"
  | "education"
  | "movies"
  | "gaming"
  | "history"
  | "lifestyle"
  | "people"
  | "pets"
  | "science"
  | "sports"
  | "travel"
  | "other"

type CreateBlogSubmitState = "idle" | "saving" | "publishing" | "draft" | "published" | "pending" | "warning" | "error"

export function useCreateBlogPageVM(
  repository = createApiBlogRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()

  const title = ref("")
  const content = ref("")
  const category = ref<BlogCategoryValue>("business")
  const tagsInput = ref("")
  const thumbnailName = ref("")
  const thumbnailFile = ref<File | null>(null)
  const thumbnailIndex = ref(0)
  const submitMessage = ref("")
  const submitState = ref<CreateBlogSubmitState>("idle")

  const categoryOptions = computed(() => [
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
  ] satisfies { label: string; value: BlogCategoryValue }[])

  const editorActions = computed(() => [
    { label: t("pages.createBlogPage.actionBold"), icon: "i-ph-text-b-bold", token: t("pages.createBlogPage.tokenBold") },
    { label: t("pages.createBlogPage.actionHeading"), icon: "i-ph-text-h-bold", token: t("pages.createBlogPage.tokenHeading") },
    { label: t("pages.createBlogPage.actionQuote"), icon: "i-ph-quotes-fill", token: t("pages.createBlogPage.tokenQuote") },
    { label: t("pages.createBlogPage.actionList"), icon: "i-ph-list-bullets-bold", token: t("pages.createBlogPage.tokenList") },
  ] as const)

  const thumbnailBackgrounds = [
    "linear-gradient(135deg,#1e3a8a 0%,#2563eb 46%,#bfdbfe 100%)",
    "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
    "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    "linear-gradient(135deg,#9f1239 0%,#fb7185 100%)",
  ] as const

  const tagList = computed(() =>
    tagsInput.value
      .split(",")
      .map(tag => tag.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 8),
  )

  const selectedCategoryLabel = computed(
    () => categoryOptions.value.find(option => option.value === category.value)?.label ?? t("pages.blogsPage.categoryOther"),
  )

  const thumbnailBackground = computed(
    () => thumbnailBackgrounds[thumbnailIndex.value % thumbnailBackgrounds.length],
  )

  const readMinutes = computed(() => {
    const words = content.value.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 180))
  })

  const hasUploadableThumbnail = computed(() => Boolean(thumbnailFile.value))

  const completionCount = computed(() =>
    [
      title.value.trim().length >= 12,
      content.value.trim().length >= 80,
      Boolean(category.value),
      tagList.value.length > 0,
      hasUploadableThumbnail.value,
    ].filter(Boolean).length,
  )

  const completionText = computed(() => t("pages.createBlogPage.completionText", { count: completionCount.value }))

  const heroStats = computed(() => [
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

  const previewExcerpt = computed(() => {
    const clean = content.value.replace(/[#>*-]/g, "").trim()
    if (!clean) return t("pages.createBlogPage.emptyPreviewExcerpt")
    return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean
  })

  const description = computed(() => previewExcerpt.value.slice(0, 290))

  const isSubmitting = computed(() =>
    submitState.value === "saving" || submitState.value === "publishing",
  )

  const checklistItems = computed(() => [
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
      done: hasUploadableThumbnail.value,
    },
  ])

  const applyEditorToken = (token: string) => {
    content.value = content.value.trim()
      ? `${content.value.trim()}\n\n${token}`
      : token
  }

  const cycleThumbnail = () => {
    thumbnailIndex.value += 1
  }

  const onThumbnailChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    thumbnailName.value = file.name
    thumbnailFile.value = file
    cycleThumbnail()
  }

  const createPayload = (status: BlogCreateDraft["status"]): BlogCreateDraft => ({
    title: title.value.trim(),
    content: content.value.trim(),
    description: description.value,
    category: category.value,
    tags: tagList.value,
    status,
    thumbnailFile: thumbnailFile.value,
  })

  const saveDraft = async () => {
    if (isSubmitting.value) return

    submitMessage.value = t("pages.createBlogPage.savingDraft")
    submitState.value = "saving"

    try {
      await repository.createBlog(createPayload("draft"))

      submitMessage.value = t("pages.createBlogPage.draftSaved")
      submitState.value = "draft"

      toast.add({
        title: t("pages.createBlogPage.draftSavedTitle"),
        description: t("pages.createBlogPage.draftSaved"),
        color: "success",
      })
    }
    catch (error) {
      submitMessage.value = error instanceof Error
        ? error.message
        : t("pages.createBlogPage.submitFailed")
      submitState.value = "error"

      toast.add({
        title: t("pages.createBlogPage.submitFailedTitle"),
        description: submitMessage.value,
        color: "error",
      })
    }
  }

  const publishBlog = async () => {
    if (isSubmitting.value) return

    if (completionCount.value >= 5) {
      submitMessage.value = t("pages.createBlogPage.publishing")
      submitState.value = "publishing"

      try {
        const result = await repository.createBlog(createPayload("publish"))

        if (result.status === "pending") {
          submitMessage.value = t("pages.createBlogPage.publishPending")
          submitState.value = "pending"
        }
        else {
          submitMessage.value = t("pages.createBlogPage.publishComplete")
          submitState.value = "published"
        }

        toast.add({
          title: result.status === "pending"
            ? t("pages.createBlogPage.publishPendingTitle")
            : t("pages.createBlogPage.publishCompleteTitle"),
          description: submitMessage.value,
          color: "success",
        })

        if (result.url) {
          await navigateTo(result.url, { external: result.url.startsWith("http") })
        }
      }
      catch (error) {
        submitMessage.value = error instanceof Error
          ? error.message
          : t("pages.createBlogPage.submitFailed")
        submitState.value = "error"

        toast.add({
          title: t("pages.createBlogPage.submitFailedTitle"),
          description: submitMessage.value,
          color: "error",
        })
      }

      return
    }

    submitMessage.value = t("pages.createBlogPage.publishMissing")
    submitState.value = "warning"
  }

  const quickFillDemo = () => {
    title.value = t("pages.createBlogPage.demoTitle")
    content.value = t("pages.createBlogPage.demoContent")
    category.value = "people"
    tagsInput.value = "community, green, local"
    thumbnailName.value = ""
    thumbnailFile.value = null
    thumbnailIndex.value = 2
    submitMessage.value = ""
    submitState.value = "idle"
  }

  return {
    title,
    content,
    category,
    tagsInput,
    thumbnailName,
    thumbnailFile,
    submitMessage,
    submitState,
    isSubmitting,
    categoryOptions,
    editorActions,
    tagList,
    selectedCategoryLabel,
    thumbnailBackground,
    readMinutes,
    completionText,
    heroStats,
    previewExcerpt,
    checklistItems,
    applyEditorToken,
    cycleThumbnail,
    onThumbnailChange,
    saveDraft,
    publishBlog,
    quickFillDemo,
  }
}
