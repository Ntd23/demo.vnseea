// English description: Owns jobs route query sync, real catalog loading, pagination, and apply, create, and delete mutations for the jobs page.

import { refDebounced, watchDebounced } from "@vueuse/core"
import { createApiJobsRepository } from "../../infrastructure/repositories/ApiJobsRepository"
import type { JobsRepository } from "../../domain/repositories/JobsRepository"
import type {
  JobApplicationDraft,
  JobCreateDraft,
  JobRecord,
  JobsCatalogRecord,
} from "../../domain/types/jobs.types"

const EMPTY_CATALOG: JobsCatalogRecord = {
  items: [],
  categories: [],
  types: [],
  distanceOptions: [],
  currencies: [],
  salaryDates: [],
  questionTypes: [],
  imageTypes: [],
  ownedPages: [],
  currentUser: {
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    lat: null,
    lng: null,
  },
  canCreate: false,
  createDisabledReason: "",
  distanceEnabled: false,
  hasMore: false,
  nextAfterId: null,
}

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message
    ? error.message
    : fallback

const prependOption = (label: string, value: string, options: Array<{ value: string; label: string }>) => [
  { value, label },
  ...options,
]

type JobFilterOrigin = { lat: number, lng: number }
type JobLocationStatus = "idle" | "locating" | "ready" | "fallback" | "unavailable"
const MAX_DISTANCE_KM = 300

const normalizeDistance = (value: unknown) => {
  const distance = Math.round(Number(value))
  return Number.isFinite(distance) && distance > 0
    ? String(Math.min(distance, MAX_DISTANCE_KM))
    : ""
}

const normalizeFilterOrigin = (
  lat: number | null | undefined,
  lng: number | null | undefined,
): JobFilterOrigin | null =>
  typeof lat === "number"
  && Number.isFinite(lat)
  && lat >= -90
  && lat <= 90
  && typeof lng === "number"
  && Number.isFinite(lng)
  && lng >= -180
  && lng <= 180
    ? { lat, lng }
    : null

