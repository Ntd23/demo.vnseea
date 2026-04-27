<template>
  <div class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)] sm:p-6">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#eef0ff] text-[#0000ff] shadow-[0_10px_24px_rgba(0,0,255,0.08)]">
            <Icon name="i-ph-map-pin-fill" class="h-6 w-6" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0000ff]/70">
              {{ $t("checkout.shippingForm.shippingAddress") }}
            </p>
            <h2 class="mt-1 text-[1.25rem] font-black tracking-[-0.04em] text-[#243b63]">
              {{ hasSavedAddress
                ? $t("checkout.shippingForm.savedAddressTitle")
                : $t("checkout.shippingForm.noAddressTitle") }}
            </h2>
            <p class="mt-2 text-[14px] leading-6 text-slate-500">
              {{ hasSavedAddress
                ? $t("checkout.shippingForm.savedAddressDesc")
                : $t("checkout.shippingForm.noAddressDesc") }}
            </p>
          </div>
        </div>

        <div class="mt-5 rounded-[22px] border border-[#eef2f8] bg-[#f7f9ff] p-4">
          <template v-if="latestSavedAddress">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
                {{ $t("checkout.shippingForm.recipient") }}
              </UBadge>
              <p class="text-[15px] font-black text-[#243b63]">
                {{ latestSavedAddress.fullName }}
              </p>
              <span class="text-slate-300">•</span>
              <p class="text-[14px] font-medium text-slate-600">
                {{ latestSavedAddress.phone }}
              </p>
            </div>

            <p class="mt-3 text-[14px] leading-7 text-slate-600">
              {{ addressSummary }}
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ latestSavedAddress.city }}
              </UBadge>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ latestSavedAddress.country }}
              </UBadge>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ $t("checkout.shippingForm.postalCodePrefix") }} {{ latestSavedAddress.postalCode }}
              </UBadge>
            </div>
          </template>

          <p v-else class="text-[15px] font-medium leading-7 text-slate-700">
            {{ $t("checkout.shippingForm.addAddressHint") }}
          </p>
        </div>
      </section>

      <aside class="rounded-[26px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] p-5 shadow-[0_14px_32px_rgba(15,35,110,0.05)]">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {{ $t("checkout.shippingForm.progressLabel") }}
        </p>

        <p class="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#243b63]">
          {{ $t("checkout.shippingForm.fieldsCount", { filled: filledFieldsCount, total: totalFieldCount }) }}
        </p>

        <UProgress
          :model-value="completionPercent"
          color="primary"
          class="mt-4"
        />

        <div class="mt-4 flex flex-wrap gap-2">
          <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
            {{ hasCompleteForm
              ? $t("checkout.shippingForm.allFieldsReady")
              : $t("checkout.shippingForm.fieldsRemaining", { count: remainingFieldsCount }) }}
          </UBadge>

          <UBadge
            color="neutral"
            variant="soft"
            class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
          >
            {{ $t("checkout.shippingForm.draftLabel") }}
          </UBadge>
        </div>

        <UAlert
          class="mt-4 rounded-[18px]"
          color="neutral"
          variant="subtle"
          icon="i-ph-floppy-disk-back-fill"
          :description="$t('checkout.shippingForm.shippingInfoPersist')"
        />
      </aside>
    </div>

    <UForm
      :state="form"
      :validate="validateForm"
      class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_16px_36px_rgba(15,35,110,0.07)] sm:p-6"
      @submit="saveAddress"
      @error="handleFormError"
    >
      <div class="flex flex-col gap-4 border-b border-[#eef2f8] pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0000ff]/70">
            {{ $t("checkout.shippingForm.formTitle") }}
          </p>
          <h2 class="mt-1 text-[1.25rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ $t("checkout.shippingForm.addAddressTitle") }}
          </h2>
          <p class="mt-2 max-w-[520px] text-[14px] leading-6 text-slate-500">
            {{ $t("checkout.shippingForm.formDesc") }}
          </p>
        </div>

        <div class="inline-flex items-center gap-2 self-start rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
          <Icon name="i-ph-check-circle-fill" class="h-4 w-4 text-[#0000ff]" />
          {{ $t("checkout.shippingForm.fieldsCount", { filled: filledFieldsCount, total: totalFieldCount }) }}
        </div>
      </div>

      <UAlert
        v-if="statusAlert"
        :color="statusAlert.color"
        variant="subtle"
        :icon="statusAlert.icon"
        :title="statusAlert.title"
        :description="statusAlert.description"
        class="mt-5 rounded-[22px]"
        aria-live="polite"
      />

      <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_320px]">
        <div class="space-y-4">
          <section class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef0ff] text-[#0000ff]">
                <Icon name="i-ph-user-circle-fill" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.shippingForm.recipientInfo") }}
                </p>
                <p class="mt-1 text-[14px] font-semibold leading-6 text-slate-500">
                  {{ $t("checkout.shippingForm.recipientInfoDesc") }}
                </p>
              </div>
            </div>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <UFormField
                name="fullName"
                :label="$t('checkout.shippingForm.fullName')"
                required
                size="xl"
                class="space-y-2"
              >
                <UInput
                  v-model="form.fullName"
                  autocomplete="name"
                  color="primary"
                  size="xl"
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
                size="xl"
                class="space-y-2"
              >
                <UInput
                  v-model="form.phone"
                  autocomplete="tel"
                  color="primary"
                  size="xl"
                  type="tel"
                  :placeholder="$t('checkout.shippingForm.phonePlaceholder')"
                  :disabled="isBusy"
                  class="w-full"
                  :ui="inputUi"
                />
              </UFormField>
            </div>
          </section>

          <section class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef0ff] text-[#0000ff]">
                <Icon name="i-ph-globe-hemisphere-east-fill" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.shippingForm.region") }}
                </p>
                <p class="mt-1 text-[14px] font-semibold leading-6 text-slate-500">
                  {{ $t("checkout.shippingForm.regionDesc") }}
                </p>
              </div>
            </div>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <UFormField
                name="country"
                :label="$t('checkout.shippingForm.country')"
                required
                size="xl"
                class="space-y-2"
              >
                <UInput
                  v-model="form.country"
                  autocomplete="country-name"
                  color="primary"
                  size="xl"
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
                size="xl"
                class="space-y-2"
              >
                <UInput
                  v-model="form.city"
                  autocomplete="address-level2"
                  color="primary"
                  size="xl"
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
                size="xl"
                class="space-y-2 md:col-span-2"
              >
                <UInput
                  v-model="form.postalCode"
                  autocomplete="postal-code"
                  color="primary"
                  size="xl"
                  :placeholder="$t('checkout.shippingForm.postalCode')"
                  :disabled="isBusy"
                  class="w-full"
                  :ui="inputUi"
                />
              </UFormField>
            </div>
          </section>

          <section class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef0ff] text-[#0000ff]">
                <Icon name="i-ph-house-line-fill" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.shippingForm.pointDetail") }}
                </p>
                <p class="mt-1 text-[14px] font-semibold leading-6 text-slate-500">
                  {{ $t("checkout.shippingForm.pointDetailDesc") }}
                </p>
              </div>
            </div>

            <UFormField
              name="streetAddress"
              :label="$t('checkout.shippingForm.streetAddress')"
              required
              size="xl"
              class="mt-4 space-y-2"
            >
              <UTextarea
                v-model="form.streetAddress"
                autocomplete="street-address"
                color="primary"
                size="xl"
                autoresize
                :rows="4"
                :placeholder="$t('checkout.shippingForm.streetAddressPlaceholder')"
                :disabled="isBusy"
                class="w-full"
                :ui="textareaUi"
              />
            </UFormField>
          </section>
        </div>

        <aside class="space-y-4">
          <section class="rounded-[24px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] p-5 shadow-[0_12px_26px_rgba(15,35,110,0.05)] xl:sticky xl:top-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#eef0ff] text-[#0000ff]">
                <Icon name="i-ph-eye-fill" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.shippingForm.quickPreview") }}
                </p>
                <p class="mt-1 text-[15px] font-black text-[#243b63]">
                  {{ previewRecipient }}
                </p>
              </div>
            </div>

            <p class="mt-4 rounded-[18px] bg-white px-4 py-3 text-[13px] leading-6 text-slate-500 shadow-[0_10px_20px_rgba(15,35,110,0.04)]">
              {{ previewAddress }}
            </p>

            <UAlert
              class="mt-4 rounded-[18px]"
              color="neutral"
              variant="subtle"
              icon="i-ph-info-fill"
              :description="$t('checkout.shippingForm.mockWarning')"
            />

            <div class="mt-4 flex flex-col gap-3">
              <UButton
                type="submit"
                loading-auto
                loading-icon="i-lucide-loader-2"
                color="primary"
                variant="solid"
                block
                size="xl"
                :disabled="isSubmitDisabled"
                class="rounded-[18px] text-[15px] font-extrabold shadow-[0_14px_28px_rgba(0,0,255,0.18)]"
              >
                {{ submitLabel }}
              </UButton>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                block
                size="xl"
                :disabled="isBusy"
                class="rounded-[18px] text-[15px] font-semibold"
                @click="resetForm"
              >
                {{ $t("checkout.shippingForm.resetChanges") }}
              </UButton>

              <UButton
                v-if="canRestoreSavedAddress"
                type="button"
                color="neutral"
                variant="soft"
                block
                size="xl"
                :disabled="isBusy"
                class="rounded-[18px] text-[15px] font-semibold"
                @click="restoreSavedAddress"
              >
                {{ $t("checkout.shippingForm.restoreSavedAddress") }}
              </UButton>
            </div>
          </section>
        </aside>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import type { ShippingAddress } from "../../domain/types/checkout.types"

type ShippingFormStatus = "idle" | "loading" | "success" | "error"

type ShippingFormError = {
  name?: keyof ShippingAddress
  message: string
}

const props = withDefaults(defineProps<{
  initialAddress?: ShippingAddress | null
}>(), {
  initialAddress: null,
})

const emit = defineEmits<{
  submit: [address: ShippingAddress]
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

const createEmptyForm = (): ShippingAddress => ({
  fullName: "",
  phone: "",
  country: "",
  city: "",
  postalCode: "",
  streetAddress: "",
})

const normalizeAddress = (address: ShippingAddress): ShippingAddress => ({
  fullName: address.fullName.trim(),
  phone: address.phone.trim(),
  country: address.country.trim(),
  city: address.city.trim(),
  postalCode: address.postalCode.trim(),
  streetAddress: address.streetAddress.trim(),
})

const hasAnyField = (address: ShippingAddress | null | undefined) =>
  Boolean(address) && Object.values(address).some(value => value.trim().length > 0)

const isSameAddress = (
  first: ShippingAddress | null | undefined,
  second: ShippingAddress | null | undefined,
) => {
  if (!first || !second) {
    return false
  }

  const normalizedFirst = normalizeAddress(first)
  const normalizedSecond = normalizeAddress(second)

  return Object.entries(normalizedFirst).every(([key, value]) =>
    normalizedSecond[key as keyof ShippingAddress] === value,
  )
}

const form = reactive<ShippingAddress>(createEmptyForm())
const latestSavedAddress = ref<ShippingAddress | null>(null)
const submitState = ref<ShippingFormStatus>("idle")
const draftRestored = ref(false)
const storageHydrated = ref(false)

const draftStorage = useStorage<ShippingAddress>(
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

const validateForm = (state: ShippingAddress): ShippingFormError[] => {
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
