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
import type { WalletSendPayload, WalletTopupPayload, WalletTransaction } from "../../application/composables/useMockWalletData"
import { useMockWalletData } from "../../application/composables/useMockWalletData"
import WalletHero from "../components/WalletHero.vue"
import WalletSendForm from "../components/WalletSendForm.vue"
import WalletTopupForm from "../components/WalletTopupForm.vue"
import WalletTransactions from "../components/WalletTransactions.vue"

const { t } = useI18n()
const { initialBalance, topupMethods, transactions } = useMockWalletData()

useSeoMeta({
  title: t("pages.walletPage.seoTitle"),
  description: t("pages.walletPage.seoDescription"),
})

const balance = ref(initialBalance)
const localTransactions = ref<WalletTransaction[]>([])

const allTransactions = computed(() => [...localTransactions.value, ...transactions.value])

const walletStats = computed(() => [
  {
    label: t("pages.walletPage.statTransactions"),
    value: allTransactions.value.length,
  },
  {
    label: t("pages.walletPage.statTopups"),
    value: localTransactions.value.filter(item => item.type === "topup").length,
  },
])

const handleTopup = (payload: WalletTopupPayload) => {
  const methodLabel = topupMethods.value.find(item => item.value === payload.method)?.label ?? payload.method
  balance.value += payload.amount
  localTransactions.value = [
    {
      id: `topup-${Date.now()}`,
      type: "topup",
      title: t("pages.walletPage.topupTransactionTitle"),
      description: t("pages.walletPage.topupTransactionDescription", { method: methodLabel }),
      amount: payload.amount,
      time: t("pages.walletPage.justNow"),
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
      title: t("pages.walletPage.sendTransactionTitle", { recipient: payload.recipient }),
      description: payload.note || t("pages.walletPage.sendTransactionDescription"),
      amount: -payload.amount,
      time: t("pages.walletPage.justNow"),
      status: "completed",
    },
    ...localTransactions.value,
  ]
}
</script>