export function useJobsPageVM(
  repository: JobsRepository = createApiJobsRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const syncingFromRoute = ref(false)

  const searchQuery = ref("")
  const selectedCategory = ref("")
  const selectedType = ref("")
  const selectedDistance = ref("")
  const deviceOrigin = shallowRef<JobFilterOrigin | null>(null)
  const savedOrigin = shallowRef<JobFilterOrigin | null>(null)
  const locationStatus = ref<JobLocationStatus>("idle")

  const applyModalJob = ref<JobRecord | null>(null)
  const deleteModalJob = ref<JobRecord | null>(null)
  const createModalOpen = ref(false)
  const applySubmitting = ref(false)
  const createSubmitting = ref(false)
  const deleteSubmitting = ref(false)
  const applyErrorMessage = ref("")
  const createErrorMessage = ref("")
  const deleteErrorMessage = ref("")

  const buildRouteQuery = () => {
    const query: Record<string, string> = {}

    if (searchQuery.value.trim()) {
      query.q = searchQuery.value.trim()
    }

    if (selectedCategory.value) {
      query.category = selectedCategory.value
    }

    if (selectedType.value) {
      query.type = selectedType.value
    }

    if (selectedDistance.value) {
      query.distance = selectedDistance.value
    }

    return query
  }

  const syncStateFromRoute = () => {
    syncingFromRoute.value = true
    searchQuery.value = typeof route.query.q === "string" ? route.query.q.trim() : ""
    selectedCategory.value = typeof route.query.category === "string" ? route.query.category.trim() : ""
    selectedType.value = typeof route.query.type === "string" ? route.query.type.trim() : ""
    selectedDistance.value = normalizeDistance(
      typeof route.query.distance === "string" ? route.query.distance : "",
    )
    nextTick(() => {
      syncingFromRoute.value = false
    })
  }

  watch(
    () => route.query,
    syncStateFromRoute,
    { immediate: true },
  )

  watchDebounced(
    [searchQuery, selectedCategory, selectedType, selectedDistance],
    async () => {
      if (syncingFromRoute.value) {
        return
      }

      const query = buildRouteQuery()

      if (import.meta.client) {
        const url = new URL(window.location.href)
        url.search = new URLSearchParams(query).toString()
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
        return
      }

      await router.replace({ query })
    },
    {
      debounce: 240,
      maxWait: 700,
    },
  )

  const filterOrigin = computed(() => deviceOrigin.value ?? savedOrigin.value)
  const requestedCatalogFilters = computed(() => {
    const shouldFilterDistance = Boolean(selectedDistance.value && filterOrigin.value)

    return {
      q: searchQuery.value.trim(),
      category: selectedCategory.value,
      type: selectedType.value,
      distance: shouldFilterDistance ? Number(selectedDistance.value) : undefined,
      originLat: shouldFilterDistance ? filterOrigin.value?.lat : undefined,
      originLng: shouldFilterDistance ? filterOrigin.value?.lng : undefined,
    }
  })
  const stableCatalogFilters = refDebounced(requestedCatalogFilters, 80)
  const filtersKey = computed(() => JSON.stringify(stableCatalogFilters.value))

  const { data, status, error, refresh } = useAsyncData(
    "jobs:catalog",
    () => repository.getCatalog({
      ...stableCatalogFilters.value,
      limit: 10,
    }),
    {
      watch: [filtersKey],
      default: () => EMPTY_CATALOG,
    },
  )

  const items = ref<JobRecord[]>([])
  const nextAfterId = ref<number | null>(null)
  const hasMore = ref(false)
  const loadingMore = ref(false)

  watch(
    data,
    (catalog) => {
      items.value = catalog.items
      nextAfterId.value = catalog.nextAfterId
      hasMore.value = catalog.hasMore
      savedOrigin.value = normalizeFilterOrigin(
        catalog.currentUser.lat,
        catalog.currentUser.lng,
      )

      if (
        !deviceOrigin.value
        && savedOrigin.value
        && (locationStatus.value === "idle" || locationStatus.value === "unavailable")
      ) {
        locationStatus.value = "fallback"
      }
    },
    { immediate: true },
  )

  const catalogResolved = ref(status.value === "success")
  watch(status, (nextStatus) => {
    if (nextStatus === "success" || nextStatus === "error") {
      catalogResolved.value = true
    }
  }, { immediate: true })

  const loading = computed(() => status.value === "pending" && !catalogResolved.value)
  const refreshing = computed(() => status.value === "pending" && catalogResolved.value)
  const errorMessage = computed(() =>
    error.value ? toErrorMessage(error.value, t("pages.jobsPage.emptyDescription")) : "",
  )

  const categories = computed(() =>
    prependOption(t("pages.jobsPage.allCategories"), "__all_categories__", data.value.categories),
  )
  const types = computed(() =>
    prependOption(t("pages.jobsPage.allTypes"), "__all_types__", data.value.types),
  )
  const distanceOptions = computed(() =>
    prependOption(t("pages.jobsPage.allDistances"), "__all_distances__", data.value.distanceOptions),
  )
  const currencies = computed(() => data.value.currencies)
  const salaryDates = computed(() => data.value.salaryDates)
  const questionTypes = computed(() => data.value.questionTypes)
  const imageTypes = computed(() => data.value.imageTypes)
  const ownedPages = computed(() => data.value.ownedPages)
  const preferredCreatePageId = computed(() => {
    const value = Array.isArray(route.query.pageId) ? route.query.pageId[0] : route.query.pageId
    const pageId = Number(value || 0)
    return Number.isFinite(pageId) && pageId > 0 ? pageId : 0
  })
  const currentUser = computed(() => data.value.currentUser)
  const canCreate = computed(() => data.value.canCreate)
  const createDisabledReason = computed(() => data.value.createDisabledReason)
  const distanceEnabled = computed(() => Boolean(filterOrigin.value))
  const locationPending = computed(() => locationStatus.value === "locating")
  const distanceStatus = computed(() => {
    if (locationStatus.value === "locating") {
      return t("pages.jobsPage.distanceLocating")
    }

    if (deviceOrigin.value) {
      return t("pages.jobsPage.distanceUsingCurrentLocation")
    }

    if (savedOrigin.value) {
      return t("pages.jobsPage.distanceUsingSavedLocation")
    }

    return t("pages.jobsPage.distanceUnavailable")
  })
  const hasActiveFilters = computed(() =>
    Boolean(searchQuery.value.trim() || selectedCategory.value || selectedType.value || selectedDistance.value),
  )

  async function loadMore() {
    if (loadingMore.value || !hasMore.value || !nextAfterId.value) {
      return
    }

    loadingMore.value = true

    try {
      const activeFilters = stableCatalogFilters.value
      const response = await repository.getCatalog({
        ...activeFilters,
        afterId: nextAfterId.value,
        limit: 10,
      })

      const existingIds = new Set(items.value.map(item => item.id))
      const extraItems = response.items.filter(item => !existingIds.has(item.id))

      items.value = [...items.value, ...extraItems]
      nextAfterId.value = response.nextAfterId
      hasMore.value = response.hasMore
    }
    finally {
      loadingMore.value = false
    }
  }

  function resetFilters() {
    searchQuery.value = ""
    selectedCategory.value = ""
    selectedType.value = ""
    selectedDistance.value = ""
  }

  function openApply(job: JobRecord) {
    if (!job.canApply || job.alreadyApplied) {
      return
    }

    applyErrorMessage.value = ""
    applyModalJob.value = job
  }

  function requestCurrentLocation() {
    if (!import.meta.client || !navigator.geolocation) {
      locationStatus.value = savedOrigin.value ? "fallback" : "unavailable"
      return
    }

    locationStatus.value = "locating"
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextOrigin = normalizeFilterOrigin(
          position.coords.latitude,
          position.coords.longitude,
        )

        if (!nextOrigin) {
          locationStatus.value = savedOrigin.value ? "fallback" : "unavailable"
          return
        }

        deviceOrigin.value = nextOrigin
        locationStatus.value = "ready"
      },
      () => {
        locationStatus.value = savedOrigin.value ? "fallback" : "unavailable"
      },
      {
        enableHighAccuracy: true,
        maximumAge: 120000,
        timeout: 10000,
      },
    )
  }

  onMounted(requestCurrentLocation)

  function closeApply() {
    applyErrorMessage.value = ""
    applyModalJob.value = null
  }

  function openDelete(job: JobRecord) {
    if (!job.isOwner) {
      return
    }

    deleteErrorMessage.value = ""
    deleteModalJob.value = job
  }

  function closeDelete() {
    if (deleteSubmitting.value) {
      return
    }

    deleteErrorMessage.value = ""
    deleteModalJob.value = null
  }

  function openCreate() {
    createErrorMessage.value = ""
    createModalOpen.value = true
  }

  function closeCreate() {
    createErrorMessage.value = ""
    createModalOpen.value = false
  }

  watch(
    () => route.query.create,
    (value) => {
      if (value === "1" || value === "true") {
        openCreate()
      }
    },
    { immediate: true },
  )

  async function submitApplication(input: JobApplicationDraft) {
    const selectedJob = items.value.find(job => job.id === input.jobId)

    if (
      applySubmitting.value
      || !selectedJob
      || selectedJob.alreadyApplied
      || !selectedJob.canApply
    ) {
      return
    }

    applySubmitting.value = true
    applyErrorMessage.value = ""

    try {
      await repository.applyToJob(input)
      items.value = items.value.map(job =>
        job.id === input.jobId
          ? {
              ...job,
              alreadyApplied: true,
              canApply: false,
              applyCount: job.applyCount + 1,
            }
          : job,
      )
      closeApply()
    }
    catch (submitError) {
      applyErrorMessage.value = toErrorMessage(
        submitError,
        t("pages.jobsPage.applyStatusErrorDescription"),
      )
    }
    finally {
      applySubmitting.value = false
    }
  }

  async function submitCreate(input: JobCreateDraft) {
    createSubmitting.value = true
    createErrorMessage.value = ""

    try {
      await repository.createJob(input)
      closeCreate()
      await refresh()
    }
    catch (submitError) {
      createErrorMessage.value = toErrorMessage(
        submitError,
        t("pages.jobsPage.createErrorDescription"),
      )
    }
    finally {
      createSubmitting.value = false
    }
  }

  async function submitDelete() {
    const job = deleteModalJob.value

    if (!job || !job.isOwner || deleteSubmitting.value) {
      return
    }

    deleteSubmitting.value = true
    deleteErrorMessage.value = ""

    try {
      await repository.deleteJob(job.id)
      items.value = items.value.filter(item => item.id !== job.id)
      deleteModalJob.value = null
    }
    catch (submitError) {
      deleteErrorMessage.value = toErrorMessage(
        submitError,
        t("pages.jobsPage.deleteErrorDescription"),
      )
    }
    finally {
      deleteSubmitting.value = false
    }
  }

  return {
    loading,
    refreshing,
    loadingMore,
    errorMessage,
    items,
    categories,
    types,
    distanceOptions,
    currencies,
    salaryDates,
    questionTypes,
    imageTypes,
    ownedPages,
    preferredCreatePageId,
    currentUser,
    canCreate,
    createDisabledReason,
    distanceEnabled,
    locationPending,
    distanceStatus,
    hasMore,
    hasActiveFilters,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedDistance,
    applyModalJob,
    deleteModalJob,
    createModalOpen,
    applySubmitting,
    createSubmitting,
    deleteSubmitting,
    applyErrorMessage,
    createErrorMessage,
    deleteErrorMessage,
    resetFilters,
    requestCurrentLocation,
    loadMore,
    openApply,
    closeApply,
    openDelete,
    closeDelete,
    openCreate,
    closeCreate,
    submitApplication,
    submitCreate,
    submitDelete,
    refresh,
  }
}
