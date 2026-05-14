<!-- English description: Inline send-money form that searches real backend recipients before transfer. -->
<template>
    <div v-if="open" class="space-y-5">
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

        <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
          <UInput
            v-model="qrPayload"
            icon="i-ph-qr-code-duotone"
            :placeholder="t('pages.walletPage.qrPayloadPlaceholder')"
            class="w-full"
          />
          <UButton
            color="neutral"
            variant="soft"
            class="rounded-full font-semibold"
            icon="i-ph-scan-duotone"
            @click="applyQrPayload"
          >
            {{ t("pages.walletPage.applyQr") }}
          </UButton>
        </div>

        <div class="max-h-64 space-y-2 overflow-y-auto pr-1">
          <div
            v-if="selectedRecipientLabel && !recipients.some(recipient => recipient.id === draft.recipientUserId)"
            class="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface-active)] px-3 py-3"
          >
            <div class="avatar-md avatar-muted shrink-0">
              {{ selectedRecipientLabel.slice(0, 1).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-title-primary">{{ selectedRecipientLabel }}</p>
              <p class="truncate text-caption-secondary">{{ t("pages.walletPage.qrRecipient") }}</p>
            </div>
          </div>

          <button
            v-for="recipient in recipients"
            :key="recipient.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
            :class="recipient.id === draft.recipientUserId ? 'border-[var(--border-strong)] bg-[var(--bg-surface-active)]' : 'border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]'"
            @click="selectRecipient(recipient)"
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
const qrPayload = ref("")
const selectedRecipientLabel = ref("")
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
      qrPayload.value = ""
      selectedRecipientLabel.value = ""
      draft.recipientUserId = 0
      draft.amount = 0
      localError.value = ""
    }
  },
)

function parseWalletQrPayload(value: string) {
  const raw = value.trim()

  if (!raw) return null

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const type = String(parsed.type ?? "")

      if (type === "wallet" || type === "send") {
        return {
          to: Number(parsed.to ?? 0) || 0,
          amount: parsed.amount === undefined || parsed.amount === null ? null : Number(parsed.amount),
        }
      }
    }
    catch {
      return null
    }
  }

  if (!raw.includes("|")) return null

  const parts = raw.split("|")
  const prefix = parts.shift()?.toUpperCase()

  if (prefix !== "WALLET") return null

  const values = new Map<string, string>()
  for (const part of parts) {
    const separatorIndex = part.indexOf("=")
    if (separatorIndex > -1) {
      values.set(part.slice(0, separatorIndex), part.slice(separatorIndex + 1))
    }
  }

  return {
    to: Number(values.get("to") ?? 0) || 0,
    amount: values.has("amount") ? Number(values.get("amount")) : null,
  }
}

function applyQrPayload() {
  localError.value = ""
  const parsed = parseWalletQrPayload(qrPayload.value)

  if (!parsed?.to) {
    localError.value = t("pages.walletPage.errorQrPayload")
    return
  }

  draft.recipientUserId = parsed.to
  selectedRecipientLabel.value = `User #${parsed.to}`

  if (parsed.amount !== null && Number.isFinite(parsed.amount) && parsed.amount > 0) {
    draft.amount = parsed.amount
  }
}

function selectRecipient(recipient: WalletRecipient) {
  draft.recipientUserId = recipient.id
  selectedRecipientLabel.value = recipient.name
}

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
