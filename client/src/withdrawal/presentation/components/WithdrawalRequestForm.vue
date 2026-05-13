<!-- English description: Withdrawal request form using the same payload fields as the PHP withdrawal form. -->
<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-label-secondary">{{ t("pages.withdrawalPage.requestEyebrow") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.requestTitle") }}</h2>
      </div>
      <UBadge
        color="primary"
        variant="subtle"
        class="w-fit rounded-full px-3 py-1 font-semibold"
      >
        {{ availableLabel }}
      </UBadge>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.withdrawMethod')">
        <USelect
          v-model="draft.method"
          :items="methods"
          label-key="label"
          value-key="value"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.amountLabel')">
        <UInputNumber
          v-model="draft.amount"
          :min="minimumAmount"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>
    </div>

    <div v-if="draft.method === 'paypal'" class="mt-4">
      <UFormField :label="t('pages.withdrawalPage.paypalEmail')">
        <UInput
          v-model="draft.paypalEmail"
          type="email"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>
    </div>

    <div v-else-if="draft.method === 'bank'" class="mt-4 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.iban')">
        <UInput v-model="draft.iban" class="w-full" :disabled="disabled" />
      </UFormField>
      <UFormField :label="t('pages.withdrawalPage.country')">
        <UInput v-model="draft.country" class="w-full" :disabled="disabled" />
      </UFormField>
      <UFormField :label="t('pages.withdrawalPage.fullName')">
        <UInput v-model="draft.fullName" class="w-full" :disabled="disabled" />
      </UFormField>
      <UFormField :label="t('pages.withdrawalPage.swiftCode')">
        <UInput v-model="draft.swiftCode" class="w-full" :disabled="disabled" />
      </UFormField>
      <UFormField
        :label="t('pages.withdrawalPage.address')"
        class="md:col-span-2"
      >
        <UTextarea v-model="draft.address" :rows="3" class="w-full" :disabled="disabled" />
      </UFormField>
    </div>

    <div v-else-if="draft.method" class="mt-4">
      <UFormField :label="t('pages.withdrawalPage.transferTo')">
        <UTextarea
          v-model="draft.transferTo"
          :rows="3"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>
    </div>

    <UAlert
      v-if="localError"
      class="mt-5 rounded-2xl"
      color="error"
      variant="subtle"
      :description="localError"
    />

    <UButton
      class="mt-6 rounded-full font-semibold"
      color="primary"
      :loading="submitting"
      :disabled="disabled || !methods.length"
      @click="submit"
    >
      {{ t("pages.withdrawalPage.submit") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type {
  WithdrawalCurrencyRule,
  WithdrawalMethod,
  WithdrawalRequestDraft,
} from "../../domain/types/withdrawal.types"

const props = defineProps<{
  balance: number
  minimumAmount: number
  currency: string
  currencySymbol: string
  currencyRule: WithdrawalCurrencyRule
  methods: WithdrawalMethod[]
  paypalEmail: string
  submitting: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  request: [payload: WithdrawalRequestDraft]
}>()

const { t, locale } = useI18n()
const localError = ref("")
const draft = reactive<WithdrawalRequestDraft>({
  amount: props.balance || props.minimumAmount,
  method: "",
  paypalEmail: props.paypalEmail,
})

const formatAmount = (amount: number) =>
  formatCurrency(amount, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })

const availableLabel = computed(() =>
  t("pages.withdrawalPage.availableBadge", {
    amount: formatAmount(props.balance),
  }),
)

watch(
  () => props.methods,
  (methods) => {
    if (!draft.method && methods.length) {
      draft.method = methods[0].value
    }

    if (draft.method && !methods.some(method => method.value === draft.method)) {
      draft.method = methods[0]?.value ?? ""
    }
  },
  { immediate: true },
)

watch(
  () => props.paypalEmail,
  (email) => {
    if (!draft.paypalEmail) {
      draft.paypalEmail = email
    }
  },
)

function submit() {
  localError.value = ""

  if (draft.amount < props.minimumAmount) {
    localError.value = t("pages.withdrawalPage.errorMinimum", {
      amount: formatAmount(props.minimumAmount),
    })
    return
  }

  if (draft.amount > props.balance) {
    localError.value = t("pages.withdrawalPage.errorMaximum")
    return
  }

  emit("request", { ...draft })
}
</script>
