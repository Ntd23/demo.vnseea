// English description: Coordinates ads create and edit form state with backend-backed options and mutations.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { createApiAdsRepository } from "../../infrastructure/repositories/ApiAdsRepository"
import type { AdsCampaignDraft } from "../../domain/types/ads.types"

const createEmptyDraft = (): AdsCampaignDraft => ({
  name: "",
  websiteUrl: "",
  headline: "",
  description: "",
  location: "",
  audienceIds: [],
  gender: "all",
  bidding: "clicks",
  placement: "entire",
  startDate: "",
  endDate: "",
  budget: null,
  page: "",
  mediaFile: null,
})

export function useAdsFormPageVM(mode: "create" | "edit", campaignId?: number) {
  const repository = createApiAdsRepository()
  const draft = reactive<AdsCampaignDraft>(createEmptyDraft())
  const step = ref<"media" | "details" | "targeting">("media")
  const submitting = ref(false)
  const submitError = ref("")
  const submitMessage = ref("")
  const mediaPreviewUrl = ref("")

  const { data, pending, error } = useAsyncData(
    () => `ads:form:${mode}:${campaignId ?? "new"}`,
    async () => {
      const [options, overview, campaign] = await Promise.all([
        repository.getOptions(),
        repository.getOverview({ limit: 1 }),
        mode === "edit" && campaignId ? repository.getCampaign(campaignId) : Promise.resolve(null),
      ])

      if (campaign) {
        Object.assign(draft, {
          id: campaign.id,
          name: campaign.name,
          websiteUrl: campaign.websiteUrl,
          headline: campaign.headline,
          description: campaign.description,
          location: campaign.location,
          audienceIds: campaign.audienceIds,
          gender: campaign.gender || "all",
          bidding: campaign.bidding || "clicks",
          placement: campaign.placement || "entire",
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          budget: campaign.budget || null,
          page: "",
          mediaFile: null,
        })
        mediaPreviewUrl.value = campaign.mediaUrl
        step.value = "details"
      }

      return { options, overview, campaign }
    },
    {
      default: () => ({ options: null, overview: null, campaign: null }),
    },
  )

  const options = computed(() => data.value.options)
  const campaign = computed(() => data.value.campaign)
  const balance = computed(() => data.value.overview?.balance ?? 0)
  const canSubmit = computed(() => {
    const hasMedia = mode === "edit" || Boolean(draft.mediaFile)

    return Boolean(
      draft.name
      && draft.websiteUrl
      && draft.headline
      && draft.description
      && draft.gender
      && draft.bidding
      && draft.placement
      && draft.startDate
      && draft.endDate
      && hasMedia,
    )
  })

  const currentBidPrice = computed(() => {
    const prices = options.value?.prices
    if (!prices) return ""

    const multiplier = draft.placement === "entire" ? 1.5 : 1
    const price = draft.bidding === "views" ? prices.views : prices.clicks

    return `${prices.currencySymbol}${(price * multiplier).toFixed(2)}`
  })

  function selectPage(slug: string) {
    draft.page = slug
    draft.websiteUrl = slug
      ? import.meta.client ? new URL(`/${slug}`, window.location.origin).toString() : `/${slug}`
      : ""
  }

  function setMediaFile(file: File | null) {
    draft.mediaFile = file
    if (!file) {
      mediaPreviewUrl.value = mode === "edit" ? campaign.value?.mediaUrl ?? "" : ""
      return
    }

    mediaPreviewUrl.value = URL.createObjectURL(file)
  }

  function goToDetails() {
    if (!draft.name || (mode === "create" && !draft.mediaFile)) return
    step.value = "details"
  }

  function goToTargeting() {
    if (!draft.headline || !draft.description || !draft.startDate || !draft.endDate || !draft.websiteUrl) return
    step.value = "targeting"
  }

  async function submit() {
    if (!canSubmit.value || submitting.value) return

    submitting.value = true
    submitError.value = ""
    submitMessage.value = ""

    try {
      const result = mode === "edit" && campaignId
        ? await repository.updateCampaign(campaignId, draft)
        : await repository.createCampaign(draft)

      submitMessage.value = result.message
      await navigateTo(appRoutes.ads)
    }
    catch (caught) {
      submitError.value = caught instanceof Error ? caught.message : "Unable to save advertising campaign."
    }
    finally {
      submitting.value = false
    }
  }

  return {
    campaign,
    balance,
    canSubmit,
    currentBidPrice,
    draft,
    error,
    goToDetails,
    goToTargeting,
    mediaPreviewUrl,
    options,
    pending,
    selectPage,
    setMediaFile,
    step,
    submit,
    submitError,
    submitMessage,
    submitting,
  }
}
