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

const { jobs, jobCategories, jobLocations, jobTypes } = useMockJobsData()

useSeoMeta({
  title: "Việc làm | VNSEEA",
  description: "Tìm việc, lọc theo ngành nghề, địa điểm, xem chi tiết và ứng tuyển các job trong cộng đồng VNSEEA.",
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
    label: "Đang tuyển",
    value: allJobs.value.length,
    description: "Tin tuyển dụng trong mock data.",
  },
  {
    label: "Remote",
    value: allJobs.value.filter(job => job.isRemote).length,
    description: "Vị trí hỗ trợ làm từ xa.",
  },
  {
    label: "Ứng tuyển",
    value: applications.value.length,
    description: "Hồ sơ đã gửi trong phiên này.",
  },
])

const sidebarStats = computed(() => [
  { label: "Tin nổi bật", value: allJobs.value.filter(job => job.isFeatured).length },
  { label: "Việc đã lưu", value: allJobs.value.filter(job => savedById.value[job.id] ?? job.isSaved).length },
  { label: "Nhà tuyển dụng", value: new Set(allJobs.value.map(job => job.company)).size },
])

const categoryBreakdown = computed(() =>
  jobCategories
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: allJobs.value.filter(job => job.category === category.value).length,
    }))
    .filter(category => category.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi")),
)

const currentSortLabel = computed(() => {
  if (sortBy.value === "salary") return "Lương tốt"
  if (sortBy.value === "applicants") return "Nhiều ứng viên"
  return "Mới nhất"
})

const resultHeading = computed(() => {
  if (savedOnly.value) return "Việc làm đã lưu"
  if (selectedCategory.value !== "all") {
    return jobCategories.find(category => category.value === selectedCategory.value)?.label ?? "Việc làm phù hợp"
  }
  return "Danh sách việc làm đang tuyển"
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
    categoryLabel: category?.label ?? "Kỹ thuật",
    locationKey: payload.locationKey,
    location: payload.location,
    type: payload.type,
    typeLabel: type?.label ?? "Toàn thời gian",
    salary: payload.salary,
    postedAt: "Vừa đăng",
    deadline: "30/06/2026",
    experience: "Theo mô tả",
    applicants: 0,
    views: 0,
    description: payload.description,
    requirements: ["Thông tin yêu cầu sẽ được cập nhật khi nối API job.php."],
    benefits: ["Nhà tuyển dụng sẽ bổ sung quyền lợi chi tiết."],
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
