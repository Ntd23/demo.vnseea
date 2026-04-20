<template>
  <div class="space-y-5 pb-10">
    <JobsHero
      :job-count="allJobs.length"
      :saved-only="savedOnly"
      :stats="heroStats"
      @open-post="postModalOpen = true"
      @toggle-saved="savedOnly = !savedOnly"
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
      @open-post="postModalOpen = true"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section class="space-y-4">
        <JobsResultsHeader
          :heading="resultHeading"
          :count="filteredJobs.length"
          :sort-label="currentSortLabel"
          @open-post="postModalOpen = true"
          @reset="resetFilters"
        />

        <div v-if="filteredJobs.length > 0" class="grid gap-4 lg:grid-cols-2">
          <JobsJobCard
            v-for="job in filteredJobs"
            :key="job.id"
            :job="job"
            :saved="savedById[job.id] ?? job.isSaved"
            @apply="openApply"
            @view="selectJob"
            @toggle-save="toggleSave"
          />
        </div>

        <JobsEmptyState v-else @reset="resetFilters" />
      </section>

      <div class="space-y-4">
        <JobsJobDetailPanel
          v-if="selectedJob"
          :job="selectedJob"
          @apply="openApply"
        />
        <JobsSidebar
          v-else
          :stats="sidebarStats"
          :categories="categoryBreakdown"
          @select-category="selectCategory"
        />
      </div>
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
import type { JobApplicationPayload, JobCategoryKey, JobLocationKey, JobPostPayload, JobTypeKey, MockJob } from "~/composables/useMockJobsData"

type CategoryFilter = "all" | JobCategoryKey
type SortKey = "latest" | "salary" | "applicants"

const { t, locale } = useI18n()
const { jobs, jobCategories, jobLocations, jobTypes } = useMockJobsData()

useSeoMeta({
  title: () => t("pages.jobsPage.seoTitle"),
  description: () => t("pages.jobsPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<CategoryFilter>("all")
const selectedLocation = ref<JobLocationKey>("all")
const selectedType = ref<JobTypeKey>("all")
const sortBy = ref<SortKey>("latest")
const savedOnly = ref(false)
const selectedJobId = ref(jobs[0]?.id ?? "")
const applyJob = ref<MockJob>()
const postModalOpen = ref(false)
const createdJobs = ref<MockJob[]>([])
const applications = ref<JobApplicationPayload[]>([])
const savedById = ref<Record<string, boolean>>(
  Object.fromEntries(jobs.map(job => [job.id, job.isSaved])),
)

const allJobs = computed(() => [...createdJobs.value, ...jobs])

const selectedJob = computed(() => allJobs.value.find(job => job.id === selectedJobId.value) ?? filteredJobs.value[0])

const filteredJobs = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const filtered = allJobs.value.filter((job) => {
    const matchesKeyword = keyword.length === 0 || [
      job.title,
      job.company,
      job.categoryLabel,
      job.location,
      job.salary,
      job.description,
      ...job.skills,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory = selectedCategory.value === "all" || job.category === selectedCategory.value
    const matchesLocation = selectedLocation.value === "all" || job.locationKey === selectedLocation.value
    const matchesType = selectedType.value === "all" || job.type === selectedType.value
    const matchesSaved = !savedOnly.value || (savedById.value[job.id] ?? job.isSaved)

    return matchesKeyword && matchesCategory && matchesLocation && matchesType && matchesSaved
  })

  return filtered.slice().sort((left, right) => {
    if (sortBy.value === "salary") return salaryRank(right.salary) - salaryRank(left.salary)
    if (sortBy.value === "applicants") return right.applicants - left.applicants
    return allJobs.value.indexOf(left) - allJobs.value.indexOf(right)
  })
})

watch(filteredJobs, (value) => {
  if (!value.some(job => job.id === selectedJobId.value)) {
    selectedJobId.value = value[0]?.id ?? ""
  }
})

const heroStats = computed(() => [
  {
    label: t("pages.jobsPage.statHiring"),
    value: allJobs.value.length,
    description: t("pages.jobsPage.statHiringDescription"),
  },
  {
    label: t("pages.jobsPage.statRemote"),
    value: allJobs.value.filter(job => job.isRemote).length,
    description: t("pages.jobsPage.statRemoteDescription"),
  },
  {
    label: t("pages.jobsPage.statApplied"),
    value: applications.value.length,
    description: t("pages.jobsPage.statAppliedDescription"),
  },
])

const sidebarStats = computed(() => [
  { label: t("pages.jobsPage.sidebarFeatured"), value: allJobs.value.filter(job => job.isFeatured).length },
  { label: t("pages.jobsPage.sidebarSaved"), value: allJobs.value.filter(job => savedById.value[job.id] ?? job.isSaved).length },
  { label: t("pages.jobsPage.sidebarEmployers"), value: new Set(allJobs.value.map(job => job.company)).size },
])

const categoryBreakdown = computed(() =>
  jobCategories
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: allJobs.value.filter(job => job.category === category.value).length,
    }))
    .filter(category => category.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale.value)),
)

