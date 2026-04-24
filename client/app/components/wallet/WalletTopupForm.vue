<template>
  <section class="surface-card p-6 sm:p-8">
    <div class="space-y-1">
      <p class="text-label-primary text-secondary-500 uppercase tracking-widest text-[10px]">{{ t("pages.walletPage.topupEyebrow") }}</p>
      <h2 class="text-2xl font-black text-secondary-900 leading-tight">{{ t("pages.walletPage.topupTitle") }}</h2>
      <p class="text-body-secondary text-sm">{{ t("pages.walletPage.topupDescription") }}</p>
    </div>

    <div class="mt-8 space-y-6">
      <!-- Preset Amounts -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UButton
          v-for="amount in presetAmounts"
          :key="amount"
          :color="form.amount === amount ? 'primary' : 'gray'"
          :variant="form.amount === amount ? 'solid' : 'soft'"
          size="lg"
          class="rounded-xl font-bold justify-center"
          @click="form.amount = amount"
        >
          {{ formatWalletCurrency(amount, locale.value) }}
        </UButton>
      </div>

      <!-- Custom Amount -->
      <UFormGroup :label="t('pages.walletPage.otherAmountLabel')">
        <UInput
          v-model.number="form.amount"
          type="number"
          size="xl"
          variant="outline"
          class="font-black text-lg"
          min="10000"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <span class="text-secondary-400 font-bold px-2">VND</span>
          </template>
        </UInput>
      </UFormGroup>

      <!-- Payment Methods -->
      <div class="grid gap-4 sm:grid-cols-3">
        <button
          v-for="method in methods"
          :key="method.value"
          class="group relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all duration-300"
          :class="form.method === method.value 
            ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-500/10' 
            : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-secondary-50/50'"
          type="button"
          @click="form.method = method.value"
        >
          <div 
            :class="form.method === method.value ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-500 group-hover:bg-primary-100 group-hover:text-secondary-900'"
            class="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
          >
            <Icon :name="method.icon" class="h-6 w-6" />
          </div>
          <p class="mt-4 text-[13px] font-black text-secondary-900">{{ method.label }}</p>
          
          <div 
            v-if="form.method === method.value"
            class="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white"
          >
            <Icon name="i-ph-check-bold" class="h-3 w-3" />
          </div>
        </button>
      </div>

      <UButton
        block
        size="xl"
        color="primary"
        class="rounded-full font-black px-10 shadow-lg shadow-primary-500/20"
        @click="submit"
      >
        {{ t("pages.walletPage.topupSubmit") }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WalletTopupPayload } from "~/composables/useMockWalletData"
import { formatWalletCurrency } from "~/composables/useMockWalletData"

const { t, locale } = useI18n()

defineProps<{
  methods: ReadonlyArray<{ label: string; value: WalletTopupPayload["method"]; icon: string }>
}>()

const emit = defineEmits<{ topup: [payload: WalletTopupPayload] }>()

const presetAmounts = [100000, 300000, 500000, 1000000]
const form = reactive<WalletTopupPayload>({
  amount: 300000,
  method: "bank",
})

const submit = () => {
  if (form.amount <= 0) return
  emit("topup", { ...form })
}
</script>

<style scoped>
.wallet-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-hover);
  padding: 0 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  outline: none;
}
</style>
