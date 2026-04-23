<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-20 px-4 sm:px-6">
    <JobsHero
      :job-count="filteredJobs.length"
      :saved-only="savedOnly"
      :stats="heroStats"
      :status-label="filtersStatusLabel"
      :search-term="search || undefined"
      :active-category-label="selectedCategory !== defaultJobCategory ? activeCategoryLabel : undefined"
      :selected-job-title="selectedJobPinned ? selectedJob?.title : undefined"
      :has-active-filters="hasRouteState"
      @open-post="postModalOpen = true"
      @toggle-saved="savedOnly = !savedOnly"
      @reset="resetFilters"
    />

    <JobsFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:selected-location="selectedLocation"
      v-model:selected-type="selectedType"
      v-model:sort-by="sortBy"
      :categories="jobCategories"
      :locations="jobLocations"
      :types="jobTypes"
      :result-count="filteredJobs.length"
      :status-label="filtersStatusLabel"
      :has-active-filters="hasRouteState"
      @open-post="postModalOpen = true"
      @reset="resetFilters"
    />

    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      <section class="min-w-0 space-y-10">
        <JobsResultsHeader
          :heading="resultHeading"
          :count="filteredJobs.length"
          :sort-label="currentSortLabel"
          :status-label="filtersStatusLabel"
          :has-active-filters="hasRouteState"
          @open-post="postModalOpen = true"
          @reset="resetFilters"
        />

        <div v-if="filteredJobs.length > 0" class="grid gap-6 lg:grid-cols-2">
          <JobsJobCard
            v-for="job in filteredJobs"
            :key="job.id"
            :job="job"
            :saved="savedById[job.id] ?? job.isSaved"
            :selected="selectedJob?.id === job.id"
            @apply="openApply"
            @view="selectJob"
            @toggle-save="toggleSave"
          />
        </div>

        <JobsEmptyState v-else @reset="resetFilters" />
      </section>

      <aside class="sticky top-24 space-y-10">
        <JobsJobDetailPanel
          v-if="selectedJob"
          :job="selectedJob"
          :saved="savedById[selectedJob.id] ?? selectedJob.isSaved"
          @apply="openApply"
          @toggle-save="toggleSave"
        />
        <JobsSidebar
          :stats="sidebarStats"
          :categories="categoryBreakdown"
          :status-label="sidebarStatusLabel"
          :has-active-filters="hasRouteState"
          @select-category="selectCategory"
          @reset="resetFilters"
        />
      </aside>
    </div>

    <JobsJobApplyModal
      :job="applyJob"
      @close="applyJob = undefined"
      @submit="recordApplication"
    />

    <JobsJobPostModal
      :open="postModalOpen"
      :categories="jobCategories"
      :locations="jobLocations"
      :types="jobTypes"
      @close="postModalOpen = false"
      @create="createJob"
    />
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core"
import type { LocationQueryRaw } from "vue-router"
import type {
  JobApplicationPayload,
  JobCategoryFilter,
  JobPostPayload,
  JobSortKey,
  MockJob,
} from "~/composables/useMockJobsData"
import {
  defaultJobCategory,
  defaultJobLocation,
  defaultJobSort,
  defaultJobType,
  filterMockJobs,
  formatJobCompactNumber,
  normalizeJobCategory,
  normalizeJobLocation,
  normalizeJobSavedFlag,
  normalizeJobSort,
  normalizeJobType,
  readJobQueryValue,
  useMockJobsData,
} from "~/composables/useMockJobsData"

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const {
  jobs,
  jobCategories,
  jobLocations,
  jobTypes,
  createdJobBenefits,
  createdJobRequirements,
  createdJobSkills,
} = useMockJobsData()

const search = ref(readJobQueryValue(route.query.q).trim())
const selectedCategory = ref<JobCategoryFilter>(normalizeJobCategory(readJobQueryValue(route.query.category)))
const selectedLocation = ref(normalizeJobLocation(readJobQueryValue(route.query.location)))
const selectedType = ref(normalizeJobType(readJobQueryValue(route.query.type)))
const sortBy = ref<JobSortKey>(normalizeJobSort(readJobQueryValue(route.query.sort)))
const savedOnly = ref(normalizeJobSavedFlag(readJobQueryValue(route.query.saved)))
const selectedJobId = ref(readJobQueryValue(route.query.job).trim())
const selectedJobPinned = ref(readJobQueryValue(route.query.job).trim().length > 0)
const applyJob = ref<MockJob | null>(null)
const postModalOpen = ref(false)
const createdJobs = ref<MockJob[]>([])
const applications = ref<JobApplicationPayload[]>([])
const savedById = ref<Record<string, boolean>>({})

const allJobs = computed(() => [...createdJobs.value, ...jobs.value])