const currentSortLabel = computed(() => {
  if (sortBy.value === "salary") return t("pages.jobsPage.sortSalary")
  if (sortBy.value === "applicants") return t("pages.jobsPage.sortApplicants")
  return t("pages.jobsPage.sortLatest")
})

const resultHeading = computed(() => {
  if (savedOnly.value) return t("pages.jobsPage.savedHeading")
  if (selectedCategory.value !== "all") {
    return jobCategories.find(category => category.value === selectedCategory.value)?.label ?? t("pages.jobsPage.defaultHeading")
  }
  return t("pages.jobsPage.defaultHeading")
})

const salaryRank = (salary: string) => {
  const numbers = salary.match(/\d+/g)?.map(Number) ?? []
  return numbers.length > 0 ? Math.max(...numbers) : 0
}

const selectJob = (job: MockJob) => {
  selectedJobId.value = job.id
}

const openApply = (job: MockJob) => {
  selectedJobId.value = job.id
  applyJob.value = job
}

const toggleSave = (id: string) => {
  const current = savedById.value[id] ?? allJobs.value.find(job => job.id === id)?.isSaved ?? false
  savedById.value = {
    ...savedById.value,
    [id]: !current,
  }
}

const recordApplication = (payload: JobApplicationPayload) => {
  applications.value = [payload, ...applications.value]
}

const createJob = (payload: JobPostPayload) => {
  const category = jobCategories.find(item => item.value === payload.category)
  const type = jobTypes.find(item => item.value === payload.type)
  const companyInitials = payload.company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join("") || "JB"

  const job: MockJob = {
    id: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-job"}-${Date.now()}`,
    title: payload.title,
    company: payload.company,
    companyInitials,
    companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
    category: payload.category,
    categoryLabel: category?.label ?? t("pages.jobsPage.categoryEngineering"),
    locationKey: payload.locationKey,
    location: payload.location,
    type: payload.type,
    typeLabel: type?.label ?? t("pages.jobsPage.typeFullTime"),
    salary: payload.salary,
    postedAt: t("pages.jobsPage.postedJustNow"),
    deadline: "30/06/2026",
    experience: t("pages.jobsPage.experiencePerDescription"),
    applicants: 0,
    views: 0,
    description: payload.description,
    requirements: [t("pages.jobsPage.defaultRequirement")],
    benefits: [t("pages.jobsPage.defaultBenefit")],
    skills: ["Hiring", "VNSEEA"],
    isRemote: payload.locationKey === "remote",
    isFeatured: false,
    isSaved: false,
    isOwner: true,
  }

  createdJobs.value = [job, ...createdJobs.value]
  selectedJobId.value = job.id
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  selectedLocation.value = "all"
  selectedType.value = "all"
  sortBy.value = "latest"
  savedOnly.value = false
}

const selectCategory = (value: string) => {
  selectedCategory.value = value as CategoryFilter
}
</script>
