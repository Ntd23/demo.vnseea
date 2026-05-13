<!-- English description: Backend payment history table for withdrawal requests. -->
<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-secondary">{{ t("pages.withdrawalPage.historyEyebrow") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.paymentHistory") }}</h2>
      </div>
      <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1 font-semibold">
        {{ items.length }}
      </UBadge>
    </div>

    <div v-if="items.length" class="mt-5 overflow-hidden rounded-2xl border border-[var(--border-light)]">
      <div class="hidden grid-cols-[80px_1fr_160px_140px] gap-4 bg-[var(--bg-muted)] px-4 py-3 text-label-secondary md:grid">
        <span>#</span>
        <span>{{ t("pages.withdrawalPage.amountLabel") }}</span>
        <span>{{ t("pages.withdrawalPage.requested") }}</span>
        <span>{{ t("pages.withdrawalPage.status") }}</span>
      </div>
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="grid gap-2 border-t border-[var(--border-light)] px-4 py-4 md:grid-cols-[80px_1fr_160px_140px] md:items-center"
      >
        <span class="text-caption-secondary">{{ index + 1 }}</span>
        <div>
          <p class="text-title-primary">{{ formatHistoryAmount(item.amount) }}</p>
          <p v-if="item.transferInfo" class="text-caption-secondary">{{ item.transferInfo }}</p>
        </div>
        <p class="text-caption-secondary">{{ item.requested || "-" }}</p>
        <UBadge
          :color="statusColor(item.status)"
          variant="subtle"
          class="w-fit rounded-full px-3 py-1 font-semibold"
        >
          {{ statusLabel(item.status) }}
        </UBadge>
      </div>
    </div>

    <div v-else class="mt-5 rounded-2xl bg-[var(--bg-muted)] p-8 text-center">
      <Icon name="i-ph-clock-counter-clockwise-duotone" class="mx-auto h-10 w-10 text-[var(--icon-secondary)]" />
      <p class="mt-3 text-body-secondary">{{ t("pages.withdrawalPage.noHistory") }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type {
  WithdrawalCurrencyRule,
  WithdrawalHistoryItem,
  WithdrawalStatus,
} from "../../domain/types/withdrawal.types"

const props = defineProps<{
  items: WithdrawalHistoryItem[]
  currency: string
  currencySymbol: string
  currencyRule: WithdrawalCurrencyRule
}>()

const { t, locale } = useI18n()

const formatHistoryAmount = (amount: number) =>
  formatCurrency(amount, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })

const statusLabel = (status: WithdrawalStatus) => {
  if (status === "approved") return t("pages.withdrawalPage.statusApproved")
  if (status === "declined") return t("pages.withdrawalPage.statusDeclined")
  return t("pages.withdrawalPage.statusPending")
}

const statusColor = (status: WithdrawalStatus) => {
  if (status === "approved") return "primary"
  if (status === "declined") return "error"
  return "warning"
}
</script>
