<template>
  <section class="surface-card p-6 sm:p-8">
    <div class="space-y-1">
      <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest text-[10px]">{{ t("pages.walletPage.sendEyebrow") }}</p>
      <h2 class="text-2xl font-black text-[var(--text-primary)] leading-tight">{{ t("pages.walletPage.sendTitle") }}</h2>
      <p class="text-body-secondary text-sm">{{ t("pages.walletPage.currentBalance", { amount: formatWalletCurrency(balance, locale.value) }) }}</p>
    </div>

    <div class="mt-8 space-y-5">
      <UFormField :label="t('pages.walletPage.recipientLabel')">
        <UInput
          v-model="form.recipient"
          size="lg"
          variant="outline"
          class="font-semibold"
          icon="i-ph-user"
          :placeholder="t('pages.walletPage.recipientPlaceholder')"
        />
      </UFormField>

      <UFormField :label="t('pages.walletPage.amountLabel')">
        <UInput
          v-model.number="form.amount"
          type="number"
          size="lg"
          variant="outline"
          class="font-black"
          min="10000"
        >
          <template #trailing>
            <span class="text-[var(--text-primary)] font-bold px-2">VND</span>
          </template>
        </UInput>
      </UFormField>

      <UFormField :label="t('pages.walletPage.noteLabel')">
        <UTextarea
          v-model="form.note"
          size="lg"
          variant="outline"
          class="font-semibold"
          :rows="3"
          :placeholder="t('pages.walletPage.notePlaceholder')"
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="red"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        :title="error"
        class="rounded-xl"
      />

      <UButton
        block
        size="xl"
        color="primary"
        class="rounded-full font-black px-10 shadow-lg shadow-primary-500/20 mt-4"
        @click="submit"
      >
        {{ t("pages.walletPage.sendSubmit") }}
      </UButton>
    </div>
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
