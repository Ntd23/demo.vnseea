export type JobCategoryKey = "engineering" | "design" | "marketing" | "sales" | "operations" | "finance"
export type JobLocationKey = "all" | "ho-chi-minh" | "ha-noi" | "da-nang" | "remote"
export type JobTypeKey = "all" | "full-time" | "part-time" | "contract" | "internship"

export type JobOption<T extends string = string> = {
  label: string
  value: T
  icon: string
}

export type MockJob = {
  id: string
  title: string
  company: string
  companyInitials: string
  companyGradient: string
  category: JobCategoryKey
  categoryLabel: string
  locationKey: Exclude<JobLocationKey, "all">
  location: string
  type: Exclude<JobTypeKey, "all">
  typeLabel: string
  salary: string
  postedAt: string
  deadline: string
  experience: string
  applicants: number
  views: number
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  isRemote: boolean
  isFeatured: boolean
  isSaved: boolean
  isOwner: boolean
}

export type JobApplicationPayload = {
  jobId: string
  name: string
  email: string
  phone: string
  message: string
  cvName: string
}

export type JobPostPayload = {
  title: string
  company: string
  category: JobCategoryKey
  locationKey: Exclude<JobLocationKey, "all">
  location: string
  type: Exclude<JobTypeKey, "all">
  salary: string
  description: string
}

