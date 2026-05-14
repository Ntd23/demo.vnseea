<!-- English description: Send-money modal that searches real backend recipients before transfer. -->
<template>
  <FoundationModalShell
    :open="open"
    :title="t('pages.walletPage.sendMoneyTitle')"
    size="md"
    @close="emit('update:open', false)"
  >
    <div class="space-y-5">
        <UFormField :label="t('pages.walletPage.amountLabel')">
          <UInputNumber
            v-model="draft.amount"
            :min="1"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('pages.walletPage.searchRecipient')">
          <UInput
            v-model="recipientQuery"
            icon="i-ph-magnifying-glass-duotone"
            :loading="searching"
            :placeholder="t('pages.walletPage.searchRecipientPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <div class="max-h-64 space-y-2 overflow-y-auto pr-1">
          <button
            v-for="recipient in recipients"
            :key="recipient.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
            :class="recipient.id === draft.recipientUserId ? 'border-[var(--border-strong)] bg-[var(--bg-surface-active)]' : 'border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]'"
            @click="draft.recipientUserId = recipient.id"
          >
            <img
              v-if="recipient.avatarUrl"
              :src="recipient.avatarUrl"
              :alt="recipient.name"
              class="h-10 w-10 rounded-full object-cover"
            >
            <div v-else class="avatar-md avatar-muted shrink-0">
              {{ recipient.name.slice(0, 1).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-title-primary">{{ recipient.name }}</p>
              <p class="truncate text-caption-secondary">@{{ recipient.username }}</p>
            </div>
          </button>

          <p
            v-if="recipientQuery.length >= 2 && !searching && recipients.length === 0"
            class="rounded-2xl bg-[var(--bg-muted)] p-4 text-caption-secondary"
          >
            {{ t("pages.walletPage.noRecipients") }}
          </p>
        </div>

        <UAlert
          v-if="localError"
          color="error"
          variant="subtle"
          class="rounded-2xl"
          :description="localError"
        />

        <UButton
          block
          color="primary"
          class="rounded-full font-semibold"
          :loading="submitting"
          @click="submit"
        >
          {{ t("pages.walletPage.sendSubmit") }}
        </UButton>
    </div>
  </FoundationModalShell>
</template>

<script setup lang="ts">
import type {
  WalletRecipient,
  WalletSendDraft,
} from "../../domain/types/wallet.types"

const props = defineProps<{
  open: boolean
  recipients: WalletRecipient[]
  searching: boolean
  submitting: boolean
  balance: number
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  search: [query: string]
  send: [payload: WalletSendDraft]
}>()

const { t } = useI18n()
const recipientQuery = ref("")
const localError = ref("")
const draft = reactive<WalletSendDraft>({
  recipientUserId: 0,
  amount: 0,
})

watch(recipientQuery, (query) => {
  emit("search", query)
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      recipientQuery.value = ""
      draft.recipientUserId = 0
      draft.amount = 0
      localError.value = ""
    }
  },
)

function submit() {
  localError.value = ""

  if (!draft.recipientUserId) {
    localError.value = t("pages.walletPage.errorRecipient")
    return
  }

  if (draft.amount <= 0 || draft.amount > props.balance) {
    localError.value = t("pages.walletPage.errorAmount")
    return
  }

  emit("send", { ...draft })
}
</script>
