<!-- English description: Validates and saves a shipping address inside the checkout address modal. -->
<template>
  <UForm
    :state="form"
    :validate="validateForm"
    class="shipping-form"
    @submit="submitAddress"
    @error="submitState = 'error'"
  >
    <UAlert
      v-if="submitState === 'error'"
      color="error"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      :title="$t('checkout.shippingForm.statusErrorTitle')"
      :description="errorDescription"
      class="shipping-form__alert"
      aria-live="polite"
    />

    <div class="shipping-form__fields">
      <UFormField name="fullName" :label="$t('checkout.shippingForm.fullName')" required>
        <UInput
          v-model="form.fullName"
          autocomplete="name"
          :placeholder="$t('checkout.shippingForm.fullNamePlaceholder')"
          :disabled="isBusy"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField name="phone" :label="$t('checkout.shippingForm.phone')" required>
        <UInput
          v-model="form.phone"
          autocomplete="tel"
          inputmode="tel"
          :placeholder="$t('checkout.shippingForm.phonePlaceholder')"
          :disabled="isBusy"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField name="country" :label="$t('checkout.shippingForm.country')" required>
        <UInput
          v-model="form.country"
          autocomplete="country-name"
          :placeholder="$t('checkout.shippingForm.country')"
          :disabled="isBusy"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField name="city" :label="$t('checkout.shippingForm.city')" required>
        <UInput
          v-model="form.city"
          autocomplete="address-level2"
          :placeholder="$t('checkout.shippingForm.city')"
          :disabled="isBusy"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField name="streetAddress" :label="$t('checkout.shippingForm.streetAddress')" required>
        <UTextarea
          v-model="form.streetAddress"
          autocomplete="street-address"
          :placeholder="$t('checkout.shippingForm.streetAddressPlaceholder')"
          :disabled="isBusy"
          :rows="3"
          autoresize
          size="xl"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="shipping-form__actions">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        size="lg"
        class="shipping-form__action"
        :disabled="isBusy"
        @click="emit('cancel')"
      >
        {{ $t('checkout.confirmModal.cancel', 'Cancel') }}
      </UButton>

      <UButton
        type="submit"
        color="primary"
        variant="solid"
        size="lg"
        class="shipping-form__action"
        :loading="isBusy"
      >
        {{ $t('checkout.shippingForm.saveAddress') }}
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { SavedShippingAddress, ShippingAddressForm } from "../../domain/types/checkout.types"

type ShippingFormError = {
  name?: keyof ShippingAddressForm
  message: string
}

const props = defineProps<{
  saveAddress: (address: SavedShippingAddress) => Promise<SavedShippingAddress>
}>()

const emit = defineEmits<{
  saved: [address: SavedShippingAddress]
  cancel: []
}>()

const { t } = useI18n()
const toast = useToast()
const submitState = ref<"idle" | "loading" | "error">("idle")
const errorDescription = ref(t("checkout.shippingForm.statusErrorDescription"))

const createEmptyForm = (): ShippingAddressForm => ({
  fullName: "",
  phone: "",
  country: "",
  city: "",
  streetAddress: "",
})

const form = reactive<ShippingAddressForm>(createEmptyForm())
const isBusy = computed(() => submitState.value === "loading")

const validateForm = (state: ShippingAddressForm): ShippingFormError[] => {
  const errors: ShippingFormError[] = []
  const requiredFields: Array<[keyof ShippingAddressForm, string]> = [
    ["fullName", t("checkout.shippingForm.validationFullNameRequired")],
    ["phone", t("checkout.shippingForm.validationPhoneRequired")],
    ["country", t("checkout.shippingForm.validationCountryRequired")],
    ["city", t("checkout.shippingForm.validationCityRequired")],
    ["streetAddress", t("checkout.shippingForm.validationStreetRequired")],
  ]

  for (const [name, message] of requiredFields) {
    if (!String(state[name] ?? "").trim()) {
      errors.push({ name, message })
    }
  }

  if (state.phone.trim() && state.phone.replace(/\D/g, "").length < 8) {
    errors.push({
      name: "phone",
      message: t("checkout.shippingForm.validationPhoneInvalid"),
    })
  }

  return errors
}

async function submitAddress() {
  submitState.value = "loading"
  errorDescription.value = t("checkout.shippingForm.statusErrorDescription")

  const normalized: SavedShippingAddress = {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    country: form.country.trim(),
    city: form.city.trim(),
    streetAddress: form.streetAddress.trim(),
  }

  try {
    const saved = await props.saveAddress(normalized)
    toast.add({
      title: t("checkout.shippingForm.statusSuccessTitle"),
      description: t("checkout.shippingForm.statusSuccessDescription"),
      color: "success",
    })
    emit("saved", saved)
  }
  catch (error) {
    submitState.value = "error"
    errorDescription.value = error instanceof Error && error.message
      ? error.message
      : t("checkout.shippingForm.statusErrorDescription")
  }
}
</script>

<style scoped>
.shipping-form__alert {
  margin-bottom: 16px;
}

.shipping-form__fields {
  display: grid;
  gap: 16px;
}

.shipping-form__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--border-light);
}

.shipping-form__action {
  justify-content: center;
  min-height: 44px;
  font-weight: 700;
}
</style>
