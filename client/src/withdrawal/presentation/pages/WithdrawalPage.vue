<template>
  <div class="space-y-6 pb-20">
    <WithdrawalHero
      :available-balance="availableBalance"
      :stats="withdrawalStats"
    />

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-6">
        <WithdrawalRequestForm
          :available-balance="availableBalance"
          :methods="methods"
          :minimum-amount="minimumWithdrawal"
          @request="handleRequest"
        />

        <WithdrawalHistory :items="history" />
      </div>

      <WithdrawalPaymentInfo :profiles="paymentProfiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWithdrawal } from "../../application/composables/use-withdrawal"
import { formatWithdrawalCurrency } from "../../domain/types/withdrawal.types"
import WithdrawalHero from "../components/WithdrawalHero.vue"
import WithdrawalRequestForm from "../components/WithdrawalRequestForm.vue"
import WithdrawalHistory from "../components/WithdrawalHistory.vue"
import WithdrawalPaymentInfo from "../components/WithdrawalPaymentInfo.vue"

const { t } = useI18n()
const {
  availableBalance,
  pendingAmount,
  minimumWithdrawal,
  methods,
  paymentProfiles,
  history,
  handleRequest,
} = useWithdrawal()

useSeoMeta({
  title: () => t("pages.withdrawalPage.seoTitle"),
  description: () => t("pages.withdrawalPage.seoDescription"),
})

const withdrawalStats = computed(() => [
  {
    label: t("pages.withdrawalPage.statPending"),
    value: formatWithdrawalCurrency(pendingAmount.value),
  },
  {
    label: t("pages.withdrawalPage.statRequests"),
    value: history.value.length,
  },
])
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

