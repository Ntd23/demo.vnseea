<!-- English description: Withdrawal balance block that follows the PHP withdrawal page order. -->
<template>
  <section class="withdrawal-hero">
    <div class="withdrawal-hero__avatar-wrap">
      <img
        v-if="user.avatar"
        :src="user.avatar"
        :alt="displayName"
        class="withdrawal-hero__avatar"
      >
      <div v-else class="withdrawal-hero__avatar withdrawal-hero__avatar--fallback">
        <Icon name="i-ph-user-duotone" class="h-12 w-12" />
      </div>
      <span class="withdrawal-hero__badge">
        <Icon name="i-ph-money-duotone" class="h-6 w-6" />
      </span>
    </div>

    <div class="min-w-0">
      <p class="withdrawal-hero__name">{{ displayName }}</p>
      <h1 class="withdrawal-hero__title">
        {{ t("pages.withdrawalPage.incomeTitle", { amount: availableBalance }) }}
      </h1>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type {
  WithdrawalCurrencyRule,
  WithdrawalUserSummary,
} from "../../domain/types/withdrawal.types"

const props = defineProps<{
  balance: number
  currency: string
  currencySymbol: string
  currencyRule: WithdrawalCurrencyRule
  user: WithdrawalUserSummary
}>()

const { t, locale } = useI18n()

const availableBalance = computed(() =>
  formatCurrency(props.balance, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  }),
)
const displayName = computed(() =>
  props.user.username || props.user.name || t("pages.withdrawalPage.defaultUserName"),
)
</script>

<style scoped>
.withdrawal-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 154px;
  border: 1px solid #d7ead7;
  border-radius: 9px;
  background: #fbfdf9;
  padding: 26px;
}

.withdrawal-hero__avatar-wrap {
  position: relative;
  flex: 0 0 auto;
}

.withdrawal-hero__avatar {
  width: 100px;
  height: 100px;
  border-radius: 999px;
  background: #ffe0b8;
  object-fit: cover;
}

.withdrawal-hero__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #257618;
}

.withdrawal-hero__badge {
  position: absolute;
  right: -4px;
  bottom: -2px;
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 4px solid #fbfdf9;
  border-radius: 999px;
  background: #2f7f21;
  color: #fff;
}

.withdrawal-hero__name {
  color: #14730f;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.2;
}

.withdrawal-hero__title {
  margin-top: 4px;
  color: #187311;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.16;
}

@media (max-width: 640px) {
  .withdrawal-hero {
    gap: 16px;
    min-height: 128px;
    padding: 18px;
  }

  .withdrawal-hero__avatar {
    width: 72px;
    height: 72px;
  }

  .withdrawal-hero__badge {
    width: 32px;
    height: 32px;
  }

  .withdrawal-hero__name {
    font-size: 17px;
  }

  .withdrawal-hero__title {
    font-size: 26px;
  }
}
</style>
