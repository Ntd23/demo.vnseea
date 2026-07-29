// English description: Loads a job directly by job id and keeps it visible while updating its one-time application state.

import { createApiJobsRepository } from "../../infrastructure/repositories/ApiJobsRepository"
import type { JobsRepository } from "../../domain/repositories/JobsRepository"
import type { JobApplicationDraft, JobRecord } from "../../domain/types/jobs.types"

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message
    ? error.message
    : fallback

export function useJobDetailVM(
  jobId: MaybeRefOrGetter<number>,
  repository: JobsRepository = createApiJobsRepository(),
) {
  const { t } = useI18n()
  const resolvedJobId = computed(() => {
    const value = Number(toValue(jobId) || 0)
    return Number.isInteger(value) && value > 0 ? value : 0
  })
  const applyModalJob = ref<JobRecord | null>(null)
  const applySubmitting = ref(false)
  const applyErrorMessage = ref("")

  const { data, status, error } = useAsyncData(
    () => `jobs:detail:${resolvedJobId.value}`,
    () => resolvedJobId.value
      ? repository.getDetailByJobId(resolvedJobId.value)
      : Promise.resolve(null),
    {
      watch: [resolvedJobId],
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
    if (!selectedJob.canApply || selectedJob.alreadyApplied) {
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

  async function submitApplication(input: JobApplicationDraft) {
    if (applySubmitting.value || data.value?.job.alreadyApplied) {
      return
    }

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
    openApply,
    closeApply,
    submitApplication,
  }
}