const activeCategoryLabel = computed(() =>
  jobCategories.value.find(item => item.value === selectedCategory.value)?.label
  ?? t("pages.jobsPage.categoryAll"),
)

const activeLocationLabel = computed(() =>
  jobLocations.value.find(item => item.value === selectedLocation.value)?.label
  ?? t("pages.jobsPage.locationAll"),
)

const activeTypeLabel = computed(() =>
  jobTypes.value.find(item => item.value === selectedType.value)?.label
  ?? t("pages.jobsPage.typeAll"),
)

const filteredJobs = computed(() => {
  return filterMockJobs(allJobs.value, {
    search: search.value,
    category: selectedCategory.value,
    location: selectedLocation.value,
    type: selectedType.value,
    sort: sortBy.value,
    savedOnly: savedOnly.value,
    savedById: savedById.value,
  })
})

const selectedJob = computed<MockJob | null>(() => {
  return filteredJobs.value.find(job => job.id === selectedJobId.value)
    ?? filteredJobs.value[0]
    ?? null
})

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0
  || selectedCategory.value !== defaultJobCategory
  || selectedLocation.value !== defaultJobLocation
  || selectedType.value !== defaultJobType
  || sortBy.value !== defaultJobSort
  || savedOnly.value,
)

const hasRouteState = computed(() =>
  hasActiveFilters.value || selectedJobPinned.value,
)

const activeFilterSummary = computed(() => {
  const tokens: string[] = []

  if (search.value.trim()) {
    tokens.push(t("pages.jobsPage.filterChipSearch", {
      query: search.value.trim(),
    }))
  }

  if (selectedCategory.value !== defaultJobCategory) {
    tokens.push(activeCategoryLabel.value)
  }

  if (selectedLocation.value !== defaultJobLocation) {
    tokens.push(activeLocationLabel.value)
  }

  if (selectedType.value !== defaultJobType) {
    tokens.push(activeTypeLabel.value)
  }

  if (savedOnly.value) {
    tokens.push(t("pages.jobsPage.savedOnly"))
  }

  return tokens.join(" · ")
})

const heroStats = computed(() => [
  {
    label: t("pages.jobsPage.statVisible"),
    value: formatJobCompactNumber(filteredJobs.value.length, locale.value),
    description: t("pages.jobsPage.statVisibleDescription"),
  },
  {
    label: t("pages.jobsPage.statRemote"),
    value: formatJobCompactNumber(filteredJobs.value.filter(job => job.isRemote).length, locale.value),
    description: t("pages.jobsPage.statRemoteDescription"),
  },
  {
    label: t("pages.jobsPage.statApplied"),
    value: formatJobCompactNumber(applications.value.length, locale.value),
    description: t("pages.jobsPage.statAppliedDescription"),
  },
])

const sidebarStats = computed(() => [
  {
    label: t("pages.jobsPage.sidebarFeatured"),
    value: formatJobCompactNumber(filteredJobs.value.filter(job => job.isFeatured).length, locale.value),
  },
  {
    label: t("pages.jobsPage.sidebarSaved"),
    value: formatJobCompactNumber(
      allJobs.value.filter(job => savedById.value[job.id] ?? job.isSaved).length,
      locale.value,
    ),
  },
  {
    label: t("pages.jobsPage.sidebarEmployers"),
    value: formatJobCompactNumber(new Set(filteredJobs.value.map(job => job.company)).size, locale.value),
  },
])

const categoryPool = computed(() =>
  filterMockJobs(allJobs.value, {
    search: search.value,
    category: defaultJobCategory,
    location: selectedLocation.value,
    type: selectedType.value,
    sort: defaultJobSort,
    savedOnly: savedOnly.value,
    savedById: savedById.value,
  }),
)

const categoryBreakdown = computed(() =>
  jobCategories.value
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: categoryPool.value.filter(job => job.category === category.value).length,
    }))
    .filter(category => category.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale.value)),
)

const currentSortLabel = computed(() => {
  if (sortBy.value === "salary") return t("pages.jobsPage.sortSalary")
  if (sortBy.value === "applicants") return t("pages.jobsPage.sortApplicants")
  return t("pages.jobsPage.sortLatest")
})

const filtersStatusLabel = computed(() => {
  if (activeFilterSummary.value) {
    return t("pages.jobsPage.filterStatusActive", {
      count: filteredJobs.value.length,
      summary: activeFilterSummary.value,
    })
  }

  return t("pages.jobsPage.filterStatusDefault", {
    count: filteredJobs.value.length,
    total: allJobs.value.length,
  })
})

