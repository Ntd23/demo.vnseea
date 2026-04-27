<template>
  <section class="surface-card group overflow-hidden p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100">
    <div class="space-y-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-secondary-50 pb-8">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
            {{ $t("pages.withdrawalPage.activity") }}
          </p>
          <h2 class="text-3xl font-black tracking-tight text-secondary-900">
            {{ $t("pages.withdrawalPage.withdrawalHistory") }}
          </h2>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="group/item flex items-center justify-between gap-6 rounded-2xl border border-secondary-100 p-5 transition-all duration-300 hover:border-primary-100 hover:shadow-lg sm:p-6"
        >
          <div class="flex items-center gap-5 min-w-0">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 transition-all duration-500 group-hover/item:scale-110 sm:h-16 sm:w-16"
            >
              <Icon
                name="i-ph-arrow-up-right-duotone"
                class="h-7 w-7 text-secondary-400 sm:h-8 sm:w-8"
              />
            </div>

            <div class="min-w-0 space-y-1.5">
              <p class="truncate text-base font-black tracking-tight text-secondary-900 group-hover/item:text-secondary-900 transition-colors sm:text-lg">
                {{ item.method }}
              </p>
              <div class="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-secondary-400">
                <p>{{ item.time }}</p>
                <div class="h-1 w-1 rounded-full bg-secondary-200" />
                <p class="font-medium text-secondary-500">{{ item.account }}</p>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <p class="text-xl font-black tracking-tight text-secondary-900 sm:text-2xl">
              -{{ formatWithdrawalCurrency(item.amount) }}
            </p>
            <div class="mt-1 flex items-center justify-end gap-1.5">
              <div class="h-1.5 w-1.5 rounded-full" :class="statusColor[item.status]" />
              <p class="text-[9px] font-black uppercase tracking-widest text-secondary-400">
                {{ $t(`pages.withdrawalPage.status.${item.status}`) }}
              </p>
            </div>
          </div>
        </div>

        <FoundationEmptyState
          v-if="items.length === 0"
          icon="i-ph-bank-duotone"
          :title="$t('pages.withdrawalPage.noWithdrawals')"
          :description="$t('pages.withdrawalPage.noWithdrawalsDesc')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWithdrawalCurrency } from "../../domain/types/withdrawal.types"
import type { WithdrawalHistoryItem } from "../../domain/types/withdrawal.types"

defineProps<{
  items: WithdrawalHistoryItem[]
}>()

const statusColor = {
  completed: "bg-green-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

