<!-- English description: Wallet transaction history table/list backed by PHP transaction data. -->
<template>
  <section class="wallet-activity">
    <div class="wallet-activity__header">
      <div>
        <p class="wallet-activity__eyebrow">{{ t("pages.walletPage.historyEyebrow") }}</p>
        <h2 class="wallet-activity__title">{{ t("pages.walletPage.historyTitle") }}</h2>
      </div>
    </div>

    <div v-if="transactions.length" class="wallet-activity__filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="wallet-activity__filter"
        :class="{ 'wallet-activity__filter--active': activeFilter === filter.value }"
        @click="setFilter(filter.value)"
      >
        <Icon :name="filter.icon" class="h-4 w-4" />
        <span>{{ filter.label }}</span>
        <strong>{{ filter.count }}</strong>
      </button>
    </div>

    <template v-if="filteredTransactions.length">
      <div class="wallet-activity__list">
        <div
          v-for="transaction in paginatedTransactions"
          :key="transaction.id"
          class="wallet-activity__item"
        >
          <div class="wallet-activity__icon" :class="transactionIconClass(transaction)">
            <Icon :name="transactionIcon(transaction)" class="h-5 w-5" />
          </div>

          <div class="wallet-activity__content">
            <div class="wallet-activity__row">
              <div class="min-w-0">
                <p class="wallet-activity__name">{{ transactionTitle(transaction) }}</p>
                <p class="wallet-activity__meta">
                  {{ transactionDetail(transaction) }}
                  <span v-if="transaction.transactionDate">- {{ transaction.transactionDate }}</span>
                </p>
              </div>
              <p class="wallet-activity__amount" :class="amountClass(transaction)">
                {{ formatTransactionAmount(transaction) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pageCount > 1" class="wallet-activity__pagination">
        <button
          type="button"
          class="wallet-activity__page-btn"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          <Icon name="i-ph-caret-left-bold" class="h-4 w-4" />
        </button>
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          class="wallet-activity__page"
          :class="{ 'wallet-activity__page--active': currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="wallet-activity__page-btn"
          :disabled="currentPage === pageCount"
          @click="currentPage += 1"
        >
          <Icon name="i-ph-caret-right-bold" class="h-4 w-4" />
        </button>
      </div>
    </template>

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
} from "../../domain/types/wallet.types"

const props = defineProps<{
  transactions: WalletTransaction[]
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const { t, locale } = useI18n()
const pageSize = 10
const currentPage = ref(1)
const activeFilter = ref("all")

const transactionKind = (transaction: WalletTransaction) =>
  transaction.kind.toUpperCase()

const transactionGroup = (transaction: WalletTransaction) => {
  const kind = transactionKind(transaction)

  if (kind === "RECEIVED") return "received"
  if (kind === "SENT") return "sent"
  if (kind === "WALLET") return "wallet"
  if (kind === "SALE" || kind === "SALES") return "sale"
  if (kind === "DONATE") return "donate"
  return "other"
}

const countByFilter = (value: string) =>
  value === "all"
    ? props.transactions.length
    : props.transactions.filter(transaction => transactionGroup(transaction) === value).length

const filters = computed(() => [
  { value: "all", label: t("pages.walletPage.filterAll"), icon: "i-ph-list-bullets-duotone", count: countByFilter("all") },
  { value: "received", label: t("pages.walletPage.filterReceived"), icon: "i-ph-hand-coins-duotone", count: countByFilter("received") },
  { value: "sent", label: t("pages.walletPage.filterSent"), icon: "i-ph-paper-plane-tilt-duotone", count: countByFilter("sent") },
  { value: "wallet", label: t("pages.walletPage.filterTopup"), icon: "i-ph-wallet-duotone", count: countByFilter("wallet") },
  { value: "sale", label: t("pages.walletPage.filterSale"), icon: "i-ph-storefront-duotone", count: countByFilter("sale") },
  { value: "donate", label: t("pages.walletPage.filterDonate"), icon: "i-ph-heart-duotone", count: countByFilter("donate") },
])

const filteredTransactions = computed(() =>
  activeFilter.value === "all"
    ? props.transactions
    : props.transactions.filter(transaction => transactionGroup(transaction) === activeFilter.value),
)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)),
)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTransactions.value.slice(start, start + pageSize)
})

watch([filteredTransactions, () => props.transactions.length], () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})

function setFilter(value: string) {
  activeFilter.value = value
  currentPage.value = 1
}

