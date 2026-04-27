<template>
  <section class="relative overflow-hidden rounded-[2.5rem] bg-secondary-900 p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-secondary-900/20 sm:p-12">
    <!-- Background Decor -->
    <div class="absolute right-0 top-0 h-64 w-64 -translate-y-16 translate-x-16 rounded-full bg-primary-500/10 blur-[100px]" />
    <div class="absolute bottom-0 left-0 h-64 w-64 translate-y-16 -translate-x-16 rounded-full bg-blue-500/10 blur-[100px]" />

    <div class="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            {{ $t("pages.walletPage.availableBalance") }}
          </p>
          <h1 class="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
            {{ formatWalletCurrency(balance) }}
          </h1>
        </div>

        <div class="flex flex-wrap gap-8">
          <div v-for="stat in stats" :key="stat.label" class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              {{ $t(stat.label) }}
            </p>
            <p class="text-xl font-black">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <UButton
          size="xl"
          icon="i-ph-qr-code-duotone"
          class="h-14 rounded-2xl bg-white/10 px-8 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-xl ring-1 ring-white/20 transition-all hover:bg-white hover:text-black active:scale-95 sm:h-16"
        >
          {{ $t("pages.walletPage.myQR") }}
        </UButton>
        <UButton
          size="xl"
          icon="i-ph-arrows-left-right-duotone"
          class="h-14 rounded-2xl bg-primary-600 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-500 active:scale-95 sm:h-16"
        >
          {{ $t("pages.walletPage.transactionHistory") }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWalletCurrency } from "../../domain/types/wallet.types"
import type { WalletStats } from "../../domain/types/wallet.types"

defineProps<{
  balance: number
  stats: WalletStats[]
}>()
</script>
