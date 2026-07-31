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
type BlogValidationField = "title" | "content" | "category" | "tags" | "thumbnail"

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")

const toPlainText = (value: string) =>
  decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/[#>*-]/g, "")
    .replace(/\s+/g, " ")
    .trim()

export function useCreateBlogPageVM(
  repository = createApiBlogRepository(),
  editBlogId?: number,
) {
  const { t } = useI18n()
  const toast = useToast()

  const title = ref("")
  const descriptionInput = ref("")
  const content = ref("")
  const category = ref<BlogCategoryValue>("business")
  const tagsInput = ref("")
  const thumbnailName = ref("")
  const thumbnailFile = ref<File | null>(null)
  const thumbnailPreviewUrl = ref("")
  const thumbnailObjectUrl = ref("")
  const thumbnailIndex = ref(0)
  const submitMessage = ref("")
  const submitState = ref<CreateBlogSubmitState>("idle")
  const validationAttempted = ref(false)
  const isLoadingArticle = ref(Boolean(editBlogId))
  const isEditing = computed(() => Boolean(editBlogId && editBlogId > 0))

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

  const thumbnailBackgrounds = [
    "linear-gradient(135deg,var(--color-primary-900) 0%,var(--bg-brand) 46%,var(--color-primary-200) 100%)",
    "linear-gradient(135deg,#172554 0%,var(--bg-brand-hover) 46%,#7dd3fc 100%)",
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

  const plainContent = computed(() => toPlainText(content.value))

  const readMinutes = computed(() => {
    const words = plainContent.value.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 180))
  })

  const hasUploadableThumbnail = computed(() =>
    Boolean(thumbnailFile.value || (isEditing.value && thumbnailName.value)),
  )

  const completionCount = computed(() =>
    [
      title.value.trim().length >= 12,
      plainContent.value.length >= 80,
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
    const clean = plainContent.value
    if (!clean) return t("pages.createBlogPage.emptyPreviewExcerpt")
    return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean
  })

  const description = computed(() =>
    descriptionInput.value.trim() || previewExcerpt.value.slice(0, 290),
  )

  const isSubmitting = computed(() =>
    submitState.value === "saving" || submitState.value === "publishing",
  )

  const validationErrors = computed<Record<BlogValidationField, string>>(() => {
    if (!validationAttempted.value) {
      return {
        title: "",
        content: "",
        category: "",
        tags: "",
        thumbnail: "",
      }
    }

    return {
      title: title.value.trim().length >= 12
        ? ""
        : t("pages.createBlogPage.titleValidation", { count: title.value.trim().length }),
      content: plainContent.value.length >= 80
        ? ""
        : t("pages.createBlogPage.contentValidation", { count: plainContent.value.length }),
      category: category.value
        ? ""
        : t("pages.createBlogPage.categoryValidation"),
      tags: tagList.value.length > 0
        ? ""
        : t("pages.createBlogPage.tagsValidation"),
      thumbnail: hasUploadableThumbnail.value
        ? ""
        : t("pages.createBlogPage.thumbnailValidation"),
    }
  })

  const invalidValidationFields = computed(() =>
    (Object.entries(validationErrors.value) as Array<[BlogValidationField, string]>)
      .filter(([, message]) => Boolean(message)),
  )

  const submitAlertColor = computed(() => {
    if (submitState.value === "error") return "error" as const
    if (submitState.value === "warning") return "warning" as const
    return "success" as const
  })

  const submitStatusIcon = computed(() => {
    if (submitState.value === "published") return "i-ph-check-circle-fill"
    if (submitState.value === "pending") return "i-ph-clock-countdown-fill"
    if (submitState.value === "draft") return "i-ph-floppy-disk-fill"
    if (submitState.value === "saving" || submitState.value === "publishing") return "i-ph-circle-notch-bold"
    if (submitState.value === "error") return "i-ph-x-circle-fill"
    if (submitState.value === "warning") return "i-ph-warning-circle-fill"
    return "i-ph-info-fill"
  })

  const checklistItems = computed(() => [
    {
      label: t("pages.createBlogPage.checkTitle"),
      description: t("pages.createBlogPage.checkTitleDescription"),
      done: title.value.trim().length >= 12,
    },
    {
      label: t("pages.createBlogPage.checkContent"),
      description: t("pages.createBlogPage.checkContentDescription"),
      done: plainContent.value.length >= 80,
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

  const cycleThumbnail = () => {
    thumbnailIndex.value += 1
  }

  const clearThumbnailObjectUrl = () => {
    if (!thumbnailObjectUrl.value) return

    URL.revokeObjectURL(thumbnailObjectUrl.value)
    thumbnailObjectUrl.value = ""
  }

  const setThumbnailFile = (file: File | null) => {
    if (!file) {
      clearThumbnailObjectUrl()
      thumbnailPreviewUrl.value = ""
      thumbnailName.value = ""
      thumbnailFile.value = null
      return
    }

    clearThumbnailObjectUrl()
    thumbnailObjectUrl.value = URL.createObjectURL(file)
    thumbnailPreviewUrl.value = thumbnailObjectUrl.value
    thumbnailName.value = file.name
    thumbnailFile.value = file
    cycleThumbnail()
  }

  const onThumbnailChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    setThumbnailFile(file)
  }

  const createPayload = (status: BlogCreateDraft["status"]): BlogCreateDraft => ({
    title: title.value.trim(),
    content: content.value.trim(),
    description: description.value.trim(),
    category: category.value,
    tags: tagList.value,
    status,
    thumbnailFile: thumbnailFile.value,
  })

  const loadArticleForEditing = async () => {
    if (!editBlogId) return

    try {
      const article = await repository.getBlogBySlug(String(editBlogId))
      if (!article.mine) throw new Error("Bạn không có quyền chỉnh sửa bài viết này.")

      title.value = article.title
      descriptionInput.value = article.excerpt
      content.value = article.body.join("\n\n")
      category.value = article.category as BlogCategoryValue
      tagsInput.value = article.tags.join(", ")
      thumbnailName.value = article.image ? "Ảnh bìa hiện tại" : ""
      thumbnailPreviewUrl.value = article.image
    }
    catch (error) {
      submitMessage.value = error instanceof Error ? error.message : "Không thể tải bài viết."
      submitState.value = "error"
    }
    finally {
      isLoadingArticle.value = false
    }
  }

  const saveDraft = async () => {
    if (isSubmitting.value) return

    submitMessage.value = t("pages.createBlogPage.savingDraft")
    submitState.value = "saving"

    try {
      const payload = createPayload("draft")
      await (isEditing.value
        ? repository.updateBlog({ ...payload, id: editBlogId! })
        : repository.createBlog(payload))

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

    validationAttempted.value = true

    if (completionCount.value >= 5) {
      submitMessage.value = isEditing.value
        ? t("pages.createBlogPage.updating")
        : t("pages.createBlogPage.publishing")
      submitState.value = "publishing"

      try {
        const payload = createPayload("publish")
        const result = await (isEditing.value
          ? repository.updateBlog({ ...payload, id: editBlogId! })
          : repository.createBlog(payload))

        if (result.status === "pending") {
          submitMessage.value = t("pages.createBlogPage.publishPending")
          submitState.value = "pending"
        }
        else {
          submitMessage.value = isEditing.value
            ? t("pages.createBlogPage.updateComplete")
            : t("pages.createBlogPage.publishComplete")
          submitState.value = "published"
        }
        validationAttempted.value = false

        toast.add({
          title: result.status === "pending"
            ? t("pages.createBlogPage.publishPendingTitle")
            : isEditing.value
              ? t("pages.createBlogPage.updateCompleteTitle")
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

    submitMessage.value = invalidValidationFields.value
      .map(([, message]) => message)
      .join(" ")
    submitState.value = "warning"

    if (import.meta.client) {
      await nextTick()
      const firstField = invalidValidationFields.value[0]?.[0]
      const field = firstField
        ? document.querySelector<HTMLElement>(`[data-blog-field="${firstField}"]`)
        : null
      field?.scrollIntoView({ behavior: "smooth", block: "center" })
      field?.querySelector<HTMLElement>("input, textarea, button, [contenteditable='true']")?.focus()
    }
  }

  const quickFillDemo = () => {
    title.value = t("pages.createBlogPage.demoTitle")
    descriptionInput.value = ""
    content.value = t("pages.createBlogPage.demoContent")
    category.value = "people"
    tagsInput.value = "community, green, local"
    thumbnailName.value = ""
    thumbnailFile.value = null
    clearThumbnailObjectUrl()
    thumbnailPreviewUrl.value = ""
    thumbnailIndex.value = 2
    submitMessage.value = ""
    submitState.value = "idle"
    validationAttempted.value = false
  }

  watch(completionCount, (count) => {
    if (count === 5 && submitState.value === "warning") {
      submitMessage.value = ""
      submitState.value = "idle"
    }
  })

  onBeforeUnmount(clearThumbnailObjectUrl)

  return {
    title,
    descriptionInput,
    content,
    category,
    tagsInput,
    thumbnailName,
    thumbnailFile,
    thumbnailPreviewUrl,
    submitMessage,
    submitState,
    isSubmitting,
    submitStatusIcon,
    submitAlertColor,
    validationErrors,
    isEditing,
    isLoadingArticle,
    categoryOptions,
    tagList,
    selectedCategoryLabel,
    thumbnailBackground,
    readMinutes,
    completionText,
    heroStats,
    previewExcerpt,
    checklistItems,
    cycleThumbnail,
    onThumbnailChange,
    setThumbnailFile,
    saveDraft,
    publishBlog,
    quickFillDemo,
    loadArticleForEditing,
  }
}
