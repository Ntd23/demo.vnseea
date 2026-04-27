<template>
  <div class="space-y-6 pb-20">
    <WalletHero
      :balance="balance"
      :stats="walletStats"
    />

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-6">
        <WalletTopupForm
          :methods="topupMethods"
          @topup="handleTopup"
        />

        <WalletTransactions :transactions="transactions" />
      </div>

      <WalletSendForm
        :balance="balance"
        @send="handleSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from "../../application/composables/use-wallet"
import WalletHero from "../components/WalletHero.vue"
import WalletTopupForm from "../components/WalletTopupForm.vue"
import WalletSendForm from "../components/WalletSendForm.vue"
import WalletTransactions from "../components/WalletTransactions.vue"

const { t } = useI18n()
const { balance, topupMethods, transactions, walletStats, handleTopup, handleSend } = useWallet()

useSeoMeta({
  title: t("pages.walletPage.seoTitle"),
  description: t("pages.walletPage.seoDescription"),
})
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

