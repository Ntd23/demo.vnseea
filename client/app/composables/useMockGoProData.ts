export type BillingCycle = "monthly" | "yearly"
export type ProPlanKey = "starter" | "creator" | "business"

export type ProPlan = {
  id: ProPlanKey
  name: string
  badge: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  highlight: boolean
  features: string[]
  limits: { label: string; value: string }[]
}

export type PaymentMethodKey = "wallet" | "card" | "bank"

export type ProCheckoutPayload = {
  planId: ProPlanKey
  billingCycle: BillingCycle
  paymentMethod: PaymentMethodKey
  amount: number
}

export const useMockGoProData = () => {
  const plans: ProPlan[] = [
    {
      id: "starter",
      name: "Starter Pro",
      badge: "Cá nhân",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      description: "Dành cho người dùng muốn mở khóa badge Pro và tăng độ nổi bật hồ sơ.",
      highlight: false,
      features: ["Pro badge", "Ẩn quảng cáo cơ bản", "Ưu tiên hỗ trợ trong cộng đồng", "5 bài viết ghim"],
      limits: [
        { label: "Boost bài viết", value: "3 / tháng" },
        { label: "Dung lượng media", value: "20GB" },
        { label: "Support", value: "48h" },
      ],
    },
    {
      id: "creator",
      name: "Creator Plus",
      badge: "Phổ biến",
      monthlyPrice: 199000,
      yearlyPrice: 1990000,
      description: "Gói tối ưu cho creator, blogger và người tổ chức sự kiện trong VNSEEA.",
      highlight: true,
      features: ["Tất cả Starter Pro", "Creator analytics", "Livestream ưu tiên", "10 chiến dịch boost", "Monetization tools"],
      limits: [
        { label: "Boost bài viết", value: "10 / tháng" },
        { label: "Dung lượng media", value: "80GB" },
        { label: "Support", value: "24h" },
      ],
    },
    {
      id: "business",
      name: "Business Pro",
      badge: "Đội nhóm",
      monthlyPrice: 499000,
      yearlyPrice: 4990000,
      description: "Dành cho shop, fanpage và team cần quản trị nhiều nội dung, job và quảng bá.",
      highlight: false,
      features: ["Tất cả Creator Plus", "Team roles", "Marketplace insights", "Job highlight", "Priority verification"],
      limits: [
        { label: "Boost bài viết", value: "30 / tháng" },
        { label: "Dung lượng media", value: "250GB" },
        { label: "Support", value: "4h" },
      ],
    },
  ]

  const comparisonRows = [
    { label: "Pro badge", starter: true, creator: true, business: true },
    { label: "Ẩn quảng cáo", starter: true, creator: true, business: true },
    { label: "Analytics nâng cao", starter: false, creator: true, business: true },
    { label: "Livestream ưu tiên", starter: false, creator: true, business: true },
    { label: "Team roles", starter: false, creator: false, business: true },
    { label: "Priority verification", starter: false, creator: false, business: true },
  ]

  const paymentMethods = [
    { label: "Ví VNSEEA", value: "wallet" as const, icon: "i-ph-wallet-fill" },
    { label: "Thẻ thanh toán", value: "card" as const, icon: "i-ph-credit-card-fill" },
    { label: "Chuyển khoản", value: "bank" as const, icon: "i-ph-bank-fill" },
  ]

  const currentSubscription = {
    plan: "Free",
    status: "Chưa nâng cấp",
    renewsAt: "Không có",
  }

  return {
    plans,
    comparisonRows,
    paymentMethods,
    currentSubscription,
  }
}

export const formatProCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
