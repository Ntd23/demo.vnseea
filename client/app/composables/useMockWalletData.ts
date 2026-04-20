import { computed } from "vue"

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
  const { tm } = useI18n()

  const initialBalance = 9999999

  const topupMethods = computed(() =>
    tm("pages.walletPage.methods") as Array<{ label: string; value: WalletTopupPayload["method"]; icon: string }>,
  )

  const transactions = computed(() =>
    (tm("pages.walletPage.transactions") as Array<Omit<WalletTransaction, "amount"> & { amount: number | string }>).map(
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
