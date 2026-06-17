<!-- English description: Withdrawal page wired to backend data and the PHP withdrawal request flow. -->
<template>
  <div class="mx-auto max-w-5xl space-y-5 pb-10">
    <div v-if="loading" class="space-y-5">
      <USkeleton class="h-32 rounded-3xl" />
      <USkeleton class="h-72 rounded-3xl" />
    </div>

    <template v-else>
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        class="rounded-2xl"
        :description="errorMessage"
      />

      <template v-else>
        <WithdrawalHero
          :balance="overview.balance"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
          :user="overview.user"
        />

        <div
          v-if="belowMinimum"
          class="withdrawal-page__minimum-alert"
        >
          <Icon name="i-ph-warning-bold" class="h-6 w-6 flex-shrink-0" />
          <span>
            {{ t('pages.withdrawalPage.minimumWarning', {
              balance: formattedBalance,
              minimum: formattedMinimumAmount
            }) }}
          </span>
        </div>

        <div class="withdrawal-page__notice">
          {{ t("pages.withdrawalPage.withdrawableNotice") }}
        </div>

        <UAlert
          v-if="overview.hasPendingRequest"
          color="warning"
          variant="subtle"
          class="rounded-2xl"
          :description="t('pages.withdrawalPage.hasPendingRequest')"
        />

        <UAlert
          v-if="mutationError"
          color="error"
          variant="subtle"
          class="rounded-2xl"
          :description="mutationError"
        />
        <UAlert
          v-if="mutationMessage"
          color="primary"
          variant="subtle"
          class="rounded-2xl"
          :description="mutationMessage"
        />

        <WithdrawalRequestForm
          :balance="overview.balance"
          :minimum-amount="overview.minimumAmount"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
          :methods="overview.methods"
          :paypal-email="overview.paypalEmail"
          :submitting="submitting"
          :disabled="!canSubmit"
          @request="requestWithdrawal"
        />

        <WithdrawalHistory
          :items="overview.history"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWithdrawalPageVM } from "../../application/view-models/useWithdrawalPageVM"
import WithdrawalHero from "../components/WithdrawalHero.vue"
import WithdrawalHistory from "../components/WithdrawalHistory.vue"
import WithdrawalRequestForm from "../components/WithdrawalRequestForm.vue"

const { t } = useI18n()

const {
  overview,
  loading,
  errorMessage,
  belowMinimum,
  canSubmit,
  formattedBalance,
  formattedMinimumAmount,
  submitting,
  mutationError,
  mutationMessage,
  requestWithdrawal,
} = useWithdrawalPageVM()

useSeoMeta({
  title: () => t("pages.withdrawalPage.seoTitle"),
  description: () => t("pages.withdrawalPage.seoDescription"),
})
</script>

<style scoped>
.withdrawal-page__minimum-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 5px;
  background: #feecec;
  padding: 20px 18px;
  color: #ff4438;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.35;
}

.withdrawal-page__notice {
  border-radius: 5px;
  background: #fff8ef;
  padding: 22px 18px;
  color: #f28a2e;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.35;
}

@media (max-width: 640px) {
  .withdrawal-page__minimum-alert,
  .withdrawal-page__notice {
    padding: 16px;
    font-size: 15px;
  }
}
</style>
