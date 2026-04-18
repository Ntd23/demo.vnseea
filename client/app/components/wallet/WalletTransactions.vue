<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">Lịch sử</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Giao dịch ví</h2>
      </div>
      <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ transactions.length }}</span>
    </div>

    <div class="mt-5 space-y-3">
      <div v-for="transaction in transactions" :key="transaction.id" class="flex items-center justify-between gap-4 rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" :class="iconClass(transaction.amount)">
            <Icon :name="iconName(transaction.type)" class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-[14px] font-extrabold text-[var(--text-primary)]">{{ transaction.title }}</p>
            <p class="mt-1 truncate text-[12px] font-semibold text-[var(--text-secondary)]">{{ transaction.description }}</p>
            <p class="mt-1 text-[11px] font-semibold text-[var(--text-tertiary)]">{{ transaction.time }} · {{ transaction.status }}</p>
          </div>
        </div>
        <p class="shrink-0 text-[14px] font-black" :class="transaction.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'">
          {{ transaction.amount >= 0 ? "+" : "-" }}{{ formatWalletCurrency(Math.abs(transaction.amount)) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WalletTransaction, WalletTransactionType } from "~/composables/useMockWalletData"
import { formatWalletCurrency } from "~/composables/useMockWalletData"

defineProps<{ transactions: ReadonlyArray<WalletTransaction> }>()

const iconName = (type: WalletTransactionType) => {
  if (type === "topup") return "i-ph-arrow-down-left-bold"
  if (type === "send") return "i-ph-arrow-up-right-bold"
  if (type === "receive") return "i-ph-arrow-down-bold"
  if (type === "refund") return "i-ph-arrow-counter-clockwise-bold"
  return "i-ph-receipt-fill"
}

const iconClass = (amount: number) =>
  amount >= 0 ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
</script>
