<template>
  <section class="surface-card p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.withdrawalPage.historyEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.historyTitle") }}</h2>
      </div>
      <UBadge
        :label="items.length.toString()"
        size="md"
        variant="subtle"
        color="primary"
        class="rounded-full px-3"
      />
    </div>

    <div class="mt-6 space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="group flex flex-col gap-4 rounded-2xl bg-secondary-50/50 p-5 transition hover:bg-secondary-50 sm:flex-row sm:items-center sm:justify-between border border-secondary-100/30"
      >
        <div class="min-w-0 space-y-1">
          <p class="text-lg font-black text-[var(--text-primary)]">{{ formatWithdrawalCurrency(item.amount, locale) }}</p>
          <div class="flex items-center gap-2 text-body-secondary text-sm">
            <span class="font-bold text-[var(--text-primary)]">{{ item.method }}</span>
            <span class="text-secondary-300">•</span>
            <span>{{ item.account }}</span>
          </div>
          <p class="text-caption-secondary text-xs">{{ item.time }}</p>
        </div>
        <UBadge
          :label="statusLabel(item.status)"
          :color="statusColor(item.status)"
          variant="subtle"
          size="sm"
          class="w-fit font-bold px-3"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WithdrawalHistoryItem } from "~/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

const { t, locale } = useI18n()

defineProps<{ items: ReadonlyArray<WithdrawalHistoryItem> }>()

const statusLabel = (status: WithdrawalHistoryItem["status"]) => {
  if (status === "approved") return t("pages.withdrawalPage.statusApproved")
  if (status === "rejected") return t("pages.withdrawalPage.statusRejected")
  return t("pages.withdrawalPage.statusPending")
}

const statusColor = (status: WithdrawalHistoryItem["status"]) => {
  if (status === "approved") return "primary"
  if (status === "rejected") return "red"
  return "amber"
}
</script>
