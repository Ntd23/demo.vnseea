<!-- English description: Compact wallet balance card that mirrors the PHP wallet balance section. -->
<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
          <Icon name="i-ph-wallet-duotone" class="h-7 w-7" />
        </div>
        <div class="min-w-0">
          <p class="text-label-secondary">{{ t("pages.walletPage.title") }}</p>
          <p class="mt-1 break-words text-3xl font-black text-[var(--text-primary)]">
            {{ formattedBalance }}
          </p>
        </div>
      </div>

      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type { WalletCurrencyRule } from "../../domain/types/wallet.types"

const props = defineProps<{
  balance: number
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const { t, locale } = useI18n()

const formattedBalance = computed(() =>
  formatCurrency(props.balance, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  }),
)
</script>
