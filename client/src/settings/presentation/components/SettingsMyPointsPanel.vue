<template>
  <section class="settings-points" aria-labelledby="settings-points-title">
    <div class="settings-points__hero">
      <div class="settings-points__hero-main">
        <span class="settings-points__hero-icon" aria-hidden="true">
          <Icon name="i-ph-star-fill" class="h-6 w-6" />
        </span>
        <div>
          <p class="settings-points__eyebrow">{{ t("settings.data.pointsPanel.eyebrow") }}</p>
          <h2 id="settings-points-title" class="settings-points__title">
            {{ t("settings.data.pointsPanel.pointsAmount", { points: formatNumber(pointsBalance) }) }}
          </h2>
          <p class="settings-points__description">
            {{ t("settings.data.pointsPanel.description") }}
          </p>
        </div>
      </div>

      <!-- Temporarily hidden while point-to-money exchange is paused. -->
      <!-- <button
        class="settings-points__exchange-button"
        type="button"
        :disabled="maxExchangePoints < exchangeStepPoints"
        @click="openExchangeModal"
      >
        <Icon name="i-ph-swap-fill" class="h-4 w-4" />
        <span>{{ t("settings.data.pointsPanel.exchangeButton") }}</span>
      </button> -->
      <div class="settings-points__hero-actions">
        <button
          class="settings-points__exchange-button"
          type="button"
          @click="openTransferPanel"
        >
          <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
          <span>{{ t("settings.data.pointsPanel.transferButton") }}</span>
        </button>
        <button
          class="settings-points__secondary-button"
          type="button"
          @click="openReceiveQrPanel(receiveQrPoints)"
        >
          <Icon name="i-ph-qr-code-fill" class="h-4 w-4" />
          <span>{{ t("settings.data.pointsPanel.receiveQrButton") }}</span>
        </button>
      </div>
    </div>

    <!-- Temporarily hidden with point-to-money exchange stats. -->
    <!-- <div class="settings-points__stats">
      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--blue" aria-hidden="true">
          <Icon name="i-ph-star-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">{{ t("settings.data.pointsPanel.availablePoints") }}</p>
          <p class="settings-points__stat-value">{{ formatNumber(pointsBalance) }}</p>
        </div>
      </article>

      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--green" aria-hidden="true">
          <Icon name="i-ph-wallet-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">{{ t("settings.data.pointsPanel.walletBalance") }}</p>
          <p class="settings-points__stat-value">{{ formatWalletCurrency(walletBalance) }}</p>
        </div>
      </article>

      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--amber" aria-hidden="true">
          <Icon name="i-ph-arrows-left-right-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">{{ t("settings.data.pointsPanel.exchangeRate") }}</p>
          <p class="settings-points__stat-value">{{ exchangeRateLabel }}</p>
        </div>
      </article>
    </div> -->

    <section v-if="transferPanelOpen" class="settings-points__transfer">
      <div class="settings-points__section-heading">
        <div>
          <h3 class="settings-points__section-title">{{ t("settings.data.pointsPanel.transferTitle") }}</h3>
          <p class="settings-points__section-description">{{ t("settings.data.pointsPanel.transferDescription") }}</p>
        </div>
        <button class="settings-points__refresh-button" type="button" @click="closeTransferPanel">
          <Icon name="i-ph-x-duotone" class="h-4 w-4" />
        </button>
      </div>

      <label class="settings-points-modal__field settings-points__recipient-field">
        <span>{{ t("settings.data.pointsPanel.transferSearchRecipient") }}</span>
        <input
          v-model="transferRecipientQuery"
          class="settings-points-modal__input"
          type="search"
          :placeholder="t('settings.data.pointsPanel.transferSearchPlaceholder')"
        >
        <div
          v-if="transferRecipientQuery.length >= 2 && (transferRecipients.length > 0 || (!transferSearching && !transferDraft.recipientUserId))"
          class="settings-points__recipient-dropdown"
        >
          <button
            v-for="recipient in transferRecipients"
            :key="recipient.id"
            type="button"
            class="settings-points__recipient-option"
            :class="{ 'settings-points__recipient-option--active': recipient.id === transferDraft.recipientUserId }"
            @click="selectTransferRecipient(recipient)"
          >
            <img v-if="recipient.avatarUrl" :src="recipient.avatarUrl" :alt="recipient.name">
            <span v-else>{{ recipient.name.slice(0, 1).toUpperCase() }}</span>
            <div>
              <strong>{{ recipient.name }}</strong>
              <small>@{{ recipient.username }}</small>
            </div>
          </button>
          <p v-if="!transferSearching && transferRecipients.length === 0" class="settings-points__empty-line">
            {{ t("settings.data.pointsPanel.noRecipients") }}
          </p>
        </div>
      </label>

      <div class="settings-points__transfer-grid">
        <label class="settings-points-modal__field">
          <span>{{ t("settings.data.pointsPanel.transferPointsInput") }}</span>
          <input
            v-model.number="transferDraft.points"
            class="settings-points-modal__input"
            type="number"
            min="1"
            step="1"
            :max="pointsBalance"
          >
        </label>

        <div class="settings-points__scan-actions">
          <button class="settings-points__secondary-button" type="button" @click="transferScanning ? stopTransferQrScan() : startTransferQrScan()">
            <Icon :name="transferScanning ? 'i-ph-x-duotone' : 'i-ph-camera-duotone'" class="h-4 w-4" />
            <span>{{ transferScanning ? t("settings.data.pointsPanel.stopScanQr") : t("settings.data.pointsPanel.scanQr") }}</span>
          </button>
        </div>
      </div>

      <label class="settings-points-modal__field">
        <span>{{ t("settings.data.pointsPanel.transferNote") }}</span>
        <textarea
          v-model="transferNote"
          class="settings-points-modal__input settings-points-modal__input--textarea"
          rows="3"
          :placeholder="t('settings.data.pointsPanel.transferNotePlaceholder')"
        />
      </label>

      <div v-show="transferScanning" class="settings-points__scan">
        <div id="points-qr-reader" class="settings-points__scan-reader" />
      </div>

      <div class="settings-points__upload">
        <span>{{ t("settings.data.pointsPanel.uploadQrHint") }}</span>
        <input type="file" accept="image/*" @change="scanTransferQrFile">
      </div>

      <div v-if="transferDraft.recipientUserId" class="settings-points__selected">
        <img
          v-if="selectedTransferRecipient?.avatarUrl"
          :src="selectedTransferRecipient.avatarUrl"
          :alt="selectedTransferRecipient.name"
        >
        <span v-else>{{ selectedTransferRecipientName.slice(0, 1).toUpperCase() }}</span>
        <p>{{ selectedTransferRecipientName }}</p>
        <button type="button" @click="clearTransferRecipient">
          <Icon name="i-ph-x-duotone" class="h-4 w-4" />
        </button>
      </div>

      <p v-if="transferError" class="settings-points-modal__error">{{ transferError }}</p>

      <button
        class="settings-points-modal__primary settings-points__transfer-submit"
        type="button"
        :disabled="!canSubmitTransfer || transferSubmitting"
        @click="openTransferConfirm"
      >
        <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
        <span>{{ transferSubmitting ? t("settings.data.pointsPanel.submitting") : t("settings.data.pointsPanel.transferSubmit") }}</span>
      </button>
    </section>

    <section v-if="receiveQrPanelOpen" class="settings-points__transfer">
      <div class="settings-points__section-heading">
        <div>
          <h3 class="settings-points__section-title">{{ t("settings.data.pointsPanel.receiveQrTitle") }}</h3>
          <p class="settings-points__section-description">{{ t("settings.data.pointsPanel.receiveQrDescription") }}</p>
        </div>
        <button class="settings-points__refresh-button" type="button" @click="closeReceiveQrPanel">
          <Icon name="i-ph-x-duotone" class="h-4 w-4" />
        </button>
      </div>

      <div class="settings-points__qr-update">
        <label class="settings-points-modal__field">
          <span>{{ t("settings.data.pointsPanel.receiveQrPoints") }}</span>
          <input
            v-model.number="receiveQrPoints"
            class="settings-points-modal__input"
            type="number"
            min="1"
            step="1"
          >
        </label>
        <button
          class="settings-points__qr-update-button"
          type="button"
          :aria-label="t('settings.data.pointsPanel.updateQr')"
          :title="t('settings.data.pointsPanel.updateQr')"
          @click="openReceiveQrPanel(receiveQrPoints)"
        >
          <Icon name="i-ph-arrows-clockwise-duotone" class="h-4 w-4" />
          <span>{{ t("settings.data.pointsPanel.updateQr") }}</span>
        </button>
      </div>

      <img
        v-if="receiveQr?.imageUrl"
        :src="receiveQr.imageUrl"
        :alt="t('settings.data.pointsPanel.receiveQrTitle')"
        class="settings-points__receive-image"
      >
    </section>

    <div class="settings-points__body">
      <div class="settings-points__history">
        <div class="settings-points__section-heading">
          <div>
            <h3 class="settings-points__section-title">{{ t("settings.data.pointsPanel.historyTitle") }}</h3>
            <p class="settings-points__section-description">{{ t("settings.data.pointsPanel.historyDescription") }}</p>
          </div>
          <button class="settings-points__refresh-button" type="button" @click="loadWalletHistory">
            <Icon name="i-ph-arrow-clockwise-duotone" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="historyItems.length" class="settings-points__history-list" role="list">
          <article
            v-for="item in historyItems"
            :key="item.id"
            class="settings-points__history-item"
            role="listitem"
          >
            <span class="settings-points__history-icon" aria-hidden="true">
              <Icon name="i-ph-coins-duotone" class="h-4 w-4" />
            </span>
            <div class="settings-points__history-copy">
              <p class="settings-points__history-title">{{ item.title }}</p>
              <p class="settings-points__history-meta">{{ item.meta }}</p>
            </div>
            <strong
              class="settings-points__history-amount"
              :class="{ 'settings-points__history-amount--negative': item.points < 0 }"
            >
              {{ formatSignedPoints(item.points) }}
            </strong>
          </article>
        </div>

        <div v-else class="settings-points__empty">
          <Icon name="i-ph-clock-counter-clockwise-duotone" class="h-6 w-6" />
          <p>{{ t("settings.data.pointsPanel.emptyHistory") }}</p>
        </div>
      </div>
    </div>

    <!-- Temporarily hidden while point-to-money exchange is paused.
    <Teleport to="body">
      <div
        v-if="isExchangeModalOpen"
        class="settings-points-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-points-modal-title"
      >
        <button class="settings-points-modal__backdrop" type="button" :aria-label="t('settings.data.pointsPanel.close')" @click="closeExchangeModal" />

        <form class="settings-points-modal__panel" @submit.prevent="submitExchange">
          <div class="settings-points-modal__header">
            <div>
              <p class="settings-points__eyebrow">{{ t("settings.data.pointsPanel.modalEyebrow") }}</p>
              <h2 id="settings-points-modal-title" class="settings-points-modal__title">{{ t("settings.data.pointsPanel.modalTitle") }}</h2>
            </div>
            <button class="settings-points-modal__close" type="button" :aria-label="t('settings.data.pointsPanel.close')" @click="closeExchangeModal">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <label class="settings-points-modal__field">
            <span>{{ t("settings.data.pointsPanel.pointsInput") }}</span>
            <input
              v-model.number="exchangePoints"
              class="settings-points-modal__input"
              type="number"
              :min="exchangeStepPoints"
              :max="maxExchangePoints"
              :step="exchangeStepPoints"
            >
          </label>

          <div class="settings-points__preview settings-points__preview--modal">
            <div class="settings-points__preview-row">
              <span>{{ t("settings.data.pointsPanel.exchangeable") }}</span>
              <strong>{{ t("settings.data.pointsPanel.pointsAmount", { points: formatNumber(maxExchangePoints) }) }}</strong>
            </div>
            <div class="settings-points__preview-row">
              <span>{{ t("settings.data.pointsPanel.maxValue") }}</span>
              <strong>{{ formatPointCurrency(maxExchangeAmount) }}</strong>
            </div>
            <div class="settings-points__progress" aria-hidden="true">
              <span :style="{ width: `${progressWidth}%` }" />
            </div>
          </div>

          <div class="settings-points-modal__summary">
            <div>
              <span>{{ t("settings.data.pointsPanel.pointsDeducted") }}</span>
              <strong>{{ formatNumber(normalizedExchangePoints) }}</strong>
            </div>
            <div>
              <span>{{ t("settings.data.pointsPanel.walletCredit") }}</span>
              <strong>{{ formatPointCurrency(exchangeAmount) }}</strong>
            </div>
            <div>
              <span>{{ t("settings.data.pointsPanel.walletAfterExchange") }}</span>
              <strong>{{ formatWalletCurrency(walletBalance + exchangeWalletAmount) }}</strong>
            </div>
          </div>

          <p v-if="exchangeError" class="settings-points-modal__error">{{ exchangeError }}</p>

          <div class="settings-points-modal__actions">
            <button class="settings-points-modal__secondary" type="button" @click="closeExchangeModal">
              {{ t("settings.data.pointsPanel.cancel") }}
            </button>
            <button
              class="settings-points-modal__primary"
              type="submit"
              :disabled="!canSubmitExchange || isSubmitting"
            >
              <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
              <span>{{ isSubmitting ? t("settings.data.pointsPanel.submitting") : t("settings.data.pointsPanel.confirm") }}</span>
            </button>
          </div>
        </form>
      </div>
    </Teleport>
    -->

    <Teleport to="body">
      <div v-if="transferConfirmOpen" class="settings-points-modal" role="dialog" aria-modal="true">
        <button class="settings-points-modal__backdrop" type="button" :aria-label="t('settings.data.pointsPanel.close')" @click="transferConfirmOpen = false" />
        <div class="settings-points-modal__panel">
          <div class="settings-points-modal__header">
            <div>
              <p class="settings-points__eyebrow">{{ t("settings.data.pointsPanel.transferConfirmEyebrow") }}</p>
              <h2 class="settings-points-modal__title">{{ t("settings.data.pointsPanel.transferConfirmTitle") }}</h2>
            </div>
            <button class="settings-points-modal__close" type="button" :aria-label="t('settings.data.pointsPanel.close')" @click="transferConfirmOpen = false">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>
          <div class="settings-points-modal__summary">
            <div>
              <span>{{ t("settings.data.pointsPanel.confirmRecipient") }}</span>
              <strong>{{ selectedTransferRecipientName }}</strong>
            </div>
            <div>
              <span>{{ t("settings.data.pointsPanel.confirmPoints") }}</span>
              <strong>{{ formatNumber(transferDraft.points) }}</strong>
            </div>
            <div>
              <span>{{ t("settings.data.pointsPanel.confirmNote") }}</span>
              <strong>{{ normalizedTransferNote || "-" }}</strong>
            </div>
          </div>
          <div class="settings-points-modal__actions">
            <button class="settings-points-modal__secondary" type="button" @click="transferConfirmOpen = false">
              {{ t("settings.data.pointsPanel.cancel") }}
            </button>
            <button class="settings-points-modal__primary" type="button" :disabled="transferSubmitting" @click="confirmTransferPoints">
              <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
              <span>{{ transferSubmitting ? t("settings.data.pointsPanel.submitting") : t("settings.data.pointsPanel.transferConfirmSubmit") }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type {
  SettingsPointsExchangeResult,
  SettingsPointsReceiveQr,
  SettingsPointsTransferResult,
  SettingsUser,
} from "../../domain/types/settings.types"
import { useSettingsMyPointsPanelVM } from "../../application/view-models/useSettingsMyPointsPanelVM"

const props = defineProps<{
  user: SettingsUser | null
  onExchange: (points: number) => Promise<SettingsPointsExchangeResult>
  onTransfer: (recipientUserId: number, points: number, note?: string) => Promise<SettingsPointsTransferResult>
  onLoadReceiveQr: (points?: number | null) => Promise<SettingsPointsReceiveQr>
}>()

const {
  t,
  pointsBalance,
  walletBalance,
  exchangeStepPoints,
  maxExchangePoints,
  maxExchangeAmount,
  normalizedExchangePoints,
  exchangeAmount,
  exchangeWalletAmount,
  exchangeRateLabel,
  canSubmitExchange,
  progressWidth,
  historyItems,
  isExchangeModalOpen,
  exchangePoints,
  exchangeError,
  isSubmitting,
  transferPanelOpen,
  receiveQrPanelOpen,
  transferRecipientQuery,
  transferRecipients,
  transferSearching,
  transferSubmitting,
  transferError,
  transferNote,
  transferQrPayload,
  transferScanning,
  transferConfirmOpen,
  transferDraft,
  receiveQrPoints,
  receiveQr,
  selectedTransferRecipient,
  selectedTransferRecipientName,
  normalizedTransferNote,
  canSubmitTransfer,
  formatNumber,
  formatSignedPoints,
  formatPointCurrency,
  formatWalletCurrency,
  loadWalletHistory,
  openExchangeModal,
  closeExchangeModal,
  submitExchange,
  openTransferPanel,
  closeTransferPanel,
  openTransferConfirm,
  confirmTransferPoints,
  selectTransferRecipient,
  clearTransferRecipient,
  startTransferQrScan,
  stopTransferQrScan,
  scanTransferQrFile,
  openReceiveQrPanel,
  closeReceiveQrPanel,
} = useSettingsMyPointsPanelVM(() => props.user, props.onExchange, props.onTransfer, props.onLoadReceiveQr)

</script>

<style scoped>
.settings-points {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-points__hero,
.settings-points__stat,
.settings-points__history {
  border: 1px solid rgba(0, 0, 255, 0.05);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.settings-points__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.settings-points__hero-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.settings-points__hero-icon {
  display: flex;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.2);
}

.settings-points__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.settings-points__title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
}

.settings-points__description {
  max-width: 520px;
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
}

.settings-points__exchange-button,
.settings-points-modal__primary {
  position: relative;
  z-index: 1;
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.settings-points__exchange-button {
  padding: 0 18px;
}

.settings-points__hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.settings-points__secondary-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 16px;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.settings-points__secondary-button:hover {
  border-color: rgba(0, 0, 255, 0.16);
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.settings-points__secondary-button > * {
  pointer-events: none;
}

.settings-points__exchange-button:hover,
.settings-points-modal__primary:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 255, 0.24);
  transform: translateY(-1px);
}

.settings-points__exchange-button:disabled,
.settings-points-modal__primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.settings-points__exchange-button > *,
.settings-points-modal__primary > *,
.settings-points__refresh-button > *,
.settings-points-modal__close > * {
  pointer-events: none;
}

.settings-points__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.settings-points__stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.settings-points__stat-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.settings-points__stat-icon--blue {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.settings-points__stat-icon--green {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.settings-points__stat-icon--amber {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.settings-points__stat-label,
.settings-points__preview-row span,
.settings-points-modal__field span,
.settings-points-modal__summary span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.settings-points__stat-value {
  margin: 2px 0 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.settings-points__body {
  display: block;
}

.settings-points__history,
.settings-points__transfer {
  padding: 16px;
}

.settings-points__transfer {
  border: 1px solid rgba(0, 0, 255, 0.05);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.settings-points__transfer-grid,
.settings-points__qr-update {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.settings-points__recipient-field {
  position: relative;
}

.settings-points__recipient-dropdown {
  position: absolute;
  right: 0;
  left: 0;
  top: calc(100% + 6px);
  z-index: 12;
  display: grid;
  max-height: 268px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  padding: 6px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}

.settings-points__recipient-option {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 9px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.settings-points__recipient-option:hover,
.settings-points__recipient-option--active {
  background: rgba(0, 0, 255, 0.04);
}

.settings-points__recipient-option img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.settings-points__recipient-option > span {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.settings-points__recipient-option strong,
.settings-points__recipient-option small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-points__recipient-option strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.settings-points__recipient-option small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.settings-points__scan-actions {
  display: flex;
  align-items: end;
}

.settings-points__scan-actions .settings-points__secondary-button {
  width: 100%;
}

.settings-points__qr-update {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
}

.settings-points__qr-update-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  min-width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 12px;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  pointer-events: auto;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.settings-points__qr-update-button:hover {
  border-color: rgba(0, 0, 255, 0.16);
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.settings-points__qr-update-button > * {
  pointer-events: none;
}

.settings-points__qr-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  margin-top: 14px;
}

.settings-points__scan {
  overflow: hidden;
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #0f172a;
}

.settings-points__scan-reader :deep(video) {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 16 / 10;
  object-fit: cover !important;
}

.settings-points__scan-reader :deep(#points-qr-reader__dashboard),
.settings-points__scan-reader :deep(#points-qr-reader__status_span) {
  display: none !important;
}

.settings-points__upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: #fafbfe;
  padding: 12px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.settings-points__selected {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  border: 1px solid rgba(0, 0, 255, 0.14);
  border-radius: 14px;
  background: rgba(0, 0, 255, 0.04);
  padding: 10px;
}

.settings-points__selected img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.settings-points__selected > span {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.settings-points__selected p {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-points__selected button {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
}

.settings-points__empty-line {
  margin: 0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.settings-points__transfer-submit {
  width: 100%;
  margin-top: 14px;
}

.settings-points__receive-image {
  display: block;
  width: min(100%, 260px);
  margin: 16px auto 0;
  border-radius: 14px;
  background: #ffffff;
  padding: 10px;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.12);
}

.settings-points__section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.settings-points__section-title {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.settings-points__section-description {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.settings-points__preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  background: #fafbfe;
}

.settings-points__preview--modal {
  margin-top: 14px;
}

.settings-points__preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-points__preview-row strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.settings-points__progress {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.settings-points__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0000ff 0%, #0ea5e9 100%);
}

.settings-points__refresh-button,
.settings-points-modal__close {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.settings-points__refresh-button:hover,
.settings-points-modal__close:hover {
  border-color: rgba(0, 0, 255, 0.16);
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.settings-points__history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.settings-points__history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #fafbfe;
}

.settings-points__history-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.settings-points__history-copy {
  min-width: 0;
  flex: 1;
}

.settings-points__history-title,
.settings-points__history-meta,
.settings-points__empty p {
  margin: 0;
}

.settings-points__history-title {
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-points__history-meta {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
}

.settings-points__history-amount {
  color: #16a34a;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.settings-points__history-amount--negative {
  color: #dc2626;
}

.settings-points__empty {
  display: flex;
  min-height: 132px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #fafbfe;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.settings-points-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.settings-points-modal__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(15, 23, 42, 0.48);
  cursor: pointer;
}

.settings-points-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  padding: 18px;
  border: 1px solid rgba(0, 0, 255, 0.06);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.18);
}

.settings-points-modal__header,
.settings-points-modal__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-points-modal__title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.settings-points-modal__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.settings-points-modal__input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  background: #fafbfe;
  color: #0f172a;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: border-color 0.15s ease;
}

.settings-points-modal__input:focus {
  border-color: rgba(0, 0, 255, 0.28);
}

.settings-points-modal__input--textarea {
  min-height: 90px;
  resize: vertical;
}

.settings-points-modal__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.settings-points-modal__summary div {
  min-width: 0;
  padding: 11px;
  border-radius: 12px;
  background: #fafbfe;
}

.settings-points-modal__summary strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.settings-points-modal__error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

.settings-points-modal__actions {
  margin-top: 18px;
}

.settings-points-modal__secondary {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.15s ease;
}

.settings-points-modal__secondary:hover {
  background: #f8fafc;
}

.settings-points-modal__primary {
  padding: 0 16px;
}

@media (max-width: 860px) {
  .settings-points__hero,
  .settings-points__hero-main {
    align-items: flex-start;
  }

  .settings-points__hero {
    flex-direction: column;
  }

  .settings-points__exchange-button {
    width: 100%;
  }

  .settings-points__hero-actions,
  .settings-points__secondary-button,
  .settings-points__qr-row {
    width: 100%;
  }

  .settings-points__qr-row,
  .settings-points__transfer-grid {
    grid-template-columns: 1fr;
  }

  .settings-points__stats,
  .settings-points__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .settings-points__hero-main {
    flex-direction: column;
  }

  .settings-points-modal__summary {
    grid-template-columns: 1fr;
  }

  .settings-points-modal__actions {
    flex-direction: column-reverse;
  }

  .settings-points-modal__secondary,
  .settings-points-modal__primary {
    width: 100%;
  }
}
</style>
