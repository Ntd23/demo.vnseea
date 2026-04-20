<template>
  <div class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
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
              {{ initialAddress ? $t("checkout.shippingForm.savedAddressTitle") : $t("checkout.shippingForm.noAddressTitle") }}
            </h2>
            <p class="mt-2 text-[14px] leading-6 text-slate-500">
              {{ initialAddress
                ? $t("checkout.shippingForm.savedAddressDesc")
                : $t("checkout.shippingForm.noAddressDesc") }}
            </p>
          </div>
        </div>

        <div class="mt-5 rounded-[22px] border border-[#eef2f8] bg-[#f7f9ff] p-4">
          <template v-if="initialAddress">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0000ff] shadow-[0_8px_18px_rgba(0,0,255,0.06)]">
                {{ $t("checkout.shippingForm.recipient") }}
              </span>
              <p class="text-[15px] font-black text-[#243b63]">
                {{ initialAddress.fullName }}
              </p>
              <span class="text-slate-300">•</span>
              <p class="text-[14px] font-medium text-slate-600">
                {{ initialAddress.phone }}
              </p>
            </div>

            <p class="mt-3 text-[14px] leading-7 text-slate-600">
              {{ addressSummary }}
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <div class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500">
                {{ initialAddress.city }}
              </div>
              <div class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500">
                {{ initialAddress.country }}
              </div>
              <div class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500">
                {{ $t("checkout.shippingForm.postalCodePrefix") }} {{ initialAddress.postalCode }}
              </div>
            </div>
          </template>

          <p v-else class="text-[15px] font-medium leading-7 text-slate-700">
            {{ $t("checkout.shippingForm.addAddressHint") }}
          </p>
        </div>
      </section>

      <aside class="rounded-[26px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] p-5 shadow-[0_14px_32px_rgba(15,35,110,0.05)]">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {{ $t("checkout.shippingForm.quickTip") }}
        </p>
        <div class="mt-4 space-y-3">
          <div class="rounded-[18px] bg-[#eef0ff] px-4 py-3 text-[13px] font-semibold leading-6 text-[#243b63]">
            {{ $t("checkout.shippingForm.fieldsRemaining", { count: totalFieldCount }) }}
          </div>
          <div class="rounded-[18px] bg-[#f8fafc] px-4 py-3 text-[13px] leading-6 text-slate-500">
            {{ $t("checkout.shippingForm.shippingInfoPersist") }}
          </div>
        </div>
      </aside>
    </div>

    <form
      class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_16px_36px_rgba(15,35,110,0.07)] sm:p-6"
      @submit.prevent="saveAddress"
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
              <label class="block space-y-2.5">
                <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.fullName") }}</span>
                <input
                  v-model="form.fullName"
                  :class="fieldClass"
                  autocomplete="name"
                  :placeholder="$t('checkout.shippingForm.fullNamePlaceholder')"
                  required
                  type="text"
                >
              </label>

              <label class="block space-y-2.5">
                <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.phone") }}</span>
                <input
                  v-model="form.phone"
                  :class="fieldClass"
                  autocomplete="tel"
                  :placeholder="$t('checkout.shippingForm.phonePlaceholder')"
                  required
                  type="tel"
                >
              </label>
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
              <label class="block space-y-2.5">
                <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.country") }}</span>
                <input
                  v-model="form.country"
                  :class="fieldClass"
                  autocomplete="country-name"
                  :placeholder="$t('checkout.shippingForm.country')"
                  required
                  type="text"
                >
              </label>

              <label class="block space-y-2.5">
                <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.city") }}</span>
                <input
                  v-model="form.city"
                  :class="fieldClass"
                  autocomplete="address-level2"
                  :placeholder="$t('checkout.shippingForm.city')"
                  required
                  type="text"
                >
              </label>

              <label class="block space-y-2.5 md:col-span-2">
                <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.postalCode") }}</span>
                <input
                  v-model="form.postalCode"
                  :class="fieldClass"
                  autocomplete="postal-code"
                  :placeholder="$t('checkout.shippingForm.postalCode')"
                  required
                  type="text"
                >
              </label>
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

            <label class="mt-4 block space-y-2.5">
              <span class="text-[0.98rem] font-black text-[#2f3542]">{{ $t("checkout.shippingForm.streetAddress") }}</span>
              <textarea
                v-model="form.streetAddress"
                :class="textareaClass"
                autocomplete="street-address"
                :placeholder="$t('checkout.shippingForm.streetAddressPlaceholder')"
                required
                rows="3"
              />
            </label>
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

            <div class="mt-4 rounded-[18px] border border-[#eef2f8] bg-[#f7f9ff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              {{ $t("checkout.shippingForm.mockWarning") }}
            </div>

            <button
              :class="submitButtonClass"
              :disabled="!hasCompleteForm"
              class="mt-4"
              type="submit"
            >
              {{ $t("checkout.shippingForm.saveAddress") }}
            </button>
          </section>
        </aside>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { SavedShippingAddress, ShippingAddressForm } from "~/types/checkout"

const props = withDefaults(defineProps<{
  initialAddress?: SavedShippingAddress | null
}>(), {
  initialAddress: null,
})

const emit = defineEmits<{
  submit: [address: SavedShippingAddress]
}>()

const { t } = useI18n()

const form = reactive<ShippingAddressForm>({
  fullName: "",
  phone: "",
  country: "",
  city: "",
  postalCode: "",
  streetAddress: "",
})

const fieldClass = "h-14 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
const textareaClass = "min-h-[72px] w-full resize-y rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
const totalFieldCount = 6

const hasCompleteForm = computed(() =>
  Object.values(form).every(value => value.trim().length > 0),
)

const filledFieldsCount = computed(() =>
  Object.values(form).filter(value => value.trim().length > 0).length,
)

const addressSummary = computed(() => {
  if (!props.initialAddress) {
    return ""
  }

  return [
    props.initialAddress.streetAddress,
    props.initialAddress.city,
    props.initialAddress.country,
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

const submitButtonClass = computed(() =>
  [
    "inline-flex h-14 w-full items-center justify-center rounded-[18px] px-5 text-[15px] font-extrabold transition",
    hasCompleteForm.value
      ? "bg-[#0000ff] text-white shadow-[0_14px_28px_rgba(0,0,255,0.18)] hover:bg-[#0000cc]"
      : "bg-[#edf1f7] text-slate-400",
  ].join(" "),
)

watch(
  () => props.initialAddress,
  (address) => {
    if (!address) {
      return
    }

    Object.assign(form, address)
  },
  { immediate: true },
)

function saveAddress() {
  if (!hasCompleteForm.value) {
    return
  }

  emit("submit", { ...form })
}
</script>
