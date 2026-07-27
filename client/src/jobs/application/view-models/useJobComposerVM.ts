// English description: Provides the reusable job creation modal state and mutations for publisher surfaces outside the jobs directory.

import { createApiJobsRepository } from "../../infrastructure/repositories/ApiJobsRepository"
import type { JobsRepository } from "../../domain/repositories/JobsRepository"
import type {
  JobCreateDraft,
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

export function useJobComposerVM(
  onCreated: (postId?: number) => void | Promise<void>,
  repository: JobsRepository = createApiJobsRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()
  const open = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref("")
  const preferredPageId = ref(0)
  const catalog = ref<JobsCatalogRecord>(EMPTY_CATALOG)
  const catalogLoaded = ref(false)

  async function loadCatalog() {
    if (loading.value || catalogLoaded.value) {
      return
    }

    loading.value = true
    errorMessage.value = ""

    try {
      catalog.value = await repository.getCatalog({ limit: 1 })
      catalogLoaded.value = true
    }
    catch (error) {
      errorMessage.value = toErrorMessage(
        error,
        t("pages.jobsPage.createErrorDescription"),
      )
    }
    finally {
      loading.value = false
    }
  }

  async function openCreate(pageId?: number) {
    const normalizedPageId = Number(pageId || 0)
    preferredPageId.value = Number.isFinite(normalizedPageId) && normalizedPageId > 0
      ? normalizedPageId
      : 0
    open.value = true
    errorMessage.value = ""
    await loadCatalog()
  }

  function closeCreate() {
    if (submitting.value) {
      return
    }

    open.value = false
    errorMessage.value = ""
  }

  async function submitCreate(input: JobCreateDraft) {
    if (submitting.value) {
      return
    }

    submitting.value = true
    errorMessage.value = ""

    try {
      const result = await repository.createJob(input)
      open.value = false
      await onCreated(result.postId)
      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("pages.jobsPage.postJob"),
      })
    }
    catch (error) {
      errorMessage.value = toErrorMessage(
        error,
        t("pages.jobsPage.createErrorDescription"),
      )
    }
    finally {
      submitting.value = false
    }
  }

  return {
    open,
    loading,
    submitting,
    errorMessage,
    preferredPageId,
    catalog,
    openCreate,
    closeCreate,
    submitCreate,
  }
}
