<template>
  <section class="surface-card p-6">
    <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.withdrawalPage.requestEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.requestTitle") }}</h2>
    <p class="mt-3 text-body-secondary">
      {{ t("pages.withdrawalPage.requestDescription", { amount: formatWithdrawalCurrency(minimumAmount, locale.value) }) }}
    </p>

    <UBadge color="primary" variant="subtle" class="mt-4 rounded-full px-3 py-1.5 font-semibold">
      {{ t("pages.withdrawalPage.availableBadge", { amount: formatWithdrawalCurrency(availableBalance, locale.value) }) }}
    </UBadge>

    <div class="mt-6 space-y-5">
      <UFormField :label="t('pages.withdrawalPage.amountLabel')">
        <UInputNumber v-model="form.amount" :min="minimumAmount" :step="50000" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.accountNameLabel')">
        <UInput v-model="form.accountName" :placeholder="t('pages.withdrawalPage.accountNamePlaceholder')" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.accountNumberLabel')">
        <UInput v-model="form.accountNumber" :placeholder="t('pages.withdrawalPage.accountNumberPlaceholder')" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.noteLabel')">
        <UTextarea v-model="form.note" :placeholder="t('pages.withdrawalPage.notePlaceholder')" :rows="4" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.withdrawalPage.paymentInfoTitle')">
        <USelect
          v-model="form.method"
          :items="methods"
          label-key="label"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <UAlert
      v-if="errorMessage"
      class="mt-5 rounded-2xl"
      color="error"
      variant="subtle"
      :description="errorMessage"
    />

    <UButton
      class="mt-6 h-12 rounded-2xl font-black uppercase tracking-widest"
      block
      @click="onSubmit"
    >
      {{ t("pages.withdrawalPage.submit") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { WithdrawalMethod, WithdrawalRequestPayload } from "../../application/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "../../application/composables/useMockWithdrawalData"

const { t, locale } = useI18n()

const props = defineProps<{
  availableBalance: number
  minimumAmount: number
  methods: ReadonlyArray<WithdrawalMethod>
}>()

const emit = defineEmits<{ request: [payload: WithdrawalRequestPayload] }>()

const errorMessage = ref("")
const form = reactive<WithdrawalRequestPayload>({
  amount: props.minimumAmount,
  method: "bank",
  accountName: "",
  accountNumber: "",
  note: "",
})

function onSubmit() {
  errorMessage.value = ""
  if (form.amount < props.minimumAmount) {
    errorMessage.value = t("pages.withdrawalPage.errorMinimum", {
      amount: formatWithdrawalCurrency(props.minimumAmount, locale.value),
    })
    return
  }
  if (form.amount > props.availableBalance) {
    errorMessage.value = t("pages.withdrawalPage.errorMaximum")
    return
  }
  if (!form.accountName.trim() || !form.accountNumber.trim()) {
    errorMessage.value = "Vui long dien day du thong tin tai khoan."
    return
  }
  emit("request", { ...form })

  form.amount = props.minimumAmount
  form.accountName = ""
  form.accountNumber = ""
  form.note = ""
}
</script>
