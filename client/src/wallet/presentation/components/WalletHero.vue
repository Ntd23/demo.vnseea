<template>
  <section class="surface-card overflow-hidden">
    <div class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div class="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.walletPage.heroEyebrow") }}</p>
        <h1 class="mt-3 text-display text-4xl sm:text-6xl text-[var(--text-primary)] leading-tight">
          {{ t("pages.walletPage.heroTitle") }}
        </h1>
        <p class="mt-5 max-w-xl text-body-secondary text-lg leading-relaxed">
          {{ t("pages.walletPage.heroDescription") }}
        </p>
      </div>

      <div class="bg-secondary-50 p-6 sm:p-8 xl:border-l xl:border-secondary-100 flex flex-col justify-center">
        <div class="rounded-3xl bg-white p-6 shadow-xl shadow-secondary-900/5 border border-secondary-100">
          <p class="text-micro font-bold uppercase tracking-wider text-[var(--text-primary)]">{{ t("pages.walletPage.balanceLabel") }}</p>
          <p class="mt-3 break-words text-4xl font-black text-[var(--text-primary)] leading-none">{{ formatWalletCurrency(balance, locale.value) }}</p>
          
          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div v-for="item in stats" :key="item.label" class="rounded-2xl bg-secondary-50/80 p-4 border border-secondary-100/50">
              <p class="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">{{ item.label }}</p>
              <p class="mt-1.5 text-lg font-black text-[var(--text-primary)] leading-none">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWalletCurrency } from "../../application/composables/useMockWalletData"

const { t, locale } = useI18n()

defineProps<{
  balance: number
  stats: ReadonlyArray<{ label: string; value: string | number }>
}>()
</script>
