<template>
  <section class="surface-card group overflow-hidden p-6 sm:p-10 shadow-xl transition-all duration-500 hover:shadow-2xl ring-1 ring-secondary-100">
    <div class="space-y-10">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
          {{ $t("pages.walletPage.topupTitle") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900">
          {{ $t("pages.walletPage.addFunds") }}
        </h2>
        <p class="text-sm font-medium leading-relaxed text-secondary-500 max-w-xl">
          {{ $t("pages.walletPage.topupDescription") }}
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-8">
          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.walletPage.selectAmount") }}
            </p>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <UButton
                v-for="amount in presetAmounts"
                :key="amount"
                variant="soft"
                size="xl"
                class="h-16 rounded-2xl border text-[13px] font-black tracking-tight transition-all active:scale-95 sm:h-20"
                :class="payload.amount === amount 
                  ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20' 
                  : 'bg-white border-secondary-100 text-secondary-900 hover:border-primary-200'"
                @click="payload.amount = amount"
              >
                {{ formatAmount(amount) }}
              </UButton>
            </div>
          </div>

          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.walletPage.customAmount") }}
            </p>
            <div class="relative group/input">
              <UInput
                v-model.number="payload.amount"
                type="number"
                size="xl"
                placeholder="0"
                :ui="{ 
                  rounded: 'rounded-2xl', 
                  size: { xl: 'h-[72px] px-8 text-2xl font-black' }, 
                  base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
                }"
              />
              <div class="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-black text-secondary-400 group-focus-within/input:text-primary-500 transition-colors">
                VND
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.walletPage.paymentMethod") }}
            </p>
            <div class="flex flex-col gap-3">
              <button
                v-for="method in methods"
                :key="method.value"
                class="flex items-center justify-between rounded-2xl border p-5 transition-all active:scale-[0.98]"
                :class="payload.method === method.value 
                  ? 'bg-primary-50/50 border-primary-500 ring-4 ring-primary-500/5' 
                  : 'bg-white border-secondary-100 hover:border-primary-200'"
                @click="payload.method = method.value"
              >
                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl transition-all" :class="payload.method === method.value ? 'bg-primary-600 text-white shadow-lg' : 'bg-secondary-50 text-secondary-400'">
                    <Icon :name="method.icon" class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-black" :class="payload.method === method.value ? 'text-secondary-900' : 'text-secondary-500'">
                    {{ $t(method.label) }}
                  </span>
                </div>
                <Icon v-if="payload.method === method.value" name="i-ph-check-circle-fill" class="h-6 w-6 text-primary-600" />
              </button>
            </div>
          </div>

          <UButton
            size="xl"
            block
            :disabled="payload.amount <= 0"
            class="h-16 rounded-[1.25rem] bg-secondary-900 text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-secondary-900/10 transition-all hover:bg-black active:scale-[0.97]"
            @click="$emit('topup', { ...payload })"
          >
            {{ $t("pages.walletPage.confirmTopup") }}
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WalletTopupPayload, TopupMethod } from "../../domain/types/wallet.types"

defineProps<{
  methods: TopupMethod[]
}>()

defineEmits<{
  (e: "topup", payload: WalletTopupPayload): void
}>()

const payload = reactive<WalletTopupPayload>({
  amount: 200000,
  method: "bank",
})

const presetAmounts = [100000, 200000, 500000, 1000000]

const formatAmount = (val: number) => {
  return val >= 1000000 
    ? `${val / 1000000}M` 
    : `${val / 1000}K`
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

