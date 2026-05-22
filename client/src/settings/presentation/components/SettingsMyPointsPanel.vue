<template>
  <section class="settings-points" aria-labelledby="settings-points-title">
    <div class="settings-points__hero">
      <div class="settings-points__hero-main">
        <span class="settings-points__hero-icon" aria-hidden="true">
          <Icon name="i-ph-star-fill" class="h-6 w-6" />
        </span>
        <div>
          <p class="settings-points__eyebrow">Điểm thành viên</p>
          <h2 id="settings-points-title" class="settings-points__title">
            {{ formatNumber(pointsBalance) }} điểm
          </h2>
          <p class="settings-points__description">
            Đổi điểm tích lũy sang số dư ví VNSEEA để tiếp tục sử dụng trong hệ thống.
          </p>
        </div>
      </div>

      <button
        class="settings-points__exchange-button"
        type="button"
        :disabled="maxExchangePoints < exchangeStep"
        @click="openExchangeModal"
      >
        <Icon name="i-ph-swap-fill" class="h-4 w-4" />
        <span>Đổi điểm</span>
      </button>
    </div>

    <div class="settings-points__stats">
      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--blue" aria-hidden="true">
          <Icon name="i-ph-star-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">Điểm khả dụng</p>
          <p class="settings-points__stat-value">{{ formatNumber(pointsBalance) }}</p>
        </div>
      </article>

      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--green" aria-hidden="true">
          <Icon name="i-ph-wallet-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">Số dư ví</p>
          <p class="settings-points__stat-value">{{ formatCurrency(walletBalance) }}</p>
        </div>
      </article>

      <article class="settings-points__stat">
        <span class="settings-points__stat-icon settings-points__stat-icon--amber" aria-hidden="true">
          <Icon name="i-ph-arrows-left-right-duotone" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-points__stat-label">Tỉ lệ quy đổi</p>
          <p class="settings-points__stat-value">1.000 = 10.000 VND</p>
        </div>
      </article>
    </div>

    <div class="settings-points__body">
      <div class="settings-points__calculator">
        <div class="settings-points__section-heading">
          <div>
            <h3 class="settings-points__section-title">Ước tính quy đổi</h3>
            <p class="settings-points__section-description">
              Chọn số điểm theo bội số 1.000 để xem số tiền sẽ cộng vào ví.
            </p>
          </div>
        </div>

        <div class="settings-points__preview">
          <div class="settings-points__preview-row">
            <span>Có thể đổi</span>
            <strong>{{ formatNumber(maxExchangePoints) }} điểm</strong>
          </div>
          <div class="settings-points__preview-row">
            <span>Giá trị tối đa</span>
            <strong>{{ formatCurrency(maxExchangeAmount) }}</strong>
          </div>
          <div class="settings-points__progress" aria-hidden="true">
            <span :style="{ width: `${progressWidth}%` }" />
          </div>
        </div>
      </div>

      <div class="settings-points__history">
        <div class="settings-points__section-heading">
          <div>
            <h3 class="settings-points__section-title">Lịch sử điểm</h3>
            <p class="settings-points__section-description">Các lần đổi điểm sang ví gần đây.</p>
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
            <strong class="settings-points__history-amount">{{ formatCurrency(item.amount) }}</strong>
          </article>
        </div>

        <div v-else class="settings-points__empty">
          <Icon name="i-ph-clock-counter-clockwise-duotone" class="h-6 w-6" />
          <p>Chưa có lịch sử đổi điểm.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isExchangeModalOpen"
        class="settings-points-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-points-modal-title"
      >
        <button class="settings-points-modal__backdrop" type="button" aria-label="Dong" @click="closeExchangeModal" />

        <form class="settings-points-modal__panel" @submit.prevent="submitExchange">
          <div class="settings-points-modal__header">
            <div>
              <p class="settings-points__eyebrow">Quy đổi điểm</p>
              <h2 id="settings-points-modal-title" class="settings-points-modal__title">Đổi điểm sang ví</h2>
            </div>
            <button class="settings-points-modal__close" type="button" aria-label="Dong" @click="closeExchangeModal">
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <label class="settings-points-modal__field">
            <span>Số điểm muốn đổi</span>
            <input
              v-model.number="exchangePoints"
              class="settings-points-modal__input"
              type="number"
              :min="exchangeStep"
              :max="maxExchangePoints"
              :step="exchangeStep"
            >
          </label>

          <div class="settings-points-modal__summary">
            <div>
              <span>Điểm trừ</span>
              <strong>{{ formatNumber(normalizedExchangePoints) }}</strong>
            </div>
            <div>
              <span>Cộng vào ví</span>
              <strong>{{ formatCurrency(exchangeAmount) }}</strong>
            </div>
            <div>
              <span>Ví sau đổi</span>
              <strong>{{ formatCurrency(walletBalance + exchangeAmount) }}</strong>
            </div>
          </div>

          <p v-if="exchangeError" class="settings-points-modal__error">{{ exchangeError }}</p>

          <div class="settings-points-modal__actions">
            <button class="settings-points-modal__secondary" type="button" @click="closeExchangeModal">
              Hủy
            </button>
            <button
              class="settings-points-modal__primary"
              type="submit"
              :disabled="!canSubmitExchange || isSubmitting"
            >
              <Icon name="i-ph-check-circle-fill" class="h-4 w-4" />
              <span>{{ isSubmitting ? "Đang đổi..." : "Xác nhận đổi" }}</span>
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type { SettingsPointsExchangeResult, SettingsUser } from "../../domain/types/settings.types"
import { createApiWalletRepository } from "../../../wallet/infrastructure/repositories/ApiWalletRepository"
import type { WalletTransaction } from "../../../wallet/domain/types/wallet.types"

