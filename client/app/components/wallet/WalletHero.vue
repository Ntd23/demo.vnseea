<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
    <div class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div class="p-5 sm:p-7 lg:p-8">
        <p class="text-label-secondary text-[var(--color-primary-600)]">P-45 · Wallet</p>
        <h1 class="mt-2 text-display text-[2.15rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">
          Ví VNSEEA
        </h1>
        <p class="mt-3 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          Xem số dư, nạp tiền và gửi tiền bằng giao diện mock trước khi nối `wallet.php`.
        </p>
      </div>

      <div class="border-t border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-5 xl:border-l xl:border-t-0">
        <div class="rounded-[28px] bg-white p-5 shadow-[var(--shadow-sm)]">
          <p class="text-label-secondary text-[var(--text-tertiary)]">Số dư khả dụng</p>
          <p class="mt-3 break-words text-[2rem] font-black leading-tight text-[var(--text-primary)]">{{ formatWalletCurrency(balance) }}</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div v-for="item in stats" :key="item.label" class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
              <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ item.label }}</p>
              <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWalletCurrency } from "~/composables/useMockWalletData"

defineProps<{
  balance: number
  stats: ReadonlyArray<{ label: string; value: string | number }>
}>()
</script>
