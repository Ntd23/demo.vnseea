<!-- English description: Temporary points wallet page that reuses the my-points transfer and receive-QR logic. -->
<template>
  <div class="wallet-points-page mt-2">
    <div v-if="loading" class="wallet-points-loading">
      <USkeleton class="h-32 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        class="rounded-2xl"
        :description="errorMessage"
      />

      <template v-else>
        <section class="wallet-points-hero">
          <div class="wallet-points-hero__main">
            <span class="wallet-points-hero__icon" aria-hidden="true">
              <Icon name="i-ph-wallet-duotone" class="h-7 w-7" />
            </span>
            <div>
              <h1 class="wallet-points-hero__title">Ví VNSEEA</h1>
              <strong class="wallet-points-hero__balance">{{ formatNumber(pointsBalance) }} VNSEEA</strong>
            </div>
          </div>

          <div class="wallet-points-tabs" aria-label="Thao tác ví VNSEEA">
            <!-- Tạm comment nạp tiền/rút tiền trong ví điểm.
            <button type="button" class="wallet-points-tab">
              <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
              <span>Nạp tiền</span>
            </button>
            <button type="button" class="wallet-points-tab">
              <Icon name="i-ph-bank-duotone" class="h-5 w-5" />
              <span>Rút tiền</span>
            </button>
            -->
            <button
              type="button"
              class="wallet-points-tab"
              :class="{ 'wallet-points-tab--active': transferPanelOpen }"
              @click="openTransferPanel"
            >
              <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
              <span>Chuyển VNSEEA</span>
            </button>
            <button
              type="button"
              class="wallet-points-tab"
              :class="{ 'wallet-points-tab--active': receiveQrPanelOpen }"
              @click="openReceiveQrPanel(receiveQrPoints)"
            >
              <Icon name="i-ph-qr-code-duotone" class="h-5 w-5" />
              <span>Mã QR nhận VNSEEA</span>
            </button>
          </div>
        </section>

        <section class="wallet-points-panel">
          <div class="wallet-points-panel__heading">
            <div>
              <h2>Lịch sử VNSEEA</h2>
              <p>Các lần nhận, gửi và thay đổi VNSEEA gần đây.</p>
            </div>
            <button class="wallet-points-icon-button" type="button" @click="loadWalletHistory">
              <Icon name="i-ph-arrow-clockwise-duotone" class="h-4 w-4" />
            </button>
          </div>

          <div v-if="historyItems.length" class="wallet-points-history" role="list">
            <button
              v-for="item in historyItems"
              :key="item.id"
              type="button"
              class="wallet-points-history__item"
              :class="{ 'wallet-points-history__item--expanded': expandedHistoryItemId === item.id }"
              role="listitem"
              @click="toggleHistoryItem(item.id)"
            >
              <span class="wallet-points-history__icon" aria-hidden="true">
                <Icon name="i-ph-coins-duotone" class="h-4 w-4" />
              </span>
              <div class="wallet-points-history__copy">
                <p>{{ item.title }}</p>
                <small>{{ item.meta }}</small>
              </div>
              <strong :class="{ 'wallet-points-history__amount--negative': item.points < 0 }">
                {{ formatSignedPoints(item.points) }}
              </strong>
            </button>
          </div>

          <div v-else class="wallet-points-empty">
            <Icon name="i-ph-clock-counter-clockwise-duotone" class="h-6 w-6" />
            <p>Chưa có lịch sử VNSEEA.</p>
          </div>
        </section>
      </template>
    </template>

    <Teleport to="body">
      <div v-if="transferPanelOpen" class="wallet-points-modal" role="dialog" aria-modal="true">
        <button class="wallet-points-modal__backdrop" type="button" aria-label="Đóng" @click="closeTransferPanel" />
        <div class="wallet-points-modal__panel wallet-points-modal__panel--wide">
          <div class="wallet-points-modal__header">
            <div>
              <p class="wallet-points-header__eyebrow">Chuyển VNSEEA cho người khác</p>
            </div>
            <button class="wallet-points-icon-button" type="button" @click="closeTransferPanel">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <label class="wallet-points-field">
            <span>Chọn số VNSEEA muốn chuyển</span>
            <input
              v-model.number="transferDraft.points"
              class="wallet-points-input"
              type="number"
              min="1"
              step="1"
              :max="pointsBalance"
              placeholder="Nhập số VNSEEA"
            >
          </label>

          <div class="wallet-points-transfer-question">
            <div>
              <span>Bạn muốn gửi cho ai?</span>
            </div>
            <button class="wallet-points-secondary" type="button" @click="startTransferQrScan">
              <Icon name="i-ph-camera-duotone" class="h-4 w-4" />
              <span>Quét mã QR</span>
            </button>
          </div>

          <label class="wallet-points-field wallet-points-field--recipient">
            <span>Nhập người nhận</span>
            <input
              v-model="transferRecipientQuery"
              class="wallet-points-input"
              type="search"
              placeholder="Tìm theo tên, username hoặc ID"
            >
            <div
              v-if="transferRecipientQuery.length >= 2 && (transferRecipients.length > 0 || (!transferSearching && !transferDraft.recipientUserId))"
              class="wallet-points-recipient-dropdown"
            >
              <button
                v-for="recipient in transferRecipients"
                :key="recipient.id"
                type="button"
                class="wallet-points-recipient"
                :class="{ 'wallet-points-recipient--active': recipient.id === transferDraft.recipientUserId }"
                @click="selectTransferRecipient(recipient)"
              >
                <img v-if="recipient.avatarUrl" :src="recipient.avatarUrl" :alt="recipient.name">
                <span v-else>{{ recipient.name.slice(0, 1).toUpperCase() }}</span>
                <div>
                  <strong>{{ recipient.name }}</strong>
                  <small>@{{ recipient.username }}</small>
                </div>
              </button>
              <p v-if="!transferSearching && transferRecipients.length === 0" class="wallet-points-empty-line">
                Không tìm thấy người nhận phù hợp.
              </p>
            </div>
          </label>

          <div v-if="transferDraft.recipientUserId" class="wallet-points-selected">
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

          <label class="wallet-points-field">
            <span>Nội dung</span>
            <textarea
              v-model="transferNote"
              class="wallet-points-input wallet-points-input--textarea"
              rows="3"
              placeholder="Ghi chú cho giao dịch"
            />
          </label>

          <p v-if="transferError" class="wallet-points-error">{{ transferError }}</p>

          <button
            class="wallet-points-primary wallet-points-submit"
            type="button"
            :disabled="!canSubmitTransfer || transferSubmitting"
            @click="openTransferConfirm"
          >
            <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
            <span>{{ transferSubmitting ? "Đang gửi..." : "Chuyển VNSEEA" }}</span>
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="transferScanning" class="wallet-points-modal" role="dialog" aria-modal="true">
        <button class="wallet-points-modal__backdrop" type="button" aria-label="Đóng" @click="stopTransferQrScan" />
        <div class="wallet-points-modal__panel wallet-points-modal__panel--scanner">
          <div class="wallet-points-modal__header">
            <div>
              <p class="wallet-points-header__eyebrow">Quét mã QR</p>
              <h2>Đưa mã QR vào khung quét</h2>
            </div>
            <button class="wallet-points-icon-button" type="button" @click="stopTransferQrScan">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <div class="wallet-points-scan wallet-points-scan--modal">
            <div id="points-qr-reader" class="wallet-points-scan__reader" />
          </div>
          <p class="wallet-points-modal__hint">Sau khi quét thành công, hệ thống sẽ tự điền người nhận và số VNSEEA nếu QR có gợi ý.</p>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="receiveQrPanelOpen" class="wallet-points-modal" role="dialog" aria-modal="true">
        <button class="wallet-points-modal__backdrop" type="button" aria-label="Đóng" @click="closeReceiveQrPanel" />
        <div class="wallet-points-modal__panel">
          <div class="wallet-points-modal__header">
            <div>
              <h2>Tạo mã QR nhận VNSEEA</h2>
            </div>
            <button class="wallet-points-icon-button" type="button" @click="closeReceiveQrPanel">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <div class="wallet-points-qr-form">
            <label class="wallet-points-field">
              <span>Số VNSEEA gợi ý</span>
              <input
                v-model.number="receiveQrPoints"
                class="wallet-points-input"
                type="number"
                min="1"
                step="1"
              >
            </label>
            <button class="wallet-points-secondary" type="button" @click="openReceiveQrPanel(receiveQrPoints)">
              <Icon name="i-ph-arrows-clockwise-duotone" class="h-4 w-4" />
              <span>Cập nhật QR</span>
            </button>
          </div>

          <img
            v-if="receiveQr?.imageUrl"
            :src="receiveQr.imageUrl"
            alt="Mã QR nhận VNSEEA"
            class="wallet-points-qr"
          >
          <p class="wallet-points-modal__hint">Người gửi quét QR này sẽ tự điền người nhận và số VNSEEA gợi ý.</p>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="transferConfirmOpen" class="wallet-points-modal" role="dialog" aria-modal="true">
        <button class="wallet-points-modal__backdrop" type="button" aria-label="Đóng" @click="transferConfirmOpen = false" />
        <div class="wallet-points-modal__panel">
          <div class="wallet-points-modal__header">
            <div>
              <p class="wallet-points-header__eyebrow">Xác nhận</p>
              <h2>Xác nhận chuyển VNSEEA</h2>
            </div>
            <button class="wallet-points-icon-button" type="button" @click="transferConfirmOpen = false">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>
          <div class="wallet-points-summary">
            <div>
              <span>Người nhận</span>
              <strong>{{ selectedTransferRecipientName }}</strong>
            </div>
            <div>
              <span>Số VNSEEA</span>
              <strong>{{ formatNumber(transferDraft.points) }}</strong>
            </div>
            <div>
              <span>Nội dung</span>
              <strong>{{ normalizedTransferNote || "-" }}</strong>
            </div>
          </div>
          <div class="wallet-points-modal__actions">
            <button class="wallet-points-secondary" type="button" @click="transferConfirmOpen = false">
              Hủy
            </button>
            <button class="wallet-points-primary" type="button" :disabled="transferSubmitting" @click="confirmTransferPoints">
              <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
              <span>{{ transferSubmitting ? "Đang gửi..." : "Xác nhận chuyển" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type {
  SettingsPointsExchangeResult,
} from "../../../settings/domain/types/settings.types"
import { useSettingsMyPointsPanelVM } from "../../../settings/application/view-models/useSettingsMyPointsPanelVM"
import { useSettingsPageVM } from "../../../settings/application/view-models/useSettingsPageVM"

const {
  user,
  loading,
  errorMessage,
  transferPoints,
  getPointsReceiveQr,
} = useSettingsPageVM(() => "myPoints")

const disabledExchange = async (): Promise<SettingsPointsExchangeResult> => {
  throw new Error("Tính năng đổi VNSEEA sang tiền đang tạm ẩn.")
}

const {
  pointsBalance,
  historyItems,
  transferPanelOpen,
  receiveQrPanelOpen,
  transferRecipientQuery,
  transferRecipients,
  transferSearching,
  transferSubmitting,
  transferError,
  transferNote,
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
  loadWalletHistory,
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
} = useSettingsMyPointsPanelVM(() => user.value, disabledExchange, transferPoints, getPointsReceiveQr)

const expandedHistoryItemId = ref<string | null>(null)

const toggleHistoryItem = (itemId: string) => {
  expandedHistoryItemId.value = expandedHistoryItemId.value === itemId ? null : itemId
}
</script>

<style scoped>
.wallet-points-page {
  display: flex;
  width: min(100%, 980px);
  flex-direction: column;
  gap: 14px;
  padding-bottom: 40px;
}

.wallet-points-header,
.wallet-points-hero,
.wallet-points-panel {
  border: 1px solid color-mix(in srgb, var(--bg-brand) 5%, transparent);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.wallet-points-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.wallet-points-header__icon,
.wallet-points-hero__icon,
.wallet-points-history__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.wallet-points-header__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.wallet-points-header__eyebrow,
.wallet-points-hero__label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.wallet-points-header__title,
.wallet-points-hero__title,
.wallet-points-panel__heading h2,
.wallet-points-modal__header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.wallet-points-loading {
  display: grid;
  gap: 14px;
}

.wallet-points-hero {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.wallet-points-hero__main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.wallet-points-hero__icon {
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.wallet-points-hero__balance {
  display: block;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 900;
  line-height: 1.08;
}

.wallet-points-hero__description,
.wallet-points-panel__heading p,
.wallet-points-modal__hint {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.wallet-points-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.wallet-points-tab,
.wallet-points-secondary,
.wallet-points-primary,
.wallet-points-icon-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.wallet-points-tab {
  min-height: 50px;
  border: 1px solid #e2e8f0;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
}

.wallet-points-tab:hover,
.wallet-points-tab--active,
.wallet-points-secondary:hover,
.wallet-points-icon-button:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 16%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  color: var(--bg-brand);
}

.wallet-points-panel {
  padding: 16px;
}

.wallet-points-panel__heading,
.wallet-points-modal__header,
.wallet-points-modal__actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.wallet-points-icon-button {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border: 1px solid #e2e8f0;
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.wallet-points-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.wallet-points-field span,
.wallet-points-summary span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.wallet-points-field--recipient {
  position: relative;
}

.wallet-points-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  background: #fafbfe;
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}

.wallet-points-input:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 28%, transparent);
}

.wallet-points-input--textarea {
  min-height: 88px;
  resize: vertical;
}

.wallet-points-recipient-dropdown {
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
  background: var(--bg-surface);
  padding: 6px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}

.wallet-points-recipient,
.wallet-points-selected {
  display: grid;
  align-items: center;
  gap: 10px;
}

.wallet-points-recipient {
  grid-template-columns: 38px minmax(0, 1fr);
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 9px;
  text-align: left;
  cursor: pointer;
}

.wallet-points-recipient:hover,
.wallet-points-recipient--active {
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
}

.wallet-points-recipient img,
.wallet-points-selected img {
  border-radius: 50%;
  object-fit: cover;
}

.wallet-points-recipient img,
.wallet-points-recipient > span {
  width: 38px;
  height: 38px;
}

.wallet-points-recipient > span,
.wallet-points-selected > span {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.wallet-points-recipient strong,
.wallet-points-recipient small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-points-recipient strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.wallet-points-recipient small {
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
}

.wallet-points-transfer-grid,
.wallet-points-qr-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
}

.wallet-points-secondary {
  min-height: 42px;
  border: 1px solid #e2e8f0;
  background: var(--bg-surface);
  padding: 0 16px;
  color: var(--text-primary);
  font-size: 13px;
}

.wallet-points-primary {
  min-height: 42px;
  border: 0;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  padding: 0 18px;
  color: #ffffff;
  font-size: 13px;
}

.wallet-points-primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.wallet-points-submit {
  width: 100%;
  margin-top: 14px;
}

.wallet-points-scan {
  overflow: hidden;
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #0f172a;
}

.wallet-points-scan--modal {
  margin-top: 16px;
}

.wallet-points-scan__reader :deep(video) {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 16 / 10;
  object-fit: cover !important;
}

.wallet-points-scan__reader :deep(#points-qr-reader__dashboard),
.wallet-points-scan__reader :deep(#points-qr-reader__status_span) {
  display: none !important;
}

.wallet-points-upload,
.wallet-points-empty-line,
.wallet-points-empty {
  border-radius: 14px;
  background: #fafbfe;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.wallet-points-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  border: 1px solid #f1f5f9;
  padding: 12px;
}

.wallet-points-empty-line {
  margin: 0;
  padding: 12px;
}

.wallet-points-selected {
  grid-template-columns: 40px minmax(0, 1fr) 34px;
  margin-top: 12px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 14%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  padding: 10px;
}

.wallet-points-selected img,
.wallet-points-selected > span {
  width: 40px;
  height: 40px;
}

.wallet-points-selected p {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-points-selected button {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.wallet-points-error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

.wallet-points-history {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.wallet-points-history__item {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #fafbfe;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.wallet-points-history__item:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
}

.wallet-points-history__item--expanded {
  align-items: flex-start;
}

.wallet-points-history__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.wallet-points-history__copy {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.wallet-points-history__copy p,
.wallet-points-history__copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-points-history__item--expanded .wallet-points-history__copy p,
.wallet-points-history__item--expanded .wallet-points-history__copy small {
  overflow: visible;
  text-overflow: initial;
  white-space: normal;
  word-break: break-word;
}

.wallet-points-history__copy p {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.wallet-points-history__copy small {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 600;
}

.wallet-points-history__item strong {
  flex: 0 0 auto;
  color: #16a34a;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.wallet-points-history__amount--negative {
  color: #dc2626 !important;
}

.wallet-points-empty {
  display: flex;
  min-height: 132px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  border: 1px dashed #cbd5e1;
}

.wallet-points-empty p {
  margin: 0;
}

.wallet-points-modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.wallet-points-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(15, 23, 42, 0.48);
  cursor: pointer;
}

.wallet-points-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 480px);
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 6%, transparent);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.18);
}

.wallet-points-modal__panel--wide {
  width: min(100%, 560px);
}

.wallet-points-modal__panel--scanner {
  width: min(100%, 520px);
}

.wallet-points-modal__header {
  align-items: center;
}

.wallet-points-modal__actions {
  align-items: center;
  margin-top: 18px;
}

.wallet-points-qr {
  display: block;
  width: min(100%, 270px);
  margin: 16px auto 0;
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 10px;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.12);
}

.wallet-points-modal__hint {
  text-align: center;
}

.wallet-points-transfer-question {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: #fafbfe;
  padding: 12px;
}

.wallet-points-transfer-question span {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.wallet-points-transfer-question p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
}

.wallet-points-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.wallet-points-summary div {
  min-width: 0;
  padding: 11px;
  border-radius: 12px;
  background: #fafbfe;
}

.wallet-points-summary strong {
  display: block;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.wallet-points-tab > *,
.wallet-points-secondary > *,
.wallet-points-primary > *,
.wallet-points-icon-button > * {
  pointer-events: none;
}

@media (max-width: 640px) {
  .wallet-points-hero__main,
  .wallet-points-panel__heading {
    align-items: flex-start;
  }

  .wallet-points-hero__main {
    flex-direction: column;
  }

  .wallet-points-tabs,
  .wallet-points-transfer-grid,
  .wallet-points-transfer-question,
  .wallet-points-qr-form,
  .wallet-points-summary {
    grid-template-columns: 1fr;
  }

  .wallet-points-secondary,
  .wallet-points-primary {
    width: 100%;
  }

  .wallet-points-modal__actions {
    flex-direction: column-reverse;
  }
}
</style>
