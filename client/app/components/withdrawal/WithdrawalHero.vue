<template>
  <section class="rounded-[34px] border border-[var(--border-default)] bg-white p-6 shadow-[var(--shadow-md)] lg:p-8">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">P-46 · Withdrawal</p>
        <h1 class="mt-2 text-display text-[var(--text-primary)]">Rút tiền VNSEEA</h1>
        <p class="mt-4 max-w-2xl text-body-secondary">
          Gửi yêu cầu rút tiền, kiểm tra thông tin thanh toán và theo dõi trạng thái xử lý trong cùng một màn hình.
        </p>
      </div>

      <div class="rounded-[28px] bg-[var(--bg-surface-hover)] p-5">
        <p class="text-label-secondary text-[var(--text-tertiary)]">Số dư khả dụng</p>
        <p class="mt-3 break-words text-[2rem] font-black leading-tight text-[var(--text-primary)]">
          {{ formatWithdrawalCurrency(availableBalance) }}
        </p>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div
            v-for="item in stats"
            :key="item.label"
            class="rounded-[22px] bg-white p-4"
          >
            <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ item.label }}</p>
            <p class="mt-1 text-[18px] font-black text-[var(--text-primary)]">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

defineProps<{
  availableBalance: number
  stats: ReadonlyArray<{ label: string; value: string | number }>
}>()
</script>
