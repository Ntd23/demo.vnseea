// English description: ViewModel for points balance, exchange modal state, and wallet-backed points history.

import { toValue, type MaybeRefOrGetter } from "vue"
import type {
  SettingsPointsExchangeResult,
  SettingsPointsReceiveQr,
  SettingsPointsTransferResult,
  SettingsUser,
} from "../../domain/types/settings.types"
import type { WalletRecipient, WalletTransaction } from "../../../wallet/domain/types/wallet.types"
import { createApiWalletRepository } from "../../../wallet/infrastructure/repositories/ApiWalletRepository"

type HistoryItem = {
  id: string
  title: string
  meta: string
  points: number
}

const fallbackExchangeStep = 1000

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "")
  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

export function useSettingsMyPointsPanelVM(
  userSource: MaybeRefOrGetter<SettingsUser | null>,
  onExchange: (points: number) => Promise<SettingsPointsExchangeResult>,
  onTransfer: (recipientUserId: number, points: number, requestId: string, note?: string) => Promise<SettingsPointsTransferResult>,
  onLoadReceiveQr: (points?: number | null) => Promise<SettingsPointsReceiveQr>,
  walletRepository = createApiWalletRepository(),
) {
  const { t, locale } = useI18n()
  const toast = useToast()
  const isExchangeModalOpen = ref(false)
  const exchangePoints = ref(fallbackExchangeStep)
  const exchangeError = ref("")
  const isSubmitting = ref(false)
  const walletTransactions = ref<WalletTransaction[]>([])
  const statusMessage = ref("")
  const transferPanelOpen = ref(false)
  const receiveQrPanelOpen = ref(false)
  const transferRecipientQuery = ref("")
  const transferRecipients = ref<WalletRecipient[]>([])
  const transferSearching = ref(false)
  const transferSubmitting = ref(false)
  const transferError = ref("")
  const transferNote = ref("")
  const transferQrPayload = ref("")
  const transferSelectedRecipientLabel = ref("")
  const transferLastAppliedQrPayload = ref("")
  const transferScanning = ref(false)
  const transferConfirmOpen = ref(false)
  const receiveQrPoints = ref<number | null>(null)
  const receiveQr = ref<SettingsPointsReceiveQr | null>(null)
  const transferDraft = reactive({
    recipientUserId: 0,
    points: 0,
  })
  let directScanner: any = null
  let receiveQrRefreshTimer: ReturnType<typeof setTimeout> | null = null
  let skipNextTransferRecipientSearch = false
  let transferRecipientSearchVersion = 0

  const pendingTransferStorageKey = "points-transfer:pending"

  const user = computed(() => toValue(userSource))
  const pointsBalance = computed(() => Math.max(Math.trunc(toNumber(user.value?.points)), 0))
  const walletBalance = computed(() => Math.max(toNumber(user.value?.wallet), 0))
  const pointsPerCurrencyUnit = computed(() => {
    const configuredRate = Math.trunc(toNumber(user.value?.pointsConfig?.dollarToPointCost))
    return configuredRate > 0 ? configuredRate : fallbackExchangeStep
  })
  const pointBaseCurrency = computed(() => user.value?.pointsConfig?.pointBaseCurrency || "USD")
  const walletCurrency = computed(() =>
    user.value?.pointsConfig?.walletCurrency || user.value?.pointsConfig?.adsCurrency || "USD",
  )
  const walletExchangeRate = computed(() => Math.max(toNumber(user.value?.pointsConfig?.walletExchangeRate), 1))
  const formatterLocale = computed(() => locale.value === "vi" ? "vi-VN" : "en-US")
  const localizedCurrency = computed(() => user.value?.pointsConfig?.displayCurrency || "VND")
  const localizedExchangeRate = computed(() => {
    const displayRate = toNumber(user.value?.pointsConfig?.displayExchangeRate)
    if (displayRate > 1) return displayRate
    if (walletCurrency.value === "VND" && walletExchangeRate.value > 1) return walletExchangeRate.value
    return 0
  })
  const exchangeStepPoints = computed(() => pointsPerCurrencyUnit.value)
  const maxExchangePoints = computed(() =>
    Math.floor(pointsBalance.value / exchangeStepPoints.value) * exchangeStepPoints.value,
  )
  const maxExchangeAmount = computed(() => maxExchangePoints.value / pointsPerCurrencyUnit.value)
  const normalizedExchangePoints = computed(() =>
    Math.floor(toNumber(exchangePoints.value) / exchangeStepPoints.value) * exchangeStepPoints.value,
  )
  const exchangeAmount = computed(() => normalizedExchangePoints.value / pointsPerCurrencyUnit.value)
  const exchangeWalletAmount = computed(() => exchangeAmount.value * walletExchangeRate.value)
  const exchangeRateLabel = computed(() => `${formatNumber(pointsPerCurrencyUnit.value)} = ${formatPointCurrency(1)}`)
  const canSubmitExchange = computed(() =>
    normalizedExchangePoints.value >= exchangeStepPoints.value
    && normalizedExchangePoints.value <= maxExchangePoints.value
    && normalizedExchangePoints.value === exchangePoints.value,
  )
  const progressWidth = computed(() => {
    if (pointsBalance.value <= 0) return 0
    return Math.min(100, Math.round((maxExchangePoints.value / pointsBalance.value) * 100))
  })

  const historyItems = computed<HistoryItem[]>(() => {
    return walletTransactions.value
      .filter(transaction => ["POINTS_EXCHANGE", "POINTS_EARNED", "POINTS_DEDUCT", "POINTS_SENT", "POINTS_RECEIVED"].includes(transaction.kind))
      .map((transaction) => {
        const points = Math.abs(Math.trunc(toNumber(transaction.points)))
        const signedPoints = transaction.kind === "POINTS_EXCHANGE" || transaction.kind === "POINTS_DEDUCT" || transaction.kind === "POINTS_SENT"
          ? 0 - points
          : points

        return {
          id: `wallet-${transaction.id}`,
          title: pointHistoryTitle(transaction, points),
          meta: formatDate(transaction.transactionDate),
          points: signedPoints,
        }
      })
      .slice(0, 12)
  })
  const selectedTransferRecipient = computed(() =>
    transferRecipients.value.find(recipient => recipient.id === transferDraft.recipientUserId) ?? null,
  )
  const selectedTransferRecipientName = computed(() =>
    selectedTransferRecipient.value
      ? `${selectedTransferRecipient.value.name} (@${selectedTransferRecipient.value.username})`
      : transferSelectedRecipientLabel.value || `User #${transferDraft.recipientUserId}`,
  )
  const normalizedTransferNote = computed(() => transferNote.value.trim())
  const canSubmitTransfer = computed(() =>
    Number.isSafeInteger(transferDraft.recipientUserId)
    && transferDraft.recipientUserId > 0
    && Number.isSafeInteger(transferDraft.points)
    && transferDraft.points > 0
    && transferDraft.points <= pointsBalance.value,
  )

  function createTransferRequestId() {
    const random = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    return `pt_${Date.now().toString(36)}_${random}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80).padEnd(20, "0")
  }

  function getOrCreateTransferRequestId() {
    const payload = {
      recipientUserId: transferDraft.recipientUserId,
      points: transferDraft.points,
      note: normalizedTransferNote.value,
    }
    if (typeof sessionStorage !== "undefined") {
      try {
        const existing = JSON.parse(sessionStorage.getItem(pendingTransferStorageKey) || "null")
        if (
          existing?.requestId
          && existing.recipientUserId === payload.recipientUserId
          && existing.points === payload.points
          && existing.note === payload.note
        ) {
          return String(existing.requestId)
        }
      }
      catch {
        sessionStorage.removeItem(pendingTransferStorageKey)
      }
    }
    const requestId = createTransferRequestId()
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(pendingTransferStorageKey, JSON.stringify({...payload, requestId}))
    }
    return requestId
  }

  function clearTransferRequestId(requestId: string) {
    if (typeof sessionStorage === "undefined") return
    try {
      const existing = JSON.parse(sessionStorage.getItem(pendingTransferStorageKey) || "null")
      if (!existing || existing.requestId === requestId) {
        sessionStorage.removeItem(pendingTransferStorageKey)
      }
    }
    catch {
      sessionStorage.removeItem(pendingTransferStorageKey)
    }
  }

  watch(maxExchangePoints, (value) => {
    if (value < exchangeStepPoints.value) {
      exchangePoints.value = exchangeStepPoints.value
      return
    }

    if (exchangePoints.value > value) {
      exchangePoints.value = value
    }
  }, { immediate: true })

  onMounted(() => {
    void loadWalletHistory()
    if (typeof window !== "undefined") {
      const globalWin = window as any
      if (!globalWin.Html5Qrcode) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/html5-qrcode"
        script.async = true
        document.head.appendChild(script)
      }
    }
  })

  watch(transferRecipientQuery, async (query) => {
    const normalized = query.trim()

    if (skipNextTransferRecipientSearch) {
      skipNextTransferRecipientSearch = false
      transferRecipientSearchVersion += 1
      transferRecipients.value = []
      transferSearching.value = false
      return
    }

    if (
      transferDraft.recipientUserId > 0
      && transferSelectedRecipientLabel.value
      && normalized === transferSelectedRecipientLabel.value
    ) {
      transferRecipients.value = []
      return
    }

    if (normalized.length < 2 && !/^\d+$/.test(normalized)) {
      transferRecipientSearchVersion += 1
      transferRecipients.value = []
      return
    }

    const searchVersion = ++transferRecipientSearchVersion
    transferSearching.value = true

    try {
      const recipients = await walletRepository.searchRecipients(normalized)
      if (searchVersion === transferRecipientSearchVersion) {
        transferRecipients.value = recipients
      }
    }
    catch {
      if (searchVersion === transferRecipientSearchVersion) {
        transferRecipients.value = []
      }
    }
    finally {
      if (searchVersion === transferRecipientSearchVersion) {
        transferSearching.value = false
      }
    }
  })

  watch(transferQrPayload, (value) => {
    void applyPointsQrPayload(value)
  })

  watch(receiveQrPoints, (points) => {
    if (!receiveQrPanelOpen.value) return

    if (receiveQrRefreshTimer) {
      clearTimeout(receiveQrRefreshTimer)
    }

    receiveQrRefreshTimer = setTimeout(() => {
      void openReceiveQrPanel(points)
    }, 350)
  })

  onBeforeUnmount(() => {
    if (receiveQrRefreshTimer) {
      clearTimeout(receiveQrRefreshTimer)
    }
    void stopTransferQrScan()
  })

  function formatNumber(value: number) {
    return new Intl.NumberFormat(formatterLocale.value, { maximumFractionDigits: 0 }).format(value)
  }

  function formatSignedPoints(value: number) {
    const sign = value > 0 ? "+" : value < 0 ? "-" : ""
    return `${sign}${formatNumber(Math.abs(value))}`
  }

  function formatVnseeaMessage(value: string) {
    return value
      .replace(/\bpoints\b/gi, "VNSEEA")
      .replace(/\bpoint\b/gi, "VNSEEA")
      .replace(/điểm/gi, "VNSEEA")
  }

  function formatMoney(value: number, sourceCurrency: string) {
    const displayCurrency = locale.value === "vi" ? localizedCurrency.value : "USD"
    let displayValue = value

    if (sourceCurrency === displayCurrency) {
      displayValue = value
    }
    else if (sourceCurrency === "USD" && displayCurrency === "VND" && localizedExchangeRate.value > 0) {
      displayValue = value * localizedExchangeRate.value
    }
    else if (sourceCurrency === "VND" && displayCurrency === "USD" && localizedExchangeRate.value > 0) {
      displayValue = value / localizedExchangeRate.value
    }
    else if (sourceCurrency === walletCurrency.value && displayCurrency === "USD" && walletExchangeRate.value > 0) {
      displayValue = value / walletExchangeRate.value
    }
    else if (sourceCurrency === "USD" && displayCurrency === walletCurrency.value && walletExchangeRate.value > 0) {
      displayValue = value * walletExchangeRate.value
    }

    try {
      return new Intl.NumberFormat(formatterLocale.value, {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: displayCurrency === "VND" ? 0 : 2,
      }).format(displayValue)
    }
    catch {
      const symbol = displayCurrency === localizedCurrency.value
        ? user.value?.pointsConfig?.displayCurrencySymbol || localizedCurrency.value
        : "$"
      return `${formatNumber(displayValue)} ${symbol}`
    }
  }

  function formatPointCurrency(value: number) {
    return formatMoney(value, pointBaseCurrency.value)
  }

  function formatWalletCurrency(value: number) {
    return formatMoney(value, walletCurrency.value)
  }

  function formatDate(value: string) {
    if (!value) return t("settings.data.pointsPanel.justNow")
    const date = new Date(value.replace(" ", "T"))
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(formatterLocale.value, {
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

  function pointHistoryTitle(transaction: WalletTransaction, points: number) {
    const pointType = (transaction.pointType || transaction.notes || "").toLowerCase()
    if (transaction.kind === "POINTS_EARNED" && pointType === "signup_bonus") {
      return t("settings.data.pointsPanel.signupBonusHistoryTitle")
    }

    if (transaction.kind === "POINTS_EXCHANGE") {
      return t("settings.data.pointsPanel.exchangeHistoryTitle", { points: formatNumber(points) })
    }

    if (transaction.kind === "POINTS_DEDUCT") {
      return t("settings.data.pointsPanel.deductHistoryTitle", { points: formatNumber(points) })
    }

    if (transaction.kind === "POINTS_SENT") {
      return t("settings.data.pointsPanel.pointsSentHistoryTitle", {
        points: formatNumber(points),
        recipient: transaction.counterpartyName || t("settings.data.pointsPanel.unknownRecipient"),
      })
    }

    if (transaction.kind === "POINTS_RECEIVED") {
      return t("settings.data.pointsPanel.pointsReceivedHistoryTitle", {
        points: formatNumber(points),
        sender: transaction.counterpartyName || t("settings.data.pointsPanel.unknownSender"),
      })
    }

    const typeKey = transaction.pointType || transaction.notes || ""
    const translatedType = typeKey
      ? t(`settings.data.pointsPanel.pointTypes.${typeKey}`, typeKey)
      : t("settings.data.pointsPanel.defaultEarnedType")

    return t("settings.data.pointsPanel.earnedHistoryTitle", {
      points: formatNumber(points),
      type: translatedType,
    })
  }

  function openExchangeModal() {
    exchangeError.value = ""
    statusMessage.value = ""
    exchangePoints.value = exchangeStepPoints.value
    isExchangeModalOpen.value = true
  }

  function closeExchangeModal() {
    isExchangeModalOpen.value = false
    exchangeError.value = ""
  }

  async function submitExchange() {
    exchangeError.value = ""

    if (!canSubmitExchange.value) {
      exchangeError.value = t("settings.data.pointsPanel.invalidPoints", { step: formatNumber(exchangeStepPoints.value) })
      return
    }

    isSubmitting.value = true

    try {
      const result = await onExchange(normalizedExchangePoints.value)

      statusMessage.value = result.message
        ? formatVnseeaMessage(result.message)
        : t("settings.data.pointsPanel.exchangeSuccess")
      closeExchangeModal()
      toast.add({
        title: t("settings.data.pointsPanel.exchangeSuccess"),
        description: statusMessage.value,
        color: "success",
        icon: "i-ph-check-circle-bold",
      })
      void loadWalletHistory()
    }
    catch (error) {
      exchangeError.value = error instanceof Error ? error.message : t("settings.data.pointsPanel.exchangeError")
    }
    finally {
      isSubmitting.value = false
    }
  }

  function openTransferPanel() {
    transferError.value = ""
    transferPanelOpen.value = true
    receiveQrPanelOpen.value = false
  }

  function closeTransferPanel() {
    transferPanelOpen.value = false
    transferRecipientQuery.value = ""
    transferRecipients.value = []
    transferQrPayload.value = ""
    transferSelectedRecipientLabel.value = ""
    transferLastAppliedQrPayload.value = ""
    transferNote.value = ""
    transferDraft.recipientUserId = 0
    transferDraft.points = 0
    transferConfirmOpen.value = false
    transferError.value = ""
    void stopTransferQrScan()
  }

  function openTransferConfirm() {
    transferError.value = ""

    if (!transferDraft.recipientUserId) {
      transferError.value = t("settings.data.pointsPanel.transferRecipientError")
      return
    }

    if (transferDraft.points <= 0 || transferDraft.points > pointsBalance.value) {
      transferError.value = t("settings.data.pointsPanel.transferPointsError")
      return
    }

    transferConfirmOpen.value = true
  }

  async function confirmTransferPoints() {
    if (!canSubmitTransfer.value) return
    transferSubmitting.value = true
    transferError.value = ""
    const requestId = getOrCreateTransferRequestId()

    try {
      const result = await onTransfer(transferDraft.recipientUserId, transferDraft.points, requestId, normalizedTransferNote.value)
      clearTransferRequestId(result.requestId || requestId)
      toast.add({
        title: t("settings.data.pointsPanel.transferSuccess"),
        description: result.message
          ? formatVnseeaMessage(result.message)
          : t("settings.data.pointsPanel.transferSuccess"),
        color: "success",
        icon: "i-ph-check-circle-bold",
      })
      closeTransferPanel()
      void loadWalletHistory()
    }
    catch (error) {
      const status = Number((error as any)?.statusCode || (error as any)?.response?.status || 0)
      const errorCode = String(
        (error as any)?.data?.error_code
        || (error as any)?.data?.data?.error_code
        || (error as any)?.response?._data?.data?.error_code
        || "",
      )
      if ([400, 422].includes(status) || (status === 409 && errorCode === "idempotency_conflict")) {
        clearTransferRequestId(requestId)
      }
      transferError.value = error instanceof Error ? error.message : t("settings.data.pointsPanel.transferError")
    }
    finally {
      transferSubmitting.value = false
    }
  }

  function selectTransferRecipient(recipient: WalletRecipient) {
    transferDraft.recipientUserId = recipient.id
    transferSelectedRecipientLabel.value = `${recipient.name} (@${recipient.username})`
    transferRecipientQuery.value = transferSelectedRecipientLabel.value
    transferRecipients.value = []
  }

  function clearTransferRecipient() {
    transferDraft.recipientUserId = 0
    transferSelectedRecipientLabel.value = ""
    transferLastAppliedQrPayload.value = ""
    transferConfirmOpen.value = false
  }

  function parsePointsQrPayload(value: string) {
    const raw = value.trim()
    if (!raw) return null

    if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        const type = String(parsed.type ?? "")

        if (["points", "wallet", "send"].includes(type.toLowerCase())) {
          if (
            type.toLowerCase() === "points"
            && parsed.amount !== undefined
            && (parsed.points === undefined || parsed.points === null || parsed.points === "")
          ) return null
          const parsedPoints = parsed.points ?? parsed.amount
          const points = parsedPoints === undefined || parsedPoints === null ? null : parseStrictPositiveInteger(parsedPoints)
          const amount = parsed.amount === undefined || parsed.amount === null ? points : parseStrictPositiveInteger(parsed.amount)

          if (points === null ? amount !== null : points !== amount) return null

          return {
            to: parseStrictPositiveInteger(parsed.to) || 0,
            points,
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

    if (prefix !== "POINTS" && prefix !== "WALLET") return null

    const values = new Map<string, string>()
    for (const part of parts) {
      const separatorIndex = part.indexOf("=")
      if (separatorIndex > -1) {
        values.set(part.slice(0, separatorIndex), part.slice(separatorIndex + 1))
      }
    }

    const points = values.has("points") ? parseStrictPositiveInteger(values.get("points")) : null
    const amount = values.has("amount") ? parseStrictPositiveInteger(values.get("amount")) : points
    if (prefix === "POINTS" && values.has("amount") && !values.has("points")) return null
    if (points === null ? amount !== null : points !== amount) return null

    return {to: parseStrictPositiveInteger(values.get("to")) || 0, points}
  }

  async function applyPointsQrPayload(value: string, options: { stopAfterScan?: boolean } = {}) {
    const raw = value.trim()
    if (!raw) return false

    const payload = parsePointsQrPayload(raw)
    if (!payload?.to) {
      transferError.value = t("settings.data.pointsPanel.transferQrError")
      return false
    }

    if (raw === transferLastAppliedQrPayload.value && transferDraft.recipientUserId === payload.to) {
      if (payload.points !== null && Number.isFinite(payload.points) && payload.points > 0) {
        transferDraft.points = payload.points
      }

      if (options.stopAfterScan) {
        await stopTransferQrScan()
      }
      return true
    }

    transferError.value = ""
    transferLastAppliedQrPayload.value = raw
    transferDraft.recipientUserId = payload.to
    transferSelectedRecipientLabel.value = `User #${payload.to}`
    transferRecipientSearchVersion += 1
    transferRecipients.value = []
    transferSearching.value = false

    if (payload.points !== null && Number.isFinite(payload.points) && payload.points > 0) {
      transferDraft.points = payload.points
    }

    skipNextTransferRecipientSearch = true
    transferRecipientQuery.value = String(payload.to)
    await hydrateQrRecipient(payload.to)

    if (options.stopAfterScan) {
      await stopTransferQrScan()
    }

    return true
  }

  async function hydrateQrRecipient(userId: number) {
    try {
      const recipients = await walletRepository.searchRecipients(String(userId))
      const recipient = recipients.find(item => item.id === userId)

      if (recipient) {
        transferDraft.recipientUserId = recipient.id
        transferSelectedRecipientLabel.value = `${recipient.name} (@${recipient.username})`
        skipNextTransferRecipientSearch = true
        transferRecipientQuery.value = transferSelectedRecipientLabel.value
        transferRecipients.value = []
        return
      }

      transferRecipients.value = []
      transferDraft.recipientUserId = userId
      transferSelectedRecipientLabel.value = `User #${userId}`
      skipNextTransferRecipientSearch = true
      transferRecipientQuery.value = String(userId)
    }
    catch {
      transferRecipients.value = []
      transferDraft.recipientUserId = userId
      transferSelectedRecipientLabel.value = `User #${userId}`
      skipNextTransferRecipientSearch = true
      transferRecipientQuery.value = String(userId)
    }
  }

  async function startTransferQrScan() {
    transferError.value = ""

    if (typeof window === "undefined" || !(window as any).Html5Qrcode) {
      transferError.value = t("settings.data.pointsPanel.transferQrUnsupported")
      return
    }

    try {
      transferScanning.value = true
      await nextTick()

      directScanner = new (window as any).Html5Qrcode("points-qr-reader")
      const cameras = await (window as any).Html5Qrcode.getCameras()
      const preferred = (cameras || []).find((cam: any) =>
        /back|rear|environment/i.test((cam.label || "").toLowerCase()),
      )
      const cameraConfig = preferred ? { deviceId: { exact: preferred.id } } : { facingMode: "environment" }

      await directScanner.start(
        cameraConfig,
        { fps: 12, qrbox: { width: 250, height: 250 }, aspectRatio: 1.777 },
        (decodedText: string) => {
          transferQrPayload.value = decodedText
          void applyPointsQrPayload(decodedText, { stopAfterScan: true })
        },
        () => {},
      )
    }
    catch {
      void stopTransferQrScan()
      transferError.value = t("settings.data.pointsPanel.transferQrScanError")
    }
  }

  async function stopTransferQrScan() {
    transferScanning.value = false

    if (directScanner) {
      try {
        await directScanner.stop()
      } catch (_) {}
      try {
        await directScanner.clear()
      } catch (_) {}
      directScanner = null
    }

    const readerEl = typeof document !== "undefined" ? document.getElementById("points-qr-reader") : null
    if (readerEl) {
      readerEl.innerHTML = ""
    }
  }

  async function scanTransferQrFile(event: Event) {
    transferError.value = ""
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    if (typeof window === "undefined" || !(window as any).Html5Qrcode) {
      transferError.value = t("settings.data.pointsPanel.transferQrUnsupported")
      return
    }

    try {
      const decodedText = await (window as any).Html5Qrcode.scanFile(file, true)
      transferQrPayload.value = decodedText
      const applied = await applyPointsQrPayload(decodedText)
      if (!applied) return
      toast.add({
        color: "success",
        icon: "i-ph-check-circle-bold",
        title: t("settings.data.pointsPanel.transferQrScanned"),
      })
    }
    catch {
      transferError.value = t("settings.data.pointsPanel.transferQrFileError")
    }
  }

  async function openReceiveQrPanel(points?: number | null) {
    transferPanelOpen.value = false
    receiveQrPanelOpen.value = true
    receiveQr.value = await onLoadReceiveQr(points ?? receiveQrPoints.value)
  }

  function closeReceiveQrPanel() {
    receiveQrPanelOpen.value = false
  }

  return {
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
  }
}

const parseStrictPositiveInteger = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 && value <= 2147483647 ? value : null
  }
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed <= 2147483647 ? parsed : null
}
