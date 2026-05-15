<!-- English description: Wallet transaction history table/list backed by PHP transaction data. -->
<template>
  <section class="wallet-activity">
    <div class="wallet-activity__header">
      <div>
        <p class="wallet-activity__eyebrow">{{ t("pages.walletPage.historyEyebrow") }}</p>
        <h2 class="wallet-activity__title">{{ t("pages.walletPage.historyTitle") }}</h2>
      </div>
      <UBadge
        color="primary"
        variant="subtle"
        class="rounded-full px-3 py-1 font-semibold"
      >
        {{ transactions.length }}
      </UBadge>
    </div>

    <div v-if="transactions.length" class="wallet-activity__list">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="wallet-activity__item"
      >
        <div class="wallet-activity__icon" :class="iconClass(transaction.statusTone)">
          <Icon :name="transactionIcon(transaction)" class="h-5 w-5" />
        </div>

        <div class="wallet-activity__content">
          <div class="wallet-activity__row">
            <div class="min-w-0">
              <p class="wallet-activity__name">{{ transaction.notes || transaction.kind || "-" }}</p>
              <p class="wallet-activity__meta">
                {{ transaction.kind || "-" }}
                <span v-if="transaction.transactionDate">- {{ transaction.transactionDate }}</span>
              </p>
            </div>
            <p class="wallet-activity__amount" :class="amountClass(transaction.amount)">
              {{ formatTransactionAmount(transaction.amount) }}
            </p>
          </div>

          <UBadge
            :color="badgeColor(transaction.statusTone)"
            variant="subtle"
            class="mt-2 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          >
            {{ statusLabel(transaction) }}
          </UBadge>
        </div>
      </div>
    </div>

    <div v-else class="wallet-activity__empty">
      <Icon name="i-ph-receipt-duotone" class="mx-auto h-10 w-10 text-[var(--icon-secondary)]" />
      <p class="mt-3 text-body-secondary">{{ t("pages.walletPage.noTransactions") }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type {
  WalletCurrencyRule,
  WalletTransaction,
  WalletTransactionTone,
} from "../../domain/types/wallet.types"

const props = defineProps<{
  transactions: WalletTransaction[]
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const { t, locale } = useI18n()

const formatTransactionAmount = (amount: number) =>
  formatCurrency(amount, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })

const badgeColor = (tone: WalletTransactionTone) => {
  if (tone === "success") return "primary"
  if (tone === "warning") return "warning"
  if (tone === "danger") return "error"
  return "neutral"
}

const statusLabel = (transaction: WalletTransaction) => {
  if (transaction.statusTone === "success") return t("pages.walletPage.statusCompleted")
  if (transaction.statusTone === "warning") return t("pages.walletPage.statusPending")
  if (transaction.statusTone === "danger") return t("pages.walletPage.statusFailed")
  return transaction.kind || "-"
}

const amountClass = (amount: number) => {
  if (amount > 0) return "wallet-activity__amount--positive"
  if (amount < 0) return "wallet-activity__amount--negative"
  return ""
}

const iconClass = (tone: WalletTransactionTone) => {
  if (tone === "success") return "wallet-activity__icon--success"
  if (tone === "warning") return "wallet-activity__icon--warning"
  if (tone === "danger") return "wallet-activity__icon--danger"
  return ""
}

const transactionIcon = (transaction: WalletTransaction) => {
  const value = `${transaction.kind} ${transaction.notes}`.toLowerCase()
  if (value.includes("send") || value.includes("transfer") || transaction.amount < 0) return "i-ph-paper-plane-tilt-duotone"
  if (value.includes("withdraw") || value.includes("bank")) return "i-ph-bank-duotone"
  if (value.includes("qr") || value.includes("sepay")) return "i-ph-qr-code-duotone"
  return "i-ph-receipt-duotone"
}
</script>

<style scoped>
.wallet-activity {
  border: 1px solid rgba(0, 0, 255, 0.06);
  border-radius: 16px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.wallet-activity__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.wallet-activity__eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.wallet-activity__title {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.wallet-activity__list {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.wallet-activity__item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  border-radius: 14px;
  padding: 12px;
  transition: all 0.15s ease;
}

.wallet-activity__item:hover {
  background: rgba(0, 0, 255, 0.03);
}

.wallet-activity__icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
}

.wallet-activity__icon--success {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.wallet-activity__icon--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.wallet-activity__icon--danger {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.wallet-activity__content {
  min-width: 0;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.wallet-activity__item:last-child .wallet-activity__content {
  border-bottom: 0;
  padding-bottom: 0;
}

.wallet-activity__row {
  display: grid;
  gap: 8px;
}

.wallet-activity__name {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.wallet-activity__meta {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.wallet-activity__amount {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.wallet-activity__amount--positive {
  color: #0284c7;
}

.wallet-activity__amount--negative {
  color: #dc2626;
}

.wallet-activity__empty {
  margin-top: 14px;
  border-radius: 14px;
  background: #fafbfe;
  padding: 32px;
  text-align: center;
}

@media (min-width: 640px) {
  .wallet-activity {
    padding: 20px;
  }

  .wallet-activity__row {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .wallet-activity__amount {
    text-align: right;
  }
}
</style>
