<template>
  <PagesJobsPage />
</template>

<script setup lang="ts">
import {
  defaultJobCategory,
  defaultJobLocation,
  defaultJobSort,
  defaultJobType,
  filterMockJobs,
  normalizeJobCategory,
  normalizeJobLocation,
  normalizeJobSavedFlag,
  normalizeJobSort,
  normalizeJobType,
  readJobQueryValue,
  useMockJobsData,
} from "~/composables/useMockJobsData"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { jobs, jobCategories, jobLocations, jobTypes } = useMockJobsData()

const searchQuery = computed(() =>
  readJobQueryValue(route.query.q).trim(),
)

const selectedCategory = computed(() =>
  normalizeJobCategory(readJobQueryValue(route.query.category)),
)

const selectedLocation = computed(() =>
  normalizeJobLocation(readJobQueryValue(route.query.location)),
)

const selectedType = computed(() =>
  normalizeJobType(readJobQueryValue(route.query.type)),
)

const sortBy = computed(() =>
  normalizeJobSort(readJobQueryValue(route.query.sort)),
)

const savedOnly = computed(() =>
  normalizeJobSavedFlag(readJobQueryValue(route.query.saved)),
)

const selectedJobId = computed(() =>
  readJobQueryValue(route.query.job).trim(),
)

const filteredJobs = computed(() =>
  filterMockJobs(jobs.value, {
    search: searchQuery.value,
    category: selectedCategory.value,
    location: selectedLocation.value,
    type: selectedType.value,
    sort: sortBy.value,
    savedOnly: savedOnly.value,
  }),
)

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

const hasSelectedJob = computed(() =>
  filteredJobs.value.some(job => job.id === selectedJobId.value),
)

const selectedJob = computed(() =>
  filteredJobs.value.find(job => job.id === selectedJobId.value)
  ?? filteredJobs.value[0]
  ?? null,
)

const activeFilterSummary = computed(() => {
  const tokens: string[] = []

  if (searchQuery.value) {
    tokens.push(t("pages.jobsPage.filterChipSearch", {
      query: searchQuery.value,
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

const seoTitle = computed(() => {
  if (hasSelectedJob.value && selectedJob.value) {
    return t("pages.jobsPage.seoTitleJob", {
      title: selectedJob.value.title,
    })
  }

  if (searchQuery.value && selectedCategory.value !== defaultJobCategory) {
    return t("pages.jobsPage.seoTitleQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.jobsPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedCategory.value !== defaultJobCategory) {
    return t("pages.jobsPage.seoTitleCategory", {
      category: activeCategoryLabel.value,
    })
  }

  if (selectedLocation.value !== defaultJobLocation) {
    return t("pages.jobsPage.seoTitleLocation", {
      location: activeLocationLabel.value,
    })
  }

  if (selectedType.value !== defaultJobType) {
    return t("pages.jobsPage.seoTitleType", {
      type: activeTypeLabel.value,
    })
  }

  if (savedOnly.value) {
    return t("pages.jobsPage.seoTitleSaved")
  }

  return t("pages.jobsPage.seoTitle")
})

const seoDescription = computed(() => {
  if (hasSelectedJob.value && selectedJob.value) {
    return t("pages.jobsPage.seoDescriptionJob", {
      title: selectedJob.value.title,
      company: selectedJob.value.company,
      location: selectedJob.value.location,
    })
  }

  if (searchQuery.value && selectedCategory.value !== defaultJobCategory) {
    return t("pages.jobsPage.seoDescriptionQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
      count: filteredJobs.value.length,
    })
  }

  if (searchQuery.value) {
    return t("pages.jobsPage.seoDescriptionQuery", {
      query: searchQuery.value,
      count: filteredJobs.value.length,
    })
  }

  if (activeFilterSummary.value) {
    return t("pages.jobsPage.seoDescriptionFilters", {
      summary: activeFilterSummary.value,
      count: filteredJobs.value.length,
    })
  }

  return t("pages.jobsPage.seoDescription")
})

const canonicalUrl = computed(() => {
  const url = new URL("/jobs", requestURL.origin)

  if (searchQuery.value) {
    url.searchParams.set("q", searchQuery.value)
  }

  if (selectedCategory.value !== defaultJobCategory) {
    url.searchParams.set("category", selectedCategory.value)
  }

  if (selectedLocation.value !== defaultJobLocation) {
    url.searchParams.set("location", selectedLocation.value)
  }

  if (selectedType.value !== defaultJobType) {
    url.searchParams.set("type", selectedType.value)
  }

  if (sortBy.value !== defaultJobSort) {
    url.searchParams.set("sort", sortBy.value)
  }

  if (savedOnly.value) {
    url.searchParams.set("saved", "1")
  }

  if (hasSelectedJob.value) {
    url.searchParams.set("job", selectedJobId.value)
  }

  return url.toString()
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
})
</script>
