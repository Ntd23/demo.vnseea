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
  const initialBalance = 9999999

  const topupMethods = [
    { label: "Chuyển khoản", value: "bank" as const, icon: "i-ph-bank-fill" },
    { label: "Thẻ thanh toán", value: "card" as const, icon: "i-ph-credit-card-fill" },
    { label: "Ví MoMo", value: "momo" as const, icon: "i-ph-device-mobile-fill" },
  ]

  const transactions: WalletTransaction[] = [
    {
      id: "txn-refund-order",
      type: "refund",
      title: "Hoàn tiền đơn hàng",
      description: "Hoàn về ví VNSEEA từ đơn marketplace.",
      amount: 250000,
      time: "2 giờ trước",
      status: "completed",
    },
    {
      id: "txn-funding-donate",
      type: "payment",
      title: "Donate chiến dịch lớp học xanh",
      description: "Thanh toán qua wallet.php / funding.php.",
      amount: -300000,
      time: "Hôm qua",
      status: "completed",
    },
    {
      id: "txn-topup-bank",
      type: "topup",
      title: "Nạp tiền qua chuyển khoản",
      description: "Mã giao dịch: VNSEEA-2026-042",
      amount: 1000000,
      time: "3 ngày trước",
      status: "completed",
    },
    {
      id: "txn-send-member",
      type: "send",
      title: "Gửi tiền cho Hoangne",
      description: "Chia chi phí meetup.",
      amount: -150000,
      time: "5 ngày trước",
      status: "completed",
    },
  ]

  return {
    initialBalance,
    topupMethods,
    transactions,
  }
}

export const formatWalletCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
