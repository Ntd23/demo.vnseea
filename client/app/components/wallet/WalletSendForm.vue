<template>
  <WalletPresentationSendForm :balance="balance" @send="$emit('send', $event)" />
</template>

<script setup lang="ts">
import type { WalletSendPayload } from "~/composables/useMockWalletData"
import { formatWalletCurrency } from "~/composables/useMockWalletData"

const props = defineProps<{ balance: number }>()
const emit = defineEmits<{ send: [payload: WalletSendPayload] }>()

const { t, locale } = useI18n()
const error = ref("")
const form = reactive<WalletSendPayload>({
  recipient: "",
  amount: 100000,
  note: "",
})

const submit = () => {
  error.value = ""
  if (!form.recipient.trim()) {
    error.value = t("pages.walletPage.errorRecipient")
    return
  }
  if (form.amount <= 0 || form.amount > props.balance) {
    error.value = t("pages.walletPage.errorAmount")
    return
  }
  emit("send", { ...form })
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
