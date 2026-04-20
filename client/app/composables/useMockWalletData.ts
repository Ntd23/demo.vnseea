import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type WalletTransactionType = "topup" | "send" | "receive" | "payment" | "refund"

export type WalletTransaction = {
  id: string
  type: WalletTransactionType
  title: string
  description: string
  amount: number
  time: string
  status: "completed" | "pending" | "failed"
}

export type WalletTopupPayload = {
  amount: number
  method: "bank" | "card" | "momo"
}

export type WalletSendPayload = {
  recipient: string
  amount: number
  note: string
}

export const useMockWalletData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const initialBalance = 9999999

  const topupMethods = computed(() =>
    localized<Array<{ label: string; value: WalletTopupPayload["method"]; icon: string }>>("pages.walletPage.methods"),
  )

  const transactions = computed(() =>
    localized<Array<Omit<WalletTransaction, "amount"> & { amount: number | string }>>("pages.walletPage.transactions").map(
      transaction => ({
        ...transaction,
        amount: Number(transaction.amount),
      }),
    ),
  )

  return {
    initialBalance,
    topupMethods,
    transactions,
  }
}

export const formatWalletCurrency = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
