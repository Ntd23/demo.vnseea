<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.withdrawalPage.requestEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.requestTitle") }}</h2>
        <p class="mt-1 text-body-secondary">
          {{ t("pages.withdrawalPage.requestDescription", { amount: formatWithdrawalCurrency(minimumAmount, locale) }) }}
        </p>
      </div>
      <p class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-4 py-2 text-[12px] font-extrabold text-[var(--color-primary-600)]">
        {{ t("pages.withdrawalPage.availableBadge", { amount: formatWithdrawalCurrency(availableBalance, locale) }) }}
      </p>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.value"
        :class="form.method === method.value
          ? 'border-[var(--border-strong)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
          : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)]'"
        class="rounded-[20px] border p-4 text-left transition"
        type="button"
        @click="form.method = method.value"
      >
        <Icon :name="messageText(method.icon)" class="h-6 w-6" />
        <p class="mt-3 text-[13px] font-extrabold">{{ messageText(method.label) }}</p>
        <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">{{ messageText(method.description) }}</p>
      </button>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.withdrawalPage.amountLabel") }}</span>
        <input v-model.number="form.amount" class="withdrawal-input mt-2" min="100000" type="number">
      </label>
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.withdrawalPage.accountNameLabel") }}</span>
        <input v-model="form.accountName" class="withdrawal-input mt-2" :placeholder="t('pages.withdrawalPage.accountNamePlaceholder')">
      </label>
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.withdrawalPage.accountNumberLabel") }}</span>
        <input v-model="form.accountNumber" class="withdrawal-input mt-2" :placeholder="t('pages.withdrawalPage.accountNumberPlaceholder')">
      </label>
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.withdrawalPage.noteLabel") }}</span>
        <input v-model="form.note" class="withdrawal-input mt-2" :placeholder="t('pages.withdrawalPage.notePlaceholder')">
      </label>
    </div>

    <p v-if="errorMessage" class="mt-4 rounded-[16px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
      {{ errorMessage }}
    </p>

    <button
      class="mt-5 h-12 w-full rounded-[var(--radius-full)] bg-[var(--color-primary-500)] text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]"
      type="button"
      @click="submit"
    >
      {{ t("pages.withdrawalPage.submit") }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { WithdrawalMethod, WithdrawalRequestPayload } from "~/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

const { t, rt, locale } = useI18n()

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

const messageText = (value: unknown) =>
  typeof value === "string" ? value : rt(value as never)

const submit = () => {
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
    errorMessage.value = t("pages.withdrawalPage.errorMissingFields")
    return
  }

  emit("request", { ...form })
  form.amount = props.minimumAmount
  form.accountName = ""
  form.accountNumber = ""
  form.note = ""
}
</script>

<style scoped>
.withdrawal-input {
  min-height: 48px;
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  padding: 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.withdrawal-input:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 4px var(--color-primary-50);
}
</style>
