<template>
  <div class="space-y-5 pb-10">
    <WithdrawalHero
      :available-balance="availableBalanceState"
      :stats="withdrawalStats"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <main class="space-y-5">
        <WithdrawalRequestForm
          :available-balance="availableBalanceState"
          :methods="methods"
          :minimum-amount="minimumWithdrawal"
          @request="handleRequest"
        />

        <WithdrawalHistory :items="allHistory" />
      </main>

      <WithdrawalPaymentInfo :profiles="paymentProfiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WithdrawalHistoryItem, WithdrawalRequestPayload } from "~/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

const { t, locale } = useI18n()

const {
  availableBalance,
  pendingAmount,
  minimumWithdrawal,
  methods,
  paymentProfiles,
  history,
} = useMockWithdrawalData()

useSeoMeta({
  title: () => t("pages.withdrawalPage.seoTitle"),
  description: () => t("pages.withdrawalPage.seoDescription"),
})

const availableBalanceState = ref(availableBalance)
const pendingAmountState = ref(pendingAmount)
const localHistory = ref<WithdrawalHistoryItem[]>([])

const allHistory = computed(() => [...localHistory.value, ...history.value])

const withdrawalStats = computed(() => [
  {
    label: t("pages.withdrawalPage.statPending"),
    value: formatWithdrawalCurrency(pendingAmountState.value, locale.value),
  },
  {
    label: t("pages.withdrawalPage.statRequests"),
    value: allHistory.value.length,
  },
])

const handleRequest = (payload: WithdrawalRequestPayload) => {
  const method = methods.value.find(item => item.value === payload.method)
  availableBalanceState.value -= payload.amount
  pendingAmountState.value += payload.amount
  localHistory.value = [
    {
      id: `wd-${Date.now()}`,
      amount: payload.amount,
      method: method?.label ?? t("pages.withdrawalPage.fallbackMethod"),
      account: payload.accountNumber,
      time: t("pages.withdrawalPage.submittedNow"),
      status: "pending",
    },
    ...localHistory.value,
  ]
}
</script>
