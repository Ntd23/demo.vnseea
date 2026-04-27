<template>
  <WalletPresentationTopupForm :methods="methods" @topup="$emit('topup', $event)" />
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
