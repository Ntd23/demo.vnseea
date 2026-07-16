// English description: Funding create/edit page view-model that owns form draft, image preview, and mutations.

import type { ComputedRef, Ref } from "vue"
import type { FundingCampaign } from "../../domain/types/funding.types"
import { createApiFundingRepository } from "../../infrastructure/repositories/ApiFundingRepository"

type FundingEditorMode = "create" | "edit"
type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type FundingEditorOptions = {
  mode: MaybeRef<FundingEditorMode>
  campaignId?: MaybeRef<string>
}

export function useCreateFundingPageVM(options: FundingEditorOptions) {
  const toast = useToast()
  const { t } = useI18n()
  const repository = createApiFundingRepository()
  const submitting = ref(false)
  const imageFile = ref<File | null>(null)
  const previewUrl = ref("")
  const previewIsObjectUrl = ref(false)
  const isEditMode = computed(() => unref(options.mode) === "edit")
  const campaignId = computed(() => unref(options.campaignId) || "")
  const draft = reactive({
    title: "",
    amount: null as number | null,
    description: "",
  })

  const { data: campaignData, pending: loadingCampaign } = useAsyncData(
    () => `funding-edit:${campaignId.value}`,
    () => repository.getCampaign(campaignId.value),
    {
      immediate: isEditMode.value && Boolean(campaignId.value),
      watch: [campaignId],
    },
  )

  const campaign = computed(() => campaignData.value?.campaign ?? null)

  watch(
    campaign,
    (currentCampaign) => {
      if (!currentCampaign || !isEditMode.value) return
      draft.title = currentCampaign.title
      draft.amount = currentCampaign.amount
      draft.description = currentCampaign.description
      previewUrl.value = currentCampaign.imageUrl
      previewIsObjectUrl.value = false
    },
    { immediate: true },
  )

  const revokePreview = () => {
    if (!previewUrl.value || !previewIsObjectUrl.value || !import.meta.client) return
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ""
    previewIsObjectUrl.value = false
  }

  watch(imageFile, (file) => {
    revokePreview()

    if (file && import.meta.client) {
      previewUrl.value = URL.createObjectURL(file)
      previewIsObjectUrl.value = true
      return
    }

    previewUrl.value = isEditMode.value ? campaign.value?.imageUrl || "" : ""
  })

  onBeforeUnmount(() => {
    revokePreview()
  })
  const submit = async () => {
    const title = draft.title.trim()
    const description = draft.description.trim()
    const amount = Number(draft.amount)

    if (!title || !description || !Number.isFinite(amount) || amount <= 0) {
      toast.add({
        color: "error",
        title: t("pages.createFundingPage.statusErrorDescription"),
      })
      return
    }

    if (!isEditMode.value && !imageFile.value) {
      toast.add({
        color: "error",
        title: t("pages.createFundingPage.imageHelper"),
      })
      return
    }

    const currentCampaign = campaign.value
    if (isEditMode.value && !currentCampaign) {
      toast.add({
        color: "error",
        title: t("pages.createFundingPage.statusErrorDescription"),
      })
      return
    }

    submitting.value = true

    try {
      if (isEditMode.value && currentCampaign) {
        await repository.updateCampaign(currentCampaign.id, {
          title,
          amount,
          description,
        })
        await navigateTo(currentCampaign.detailUrl)
        return
      }

      if (!imageFile.value) return

      await repository.createCampaign({
        title,
        amount,
        description,
        image: imageFile.value,
      })
      await navigateTo("/funding?tab=mine")
    }
    catch (err) {
      toast.add({
        color: "error",
        title: err instanceof Error ? err.message : "Unable to save funding campaign.",
      })
    }
    finally {
      submitting.value = false
    }
  }

  return {
    campaign: campaign as ComputedRef<FundingCampaign | null>,
    draft,
    imageFile,
    previewUrl,
    submitting,
    loadingCampaign,
    isEditMode,
    submit,
  }
}
