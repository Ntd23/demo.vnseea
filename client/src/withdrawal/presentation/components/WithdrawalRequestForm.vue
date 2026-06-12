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

    <div v-if="displayMethods.length" class="mt-5 grid gap-3 sm:grid-cols-2">
      <button
        v-for="method in displayMethods"
        :key="method.value"
        type="button"
        class="withdrawal-request__method flex min-h-20 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
        :class="method.value === draft.method ? 'border-[var(--border-strong)] bg-[var(--bg-surface-active)]' : 'border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]'"
        :disabled="disabled"
        @click="selectMethod(method.value)"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--text-brand)]">
          <Icon :name="methodIcon(method.value)" class="h-5 w-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-title-primary">{{ method.displayLabel }}</span>
          <span class="block text-caption-secondary">{{ methodDescription(method.value) }}</span>
        </span>
      </button>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.withdrawMethod')">
        <USelect
          v-model="draft.method"
          :items="displayMethods"
          label-key="displayLabel"
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
      <p
        v-if="draft.method === 'sepay'"
        class="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-[var(--text-secondary)]"
      >
        <Icon name="i-ph-info-duotone" class="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--text-brand)]" />
        <span>{{ t("pages.withdrawalPage.bankTransferFormatHint") }}</span>
      </p>
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

    <div v-else-if="draft.method === 'sepay'" class="mt-4 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.bankSelectLabel')">
        <USelect
          v-model="draft.bankCode"
          :items="bankOptions"
          label-key="label"
          value-key="value"
          class="w-full"
          :disabled="disabled"
          @update:model-value="syncSelectedBank"
        />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.bankAccountNumberLabel')">
        <UInput
          v-model="draft.accountNumber"
          inputmode="numeric"
          class="w-full"
          :placeholder="t('pages.withdrawalPage.accountNumberPlaceholder')"
          :disabled="disabled"
        />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.beneficiaryNameLabel')" class="md:col-span-2">
        <UInput
          v-model="draft.beneficiaryName"
          class="w-full"
          :placeholder="t('pages.withdrawalPage.beneficiaryNamePlaceholder')"
          :disabled="disabled"
        />
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
  bankCode: "",
  bankName: "",
  accountNumber: "",
  beneficiaryName: "",
})

const bankOptions = [
  { value: "VCB", label: "Vietcombank" },
  { value: "BIDV", label: "BIDV" },
  { value: "ICB", label: "VietinBank" },
  { value: "TCB", label: "Techcombank" },
  { value: "MB", label: "MB Bank" },
  { value: "ACB", label: "ACB" },
  { value: "VPB", label: "VPBank" },
  { value: "TPB", label: "TPBank" },
  { value: "VIB", label: "VIB" },
  { value: "STB", label: "Sacombank" },
  { value: "HDB", label: "HDBank" },
  { value: "OCB", label: "OCB" },
  { value: "MSB", label: "MSB" },
  { value: "SHB", label: "SHB" },
  { value: "EIB", label: "Eximbank" },
  { value: "SEAB", label: "SeABank" },
  { value: "BAB", label: "Bac A Bank" },
  { value: "ABB", label: "ABBank" },
  { value: "LPB", label: "LPBank" },
  { value: "NAB", label: "Nam A Bank" },
  { value: "VAB", label: "VietABank" },
  { value: "PGB", label: "PGBank" },
  { value: "PVCB", label: "PVcomBank" },
  { value: "VIETBANK", label: "VietBank" },
  { value: "BVB", label: "BaoViet Bank" },
]

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
const displayMethods = computed(() =>
  props.methods.map(method => ({
    ...method,
    displayLabel: method.value === "sepay"
      ? t("pages.withdrawalPage.bankTransferMethod")
      : method.label,
  })),
)

function selectMethod(method: string) {
  draft.method = method
  localError.value = ""
  if (method === "sepay" && !draft.bankCode && bankOptions[0]) {
    draft.bankCode = bankOptions[0].value
    draft.bankName = bankOptions[0].label
  }
}

function syncSelectedBank(value: string | number | boolean | Record<string, unknown> | undefined) {
  const bankCode = String(value ?? draft.bankCode ?? "")
  const bank = bankOptions.find(option => option.value === bankCode)
  draft.bankCode = bank?.value ?? bankCode
  draft.bankName = bank?.label ?? ""
}

function methodIcon(method: string) {
  if (method === "paypal") return "i-ph-paypal-logo-duotone"
  if (method === "sepay") return "i-ph-bank-duotone"
  return "i-ph-wallet-duotone"
}

function methodDescription(method: string) {
  if (method === "paypal") return t("pages.withdrawalPage.paypalMethodHint")
  if (method === "sepay") return t("pages.withdrawalPage.sepayMethodHint")
  return t("pages.withdrawalPage.otherMethodHint")
}

watch(
  () => props.methods,
  (methods) => {
    if (!draft.method && methods.length) {
      draft.method = methods[0].value
    }

    if (draft.method && !methods.some(method => method.value === draft.method)) {
      draft.method = methods[0]?.value ?? ""
    }

    if (draft.method === "sepay" && !draft.bankCode && bankOptions[0]) {
      draft.bankCode = bankOptions[0].value
      draft.bankName = bankOptions[0].label
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

  if (draft.method === "paypal") {
    const email = draft.paypalEmail?.trim() ?? ""
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      localError.value = t("pages.withdrawalPage.errorPaypalEmail")
      return
    }
  }
  else if (draft.method === "sepay") {
    syncSelectedBank(draft.bankCode)
    if (!draft.bankCode?.trim() || !draft.accountNumber?.trim() || !draft.beneficiaryName?.trim()) {
      localError.value = t("pages.withdrawalPage.errorBankTransferDetails")
      return
    }
  }
  else if (!draft.transferTo?.trim()) {
    localError.value = t("pages.withdrawalPage.errorTransferTo")
    return
  }

  emit("request", { ...draft })
}
</script>

<style scoped>
.withdrawal-request__method {
  position: relative;
  z-index: 2;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.withdrawal-request__method > * {
  pointer-events: none;
}
</style>
