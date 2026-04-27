export type WithdrawalStatus = "completed" | "pending" | "failed"

export interface WithdrawalHistoryItem {
  id: string
  amount: number
  method: string
  account: string
  time: string
  status: WithdrawalStatus
}

export interface WithdrawalMethod {
  label: string
  value: string
  icon: string
}

export interface PaymentProfile {
  label: string
  value: string
  icon: string
  color: string
}

export interface WithdrawalRequestPayload {
  amount: number
  method: string
  accountNumber: string
}

export const formatWithdrawalCurrency = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
