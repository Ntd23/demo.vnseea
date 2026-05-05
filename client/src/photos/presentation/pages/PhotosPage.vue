<!-- Description: Renders the photos page as a media-first grid with lightweight album navigation, aligned to the legacy media flow. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t('pages.photosPage.heroEyebrow') }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t('pages.photosPage.heroTitle') }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t('pages.photosPage.heroDescription') }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="item in heroStats"
            :key="item.label"
            class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ item.label }}</p>
            <p class="mt-2 text-[1.55rem] font-black text-[var(--text-primary)]">{{ item.value }}</p>
            <p class="mt-2 text-[13px] leading-6 text-slate-500">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <PhotosFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.photosPage.searchPlaceholder')"
    />

    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
      <section class="min-w-0 space-y-5">
        <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <NuxtLink
            v-for="album in albums"
            :key="album.title"
            :to="album.to"
            class="min-w-[240px] shrink-0 rounded-[18px] border border-[#dbe3f2] bg-white p-4 shadow-[0_8px_20px_rgba(15,35,110,0.04)] transition hover:-translate-y-0.5"
          >
            <h2 class="text-base font-black text-[var(--text-primary)]">{{ album.title }}</h2>
            <p class="mt-2 text-[13px] leading-6 text-slate-500">{{ album.description }}</p>
            <p class="mt-3 text-[12px] font-bold text-primary-700">
              {{ t("pages.photosPage.albumCount", { count: album.count }) }}
            </p>
          </NuxtLink>
        </div>

        <section class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                {{ t("pages.photosPage.resultEyebrow") }}
              </p>
              <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
                {{ resultHeading }}
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                {{ t("pages.photosPage.resultCount", { count: filteredPhotos.length }) }}
              </p>
            </div>

            <button
              class="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-4 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4" />
              {{ t("pages.photosPage.resetFilters") }}
            </button>
          </div>
        </section>

        <section
          v-if="loading"
          class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
        >
          <div class="flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
            <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
            <span>{{ t("pages.photosPage.heroEyebrow") }}</span>
          </div>
        </section>

        <section
          v-else-if="filteredPhotos.length === 0"
          class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
        >
          <FoundationEmptyState
            icon="i-ph-images-square"
            :title="t('pages.photosPage.emptyTitle')"
            :description="t('pages.photosPage.emptyDescription')"
          />
        </section>

        <div v-else class="columns-1 gap-4 sm:columns-2 xl:columns-3">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            class="mb-4 break-inside-avoid"
          >
            <PhotosCard
              :photo="photo"
              :photographer-label="t('pages.photosPage.photographerLabel')"
              :open-label="t('pages.photosPage.cardPrimaryAction')"
              :detail-label="t('pages.photosPage.cardSecondaryAction')"
              @open="openPhoto"
            />
          </div>
        </div>
      </section>

      <PhotosSidebar
        :hashtags="topTags"
        :hashtags-eyebrow="t('pages.photosPage.sidebarHashtagsEyebrow')"
        :hashtags-title="t('pages.photosPage.sidebarHashtagsTitle')"
        :creators="topCreators"
        :creators-eyebrow="t('pages.photosPage.sidebarCreatorsEyebrow')"
        :creators-title="t('pages.photosPage.sidebarCreatorsTitle')"
        :quick-links="quickLinks"
        :links-eyebrow="t('pages.photosPage.sidebarLinksEyebrow')"
        :links-title="t('pages.photosPage.sidebarLinksTitle')"
      />
    </div>

    <LightboxModal
      :open="lightboxOpen"
      :items="lightboxItems"
      :current-index="currentLightboxIndex"
      :title="currentPhoto?.title || ''"
      :description="currentPhoto?.location || ''"
      :author="currentPhoto?.photographer || ''"
      :caption="currentPhoto?.albumTitle || ''"
      @close="lightboxOpen = false"
      @change="currentPhotoId = filteredPhotos[$event]?.id ?? filteredPhotos[0]?.id ?? ''"
      @share="currentPhoto?.companionTo ? navigateTo(currentPhoto.companionTo) : null"
      @download="noop"
      @like="noop"
      @comment="currentPhoto?.companionTo ? navigateTo(currentPhoto.companionTo) : null"
    />
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { createHashtagPath, formatHashtagLabel } from "../../../feed/application/composables/useHashtagData"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import LightboxModal from "../../../lightbox/presentation/components/LightboxModal.vue"
import PhotosCard from "../components/Card.vue"
import PhotosFilters from "../components/Filters.vue"
import PhotosSidebar from "../components/Sidebar.vue"
import type { PhotoCategoryKey, PhotoRecord } from "../../application/composables/usePhotosData"
import { buildPhotoAlbums, formatPhotoNumber, getPhotoEngagement, mapFeedPostsToPhotos, usePhotoCategories, usePhotoQuickLinks } from "../../application/composables/usePhotosData"

const accentPalette = [
  "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
  "linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)",
  "linear-gradient(135deg,#ea580c 0%,#fb923c 100%)",
]

