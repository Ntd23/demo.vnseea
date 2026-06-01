// English description: Owns send-money form state, formatted amount input, recipient selection, validation, and QR scanning.

import {
  createWalletAmountInputFormatOptions,
  formatWalletAmount,
} from "../../domain/services/wallet-money.service"
import { parseWalletQrPayload } from "../../domain/services/wallet-qr-payload.service"
import type {
  WalletCurrencyRule,
  WalletRecipient,
  WalletSendDraft,
} from "../../domain/types/wallet.types"

type WalletSendFormProps = {
  open: boolean
  recipients: WalletRecipient[]
  searching: boolean
  submitting: boolean
  balance: number
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
}

type WalletSendFormEmit = {
  (event: "update:open", value: boolean): void
  (event: "search", query: string): void
  (event: "send", payload: WalletSendDraft): void
}

export function useWalletSendFormVM(props: WalletSendFormProps, emit: WalletSendFormEmit) {
  const { t, locale } = useI18n()
  const toast = useToast()
  const recipientQuery = ref("")
  const qrPayload = ref("")
  const selectedRecipientLabel = ref("")
  const localError = ref("")
  const transferNote = ref("")
  const confirmOpen = ref(false)
  const scanning = ref(false)
  const draft = reactive<WalletSendDraft>({
    recipientUserId: 0,
    amount: 0,
  })
  let directScanner: any = null

  onMounted(() => {
    if (typeof window !== "undefined") {
      const globalWin = window as any
      if (!globalWin.Html5Qrcode) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/html5-qrcode"
        script.async = true
        script.onload = () => {
          console.log("html5-qrcode loaded successfully")
        }
        document.head.appendChild(script)
      }
    }
  })

  const selectedRecipient = computed(() =>
    props.recipients.find(recipient => recipient.id === draft.recipientUserId) ?? null,
  )
  const selectedRecipientName = computed(() =>
    selectedRecipient.value
      ? `${selectedRecipient.value.name} (@${selectedRecipient.value.username})`
      : selectedRecipientLabel.value || `User #${draft.recipientUserId}`,
  )
  const normalizedTransferNote = computed(() => transferNote.value.trim())
  const amountInputFormatOptions = computed(() =>
    createWalletAmountInputFormatOptions({
      currency: props.currency,
      currencySymbol: props.currencySymbol,
      currencyRule: props.currencyRule,
      locale: locale.value,
    }),
  )
  const formattedDraftAmount = computed(() =>
    formatWalletAmount(draft.amount || 0, {
      currency: props.currency,
      currencySymbol: props.currencySymbol,
      currencyRule: props.currencyRule,
      locale: locale.value,
    }),
  )
  const confirmationDate = computed(() =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()),
  )

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
        transferNote.value = ""
        confirmOpen.value = false
        localError.value = ""
        stopQrScan()
      }
    },
  )

  watch(
    () => props.recipients,
    (recipients) => {
      const recipient = recipients.find(item => item.id === draft.recipientUserId)
      if (recipient) {
        selectedRecipientLabel.value = recipient.name
      }
    },
  )

  onBeforeUnmount(() => {
    stopQrScan()
  })


  function selectRecipient(recipient: WalletRecipient) {
    draft.recipientUserId = recipient.id
    selectedRecipientLabel.value = recipient.name
  }

  function clearRecipient() {
    draft.recipientUserId = 0
    selectedRecipientLabel.value = ""
    confirmOpen.value = false
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

    confirmOpen.value = true
  }

  function confirmTransfer() {
    emit("send", {
      ...draft,
      note: normalizedTransferNote.value,
    })
  }

  async function startQrScan() {
    localError.value = ""

    if (typeof window === "undefined" || !(window as any).Html5Qrcode) {
      localError.value = t("pages.walletPage.errorQrScanUnsupported")
      return
    }

    try {
      scanning.value = true
      await nextTick()

      directScanner = new (window as any).Html5Qrcode("qr-reader")
      const config = {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.777,
      }

      const cameras = await (window as any).Html5Qrcode.getCameras()
      const preferred = (cameras || []).find((cam: any) =>
        /back|rear|environment/i.test((cam.label || "").toLowerCase()),
      )
      const cameraConfig = preferred ? { deviceId: { exact: preferred.id } } : { facingMode: "environment" }

      await directScanner.start(
        cameraConfig,
        config,
        (decodedText: string) => {
          qrPayload.value = decodedText
        },
        () => {},
      )
    }
    catch (err) {
      stopQrScan()
      localError.value = t("pages.walletPage.errorQrScan")
      console.error("Camera scan start failed:", err)
    }
  }

  async function stopQrScan() {
    scanning.value = false

    if (directScanner) {
      try {
        await directScanner.stop()
      } catch (_) {}
      try {
        await directScanner.clear()
      } catch (_) {}
      directScanner = null
    }

    const readerEl = document.getElementById("qr-reader")
    if (readerEl) {
      readerEl.innerHTML = ""
    }
  }

  async function scanQrFile(event: Event) {
    localError.value = ""
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    if (typeof window === "undefined" || !(window as any).Html5Qrcode) {
      localError.value = t("pages.walletPage.errorQrScanUnsupported")
      return
    }

    try {
      const decodedText = await (window as any).Html5Qrcode.scanFile(file, true)
      qrPayload.value = decodedText
      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: locale.value === "vi" ? "Quét mã thành công" : "QR scanned successfully",
        description: locale.value === "vi"
          ? "Đã đọc thành công thông tin ví người nhận từ tệp ảnh QR."
          : "Successfully read wallet recipient info from the uploaded QR image.",
      })
    } catch (err) {
      localError.value = locale.value === "vi"
        ? "Không tìm thấy hoặc không đọc được mã QR từ hình ảnh này."
        : "Could not read or find a QR code from the uploaded image."
      console.error("File QR scan failed:", err)
    }
  }

  return {
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
  }
}
