<template>
  <div class="space-y-8">
    <!-- Current Address Section -->
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-slate-900">
          {{ hasSavedAddress
            ? $t("checkout.shippingForm.savedAddressTitle")
            : $t("checkout.shippingForm.noAddressTitle") }}
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          {{ hasSavedAddress
            ? $t("checkout.shippingForm.savedAddressDesc")
            : $t("checkout.shippingForm.noAddressDesc") }}
        </p>
      </div>

      <div class="p-5 sm:p-6">
        <template v-if="latestSavedAddress">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center rounded-md bg-[var(--color-primary-50)] px-2 py-1 text-xs font-semibold text-[var(--color-primary-700)]">
              {{ $t("checkout.shippingForm.recipient") }}
            </span>
            <p class="text-sm font-bold text-slate-900">
              {{ latestSavedAddress.fullName }}
            </p>
            <span class="text-slate-300">•</span>
            <p class="text-sm text-slate-600">
              {{ latestSavedAddress.phone }}
            </p>
          </div>

          <p class="mt-3 text-sm text-slate-600 max-w-2xl">
            {{ addressSummary }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
            <span class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">{{ latestSavedAddress.city }}</span>
            <span class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">{{ latestSavedAddress.country }}</span>
            <span class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">{{ $t("checkout.shippingForm.postalCodePrefix") }} {{ latestSavedAddress.postalCode }}</span>
          </div>
        </template>
        <p v-else class="text-sm text-slate-600">
          {{ $t("checkout.shippingForm.addAddressHint") }}
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <UForm
      :state="form"
      :validate="validateForm"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      @submit="saveAddress"
      @error="handleFormError"
    >
      <div class="border-b border-slate-100 bg-white px-5 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">
            {{ $t("checkout.shippingForm.addAddressTitle") }}
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            {{ $t("checkout.shippingForm.formDesc") }}
          </p>
        </div>
        <div class="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
          <Icon name="i-ph-check-circle-fill" class="h-4 w-4 text-green-500" />
          {{ $t("checkout.shippingForm.fieldsCount", { filled: filledFieldsCount, total: totalFieldCount }) }}
        </div>
      </div>

      <div class="p-5 sm:p-6 space-y-8">
        <UAlert
          v-if="statusAlert"
          :color="statusAlert.color"
          variant="subtle"
          :icon="statusAlert.icon"
          :title="statusAlert.title"
          :description="statusAlert.description"
          class="rounded-xl"
          aria-live="polite"
        />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Fields -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Recipient -->
            <fieldset class="space-y-4">
              <legend class="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 w-full pb-2">
                {{ $t("checkout.shippingForm.recipientInfo") }}
              </legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UFormField
                  name="fullName"
                  :label="$t('checkout.shippingForm.fullName')"
                  required
                >
                  <UInput
                    v-model="form.fullName"
                    autocomplete="name"
                    size="lg"
                    :placeholder="$t('checkout.shippingForm.fullNamePlaceholder')"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="inputUi"
                  />
                </UFormField>

                <UFormField
                  name="phone"
                  :label="$t('checkout.shippingForm.phone')"
                  required
                >
                  <UInput
                    v-model="form.phone"
                    autocomplete="tel"
                    size="lg"
                    type="tel"
                    :placeholder="$t('checkout.shippingForm.phonePlaceholder')"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="inputUi"
                  />
                </UFormField>
              </div>
            </fieldset>

            <!-- Region -->
            <fieldset class="space-y-4">
              <legend class="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 w-full pb-2">
                {{ $t("checkout.shippingForm.region") }}
              </legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UFormField
                  name="country"
                  :label="$t('checkout.shippingForm.country')"
                  required
                >
                  <UInput
                    v-model="form.country"
                    autocomplete="country-name"
                    size="lg"
                    :placeholder="$t('checkout.shippingForm.country')"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="inputUi"
                  />
                </UFormField>

                <UFormField
                  name="city"
                  :label="$t('checkout.shippingForm.city')"
                  required
                >
                  <UInput
                    v-model="form.city"
                    autocomplete="address-level2"
                    size="lg"
                    :placeholder="$t('checkout.shippingForm.city')"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="inputUi"
                  />
                </UFormField>

                <UFormField
                  name="postalCode"
                  :label="$t('checkout.shippingForm.postalCode')"
                  required
                  class="sm:col-span-2"
                >
                  <UInput
                    v-model="form.postalCode"
                    autocomplete="postal-code"
                    size="lg"
                    :placeholder="$t('checkout.shippingForm.postalCode')"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="inputUi"
                  />
                </UFormField>
              </div>
            </fieldset>

            <!-- Detailed Address -->
            <fieldset class="space-y-4">
              <legend class="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 w-full pb-2">
                {{ $t("checkout.shippingForm.pointDetail") }}
              </legend>
              <UFormField
                name="streetAddress"
                :label="$t('checkout.shippingForm.streetAddress')"
                required
              >
                <UTextarea
                  v-model="form.streetAddress"
                  autocomplete="street-address"
                  size="lg"
                  autoresize
                  :rows="3"
                  :placeholder="$t('checkout.shippingForm.streetAddressPlaceholder')"
                  :disabled="isBusy"
                  class="w-full"
                  :ui="textareaUi"
                />
              </UFormField>
            </fieldset>
          </div>

          <!-- Preview & Actions -->
          <div class="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900 mb-3">
                {{ $t("checkout.shippingForm.quickPreview") }}
              </p>
              <div class="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm space-y-2">
                <p class="font-bold text-slate-900">{{ previewRecipient }}</p>
                <p class="text-slate-600 leading-relaxed">{{ previewAddress }}</p>
              </div>
            </div>

            <div class="mt-8 space-y-3">
              <UButton
                type="submit"
                loading-auto
                loading-icon="i-lucide-loader-2"
                color="primary"
                variant="solid"
                block
                size="lg"
                :disabled="isSubmitDisabled"
                class="rounded-xl h-12 text-sm font-bold shadow-sm"
              >
                {{ submitLabel }}
              </UButton>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                block
                size="lg"
                :disabled="isBusy"
                class="rounded-xl h-12 text-sm font-medium"
                @click="resetForm"
              >
                {{ $t("checkout.shippingForm.resetChanges") }}
              </UButton>

              <UButton
                v-if="canRestoreSavedAddress"
                type="button"
                color="neutral"
                variant="ghost"
                block
                size="md"
                :disabled="isBusy"
                class="text-sm font-medium"
                @click="restoreSavedAddress"
              >
                {{ $t("checkout.shippingForm.restoreSavedAddress") }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import type { SavedShippingAddress, ShippingAddressForm } from "../../domain/types/checkout.types"

type ShippingFormStatus = "idle" | "loading" | "success" | "error"

type ShippingFormError = {
  name?: keyof ShippingAddressForm
  message: string
}

const props = withDefaults(defineProps<{
  initialAddress?: SavedShippingAddress | null
}>(), {
  initialAddress: null,
})

const emit = defineEmits<{
  submit: [address: SavedShippingAddress]
}>()

const { t } = useI18n()
const toast = useToast()

const totalFieldCount = 6

const inputUi = {
  base: "h-[3.65rem] rounded-[18px] px-4 text-[15px]",
}

const textareaUi = {
  base: "min-h-[120px] rounded-[18px] px-4 py-3 text-[15px] leading-7",
}

const createEmptyForm = (): ShippingAddressForm => ({
  fullName: "",
  phone: "",
  country: "",
  city: "",
  postalCode: "",
  streetAddress: "",
})

const normalizeAddress = (address: ShippingAddressForm): SavedShippingAddress => ({
  fullName: address.fullName.trim(),
  phone: address.phone.trim(),
  country: address.country.trim(),
  city: address.city.trim(),
  postalCode: address.postalCode.trim(),
  streetAddress: address.streetAddress.trim(),
})

const hasAnyField = (address: ShippingAddressForm | SavedShippingAddress | null | undefined) =>
  Boolean(address) && Object.values(address).some(value => value.trim().length > 0)

const isSameAddress = (
  first: ShippingAddressForm | SavedShippingAddress | null | undefined,
  second: ShippingAddressForm | SavedShippingAddress | null | undefined,
) => {
  if (!first || !second) {
    return false
  }

  const normalizedFirst = normalizeAddress(first)
  const normalizedSecond = normalizeAddress(second)

  return Object.entries(normalizedFirst).every(([key, value]) =>
    normalizedSecond[key as keyof SavedShippingAddress] === value,
  )
}

const form = reactive<ShippingAddressForm>(createEmptyForm())
const latestSavedAddress = ref<SavedShippingAddress | null>(null)
const submitState = ref<ShippingFormStatus>("idle")
const draftRestored = ref(false)
const storageHydrated = ref(false)

const draftStorage = useStorage<ShippingAddressForm>(
  "checkout:shipping-address-draft",
  createEmptyForm(),
  undefined,
  {
    mergeDefaults: true,
    initOnMounted: true,
  },
)

const filledFieldsCount = computed(() =>
  Object.values(form).filter(value => value.trim().length > 0).length,
)

const remainingFieldsCount = computed(() => totalFieldCount - filledFieldsCount.value)
const completionPercent = computed(() => (filledFieldsCount.value / totalFieldCount) * 100)
const hasCompleteForm = computed(() => filledFieldsCount.value === totalFieldCount)
const isBusy = computed(() => submitState.value === "loading")
const isSubmitDisabled = computed(() => isBusy.value || !hasCompleteForm.value)
const hasSavedAddress = computed(() => Boolean(latestSavedAddress.value))

const canRestoreSavedAddress = computed(() =>
  Boolean(latestSavedAddress.value) && !isSameAddress(form, latestSavedAddress.value),
)

const addressSummary = computed(() => {
  if (!latestSavedAddress.value) {
    return ""
  }

  return [
    latestSavedAddress.value.streetAddress,
    latestSavedAddress.value.city,
    latestSavedAddress.value.country,
  ].filter(Boolean).join(", ")
})

const previewRecipient = computed(() => {
  const fullName = form.fullName.trim() || t("checkout.shippingForm.noRecipientPreview")
  const phone = form.phone.trim()

  return phone ? `${fullName} · ${phone}` : fullName
})

const previewAddress = computed(() => {
  const parts = [
    form.streetAddress.trim() || t("checkout.shippingForm.streetAddress"),
    form.city.trim() || t("checkout.shippingForm.city"),
    form.country.trim() || t("checkout.shippingForm.country"),
  ]

  const postalCode = form.postalCode.trim()

  return postalCode
    ? `${parts.join(", ")} · ${t("checkout.shippingForm.postalCodePrefix")} ${postalCode}`
    : parts.join(", ")
})

const submitLabel = computed(() =>
  submitState.value === "loading"
    ? t("checkout.shippingForm.saving")
    : t("checkout.shippingForm.saveAddress"),
)

const statusAlert = computed(() => {
  if (submitState.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("checkout.shippingForm.statusSavingTitle"),
      description: t("checkout.shippingForm.statusSavingDescription"),
    }
  }

  if (submitState.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("checkout.shippingForm.statusSuccessTitle"),
      description: t("checkout.shippingForm.statusSuccessDescription"),
    }
  }

  if (submitState.value === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("checkout.shippingForm.statusErrorTitle"),
      description: t("checkout.shippingForm.statusErrorDescription"),
    }
  }

  if (draftRestored.value) {
    return {
      color: "primary" as const,
      icon: "i-ph-clock-counter-clockwise-fill",
      title: t("checkout.shippingForm.draftRestoredTitle"),
      description: t("checkout.shippingForm.draftRestoredDescription"),
    }
  }

  return null
})

