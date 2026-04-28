import { computed } from "vue"
import { resolveI18nMessage } from "#shared-kernel/application/utils/resolveI18nMessage"

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
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const availableBalance = 9999999
  const pendingAmount = 1250000
  const minimumWithdrawal = 100000

  const methods = computed(() => localized<WithdrawalMethod[]>("pages.withdrawalPage.methods"))

  const paymentProfiles = computed(() =>
    localized<Array<{ label: string; value: string }>>("pages.withdrawalPage.paymentProfiles"),
  )

  const history = computed(() =>
    localized<WithdrawalHistoryItem[]>("pages.withdrawalPage.history"),
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
