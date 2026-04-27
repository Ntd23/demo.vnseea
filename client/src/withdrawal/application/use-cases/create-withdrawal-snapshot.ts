import type { WithdrawalHistoryItem, WithdrawalMethod, PaymentProfile } from "../domain/types/withdrawal.types"

export const createWithdrawalSnapshot = () => {
  const { t } = useI18n()

  const availableBalance = 4500000
  const pendingAmount = 850000
  const minimumWithdrawal = 100000

  const methods: WithdrawalMethod[] = [
    { label: "pages.withdrawalPage.methods.bank", value: "bank", icon: "i-ph-bank-duotone" },
    { label: "pages.withdrawalPage.methods.paypal", value: "paypal", icon: "i-ph-paypal-logo-duotone" },
    { label: "pages.withdrawalPage.methods.crypto", value: "crypto", icon: "i-ph-currency-btc-duotone" },
  ]

  const paymentProfiles: PaymentProfile[] = [
    { label: "Vietcombank", value: "**** 8890", icon: "i-ph-bank-duotone", color: "text-green-600" },
    { label: "PayPal", value: "dangm***@gmail.com", icon: "i-ph-paypal-logo-duotone", color: "text-blue-600" },
  ]

  const history: WithdrawalHistoryItem[] = [
    {
      id: "wd-001",
      amount: 500000,
      method: "Vietcombank",
      account: "**** 8890",
      time: "2 ngày trước",
      status: "completed",
    },
    {
      id: "wd-002",
      amount: 1200000,
      method: "PayPal",
      account: "dangm***@gmail.com",
      time: "1 tuần trước",
      status: "completed",
    },
    {
      id: "wd-003",
      amount: 350000,
      method: "Vietcombank",
      account: "**** 8890",
      time: "2 tuần trước",
      status: "failed",
    },
  ]

  return {
    availableBalance,
    pendingAmount,
    minimumWithdrawal,
    methods,
    paymentProfiles,
    history,
  }
}