watch(
  () => props.initialAddress,
  (address, previousAddress) => {
    if (!address) {
      return
    }

    const normalized = normalizeAddress(address)
    const shouldSyncForm = !hasAnyField(form) || (previousAddress ? isSameAddress(form, previousAddress) : false)

    latestSavedAddress.value = normalized

    if (shouldSyncForm) {
      Object.assign(form, normalized)
    }
  },
  { immediate: true },
)

onMounted(async () => {
  storageHydrated.value = true

  const storedDraft = normalizeAddress(draftStorage.value)

  if (hasAnyField(storedDraft) && (!latestSavedAddress.value || !isSameAddress(storedDraft, latestSavedAddress.value))) {
    Object.assign(form, storedDraft)
    await nextTick()
    draftRestored.value = true
  }
})

watchDebounced(
  () => ({ ...form }),
  (value) => {
    if (!storageHydrated.value) {
      return
    }

    draftStorage.value = normalizeAddress(value)
  },
  {
    debounce: 250,
    maxWait: 1000,
  },
)

watch(
  () => [form.fullName, form.phone, form.country, form.city, form.postalCode, form.streetAddress],
  () => {
    if (submitState.value !== "loading") {
      submitState.value = "idle"
    }

    draftRestored.value = false
  },
)

const validateForm = (state: ShippingAddressForm): ShippingFormError[] => {
  const errors: ShippingFormError[] = []

  if (!state.fullName.trim()) {
    errors.push({
      name: "fullName",
      message: t("checkout.shippingForm.validationFullNameRequired"),
    })
  }

  const normalizedPhone = state.phone.replace(/\D/g, "")

  if (!state.phone.trim()) {
    errors.push({
      name: "phone",
      message: t("checkout.shippingForm.validationPhoneRequired"),
    })
  }
  else if (normalizedPhone.length < 8) {
    errors.push({
      name: "phone",
      message: t("checkout.shippingForm.validationPhoneInvalid"),
    })
  }

  if (!state.country.trim()) {
    errors.push({
      name: "country",
      message: t("checkout.shippingForm.validationCountryRequired"),
    })
  }

  if (!state.city.trim()) {
    errors.push({
      name: "city",
      message: t("checkout.shippingForm.validationCityRequired"),
    })
  }

  if (!state.postalCode.trim()) {
    errors.push({
      name: "postalCode",
      message: t("checkout.shippingForm.validationPostalCodeRequired"),
    })
  }

  if (!state.streetAddress.trim()) {
    errors.push({
      name: "streetAddress",
      message: t("checkout.shippingForm.validationStreetRequired"),
    })
  }

  return errors
}

async function saveAddress() {
  submitState.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 500))

  const normalized = normalizeAddress(form)

  latestSavedAddress.value = normalized
  draftStorage.value = normalized
  draftRestored.value = false
  submitState.value = "success"

  emit("submit", normalized)

  toast.add({
    title: t("checkout.shippingForm.statusSuccessTitle"),
    description: t("checkout.shippingForm.statusSuccessDescription"),
    color: "success",
  })
}

function handleFormError() {
  submitState.value = "error"
}

function resetForm() {
  if (isBusy.value) {
    return
  }

  const nextValue = latestSavedAddress.value ? { ...latestSavedAddress.value } : createEmptyForm()

  Object.assign(form, nextValue)
  draftStorage.value = nextValue
  draftRestored.value = false
  submitState.value = "idle"
}

function restoreSavedAddress() {
  if (!latestSavedAddress.value || isBusy.value) {
    return
  }

  Object.assign(form, { ...latestSavedAddress.value })
  draftStorage.value = { ...latestSavedAddress.value }
  draftRestored.value = false
  submitState.value = "idle"
}
</script>
