<template>
  <div class="space-y-5 pb-10">
    <WalletHero
      :balance="balance"
      :stats="walletStats"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <main class="space-y-5">
        <WalletTopupForm
          :methods="topupMethods"
          @topup="handleTopup"
        />

        <WalletTransactions :transactions="allTransactions" />
      </main>

      <WalletSendForm
        :balance="balance"
        @send="handleSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WalletSendPayload, WalletTopupPayload, WalletTransaction } from "~/composables/useMockWalletData"

const { initialBalance, topupMethods, transactions } = useMockWalletData()

useSeoMeta({
  title: "Wallet | VNSEEA",
  description: "Xem số dư, nạp tiền và gửi tiền bằng ví VNSEEA.",
})

const balance = ref(initialBalance)
const localTransactions = ref<WalletTransaction[]>([])

const allTransactions = computed(() => [...localTransactions.value, ...transactions])

const walletStats = computed(() => [
  {
    label: "Giao dịch",
    value: allTransactions.value.length,
  },
  {
    label: "Nạp trong phiên",
    value: localTransactions.value.filter(item => item.type === "topup").length,
  },
])

const handleTopup = (payload: WalletTopupPayload) => {
  balance.value += payload.amount
  localTransactions.value = [
    {
      id: `topup-${Date.now()}`,
      type: "topup",
      title: "Nạp tiền vào ví",
      description: `Mock nạp tiền bằng ${payload.method}. Chưa gọi wallet.php.`,
      amount: payload.amount,
      time: "Vừa xong",
      status: "completed",
    },
    ...localTransactions.value,
  ]
}

const handleSend = (payload: WalletSendPayload) => {
  balance.value -= payload.amount
  localTransactions.value = [
    {
      id: `send-${Date.now()}`,
      type: "send",
      title: `Gửi tiền cho ${payload.recipient}`,
      description: payload.note || "Mock gửi tiền. Chưa gọi wallet.php.",
      amount: -payload.amount,
      time: "Vừa xong",
      status: "completed",
    },
    ...localTransactions.value,
  ]
}
</script>
