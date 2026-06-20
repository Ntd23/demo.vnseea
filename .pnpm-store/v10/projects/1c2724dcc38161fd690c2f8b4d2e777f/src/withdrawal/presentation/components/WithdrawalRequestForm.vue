<!-- English description: Withdrawal request form using the same payload fields as the PHP withdrawal form. -->
<template>
  <section class="surface-card p-4 sm:p-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-primary text-[var(--text-primary)]">
        {{ t("pages.withdrawalPage.requestTitle") }}
      </h2>
      <UBadge
        color="primary"
        variant="subtle"
        class="w-fit rounded-full px-3 py-1 font-semibold"
      >
        {{ availableLabel }}
      </UBadge>
    </div>

    <div class="mt-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 py-3">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-muted)] text-[var(--text-brand)]">
          <Icon name="i-ph-bank-duotone" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <p class="text-label-primary text-[var(--text-primary)]">
            {{ t("pages.withdrawalPage.bankTransferMethod") }}
          </p>
          <p class="text-caption-secondary">
            {{ t("pages.withdrawalPage.sepayMethodHint") }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.bankSelectLabel')">
        <USelect
          v-model="draft.bankCode"
          :items="bankOptions"
          label-key="label"
          value-key="value"
          class="w-full"
          :disabled="formDisabled"
          @update:model-value="syncSelectedBank"
        />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.amountLabel')">
        <UInput
          :model-value="amountInput"
          inputmode="numeric"
          class="w-full"
          :disabled="formDisabled"
          @focus="selectAmountInput"
          @update:model-value="updateAmountInput"
        />
      </UFormField>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <UFormField :label="t('pages.withdrawalPage.bankAccountNumberLabel')">
        <UInput
          v-model="draft.accountNumber"
          inputmode="numeric"
          class="w-full"
          :placeholder="t('pages.withdrawalPage.accountNumberPlaceholder')"
          :disabled="formDisabled"
        />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.beneficiaryNameLabel')">
        <UInput
          v-model="draft.beneficiaryName"
          class="w-full"
          :placeholder="t('pages.withdrawalPage.beneficiaryNamePlaceholder')"
          :disabled="formDisabled"
        />
      </UFormField>
    </div>

    <p class="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-[var(--text-secondary)]">
      <Icon name="i-ph-info-duotone" class="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--text-brand)]" />
      <span>{{ t("pages.withdrawalPage.bankTransferFormatHint") }}</span>
    </p>

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
      :disabled="formDisabled"
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
  amount: props.balance,
  method: "sepay",
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

function formatAmount(amount: number) {
  return formatCurrency(amount, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })
}

const amountInput = ref(formatAmount(draft.amount))

function parseAmountInput(value: unknown) {
  const digits = String(value ?? "").replace(/[^\d]/g, "")
  return digits ? Number(digits) : 0
}

function syncAmountInput(amount: number) {
  draft.amount = Number.isFinite(amount) ? amount : 0
  amountInput.value = formatAmount(draft.amount)
}

function updateAmountInput(value: string | number) {
  syncAmountInput(parseAmountInput(value))
}

function selectAmountInput(event: FocusEvent) {
  const input = event.target instanceof HTMLInputElement ? event.target : null
  input?.select()
}

const availableLabel = computed(() =>
  t("pages.withdrawalPage.availableBadge", {
    amount: formatAmount(props.balance),
  }),
)
const bankTransferEnabled = computed(() =>
  props.methods.some(method => method.value === "sepay"),
)
const formDisabled = computed(() => props.disabled || !bankTransferEnabled.value)

function syncSelectedBank(value: string | number | boolean | Record<string, unknown> | undefined) {
  const bankCode = String(value ?? draft.bankCode ?? "")
  const bank = bankOptions.find(option => option.value === bankCode)
  draft.bankCode = bank?.value ?? bankCode
  draft.bankName = bank?.label ?? ""
}

watch(
  () => props.methods,
  () => {
    draft.method = "sepay"
    if (!draft.bankCode && bankOptions[0]) {
      syncSelectedBank(bankOptions[0].value)
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

watch(
  () => props.balance,
  (balance) => {
    if (draft.amount === 0 || draft.amount > balance) {
      syncAmountInput(balance)
    }
  },
)

watch(
  () => [props.currency, props.currencySymbol, props.currencyRule, locale.value],
  () => {
    amountInput.value = formatAmount(draft.amount)
  },
)

function submit() {
  localError.value = ""
  draft.method = "sepay"

  if (!bankTransferEnabled.value) {
    localError.value = t("pages.withdrawalPage.errorBankTransferUnavailable")
    return
  }

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

  syncSelectedBank(draft.bankCode)
  if (!draft.bankCode?.trim() || !draft.accountNumber?.trim() || !draft.beneficiaryName?.trim()) {
    localError.value = t("pages.withdrawalPage.errorBankTransferDetails")
    return
  }

  emit("request", { ...draft })
}
</script>
