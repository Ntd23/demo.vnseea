import {
  createHashtagPath,
  createPhotoInitials,
  formatHashtagLabel,
  formatPhotoNumber,
  getPhotoEngagement,
} from "../../domain/services/photos-format.service"
import type { PhotoCategoryKey, PhotoItem } from "../../domain/types/photos.types"
import { usePhotosDataSource } from "../../infrastructure/adapters/photosData.adapter"

const accentPalette = [
  "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
  "linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)",
  "linear-gradient(135deg,#ea580c 0%,#fb923c 100%)",
]

const fallbackPhoto: PhotoItem = {
  id: "photos-fallback",
  title: "VNSEEA Photos",
  category: "community",
  albumTitle: "VNSEEA",
  photographer: "VNSEEA",
  photographerRole: "Mock gallery",
  location: "VNSEEA",
  timeLabel: "",
  likes: 0,
  comments: 0,
  image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
  accent: "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  tags: [],
  frame: "landscape",
  companionTo: "/photos",
}

export function usePhotosPage() {
  const { t, locale } = useI18n()
  const { categories, photos, albums, quickLinks } = usePhotosDataSource()

  const search = ref("")
  const selectedCategory = ref<PhotoCategoryKey>("all")
  const lightboxOpen = ref(false)
  const currentPhotoId = ref("")

  watch(
    photos,
    (items) => {
      if (!currentPhotoId.value || !items.some(photo => photo.id === currentPhotoId.value)) {
        currentPhotoId.value = items[0]?.id ?? fallbackPhoto.id
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

  const heroPhoto = computed<PhotoItem>(() =>
    filteredPhotos.value[0]
    ?? photos.value[0]
    ?? fallbackPhoto,
  )

  const currentPhoto = computed<PhotoItem>(() =>
    filteredPhotos.value.find(photo => photo.id === currentPhotoId.value)
    ?? photos.value.find(photo => photo.id === currentPhotoId.value)
    ?? photos.value[0]
    ?? fallbackPhoto,
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
        initials: createPhotoInitials(item.name),
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
    currentPhotoId.value = photos.value[0]?.id ?? fallbackPhoto.id
  }

  const noop = () => {}

  return {
    albums,
    categories,
    currentLightboxIndex,
    currentPhoto,
    currentPhotoId,
    filteredPhotos,
    heroPhoto,
    heroStats,
    lightboxItems,
    lightboxOpen,
    quickLinks,
    resultHeading,
    search,
    selectedCategory,
    topCreators,
    topTags,
    noop,
    openPhoto,
    resetFilters,
  }
}
