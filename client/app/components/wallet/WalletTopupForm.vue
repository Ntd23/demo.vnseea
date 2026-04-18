<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <p class="text-label-secondary text-[var(--text-tertiary)]">Nạp tiền</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">Thêm tiền vào ví</h2>
    <p class="mt-1 text-body-secondary">Chọn số tiền và phương thức nạp.</p>

    <div class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button
        v-for="amount in presetAmounts"
        :key="amount"
        class="h-11 rounded-[var(--radius-full)] text-[13px] font-extrabold transition"
        :class="form.amount === amount ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--color-primary-900)]'"
        type="button"
        @click="form.amount = amount"
      >
        {{ formatWalletCurrency(amount) }}
      </button>
    </div>

    <label class="mt-4 block">
      <span class="text-[12px] font-bold text-[var(--text-secondary)]">Số tiền khác</span>
      <input v-model.number="form.amount" class="wallet-input mt-2" min="10000" type="number">
    </label>

    <div class="mt-4 grid gap-2 sm:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.value"
        class="rounded-[20px] border p-4 text-left transition"
        :class="form.method === method.value ? 'border-[var(--border-strong)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]' : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)]'"
        type="button"
        @click="form.method = method.value"
      >
        <Icon :name="method.icon" class="h-6 w-6" />
        <p class="mt-3 text-[13px] font-extrabold">{{ method.label }}</p>
      </button>
    </div>

    <button class="mt-5 h-12 w-full rounded-[var(--radius-full)] bg-[var(--color-primary-500)] text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="button" @click="submit">
      Nạp tiền
    </button>
  </section>
</template>

<script setup lang="ts">
import type { WalletTopupPayload } from "~/composables/useMockWalletData"
import { formatWalletCurrency } from "~/composables/useMockWalletData"

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
