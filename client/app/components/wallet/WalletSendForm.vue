<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.walletPage.sendEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.sendTitle") }}</h2>
    <p class="mt-1 text-body-secondary">{{ t("pages.walletPage.currentBalance", { amount: formatWalletCurrency(balance, locale.value) }) }}</p>

    <div class="mt-5 grid gap-4">
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.walletPage.recipientLabel") }}</span>
        <input v-model="form.recipient" class="wallet-input mt-2" :placeholder="t('pages.walletPage.recipientPlaceholder')">
      </label>
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.walletPage.amountLabel") }}</span>
        <input v-model.number="form.amount" class="wallet-input mt-2" min="10000" type="number">
      </label>
      <label>
        <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ t("pages.walletPage.noteLabel") }}</span>
        <textarea v-model="form.note" class="wallet-input mt-2 min-h-[110px] resize-y py-3" :placeholder="t('pages.walletPage.notePlaceholder')" />
      </label>
    </div>

    <div v-if="error" class="mt-4 rounded-[18px] bg-[var(--color-error)]/10 px-4 py-3 text-[13px] font-bold text-[var(--color-error)]">
      {{ error }}
    </div>

    <button class="mt-5 h-12 w-full rounded-[var(--radius-full)] bg-[var(--color-primary-500)] text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="button" @click="submit">
      {{ t("pages.walletPage.sendSubmit") }}
    </button>
  </section>
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
