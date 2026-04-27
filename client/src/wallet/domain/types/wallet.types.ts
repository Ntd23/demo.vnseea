export type WalletTransactionType = "topup" | "send" | "receive" | "payment" | "refund"

export interface WalletTransaction {
  id: string
  type: WalletTransactionType
  title: string
  description: string
  amount: number
  time: string
  status: "completed" | "pending" | "failed"
}

export interface WalletTopupPayload {
  amount: number
  method: "bank" | "card" | "momo"
}

export interface WalletSendPayload {
  recipient: string
  amount: number
  note: string
}

export interface TopupMethod {
  label: string
  value: WalletTopupPayload["method"]
  icon: string
}

export interface WalletStats {
  label: string
  value: number | string
}

export const transactionTypeMeta: Record<WalletTransactionType, { icon: string; tone: "amber" | "blue" | "green" | "rose" | "indigo" }> = {
  topup: { icon: "i-ph-arrow-down-left-duotone", tone: "green" },
  send: { icon: "i-ph-arrow-up-right-duotone", tone: "indigo" },
  receive: { icon: "i-ph-wallet-duotone", tone: "green" },
  payment: { icon: "i-ph-shopping-bag-duotone", tone: "blue" },
  refund: { icon: "i-ph-arrow-counter-clockwise-duotone", tone: "amber" },
}

export const formatWalletCurrency = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
