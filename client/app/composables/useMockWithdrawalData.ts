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
  const availableBalance = 9999999
  const pendingAmount = 1250000
  const minimumWithdrawal = 100000

  const methods: WithdrawalMethod[] = [
    {
      label: "Ngân hàng",
      value: "bank",
      icon: "i-ph-bank-fill",
      description: "Nhận tiền qua tài khoản ngân hàng nội địa.",
    },
    {
      label: "Ví MoMo",
      value: "momo",
      icon: "i-ph-device-mobile-fill",
      description: "Rút nhanh về ví điện tử đã xác minh.",
    },
    {
      label: "PayPal",
      value: "paypal",
      icon: "i-ph-paypal-logo-fill",
      description: "Dành cho creator nhận thanh toán quốc tế.",
    },
  ]

  const paymentProfiles = [
    {
      label: "Tài khoản chính",
      value: "Nguyen Van Justin · 0123 456 789",
    },
    {
      label: "Xác minh",
      value: "Đã xác minh danh tính và email.",
    },
    {
      label: "Thời gian xử lý",
      value: "1-3 ngày làm việc.",
    },
  ]

  const history: WithdrawalHistoryItem[] = [
    {
      id: "wd-pending-bank",
      amount: 1250000,
      method: "Ngân hàng",
      account: "VCB · **** 6789",
      time: "Đang chờ duyệt",
      status: "pending",
    },
    {
      id: "wd-approved-momo",
      amount: 800000,
      method: "Ví MoMo",
      account: "MoMo · **** 2211",
      time: "3 ngày trước",
      status: "approved",
    },
    {
      id: "wd-approved-bank",
      amount: 2200000,
      method: "Ngân hàng",
      account: "ACB · **** 1042",
      time: "Tuần trước",
      status: "approved",
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

export const formatWithdrawalCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
