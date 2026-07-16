// English description: Loads a backend job by post id and owns its real application modal state.

import { createApiJobsRepository } from "../../infrastructure/repositories/ApiJobsRepository"
import type { JobsRepository } from "../../domain/repositories/JobsRepository"
import type {
  JobApplicantRecord,
  JobApplicationDraft,
  JobRecord,
} from "../../domain/types/jobs.types"

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message
    ? error.message
    : fallback

export function useJobPostDetailVM(
  postId: MaybeRefOrGetter<number>,
  repository: JobsRepository = createApiJobsRepository(),
) {
  const { t } = useI18n()
  const resolvedPostId = computed(() => {
    const value = Number(toValue(postId) || 0)
    return Number.isInteger(value) && value > 0 ? value : 0
  })
  const applyModalJob = ref<JobRecord | null>(null)
  const applySubmitting = ref(false)
  const applyErrorMessage = ref("")
  const applicantsModalOpen = ref(false)
  const applicants = ref<JobApplicantRecord[]>([])
  const applicantsLoading = ref(false)
  const applicantsErrorMessage = ref("")

  const { data, status, error } = useAsyncData(
    () => `jobs:post-detail:${resolvedPostId.value}`,
    () => resolvedPostId.value
      ? repository.getDetailByPostId(resolvedPostId.value)
      : Promise.resolve(null),
    {
      watch: [resolvedPostId],
      default: () => null,
    },
  )

  const job = computed(() => data.value?.job ?? null)
  const currentUser = computed(() => data.value?.currentUser ?? {
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    lat: null,
    lng: null,
  })
  const pending = computed(() => status.value === "pending")
  const errorMessage = computed(() =>
    error.value
      ? toErrorMessage(error.value, t("pages.jobsPage.detailLoadError"))
      : "",
  )

  function openApply(selectedJob: JobRecord) {
    if (!selectedJob.canApply) {
      return
    }

    applyErrorMessage.value = ""
    applyModalJob.value = selectedJob
  }

  function closeApply() {
    if (applySubmitting.value) {
      return
    }

    applyErrorMessage.value = ""
    applyModalJob.value = null
  }

  async function openApplicants(selectedJob: JobRecord) {
    if (!selectedJob.isOwner || selectedJob.applyCount < 1 || applicantsLoading.value) {
      return
    }

    applicantsModalOpen.value = true
    applicantsLoading.value = true
    applicantsErrorMessage.value = ""

    try {
      applicants.value = await repository.getApplicantsByPostId(resolvedPostId.value)
    }
    catch (loadError) {
      applicants.value = []
      applicantsErrorMessage.value = toErrorMessage(
        loadError,
        t("pages.jobsPage.applicantsLoadError"),
      )
    }
    finally {
      applicantsLoading.value = false
    }
  }

  function closeApplicants() {
    applicantsModalOpen.value = false
    applicantsErrorMessage.value = ""
  }

  async function submitApplication(input: JobApplicationDraft) {
    applySubmitting.value = true
    applyErrorMessage.value = ""

    try {
      await repository.applyToJob(input)

      if (data.value?.job.id === input.jobId) {
        data.value = {
          ...data.value,
          job: {
            ...data.value.job,
            alreadyApplied: true,
            canApply: false,
            applyCount: data.value.job.applyCount + 1,
          },
        }
      }

      applyModalJob.value = null
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

  return {
    job,
    currentUser,
    pending,
    errorMessage,
    applyModalJob,
    applySubmitting,
    applyErrorMessage,
    applicantsModalOpen,
    applicants,
    applicantsLoading,
    applicantsErrorMessage,
    openApply,
    closeApply,
    openApplicants,
    closeApplicants,
    submitApplication,
  }
}
