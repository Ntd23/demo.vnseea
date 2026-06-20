// English description: Coordinates phtml-compatible offer create and edit form state.

import { createOfferDraft, createOfferDraftFromOffer } from "../factories/offer-draft.factory"
import { createApiOfferRepository } from "../../infrastructure/repositories/ApiOfferRepository"
import type { Offer, OfferDraft, OfferDiscountType } from "../../domain/types/offer.types"
import type { MaybeRefOrGetter } from "vue"

type OfferFormMode = "create" | "edit"

const numericValue = (value: string | number) => Number(value || 0)

export function useOfferFormVM(input: {
  pageId: MaybeRefOrGetter<number>
  mode: MaybeRefOrGetter<OfferFormMode>
  offer?: MaybeRefOrGetter<Offer | null | undefined>
  onSaved?: (offer?: Offer | null) => void | Promise<void>
}) {
  const repository = createApiOfferRepository()
  const { t } = useI18n()
  const toast = useToast()
  const mode = computed(() => toValue(input.mode))
  const pageId = computed(() => Number(toValue(input.pageId) || 0))
  const offer = computed(() => toValue(input.offer) ?? null)
  const draft = reactive<OfferDraft>(createOfferDraft(pageId.value))
  const submitting = ref(false)
  const errorMessage = ref("")

  const discountTypeOptions = computed<Array<{ label: string; value: OfferDiscountType }>>(() => [
    { label: t("offers.discountTypes.discount_percent"), value: "discount_percent" },
    { label: t("offers.discountTypes.discount_amount"), value: "discount_amount" },
    { label: t("offers.discountTypes.buy_get_discount"), value: "buy_get_discount" },
    { label: t("offers.discountTypes.spend_get_off"), value: "spend_get_off" },
    { label: t("offers.discountTypes.free_shipping"), value: "free_shipping" },
  ])

  const percentOptions = computed(() =>
    Array.from({ length: 99 }, (_, index) => ({
      label: `${index + 1}%`,
      value: index + 1,
    })),
  )

  const showDiscountPercent = computed(() =>
    draft.discountType === "discount_percent" || draft.discountType === "buy_get_discount",
  )
  const showDiscountAmount = computed(() => draft.discountType === "discount_amount")
  const showBuyGet = computed(() => draft.discountType === "buy_get_discount")
  const showSpendGetOff = computed(() => draft.discountType === "spend_get_off")

  function reset(nextOffer?: Offer | null) {
    const nextDraft = nextOffer ? createOfferDraftFromOffer(nextOffer) : createOfferDraft(pageId.value)
    Object.assign(draft, nextDraft)
    errorMessage.value = ""
  }

  function validate() {
    if (!draft.pageId) return t("offers.errors.pageRequired")
    if (draft.description.trim().length < 32) return t("offers.errors.description")
    if (draft.discountedItems.trim().length > 100) return t("offers.errors.discountedItems")

    if (mode.value === "create") {
      if (!draft.expireDate || !draft.expireTime) return t("offers.errors.expire")
      if (!draft.thumbnailFile) return t("offers.errors.thumbnail")
    }

    if (draft.discountType === "discount_percent" && (draft.discountPercent < 1 || draft.discountPercent > 99)) {
      return t("offers.errors.percent")
    }
    if (draft.discountType === "discount_amount" && numericValue(draft.discountAmount) < 1) {
      return t("offers.errors.amount")
    }
    if (draft.discountType === "buy_get_discount") {
      if (draft.discountPercent < 1 || draft.discountPercent > 99 || numericValue(draft.buy) < 1 || numericValue(draft.get) < 1) {
        return t("offers.errors.buyGet")
      }
    }
    if (draft.discountType === "spend_get_off" && (numericValue(draft.spend) < 1 || numericValue(draft.amountOff) < 1)) {
      return t("offers.errors.spend")
    }

    return ""
  }

  async function submit() {
    if (submitting.value) return false

    errorMessage.value = validate()
    if (errorMessage.value) return false

    submitting.value = true

    try {
      const result = mode.value === "edit" && offer.value
        ? await repository.updateOffer(offer.value.id, draft)
        : await repository.createOffer(draft)

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: mode.value === "edit" ? t("offers.editSuccess") : t("offers.createSuccess"),
      })
      await input.onSaved?.(result.offer ?? null)
      return true
    }
    catch (err) {
      errorMessage.value = err instanceof Error ? err.message : t("offers.errors.save")
      return false
    }
    finally {
      submitting.value = false
    }
  }

  watch([pageId, offer, mode], () => reset(offer.value), { immediate: true })

  return {
    draft,
    submitting,
    errorMessage,
    discountTypeOptions,
    percentOptions,
    showDiscountPercent,
    showDiscountAmount,
    showBuyGet,
    showSpendGetOff,
    reset,
    submit,
  }
}
