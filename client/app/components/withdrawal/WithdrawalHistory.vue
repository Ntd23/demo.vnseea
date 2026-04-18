<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">Lịch sử</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Yêu cầu rút tiền</h2>
      </div>
      <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
        {{ items.length }}
      </span>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex flex-col gap-4 rounded-[22px] bg-[var(--bg-surface-hover)] p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="text-[15px] font-black text-[var(--text-primary)]">{{ formatWithdrawalCurrency(item.amount) }}</p>
          <p class="mt-1 text-[13px] font-bold text-[var(--text-secondary)]">{{ item.method }} · {{ item.account }}</p>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">{{ item.time }}</p>
        </div>
        <span
          :class="statusClass(item.status)"
          class="w-fit rounded-[var(--radius-full)] px-3 py-1.5 text-[12px] font-extrabold"
        >
          {{ statusLabel(item.status) }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WithdrawalHistoryItem } from "~/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

defineProps<{ items: ReadonlyArray<WithdrawalHistoryItem> }>()

const statusLabel = (status: WithdrawalHistoryItem["status"]) => {
  if (status === "approved") return "Đã duyệt"
  if (status === "rejected") return "Từ chối"
  return "Đang xử lý"
}

const statusClass = (status: WithdrawalHistoryItem["status"]) => {
  if (status === "approved") return "bg-emerald-50 text-emerald-600"
  if (status === "rejected") return "bg-red-50 text-red-600"
  return "bg-amber-50 text-amber-600"
}
</script>
