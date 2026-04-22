<template>
  <div class="space-y-5 pb-10">
    <BlogsCreateBlogHero
      :stats="heroStats"
      @quick-fill="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
      <section class="space-y-5">
        <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--color-primary-600)]">
                {{ $t("pages.createBlogPage.editorEyebrow") }}
              </p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                {{ $t("pages.createBlogPage.contentTitle") }}
              </h2>
              <p class="mt-1 text-body-secondary">
                {{ $t("pages.createBlogPage.contentDescription") }}
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-2 text-[12px] font-bold text-[var(--color-primary-600)]">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4" />
              {{ completionText }}
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.titleLabel") }}</span>
            <input
              v-model="title"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.08rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              maxlength="120"
              :placeholder="$t('pages.createBlogPage.titlePlaceholder')"
              type="text"
            >
          </label>

          <div class="mt-7 space-y-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[1.02rem] font-black text-[var(--text-primary)]">
                {{ $t("pages.createBlogPage.contentLabel") }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="action in editorActions"
                  :key="action.label"
                  class="inline-flex h-9 items-center gap-1.5 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 text-[12px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
                  type="button"
                  @click="applyEditorToken(action.token)"
                >
                  <Icon :name="action.icon" class="h-3.5 w-3.5" />
                  {{ action.label }}
                </button>
              </div>
            </div>

            <textarea
              v-model="content"
              class="min-h-[280px] w-full resize-y rounded-[22px] border border-[var(--border-default)] bg-white px-5 py-5 text-[1rem] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              :placeholder="$t('pages.createBlogPage.contentPlaceholder')"
              rows="10"
            />
          </div>

          <div class="mt-7 grid gap-5 md:grid-cols-2">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.categoryLabel") }}</span>
              <select
                v-model="category"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              >
                <option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.tagsLabel") }}</span>
              <input
                v-model="tagsInput"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
                :placeholder="$t('pages.createBlogPage.tagsPlaceholder')"
                type="text"
              >
            </label>
          </div>

          <div class="mt-4 flex min-h-9 flex-wrap gap-2">
            <span
              v-for="tag in tagList"
              :key="tag"
              class="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-primary-600)]"
            >
              #{{ tag }}
            </span>
            <span v-if="tagList.length === 0" class="text-caption-secondary">
              {{ $t("pages.createBlogPage.tagsHelp") }}
            </span>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-[1.02rem] font-black text-[var(--text-primary)]">{{ $t("pages.createBlogPage.thumbnailLabel") }}</p>
            <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label
                class="group flex min-h-[170px] cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-hover)] p-4 text-center transition hover:bg-[var(--color-primary-50)]"
                for="blog-thumbnail"
              >
                <input
                  id="blog-thumbnail"
                  class="sr-only"
                  type="file"
                  accept="image/*"
                  @change="onThumbnailChange"
                >
                <span>
                  <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary-600)] shadow-[var(--shadow-sm)]">
                    <Icon name="i-ph-image-square-fill" class="h-8 w-8" />
                  </span>
                  <span class="mt-3 block text-[13px] font-bold text-[var(--text-primary)]">
                    {{ $t("pages.createBlogPage.chooseThumbnail") }}
                  </span>
                  <span class="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                    {{ thumbnailName || $t("pages.createBlogPage.thumbnailFormats") }}
                  </span>
                </span>
              </label>

              <button
                class="relative min-h-[170px] overflow-hidden rounded-[22px] border border-[var(--border-default)] text-left shadow-[var(--shadow-sm)]"
                type="button"
                @click="cycleThumbnail"
              >
                <div class="absolute inset-0" :style="{ background: thumbnailBackground }" />
                <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.55)_100%)]" />
                <div class="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-white">
                  <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
                    {{ $t("pages.createBlogPage.previewLabel") }}
                  </p>
                  <p class="mt-2 text-[1.1rem] font-black leading-tight">
                    {{ title || $t("pages.createBlogPage.previewTitleFallback") }}
                  </p>
                  <p class="mt-2 text-[12px] text-white/78">
                    {{ $t("pages.createBlogPage.cycleBackground") }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-3 rounded-[28px] border border-[var(--border-default)] bg-white/90 p-4 shadow-[var(--shadow-md)] md:flex-row md:items-center md:justify-between">
          <p class="text-body-secondary">
            {{ submitMessage || $t("pages.createBlogPage.submitHint") }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[14px] font-bold text-[var(--color-primary-600)] transition hover:border-[var(--border-strong)]"
              type="button"
              @click="saveDraft"
            >
              {{ $t("pages.createBlogPage.saveDraft") }}
            </button>
            <button
              class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
              type="button"
              @click="publishMock"
            >
              {{ $t("pages.createBlogPage.publish") }}
            </button>
          </div>
        </section>
      </section>

      <BlogsCreateBlogSidebar
        :title="title"
        :thumbnail-background="thumbnailBackground"
        :selected-category-label="selectedCategoryLabel"
        :read-minutes="readMinutes"
        :tag-list="tagList"
        :preview-excerpt="previewExcerpt"
        :checklist-items="checklistItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
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

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.createBlogPage.seoTitle"),
  description: () => t("pages.createBlogPage.seoDescription"),
})

const title = ref("")
const content = ref("")
const category = ref<BlogCategoryValue>("business")
const tagsInput = ref("")
const thumbnailName = ref("")
const thumbnailIndex = ref(0)
const submitMessage = ref("")

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
  "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
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

const completionCount = computed(() =>
  [
    title.value.trim().length >= 12,
    content.value.trim().length >= 80,
    Boolean(category.value),
    tagList.value.length > 0,
    thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
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
    done: thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
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
</script>