type HistoryItem = {
  id: string
  title: string
  meta: string
  amount: number
}

const props = defineProps<{
  user: SettingsUser | null
  onExchange: (points: number) => Promise<SettingsPointsExchangeResult>
}>()

const exchangeStep = 1000
const exchangeAmountPerStep = 10000
const isExchangeModalOpen = ref(false)
const exchangePoints = ref(exchangeStep)
const exchangeError = ref("")
const isSubmitting = ref(false)
const walletTransactions = ref<WalletTransaction[]>([])
const localHistory = ref<HistoryItem[]>([])
const walletRepository = createApiWalletRepository()

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "")
  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

const pointsBalance = computed(() => Math.max(Math.trunc(toNumber(props.user?.points)), 0))
const walletBalance = computed(() => Math.max(toNumber(props.user?.wallet), 0))
const maxExchangePoints = computed(() => Math.floor(pointsBalance.value / exchangeStep) * exchangeStep)
const maxExchangeAmount = computed(() => (maxExchangePoints.value / exchangeStep) * exchangeAmountPerStep)
const normalizedExchangePoints = computed(() => Math.floor(toNumber(exchangePoints.value) / exchangeStep) * exchangeStep)
const exchangeAmount = computed(() => (normalizedExchangePoints.value / exchangeStep) * exchangeAmountPerStep)
const canSubmitExchange = computed(() =>
  normalizedExchangePoints.value >= exchangeStep
  && normalizedExchangePoints.value <= maxExchangePoints.value
  && normalizedExchangePoints.value === exchangePoints.value,
)
const progressWidth = computed(() => {
  if (pointsBalance.value <= 0) return 0
  return Math.min(100, Math.round((maxExchangePoints.value / pointsBalance.value) * 100))
})

const historyItems = computed<HistoryItem[]>(() => {
  const exchangeTransactions = walletTransactions.value
    .filter(transaction => transaction.kind === "POINTS_EXCHANGE")
    .map(transaction => ({
      id: `wallet-${transaction.id}`,
      title: transaction.notes || "Đổi điểm sang ví",
      meta: formatDate(transaction.transactionDate),
      amount: transaction.amount,
    }))

  return [...localHistory.value, ...exchangeTransactions].slice(0, 6)
})

watch(maxExchangePoints, (value) => {
  if (value < exchangeStep) {
    exchangePoints.value = exchangeStep
    return
  }

  if (exchangePoints.value > value) {
    exchangePoints.value = value
  }
}, { immediate: true })

onMounted(() => {
  void loadWalletHistory()
})

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return "Vừa xong"
  const date = new Date(value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

async function loadWalletHistory() {
  try {
    const overview = await walletRepository.getOverview()
    walletTransactions.value = overview.transactions
  }
  catch {
    walletTransactions.value = []
  }
}

function openExchangeModal() {
  exchangeError.value = ""
  exchangePoints.value = maxExchangePoints.value >= exchangeStep ? exchangeStep : exchangeStep
  isExchangeModalOpen.value = true
}

function closeExchangeModal() {
  if (isSubmitting.value) return
  isExchangeModalOpen.value = false
  exchangeError.value = ""
}

async function submitExchange() {
  exchangeError.value = ""

  if (!canSubmitExchange.value) {
    exchangeError.value = "Vui lòng nhập số điểm hợp lệ theo bội số 1.000."
    return
  }

  isSubmitting.value = true

  try {
    const result = await props.onExchange(normalizedExchangePoints.value)

    localHistory.value.unshift({
      id: `local-${Date.now()}`,
      title: `Đổi ${formatNumber(result.exchangedPoints)} điểm sang ví`,
      meta: "Vừa xong",
      amount: result.amount,
    })

    await loadWalletHistory()
    closeExchangeModal()
  }
  catch (error) {
    exchangeError.value = error instanceof Error ? error.message : "Không thể đổi điểm lúc này."
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.settings-points {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-points__hero,
.settings-points__stat,
.settings-points__calculator,
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
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 14px;
}

.settings-points__calculator,
.settings-points__history {
  padding: 16px;
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