const sidebarStatusLabel = computed(() => {
  if (selectedJobPinned.value && selectedJob.value) {
    return t("pages.jobsPage.sidebarFocusedJob", {
      title: selectedJob.value.title,
      company: selectedJob.value.company,
    })
  }

  return filtersStatusLabel.value
})

const resultHeading = computed(() => {
  if (selectedJobPinned.value && selectedJob.value) {
    return t("pages.jobsPage.headingFocusedJob", {
      title: selectedJob.value.title,
    })
  }

  if (savedOnly.value && search.value.trim()) {
    return t("pages.jobsPage.headingSavedSearch", {
      query: search.value.trim(),
    })
  }

  if (savedOnly.value) return t("pages.jobsPage.savedHeading")

  if (search.value.trim()) {
    return t("pages.jobsPage.headingSearch", {
      query: search.value.trim(),
    })
  }

  if (selectedCategory.value !== "all") {
    return jobCategories.value.find(category => category.value === selectedCategory.value)?.label ?? t("pages.jobsPage.defaultHeading")
  }

  return t("pages.jobsPage.defaultHeading")
})

watch(
  jobs,
  (items) => {
    if (Object.keys(savedById.value).length > 0) return

    savedById.value = Object.fromEntries(items.map(job => [job.id, job.isSaved]))
  },
  { immediate: true },
)

watch(
  () => route.query,
  (query) => {
    const nextSearch = readJobQueryValue(query.q).trim()
    const nextCategory = normalizeJobCategory(readJobQueryValue(query.category))
    const nextLocation = normalizeJobLocation(readJobQueryValue(query.location))
    const nextType = normalizeJobType(readJobQueryValue(query.type))
    const nextSort = normalizeJobSort(readJobQueryValue(query.sort))
    const nextSavedOnly = normalizeJobSavedFlag(readJobQueryValue(query.saved))
    const nextJobId = readJobQueryValue(query.job).trim()

    if (nextSearch !== search.value) {
      search.value = nextSearch
    }

    if (nextCategory !== selectedCategory.value) {
      selectedCategory.value = nextCategory
    }

    if (nextLocation !== selectedLocation.value) {
      selectedLocation.value = nextLocation
    }

    if (nextType !== selectedType.value) {
      selectedType.value = nextType
    }

    if (nextSort !== sortBy.value) {
      sortBy.value = nextSort
    }

    if (nextSavedOnly !== savedOnly.value) {
      savedOnly.value = nextSavedOnly
    }

    const previewJobs = filterMockJobs(allJobs.value, {
      search: nextSearch,
      category: nextCategory,
      location: nextLocation,
      type: nextType,
      sort: nextSort,
      savedOnly: nextSavedOnly,
      savedById: savedById.value,
    })

    const nextPinned = nextJobId.length > 0 && previewJobs.some(job => job.id === nextJobId)
    const fallbackJobId = previewJobs[0]?.id ?? ""
    const normalizedJobId = nextPinned ? nextJobId : fallbackJobId

    selectedJobPinned.value = nextPinned

    if (normalizedJobId !== selectedJobId.value) {
      selectedJobId.value = normalizedJobId
    }
  },
  { immediate: true },
)

watch(
  filteredJobs,
  (items) => {
    if (items.some(job => job.id === selectedJobId.value)) return

    selectedJobPinned.value = false
    selectedJobId.value = items[0]?.id ?? ""
  },
  { immediate: true },
)

watchDebounced(
  search,
  () => {
    const normalizedSearch = search.value.trim()

    if (normalizedSearch !== search.value) {
      search.value = normalizedSearch
      return
    }

    syncRoute()
  },
  {
    debounce: 250,
    maxWait: 800,
  },
)

watch(selectedCategory, syncRoute)
watch(selectedLocation, syncRoute)
watch(selectedType, syncRoute)
watch(sortBy, syncRoute)
watch(savedOnly, syncRoute)
watch(selectedJobId, syncRoute)

onMounted(() => {
  syncRoute()
})

const selectJob = (job: MockJob) => {
  selectedJobId.value = job.id
  selectedJobPinned.value = true
}

const openApply = (job: MockJob) => {
  selectJob(job)
  applyJob.value = job
}

const toggleSave = (id: string) => {
  const current = savedById.value[id] ?? allJobs.value.find(job => job.id === id)?.isSaved ?? false
  const nextValue = !current

  savedById.value = {
    ...savedById.value,
    [id]: nextValue,
  }

  toast.add({
    title: nextValue ? t("pages.jobsPage.saveToastTitle") : t("pages.jobsPage.unsaveToastTitle"),
    description: nextValue ? t("pages.jobsPage.saveToastDescription") : t("pages.jobsPage.unsaveToastDescription"),
    color: nextValue ? "primary" : "neutral",
    icon: nextValue ? "i-ph-bookmark-simple-fill" : "i-ph-bookmark-simple-bold",
  })
}

