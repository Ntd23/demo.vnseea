<!-- English description: Wallet transaction history table/list backed by PHP transaction data. -->
<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-secondary">{{ t("pages.walletPage.historyEyebrow") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.historyTitle") }}</h2>
      </div>
      <UBadge
        color="primary"
        variant="subtle"
        class="rounded-full px-3 py-1 font-semibold"
      >
        {{ transactions.length }}
      </UBadge>
    </div>

    <div v-if="transactions.length" class="mt-5 overflow-hidden rounded-2xl border border-[var(--border-light)]">
      <div class="hidden grid-cols-[120px_minmax(0,1fr)_160px_160px] gap-4 bg-[var(--bg-muted)] px-4 py-3 text-label-secondary md:grid">
        <span>{{ t("pages.walletPage.transactionType") }}</span>
        <span>{{ t("pages.walletPage.transactionDescription") }}</span>
        <span>{{ t("pages.walletPage.transactionDate") }}</span>
        <span class="text-right">{{ t("pages.walletPage.transactionAmount") }}</span>
      </div>

      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="grid gap-2 border-t border-[var(--border-light)] px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_160px_160px] md:items-center"
      >
        <UBadge
          :color="badgeColor(transaction.statusTone)"
          variant="subtle"
          class="w-fit rounded-full px-3 py-1 font-semibold"
        >
          {{ transaction.kind || "-" }}
        </UBadge>
        <p class="min-w-0 text-body-primary">{{ transaction.notes || "-" }}</p>
        <p class="text-caption-secondary">{{ transaction.transactionDate || "-" }}</p>
        <p class="text-left font-black tabular-nums text-[var(--text-primary)] md:text-right">
          {{ formatTransactionAmount(transaction.amount) }}
        </p>
      </div>
    </div>

    <div v-else class="mt-5 rounded-2xl bg-[var(--bg-muted)] p-8 text-center">
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
</script>
