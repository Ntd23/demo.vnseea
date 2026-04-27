<template>
  <section class="surface-card group overflow-hidden p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100">
    <div class="space-y-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-secondary-50 pb-8">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
            {{ $t("pages.walletPage.recentActivity") }}
          </p>
          <h2 class="text-3xl font-black tracking-tight text-secondary-900">
            {{ $t("pages.walletPage.history") }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            v-for="filter in filters"
            :key="filter"
            variant="ghost"
            size="sm"
            class="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            :class="activeFilter === filter ? 'bg-secondary-900 text-white' : 'text-secondary-400 hover:bg-secondary-50 hover:text-secondary-900'"
            @click="activeFilter = filter"
          >
            {{ $t(`pages.walletPage.filter.${filter}`) }}
          </UButton>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          class="group/item flex items-center justify-between gap-6 rounded-2xl border border-secondary-100 p-5 transition-all duration-300 hover:border-primary-100 hover:shadow-lg sm:p-6"
        >
          <div class="flex items-center gap-5 min-w-0">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover/item:scale-110 sm:h-16 sm:w-16"
              :class="toneClasses[transactionTypeMeta[transaction.type].tone].bg"
            >
              <Icon
                :name="transactionTypeMeta[transaction.type].icon"
                class="h-7 w-7 sm:h-8 sm:w-8"
                :class="toneClasses[transactionTypeMeta[transaction.type].tone].icon"
              />
            </div>

            <div class="min-w-0 space-y-1.5">
              <p class="truncate text-base font-black tracking-tight text-secondary-900 group-hover/item:text-secondary-900 transition-colors sm:text-lg">
                {{ $t(transaction.title) }}
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-[11px] font-semibold text-secondary-400">
                  {{ transaction.time }}
                </p>
                <div class="h-1 w-1 rounded-full bg-secondary-200" />
                <p class="truncate text-[11px] font-medium text-secondary-500 italic">
                  {{ $t(transaction.description) }}
                </p>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <p
              class="text-xl font-black tracking-tight sm:text-2xl"
              :class="transaction.amount > 0 ? 'text-green-600' : 'text-secondary-900'"
            >
              {{ transaction.amount > 0 ? '+' : '' }}{{ formatWalletCurrency(transaction.amount) }}
            </p>
            <div class="mt-1 flex items-center justify-end gap-1.5">
              <div class="h-1.5 w-1.5 rounded-full" :class="statusColor[transaction.status]" />
              <p class="text-[9px] font-black uppercase tracking-widest text-secondary-400">
                {{ $t(`pages.walletPage.status.${transaction.status}`) }}
              </p>
            </div>
          </div>
        </div>

        <FoundationEmptyState
          v-if="filteredTransactions.length === 0"
          icon="i-ph-receipt-duotone"
          :title="$t('pages.walletPage.noTransactions')"
          :description="$t('pages.walletPage.noTransactionsDesc')"
        />
      </div>
      
      <div v-if="filteredTransactions.length > 0" class="pt-6 text-center">
        <UButton
          variant="soft"
          color="white"
          class="rounded-2xl border border-secondary-100 bg-white px-10 h-14 text-[11px] font-black uppercase tracking-widest text-secondary-900 transition-all hover:bg-secondary-50 hover:border-secondary-200 active:scale-95"
        >
          {{ $t("pages.walletPage.viewAllHistory") }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWalletCurrency, transactionTypeMeta } from "../../domain/types/wallet.types"
import type { WalletTransaction } from "../../domain/types/wallet.types"

const props = defineProps<{
  transactions: WalletTransaction[]
}>()

const filters = ["all", "topup", "spend"] as const
const activeFilter = ref<typeof filters[number]>("all")

const filteredTransactions = computed(() => {
  if (activeFilter.value === "all") return props.transactions
  if (activeFilter.value === "topup") return props.transactions.filter(t => t.type === "topup")
  return props.transactions.filter(t => t.type !== "topup")
})

const toneClasses = {
  green: { bg: "bg-green-50 shadow-inner group-hover/item:bg-green-100", icon: "text-green-600" },
  indigo: { bg: "bg-indigo-50 shadow-inner group-hover/item:bg-indigo-100", icon: "text-indigo-600" },
  blue: { bg: "bg-blue-50 shadow-inner group-hover/item:bg-blue-100", icon: "text-blue-600" },
  amber: { bg: "bg-amber-50 shadow-inner group-hover/item:bg-amber-100", icon: "text-amber-600" },
  rose: { bg: "bg-rose-50 shadow-inner group-hover/item:bg-rose-100", icon: "text-rose-600" },
}

const statusColor = {
  completed: "bg-green-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
}
</script>
