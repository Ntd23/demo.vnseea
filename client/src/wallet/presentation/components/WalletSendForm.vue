<!-- English description: Inline send-money form that searches real backend recipients before transfer. -->
<template>
    <div v-if="open" class="space-y-5">
        <UFormField :label="t('pages.walletPage.amountLabel')">
          <UInputNumber
            v-model="draft.amount"
            :min="1"
            :format-options="amountInputFormatOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('pages.walletPage.transferContent')">
          <UTextarea
            v-model="transferNote"
            :rows="3"
            :placeholder="t('pages.walletPage.transferContentPlaceholder')"
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

        <div class="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
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
            :icon="scanning ? 'i-ph-x-duotone' : 'i-ph-camera-duotone'"
            @click="scanning ? stopQrScan() : startQrScan()"
          >
            {{ scanning ? t("pages.walletPage.stopScanQr") : t("pages.walletPage.scanQr") }}
          </UButton>
        </div>

        <div v-show="scanning" class="wallet-send-scan">
          <div id="qr-reader" class="wallet-send-scan__reader" />
        </div>

        <div class="flex flex-col gap-2 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-light)] p-4 text-center text-xs">
          <span class="font-bold text-[var(--text-secondary)]">Hoặc tải lên hình ảnh chứa mã QR để quét nhanh:</span>
          <input
            type="file"
            accept="image/*"
            class="mx-auto block text-xs cursor-pointer text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            @change="scanQrFile"
          >
        </div>

        <div v-if="draft.recipientUserId" class="wallet-send-selected">
          <img
            v-if="selectedRecipient?.avatarUrl"
            :src="selectedRecipient.avatarUrl"
            :alt="selectedRecipient.name"
            class="h-11 w-11 rounded-full object-cover"
          >
          <div v-else class="avatar-md avatar-muted shrink-0">
            {{ selectedRecipientName.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-title-primary">{{ selectedRecipientName }}</p>
            <p class="truncate text-caption-secondary">{{ t("pages.walletPage.selectedRecipient") }}</p>
          </div>
          <button type="button" class="wallet-send-selected__clear" @click="clearRecipient">
            <Icon name="i-ph-x-duotone" class="h-4 w-4" />
          </button>
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
            class="wallet-send-recipient flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
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

        <div v-if="confirmOpen" class="wallet-send-confirm" role="dialog" aria-modal="true">
          <section class="wallet-send-confirm__dialog">
            <div class="wallet-send-confirm__header">
              <div>
                <p class="text-label-secondary">{{ t("pages.walletPage.confirmTransferEyebrow") }}</p>
                <h3 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.confirmTransferTitle") }}</h3>
              </div>
              <button type="button" class="wallet-send-confirm__close" @click="confirmOpen = false">
                <Icon name="i-ph-x-duotone" class="h-5 w-5" />
              </button>
            </div>

            <dl class="wallet-send-confirm__list">
              <div>
                <dt>{{ t("pages.walletPage.confirmRecipient") }}</dt>
                <dd>{{ selectedRecipientName }}</dd>
              </div>
              <div>
                <dt>{{ t("pages.walletPage.confirmAmount") }}</dt>
                <dd>{{ formattedDraftAmount }}</dd>
              </div>
              <div>
                <dt>{{ t("pages.walletPage.confirmContent") }}</dt>
                <dd>{{ normalizedTransferNote || "-" }}</dd>
              </div>
              <div>
                <dt>{{ t("pages.walletPage.confirmDate") }}</dt>
                <dd>{{ confirmationDate }}</dd>
              </div>
            </dl>

            <div class="wallet-send-confirm__actions">
              <UButton
                color="neutral"
                variant="soft"
                class="rounded-full font-semibold"
                :disabled="submitting"
                @click="confirmOpen = false"
              >
                {{ t("pages.walletPage.confirmCancel") }}
              </UButton>
              <UButton
                color="primary"
                class="rounded-full font-semibold"
                :loading="submitting"
                @click="confirmTransfer"
              >
                {{ t("pages.walletPage.confirmSubmit") }}
              </UButton>
            </div>
          </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useWalletSendFormVM } from "../../application/view-models/useWalletSendFormVM"
import type {
  WalletCurrencyRule,
  WalletRecipient,
  WalletSendDraft,
} from "../../domain/types/wallet.types"

const props = defineProps<{
  open: boolean
  recipients: WalletRecipient[]
  searching: boolean
  submitting: boolean
  balance: number
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}>()

const emit = defineEmits<{
  (event: "update:open", value: boolean): void
  (event: "search", query: string): void
  (event: "send", payload: WalletSendDraft): void
}>()

const { t } = useI18n()

const {
  amountInputFormatOptions,
  clearRecipient,
  confirmOpen,
  confirmTransfer,
  confirmationDate,
  draft,
  formattedDraftAmount,
  localError,
  normalizedTransferNote,
  qrPayload,
  recipientQuery,
  scanning,
  scanQrFile,
  selectRecipient,
  selectedRecipient,
  selectedRecipientLabel,
  selectedRecipientName,
  startQrScan,
  stopQrScan,
  submit,
  transferNote,
} = useWalletSendFormVM(props, emit)
</script>

<style scoped>
.wallet-send-scan {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: #0f172a;
}

.wallet-send-scan__reader :deep(video) {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 16 / 10;
  object-fit: cover !important;
}

.wallet-send-scan__reader :deep(#qr-reader__dashboard),
.wallet-send-scan__reader :deep(#qr-reader__status_span) {
  display: none !important;
}

.wallet-send-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(0, 0, 255, 0.14);
  border-radius: 16px;
  background: rgba(0, 0, 255, 0.04);
  padding: 12px;
}

.wallet-send-selected__clear {
  position: relative;
  z-index: 2;
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.wallet-send-selected__clear > *,
.wallet-send-recipient > *,
.wallet-send-confirm__close > * {
  pointer-events: none;
}

.wallet-send-recipient {
  position: relative;
  z-index: 2;
  min-height: 58px;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.wallet-send-confirm {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.48);
  padding: 16px;
}

.wallet-send-confirm__dialog {
  width: min(100%, 460px);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 18px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.24);
}

.wallet-send-confirm__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.wallet-send-confirm__close {
  position: relative;
  z-index: 2;
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.wallet-send-confirm__list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.wallet-send-confirm__list div {
  display: grid;
  gap: 4px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 10px;
}

.wallet-send-confirm__list dt {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.wallet-send-confirm__list dd {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.wallet-send-confirm__actions {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}
</style>