const recordApplication = (payload: JobApplicationPayload) => {
  applications.value = [payload, ...applications.value]
}

const createJob = (payload: JobPostPayload) => {
  const category = jobCategories.value.find(item => item.value === payload.category)
  const type = jobTypes.value.find(item => item.value === payload.type)
  const companyInitials = payload.company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join("") || "JB"
  const idBase = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "new-job"

  const job: MockJob = {
    id: `${idBase}-${createdJobs.value.length + 1}`,
    title: payload.title,
    company: payload.company,
    companyInitials,
    companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
    category: payload.category,
    categoryLabel: category?.label ?? activeCategoryLabel.value,
    locationKey: payload.locationKey,
    location: payload.location,
    type: payload.type,
    typeLabel: type?.label ?? activeTypeLabel.value,
    salary: payload.salary,
    postedAt: t("pages.jobsPage.createdJobPostedAt"),
    deadline: t("pages.jobsPage.createdJobDeadline"),
    experience: t("pages.jobsPage.createdJobExperience"),
    applicants: 0,
    views: 0,
    description: payload.description,
    requirements: [...createdJobRequirements.value],
    benefits: [...createdJobBenefits.value],
    skills: [...createdJobSkills.value],
    isRemote: payload.locationKey === "remote",
    isFeatured: false,
    isSaved: false,
    isOwner: true,
  }

  createdJobs.value = [job, ...createdJobs.value]
  savedById.value = {
    ...savedById.value,
    [job.id]: false,
  }
  selectJob(job)
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = defaultJobCategory
  selectedLocation.value = defaultJobLocation
  selectedType.value = defaultJobType
  sortBy.value = defaultJobSort
  savedOnly.value = false
  selectedJobPinned.value = false

  selectedJobId.value = filterMockJobs(allJobs.value, {
    search: "",
    category: defaultJobCategory,
    location: defaultJobLocation,
    type: defaultJobType,
    sort: defaultJobSort,
    savedOnly: false,
    savedById: savedById.value,
  })[0]?.id ?? ""
}

const selectCategory = (value: string) => {
  selectedCategory.value = normalizeJobCategory(value)
}

function syncRoute() {
  const nextSearch = search.value.trim()
  const currentRawSearch = readJobQueryValue(route.query.q)
  const currentRawCategory = readJobQueryValue(route.query.category)
  const currentRawLocation = readJobQueryValue(route.query.location)
  const currentRawType = readJobQueryValue(route.query.type)
  const currentRawSort = readJobQueryValue(route.query.sort)
  const currentRawSaved = readJobQueryValue(route.query.saved)
  const currentRawJob = readJobQueryValue(route.query.job)
  const visibleSelectedJobId = filteredJobs.value.some(job => job.id === selectedJobId.value)
    ? selectedJobId.value
    : ""

  if (selectedJobPinned.value && !visibleSelectedJobId) {
    selectedJobPinned.value = false
  }

  const nextCategory = selectedCategory.value === defaultJobCategory ? "" : selectedCategory.value
  const nextLocation = selectedLocation.value === defaultJobLocation ? "" : selectedLocation.value
  const nextType = selectedType.value === defaultJobType ? "" : selectedType.value
  const nextSort = sortBy.value === defaultJobSort ? "" : sortBy.value
  const nextSaved = savedOnly.value ? "1" : ""
  const nextJob = selectedJobPinned.value ? visibleSelectedJobId : ""

  if (
    currentRawSearch === nextSearch
    && currentRawCategory === nextCategory
    && currentRawLocation === nextLocation
    && currentRawType === nextType
    && currentRawSort === nextSort
    && currentRawSaved === nextSaved
    && currentRawJob === nextJob
  ) {
    return
  }

  const nextQuery: LocationQueryRaw = { ...route.query }

  if (nextSearch) {
    nextQuery.q = nextSearch
  }
  else {
    delete nextQuery.q
  }

  if (nextCategory) {
    nextQuery.category = nextCategory
  }
  else {
    delete nextQuery.category
  }

  if (nextLocation) {
    nextQuery.location = nextLocation
  }
  else {
    delete nextQuery.location
  }

  if (nextType) {
    nextQuery.type = nextType
  }
  else {
    delete nextQuery.type
  }

  if (nextSort) {
    nextQuery.sort = nextSort
  }
  else {
    delete nextQuery.sort
  }

  if (nextSaved) {
    nextQuery.saved = nextSaved
  }
  else {
    delete nextQuery.saved
  }

  if (nextJob) {
    nextQuery.job = nextJob
  }
  else {
    delete nextQuery.job
  }

  void router.replace({ path: "/jobs", query: nextQuery })
}
</script>
