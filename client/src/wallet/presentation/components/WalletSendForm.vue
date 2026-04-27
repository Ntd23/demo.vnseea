<template>
  <aside class="surface-card h-fit p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100 sticky top-24">
    <div class="space-y-10">
      <div class="space-y-1 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900">
          {{ $t("pages.walletPage.quickTransfer") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900">
          {{ $t("pages.walletPage.sendMoney") }}
        </h2>
      </div>

      <div class="space-y-6">
        <div class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
            {{ $t("pages.walletPage.recipient") }}
          </p>
          <UInput
            v-model="payload.recipient"
            icon="i-ph-user-duotone"
            size="xl"
            :placeholder="$t('pages.walletPage.recipientPlaceholder')"
            :ui="{ 
              rounded: 'rounded-2xl', 
              size: { xl: 'h-14 px-6 font-semibold' }, 
              base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
            }"
          />
        </div>

        <div class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
            {{ $t("pages.walletPage.amount") }}
          </p>
          <UInput
            v-model.number="payload.amount"
            type="number"
            icon="i-ph-currency-circle-dollar-duotone"
            size="xl"
            placeholder="0"
            :ui="{ 
              rounded: 'rounded-2xl', 
              size: { xl: 'h-14 px-6 font-black text-xl' }, 
              base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
            }"
          />
          <div class="flex items-center justify-between px-1">
            <p class="text-[10px] font-bold text-secondary-400">
              {{ $t("pages.walletPage.available") }}: <span class="text-secondary-900">{{ formatWalletCurrency(balance) }}</span>
            </p>
            <button class="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors" @click="payload.amount = balance">
              {{ $t("pages.walletPage.max") }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
            {{ $t("pages.walletPage.note") }}
          </p>
          <UTextarea
            v-model="payload.note"
            :placeholder="$t('pages.walletPage.notePlaceholder')"
            :rows="3"
            :ui="{ 
              rounded: 'rounded-2xl', 
              base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300 px-6 py-4 font-medium' 
            }"
          />
        </div>

        <div class="pt-4">
          <UButton
            size="xl"
            block
            :disabled="!isValid"
            class="h-16 rounded-2xl bg-primary-600 text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-95"
            @click="handleSubmit"
          >
            {{ $t("pages.walletPage.transferNow") }}
          </UButton>
          <p class="mt-4 text-center text-[10px] font-medium leading-relaxed text-secondary-400 px-4">
            {{ $t("pages.walletPage.transferHint") }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { formatWalletCurrency } from "../../domain/types/wallet.types"
import type { WalletSendPayload } from "../../domain/types/wallet.types"

const props = defineProps<{
  balance: number
}>()

const emit = defineEmits<{
  (e: "send", payload: WalletSendPayload): void
}>()

const payload = reactive<WalletSendPayload>({
  recipient: "",
  amount: 0,
  note: "",
})

const isValid = computed(() => {
  return payload.recipient.trim().length > 0 && 
         payload.amount > 0 && 
         payload.amount <= props.balance
})

const handleSubmit = () => {
  if (!isValid.value) return
  emit("send", { ...payload })
  // Reset after send
  payload.recipient = ""
  payload.amount = 0
  payload.note = ""
}
</script>

<style scoped>
/** Added style block to ensure Vite loader separates script and style correctly */
</style>