export const useMockJobsData = () => {
  const { t } = useI18n()

  const jobCategories: JobOption<"all" | JobCategoryKey>[] = [
    { label: t("pages.jobsPage.categoryAll"), value: "all", icon: "i-ph-squares-four-fill" },
    { label: t("pages.jobsPage.categoryEngineering"), value: "engineering", icon: "i-ph-code-fill" },
    { label: t("pages.jobsPage.categoryDesign"), value: "design", icon: "i-ph-paint-brush-fill" },
    { label: t("pages.jobsPage.categoryMarketing"), value: "marketing", icon: "i-ph-megaphone-fill" },
    { label: t("pages.jobsPage.categorySales"), value: "sales", icon: "i-ph-handshake-fill" },
    { label: t("pages.jobsPage.categoryOperations"), value: "operations", icon: "i-ph-gear-six-fill" },
    { label: t("pages.jobsPage.categoryFinance"), value: "finance", icon: "i-ph-chart-line-up-fill" },
  ]

  const jobLocations: JobOption<JobLocationKey>[] = [
    { label: t("pages.jobsPage.locationAll"), value: "all", icon: "i-ph-map-pin-fill" },
    { label: t("pages.jobsPage.locationHoChiMinh"), value: "ho-chi-minh", icon: "i-ph-buildings-fill" },
    { label: t("pages.jobsPage.locationHaNoi"), value: "ha-noi", icon: "i-ph-bank-fill" },
    { label: t("pages.jobsPage.locationDaNang"), value: "da-nang", icon: "i-ph-waves-fill" },
    { label: t("pages.jobsPage.locationRemote"), value: "remote", icon: "i-ph-globe-hemisphere-east-fill" },
  ]

  const jobTypes: JobOption<JobTypeKey>[] = [
    { label: t("pages.jobsPage.typeAll"), value: "all", icon: "i-ph-briefcase-fill" },
    { label: t("pages.jobsPage.typeFullTime"), value: "full-time", icon: "i-ph-clock-fill" },
    { label: t("pages.jobsPage.typePartTime"), value: "part-time", icon: "i-ph-clock-afternoon-fill" },
    { label: t("pages.jobsPage.typeContract"), value: "contract", icon: "i-ph-file-text-fill" },
    { label: t("pages.jobsPage.typeInternship"), value: "internship", icon: "i-ph-student-fill" },
  ]

  const jobs: MockJob[] = [
    {
      id: "frontend-engineer-vnseea-labs",
      title: "Frontend Engineer",
      company: "VNSEEA Labs",
      companyInitials: "VL",
      companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      category: "engineering",
      categoryLabel: t("pages.jobsPage.categoryEngineering"),
      locationKey: "ho-chi-minh",
      location: t("pages.jobsPage.job1Location"),
      type: "full-time",
      typeLabel: t("pages.jobsPage.typeFullTime"),
      salary: t("pages.jobsPage.job1Salary"),
      postedAt: t("pages.jobsPage.job1PostedAt"),
      deadline: "30/05/2026",
      experience: t("pages.jobsPage.job1Experience"),
      applicants: 38,
      views: 1280,
      description: t("pages.jobsPage.job1Description"),
      requirements: [
        t("pages.jobsPage.job1Requirement1"),
        t("pages.jobsPage.job1Requirement2"),
        t("pages.jobsPage.job1Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job1Benefit1"),
        t("pages.jobsPage.job1Benefit2"),
        t("pages.jobsPage.job1Benefit3"),
      ],
      skills: ["Vue", "Nuxt", "TypeScript", "Tailwind"],
      isRemote: false,
      isFeatured: true,
      isSaved: true,
      isOwner: false,
    },
    {
      id: "product-designer-community",
      title: "Product Designer",
      company: "Community Studio",
      companyInitials: "CS",
      companyGradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      category: "design",
      categoryLabel: t("pages.jobsPage.categoryDesign"),
      locationKey: "remote",
      location: t("pages.jobsPage.job2Location"),
      type: "contract",
      typeLabel: t("pages.jobsPage.typeContract"),
      salary: t("pages.jobsPage.job2Salary"),
      postedAt: t("pages.jobsPage.job2PostedAt"),
      deadline: "18/05/2026",
      experience: t("pages.jobsPage.job2Experience"),
      applicants: 21,
      views: 940,
      description: t("pages.jobsPage.job2Description"),
      requirements: [
        t("pages.jobsPage.job2Requirement1"),
        t("pages.jobsPage.job2Requirement2"),
        t("pages.jobsPage.job2Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job2Benefit1"),
        t("pages.jobsPage.job2Benefit2"),
        t("pages.jobsPage.job2Benefit3"),
      ],
      skills: ["Figma", "Prototype", "Design System"],
      isRemote: true,
      isFeatured: true,
      isSaved: false,
      isOwner: false,
    },
    {
      id: "growth-marketing-specialist",
      title: "Growth Marketing Specialist",
      company: "Hanoi Startup Circle",
      companyInitials: "HS",
      companyGradient: "linear-gradient(135deg,var(--color-success),var(--color-accent-500))",
      category: "marketing",
      categoryLabel: t("pages.jobsPage.categoryMarketing"),
      locationKey: "ha-noi",
      location: t("pages.jobsPage.job3Location"),
      type: "full-time",
      typeLabel: t("pages.jobsPage.typeFullTime"),
      salary: t("pages.jobsPage.job3Salary"),
      postedAt: t("pages.jobsPage.job3PostedAt"),
      deadline: "25/05/2026",
      experience: t("pages.jobsPage.job3Experience"),
      applicants: 44,
      views: 1510,
      description: t("pages.jobsPage.job3Description"),
      requirements: [
        t("pages.jobsPage.job3Requirement1"),
        t("pages.jobsPage.job3Requirement2"),
        t("pages.jobsPage.job3Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job3Benefit1"),
        t("pages.jobsPage.job3Benefit2"),
        t("pages.jobsPage.job3Benefit3"),
      ],
      skills: ["Growth", "Content", "Analytics"],
      isRemote: false,
      isFeatured: false,
      isSaved: false,
      isOwner: false,
    },
    {
      id: "business-development-executive",
      title: "Business Development Executive",
      company: "Market Bridge",
      companyInitials: "MB",
      companyGradient: "linear-gradient(135deg,var(--color-primary-700),var(--color-success))",
      category: "sales",
      categoryLabel: t("pages.jobsPage.categorySales"),
      locationKey: "da-nang",
      location: t("pages.jobsPage.job4Location"),
      type: "full-time",
      typeLabel: t("pages.jobsPage.typeFullTime"),
      salary: t("pages.jobsPage.job4Salary"),
      postedAt: t("pages.jobsPage.job4PostedAt"),
      deadline: "12/06/2026",
      experience: t("pages.jobsPage.job4Experience"),
      applicants: 17,
      views: 760,
      description: t("pages.jobsPage.job4Description"),
      requirements: [
        t("pages.jobsPage.job4Requirement1"),
        t("pages.jobsPage.job4Requirement2"),
        t("pages.jobsPage.job4Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job4Benefit1"),
        t("pages.jobsPage.job4Benefit2"),
        t("pages.jobsPage.job4Benefit3"),
      ],
      skills: ["B2B", "CRM", "Partnership"],
      isRemote: false,
      isFeatured: false,
      isSaved: true,
      isOwner: false,
    },
    {
      id: "finance-operations-analyst",
      title: "Finance Operations Analyst",
      company: "Green Fund",
      companyInitials: "GF",
      companyGradient: "linear-gradient(135deg,var(--color-success),var(--color-info))",
      category: "finance",
      categoryLabel: t("pages.jobsPage.categoryFinance"),
      locationKey: "ho-chi-minh",
      location: t("pages.jobsPage.job5Location"),
      type: "part-time",
      typeLabel: t("pages.jobsPage.typePartTime"),
      salary: t("pages.jobsPage.job5Salary"),
      postedAt: t("pages.jobsPage.job5PostedAt"),
      deadline: "05/06/2026",
      experience: t("pages.jobsPage.job5Experience"),
      applicants: 12,
      views: 520,
      description: t("pages.jobsPage.job5Description"),
      requirements: [
        t("pages.jobsPage.job5Requirement1"),
        t("pages.jobsPage.job5Requirement2"),
        t("pages.jobsPage.job5Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job5Benefit1"),
        t("pages.jobsPage.job5Benefit2"),
        t("pages.jobsPage.job5Benefit3"),
      ],
      skills: ["Finance", "Excel", "Reporting"],
      isRemote: false,
      isFeatured: false,
      isSaved: false,
      isOwner: true,
    },
    {
      id: "community-operations-intern",
      title: "Community Operations Intern",
      company: "VNSEEA Community",
      companyInitials: "VC",
      companyGradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
      category: "operations",
      categoryLabel: t("pages.jobsPage.categoryOperations"),
      locationKey: "remote",
      location: t("pages.jobsPage.job6Location"),
      type: "internship",
      typeLabel: t("pages.jobsPage.typeInternship"),
      salary: t("pages.jobsPage.job6Salary"),
      postedAt: t("pages.jobsPage.job6PostedAt"),
      deadline: "01/06/2026",
      experience: t("pages.jobsPage.job6Experience"),
      applicants: 57,
      views: 1880,
      description: t("pages.jobsPage.job6Description"),
      requirements: [
        t("pages.jobsPage.job6Requirement1"),
        t("pages.jobsPage.job6Requirement2"),
        t("pages.jobsPage.job6Requirement3"),
      ],
      benefits: [
        t("pages.jobsPage.job6Benefit1"),
        t("pages.jobsPage.job6Benefit2"),
        t("pages.jobsPage.job6Benefit3"),
      ],
      skills: ["Community", "Ops", "Notion"],
      isRemote: true,
      isFeatured: false,
      isSaved: false,
      isOwner: true,
    },
  ]

  return {
    jobs,
    jobCategories,
    jobLocations,
    jobTypes,
    findJobById: (id: string) => jobs.find(job => job.id === id),
  }
}
