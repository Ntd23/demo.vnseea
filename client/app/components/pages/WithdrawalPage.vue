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

const {
  availableBalance,
  pendingAmount,
  minimumWithdrawal,
  methods,
  paymentProfiles,
  history,
} = useMockWithdrawalData()

useSeoMeta({
  title: "Withdrawal | VNSEEA",
  description: "Tạo yêu cầu rút tiền, quản lý thông tin thanh toán và lịch sử withdrawal.",
})

const availableBalanceState = ref(availableBalance)
const pendingAmountState = ref(pendingAmount)
const localHistory = ref<WithdrawalHistoryItem[]>([])

const allHistory = computed(() => [...localHistory.value, ...history])

const withdrawalStats = computed(() => [
  {
    label: "Đang chờ",
    value: formatWithdrawalCurrency(pendingAmountState.value),
  },
  {
    label: "Yêu cầu",
    value: allHistory.value.length,
  },
])

const handleRequest = (payload: WithdrawalRequestPayload) => {
  const method = methods.find(item => item.value === payload.method)
  availableBalanceState.value -= payload.amount
  pendingAmountState.value += payload.amount
  localHistory.value = [
    {
      id: `wd-${Date.now()}`,
      amount: payload.amount,
      method: method?.label ?? "Withdrawal",
      account: payload.accountNumber,
      time: "Vừa gửi",
      status: "pending",
    },
    ...localHistory.value,
  ]
}
</script>
