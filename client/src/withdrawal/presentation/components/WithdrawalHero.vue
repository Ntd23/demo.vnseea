<template>
  <section class="surface-card p-6 lg:p-8">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
      <div>
        <p class="text-label-primary text-[var(--text-primary)]">{{ t("pages.withdrawalPage.heroEyebrow") }}</p>
        <h1 class="mt-2 text-display text-primary-900">{{ t("pages.withdrawalPage.heroTitle") }}</h1>
        <p class="mt-4 max-w-2xl text-body-secondary">
          {{ t("pages.withdrawalPage.heroDescription") }}
        </p>
      </div>

      <div class="rounded-xl bg-primary-50/50 p-6 border border-primary-100/50">
        <p class="text-label-secondary text-[var(--text-primary)]">{{ t("pages.withdrawalPage.availableBalance") }}</p>
        <p class="mt-3 break-words text-4xl font-black leading-tight text-[var(--text-primary)]">
          {{ formatWithdrawalCurrency(availableBalance, locale) }}
        </p>
        <div class="mt-6 grid grid-cols-2 gap-4">
          <div
            v-for="item in stats"
            :key="item.label"
            class="rounded-xl bg-white p-4 shadow-sm border border-primary-50"
          >
            <p class="text-micro font-bold text-[var(--text-primary)] uppercase tracking-wider">{{ item.label }}</p>
            <p class="mt-1 text-lg font-black text-[var(--text-primary)]">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWithdrawalCurrency } from "../../application/composables/useMockWithdrawalData"

const { t, locale } = useI18n()

defineProps<{
  availableBalance: number
  stats: ReadonlyArray<{ label: string; value: string | number }>
}>()
</script>
