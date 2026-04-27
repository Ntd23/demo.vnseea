<template>
  <section class="surface-card p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.walletPage.historyEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.historyTitle") }}</h2>
      </div>
      <UBadge
        :label="transactions.length.toString()"
        size="md"
        variant="subtle"
        color="primary"
        class="rounded-full px-3 font-bold"
      />
    </div>

    <div class="mt-8 space-y-4">
      <div v-for="transaction in transactions" :key="transaction.id" class="group flex items-center justify-between gap-4 rounded-2xl bg-secondary-50/50 p-5 border border-secondary-100/30 transition hover:bg-secondary-50">
        <div class="flex min-w-0 items-center gap-4">
          <div 
            :class="iconClass(transaction.amount)"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm border border-secondary-100/30 transition-transform group-hover:scale-110"
          >
            <Icon :name="iconName(transaction.type)" class="h-6 w-6" />
          </div>
          <div class="min-w-0 space-y-1">
            <p class="truncate text-[15px] font-black text-[var(--text-primary)]">{{ transaction.title }}</p>
            <p class="truncate text-xs font-semibold text-[var(--text-primary)]">{{ transaction.description }}</p>
            <div class="flex items-center gap-2 text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
              <span>{{ transaction.time }}</span>
              <span class="text-secondary-200">•</span>
              <span :class="statusColorClass(transaction.status)">{{ statusLabel(transaction.status) }}</span>
            </div>
          </div>
        </div>
        <p class="shrink-0 text-lg font-black tabular-nums" :class="transaction.amount >= 0 ? 'text-sky-600' : 'text-red-600'">
          {{ transaction.amount >= 0 ? "+" : "-" }}{{ formatWalletCurrency(Math.abs(transaction.amount), locale.value) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WalletTransaction, WalletTransactionType } from "../../application/composables/useMockWalletData"
import { formatWalletCurrency } from "../../application/composables/useMockWalletData"

defineProps<{ transactions: ReadonlyArray<WalletTransaction> }>()

const { t, locale } = useI18n()

const iconName = (type: WalletTransactionType) => {
  if (type === "topup") return "i-ph-arrow-down-left-bold"
  if (type === "send") return "i-ph-arrow-up-right-bold"
  if (type === "receive") return "i-ph-arrow-down-bold"
  if (type === "refund") return "i-ph-arrow-counter-clockwise-bold"
  return "i-ph-receipt-fill"
}

const statusLabel = (status: WalletTransaction["status"]) => {
  if (status === "completed") return t("pages.walletPage.statusCompleted")
  if (status === "pending") return t("pages.walletPage.statusPending")
  return t("pages.walletPage.statusFailed")
}

const statusColorClass = (status: WalletTransaction["status"]) => {
  if (status === "completed") return "text-sky-500"
  if (status === "pending") return "text-amber-500"
  return "text-red-500"
}

const iconClass = (amount: number) =>
  amount >= 0 ? "bg-sky-50 text-sky-600 border-sky-100" : "bg-red-50 text-red-600 border-red-100"
</script>