const { t, locale } = useI18n()
const repository = createApiFeedRepository()
const categories = usePhotoCategories()
const quickLinks = usePhotoQuickLinks()
const loading = ref(true)
const errorMessage = ref("")
const photos = ref<PhotoRecord[]>([])

useSeoMeta({
  title: () => t("pages.photosPage.seoTitle"),
  description: () => t("pages.photosPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<PhotoCategoryKey>("all")
const lightboxOpen = ref(false)
const currentPhotoId = ref("")
const albums = computed(() => buildPhotoAlbums(photos.value, categories.value))

async function fetchPhotos() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getPhotos({ limit: 30 })
    photos.value = mapFeedPostsToPhotos(response.posts)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.photosPage.emptyDescription")
  }
  finally {
    loading.value = false
  }
}

watch(
  photos,
  (items) => {
    if (!currentPhotoId.value || !items.some(photo => photo.id === currentPhotoId.value)) {
      currentPhotoId.value = items[0]?.id ?? ""
    }
  },
  { immediate: true },
)

const categoryLabelMap = computed(() =>
  Object.fromEntries(
    categories.value.map(category => [category.value, category.label]),
  ) as Record<PhotoCategoryKey, string>,
)

const filteredPhotos = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return photos.value.filter((photo) => {
    const matchesCategory = selectedCategory.value === "all" || photo.category === selectedCategory.value
    const matchesKeyword = keyword.length === 0 || [
      photo.title,
      photo.albumTitle,
      photo.photographer,
      photo.photographerRole,
      photo.location,
      ...photo.tags,
      categoryLabelMap.value[photo.category] ?? "",
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesCategory && matchesKeyword
  })
})

watch(filteredPhotos, (items) => {
  if (!items.some(photo => photo.id === currentPhotoId.value)) {
    currentPhotoId.value = items[0]?.id ?? photos.value[0]?.id ?? ""
  }
})

const currentPhoto = computed<PhotoRecord | null>(() =>
  filteredPhotos.value.find(photo => photo.id === currentPhotoId.value)
  ?? photos.value.find(photo => photo.id === currentPhotoId.value)
  ?? photos.value[0]
  ?? null,
)

const heroStats = computed(() => [
  {
    label: t("pages.photosPage.statPhotos"),
    value: formatPhotoNumber(filteredPhotos.value.length, locale.value),
    description: t("pages.photosPage.statPhotosDescription"),
  },
  {
    label: t("pages.photosPage.statAlbums"),
    value: formatPhotoNumber(albums.value.length, locale.value),
    description: t("pages.photosPage.statAlbumsDescription"),
  },
  {
    label: t("pages.photosPage.statReach"),
    value: formatPhotoNumber(
      filteredPhotos.value.reduce((sum, photo) => sum + getPhotoEngagement(photo), 0),
      locale.value,
    ),
    description: t("pages.photosPage.statReachDescription"),
  },
  {
    label: t("pages.photosPage.statCreators"),
    value: formatPhotoNumber(
      new Set(filteredPhotos.value.map(photo => photo.photographer)).size,
      locale.value,
    ),
    description: t("pages.photosPage.statCreatorsDescription"),
  },
])

const resultHeading = computed(() => {
  if (selectedCategory.value === "all") return t("pages.photosPage.resultHeadingAll")
  return t("pages.photosPage.resultHeadingCategory", { label: categoryLabelMap.value[selectedCategory.value] })
})

const topTags = computed(() => {
  const scoreMap = new Map<string, number>()

  filteredPhotos.value.forEach((photo) => {
    const score = getPhotoEngagement(photo)

    photo.tags.forEach((tag) => {
      scoreMap.set(tag, (scoreMap.get(tag) ?? 0) + score)
    })
  })

  return Array.from(scoreMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([tag, score]) => ({
      label: formatHashtagLabel(tag),
      score: formatPhotoNumber(score, locale.value),
      to: createHashtagPath(tag),
    }))
})

const topCreators = computed(() => {
  const creatorMap = new Map<string, { name: string; role: string; score: number }>()

  filteredPhotos.value.forEach((photo) => {
    const existing = creatorMap.get(photo.photographer)
    const score = getPhotoEngagement(photo)

    if (existing) {
      existing.score += score
      return
    }

    creatorMap.set(photo.photographer, {
      name: photo.photographer,
      role: photo.photographerRole,
      score,
    })
  })

  return Array.from(creatorMap.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item, index) => ({
      name: item.name,
      initials: item.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join(""),
      role: item.role,
      score: formatPhotoNumber(item.score, locale.value),
      accent: accentPalette[index % accentPalette.length],
    }))
})

const lightboxItems = computed(() =>
  filteredPhotos.value.map(photo => ({
    type: "image" as const,
    src: photo.image,
    alt: photo.title,
  })),
)

const currentLightboxIndex = computed(() => {
  const index = filteredPhotos.value.findIndex(photo => photo.id === currentPhotoId.value)
  return index >= 0 ? index : 0
})

const openPhoto = (id: string) => {
  if (!photos.value.some(photo => photo.id === id)) return
  currentPhotoId.value = id
  lightboxOpen.value = true
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  currentPhotoId.value = photos.value[0]?.id ?? ""
}

const noop = () => {}

await fetchPhotos()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
