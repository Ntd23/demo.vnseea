import { computed } from "vue"

export type WithdrawalMethodKey = "bank" | "momo" | "paypal"

export type WithdrawalMethod = {
  label: string
  value: WithdrawalMethodKey
  icon: string
  description: string
}

export type WithdrawalRequestPayload = {
  amount: number
  method: WithdrawalMethodKey
  accountName: string
  accountNumber: string
  note: string
}

export type WithdrawalHistoryItem = {
  id: string
  amount: number
  method: string
  account: string
  time: string
  status: "pending" | "approved" | "rejected"
}

export const useMockWithdrawalData = () => {
  const { tm } = useI18n()

  const availableBalance = 9999999
  const pendingAmount = 1250000
  const minimumWithdrawal = 100000

  const methods = computed(() => tm("pages.withdrawalPage.methods") as WithdrawalMethod[])

  const paymentProfiles = computed(() =>
    tm("pages.withdrawalPage.paymentProfiles") as Array<{ label: string; value: string }>,
  )

  const history = computed(() =>
    tm("pages.withdrawalPage.history") as WithdrawalHistoryItem[],
  )

  return {
    availableBalance,
    pendingAmount,
    minimumWithdrawal,
    methods,
    paymentProfiles,
    history,
  }
}

export const formatWithdrawalCurrency = (value: number, locale = "vi") => {
  const normalizedLocale = locale === "vi" ? "vi-VN" : "en-US"

  return new Intl.NumberFormat(normalizedLocale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}