const transactionDirection = (transaction: WalletTransaction) => {
  const group = transactionGroup(transaction)

  if (["sent", "donate"].includes(group)) return "out"
  if (transactionKind(transaction) === "PURCHASE") return "out"
  if (["received", "wallet", "sale"].includes(group)) return "in"
  if (transaction.amount < 0) return "out"
  if (transaction.amount > 0) return "in"
  return "neutral"
}

const formatTransactionAmount = (transaction: WalletTransaction) => {
  const direction = transactionDirection(transaction)
  const formatted = formatCurrency(Math.abs(transaction.amount), {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })

  if (direction === "in") return `+${formatted}`
  if (direction === "out") return `-${formatted}`
  return formatted
}

const transactionCounterparty = (transaction: WalletTransaction) =>
  transaction.counterpartyName || (transaction.counterpartyId ? `#${transaction.counterpartyId}` : "-")

const transactionTitle = (transaction: WalletTransaction) => {
  const kind = transactionKind(transaction)
  const counterparty = transactionCounterparty(transaction)

  if (kind === "RECEIVED") {
    return t("pages.walletPage.transactionReceivedTitle", { sender: counterparty })
  }

  if (kind === "SENT") {
    return t("pages.walletPage.transactionSentTitle", { recipient: counterparty })
  }

  if (kind === "SALE" || kind === "SALES") {
    return t("pages.walletPage.transactionSaleTitle")
  }

  if (kind === "DONATE") {
    return t("pages.walletPage.transactionDonateTitle")
  }

  if (kind === "WALLET") {
    return t("pages.walletPage.transactionWalletTitle")
  }

  return transaction.notes || transaction.kind || "-"
}

const transactionDetail = (transaction: WalletTransaction) => {
  const kind = transactionKind(transaction)

  if (kind === "RECEIVED" || kind === "SENT") {
    return transaction.notes || "-"
  }

  if (kind === "SALE" || kind === "SALES") {
    return transaction.notes || t("pages.walletPage.transactionSaleDescription")
  }

  if (kind === "DONATE") {
    return transaction.notes
      ? t("pages.walletPage.transactionDonateDescription", { campaign: transaction.notes })
      : t("pages.walletPage.transactionDonateFallback")
  }

  if (kind === "WALLET") {
    return transaction.notes || t("pages.walletPage.transactionWalletDescription")
  }

  return transaction.kind || "-"
}

const amountClass = (transaction: WalletTransaction) => {
  const direction = transactionDirection(transaction)

  if (direction === "in") return "wallet-activity__amount--positive"
  if (direction === "out") return "wallet-activity__amount--negative"
  return ""
}

const transactionIcon = (transaction: WalletTransaction) => {
  const kind = transactionKind(transaction)

  if (kind === "RECEIVED") return "i-ph-hand-coins-duotone"
  if (kind === "SENT") return "i-ph-paper-plane-tilt-duotone"
  if (kind === "WALLET") return transaction.notes.toLowerCase().includes("sepay")
    ? "i-ph-qr-code-duotone"
    : "i-ph-wallet-duotone"
  if (kind === "SALE" || kind === "SALES") return "i-ph-storefront-duotone"
  if (kind === "DONATE") return "i-ph-heart-duotone"
  if (kind === "PRO") return "i-ph-crown-duotone"
  if (kind === "PURCHASE") return "i-ph-shopping-bag-duotone"
  return "i-ph-receipt-duotone"
}

const transactionIconClass = (transaction: WalletTransaction) =>
  `wallet-activity__icon--${transactionGroup(transaction)}`
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

.wallet-activity__filters {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.wallet-activity__filter {
  display: inline-flex;
  min-height: 38px;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px 10px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.wallet-activity__filter strong {
  min-width: 22px;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 2px 6px;
  color: #0f172a;
  font-size: 11px;
  text-align: center;
}

.wallet-activity__filter--active {
  border-color: rgba(0, 0, 255, 0.22);
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

.wallet-activity__filter--active strong {
  background: rgba(0, 0, 255, 0.1);
  color: #0000ff;
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

.wallet-activity__icon--received {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.wallet-activity__icon--sent {
  background: rgba(99, 102, 241, 0.11);
  color: #4f46e5;
}

.wallet-activity__icon--wallet {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.wallet-activity__icon--sale {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.wallet-activity__icon--donate {
  background: rgba(236, 72, 153, 0.12);
  color: #db2777;
}

.wallet-activity__icon--other {
  background: #f1f5f9;
  color: #475569;
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
  color: #15803d;
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

.wallet-activity__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 14px;
}

.wallet-activity__page,
.wallet-activity__page-btn {
  display: flex;
  min-width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.wallet-activity__page--active {
  border-color: #0000ff;
  background: #0000ff;
  color: #ffffff;
}

.wallet-activity__page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
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
