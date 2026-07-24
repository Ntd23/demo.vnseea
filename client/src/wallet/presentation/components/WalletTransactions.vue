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
          @click="previousPage"
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
          @click="nextPage"
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
import type {
  WalletCurrencyRule,
  WalletTransaction,
} from "../../domain/types/wallet.types"
import { useWalletTransactionsVM } from "../../application/view-models/useWalletTransactionsVM"

const props = defineProps<{
  transactions: WalletTransaction[]
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const { t } = useI18n()
const {
  activeFilter,
  currentPage,
  filters,
  filteredTransactions,
  paginatedTransactions,
  pageCount,
  setFilter,
  previousPage,
  nextPage,
  formatTransactionAmount,
  transactionTitle,
  transactionDetail,
  amountClass,
  transactionIcon,
  transactionIconClass,
} = useWalletTransactionsVM(
  () => props.transactions,
  () => props.currency,
  () => props.currencySymbol,
  () => props.currencyRule,
)
</script>

<style scoped>
.wallet-activity {
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 18px;
  box-shadow: var(--shadow-sm);
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
  color: var(--text-secondary);
}

.wallet-activity__title {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.wallet-activity__filters {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.wallet-activity__filter {
  position: relative;
  z-index: 2;
  display: inline-flex;
  min-height: 38px;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 8px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.wallet-activity__filter > *,
.wallet-activity__page > *,
.wallet-activity__page-btn > * {
  pointer-events: none;
}

.wallet-activity__filter strong {
  min-width: 22px;
  border-radius: 999px;
  background: var(--bg-muted);
  padding: 2px 6px;
  color: var(--text-primary);
  font-size: 11px;
  text-align: center;
}

.wallet-activity__filter--active {
  border-color: color-mix(in srgb, var(--bg-brand) 22%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.wallet-activity__filter--active strong {
  background: color-mix(in srgb, var(--bg-brand) 10%, transparent);
  color: var(--bg-brand);
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
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
}

.wallet-activity__icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.wallet-activity__icon--received {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
}

.wallet-activity__icon--sent {
  background: color-mix(in srgb, var(--bg-brand) 11%, transparent);
  color: var(--text-brand);
}

.wallet-activity__icon--wallet {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
}

.wallet-activity__icon--points_exchange {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.wallet-activity__icon--affiliate_reward {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.wallet-activity__icon--sale {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.wallet-activity__icon--donate {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.wallet-activity__icon--other {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.wallet-activity__icon--warning {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.wallet-activity__icon--danger {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--color-error);
}

.wallet-activity__content {
  min-width: 0;
  border-bottom: 1px solid var(--border-light);
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
  color: var(--text-primary);
}

.wallet-activity__meta {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.wallet-activity__amount {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.wallet-activity__amount--positive {
  color: var(--text-success);
}

.wallet-activity__amount--negative {
  color: var(--text-danger);
}

.wallet-activity__empty {
  margin-top: 14px;
  border-radius: 14px;
  background: var(--bg-muted);
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
  position: relative;
  z-index: 2;
  display: flex;
  min-width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.wallet-activity__page--active {
  border-color: var(--bg-brand);
  background: var(--bg-brand);
  color: var(--text-inverse);
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
