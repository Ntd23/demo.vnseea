<template>
  <section class="surface-card p-6">
    <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.walletPage.sendEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.sendTitle") }}</h2>
    <p class="mt-3 text-body-secondary">{{ t("pages.walletPage.currentBalance", { amount: formatWalletCurrency(balance, locale.value) }) }}</p>

    <div class="mt-6 space-y-5">
      <UFormField :label="t('pages.walletPage.recipientLabel')">
        <UInput v-model="form.recipient" :placeholder="t('pages.walletPage.recipientPlaceholder')" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.walletPage.amountLabel')">
        <UInputNumber v-model="form.amount" :min="0" :step="50000" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.walletPage.noteLabel')">
        <UTextarea v-model="form.note" :placeholder="t('pages.walletPage.notePlaceholder')" :rows="4" class="w-full" />
      </UFormField>
    </div>

    <UAlert
      v-if="error"
      class="mt-5 rounded-2xl"
      color="error"
      variant="subtle"
      :description="error"
    />

    <UButton
      class="mt-6 h-12 rounded-2xl font-black uppercase tracking-widest"
      block
      @click="submit"
    >
      {{ t("pages.walletPage.sendSubmit") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { WalletSendPayload } from "../../application/composables/useMockWalletData"
import { formatWalletCurrency } from "../../application/composables/useMockWalletData"

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
