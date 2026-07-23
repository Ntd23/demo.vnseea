<!-- English description: Compact wallet balance card that mirrors the PHP wallet balance section. -->
<template>
  <section class="wallet-hero">
    <div class="wallet-hero__main">
      <div class="wallet-hero__icon">
        <Icon name="i-ph-wallet-duotone" class="h-7 w-7" />
      </div>
      <div class="wallet-hero__balance-block">
        <p class="wallet-hero__label">{{ t("pages.walletPage.balanceLabel") }}</p>
        <div class="wallet-hero__balance-row">
          <p class="wallet-hero__balance">{{ formattedBalance }}</p>
          <div class="wallet-hero__available">
            <span>{{ t("pages.walletPage.availableBalanceLabel") }}</span>
            <strong>{{ formattedWithdrawableBalance }}</strong>
          </div>
        </div>
        <p class="wallet-hero__notice">
          <Icon name="i-ph-warning-circle-duotone" class="h-4 w-4" />
          <span>{{ t("pages.walletPage.withdrawableNotice") }}</span>
        </p>
      </div>
    </div>

    <div class="wallet-hero__stats">
      <div class="wallet-hero__stat">
        <span>{{ transactionsCount }}</span>
        <p>{{ t("pages.walletPage.statTransactions") }}</p>
      </div>
      <div class="wallet-hero__stat">
        <span>{{ topupMethodsCount }}</span>
        <p>{{ t("pages.walletPage.topupMethod") }}</p>
      </div>
    </div>

    <div class="wallet-hero__actions">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type { WalletCurrencyRule } from "../../domain/types/wallet.types"

const props = defineProps<{
  balance: number
  withdrawableBalance: number
  transactionsCount: number
  topupMethodsCount: number
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const { t, locale } = useI18n()

const formatWalletAmount = (amount: number) =>
  formatCurrency(amount, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })

const formattedBalance = computed(() =>
  formatWalletAmount(props.balance),
)

const formattedWithdrawableBalance = computed(() =>
  formatWalletAmount(props.withdrawableBalance),
)
</script>

<style scoped>
.wallet-hero {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 6%, transparent);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.wallet-hero__main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.wallet-hero__icon {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.wallet-hero__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.wallet-hero__balance-block {
  min-width: 0;
  flex: 1;
}

.wallet-hero__balance-row {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
}

.wallet-hero__balance {
  margin-top: 4px;
  overflow-wrap: anywhere;
  font-size: clamp(28px, 5vw, 40px);
  line-height: 1.05;
  font-weight: 800;
  color: var(--text-primary);
}

.wallet-hero__available {
  display: inline-flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
  background: var(--bg-muted);
  padding: 8px 12px;
}

.wallet-hero__available span {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.wallet-hero__available strong {
  overflow-wrap: anywhere;
  color: #16a34a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.wallet-hero__notice {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
}

.wallet-hero__notice :deep(svg) {
  flex-shrink: 0;
  margin-top: 1px;
}

.wallet-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.wallet-hero__stat {
  min-width: 0;
  border-radius: 12px;
  background: #fafbfe;
  padding: 12px;
}

.wallet-hero__stat span {
  display: block;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.wallet-hero__stat p {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.wallet-hero__actions {
  display: grid;
  gap: 10px;
}

@media (min-width: 640px) {
  .wallet-hero {
    grid-template-columns: minmax(0, 1fr) 220px;
    align-items: center;
    padding: 24px;
  }

  .wallet-hero__actions {
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .wallet-hero__main {
    align-items: flex-start;
  }

  .wallet-hero__available {
    width: 100%;
  }
}
</style>
