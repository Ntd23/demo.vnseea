export type BuyerOrderStatus = "pending" | "shipping" | "delivered" | "cancelled"

export type BuyerOrderFilter = "all" | BuyerOrderStatus

export interface BuyerOrderItem {
  id: string
  name: string
  quantity: number
  price: number
  imageStyle?: string
}

export interface BuyerOrder {
  id: string
  orderNumber: string
  seller: string
  placedAt: string
  status: BuyerOrderStatus
  deliveryWindow: string
  paymentMethod: string
  shippingAddress: string
  shippingFee: number
  total: number
  items: BuyerOrderItem[]
}

export interface OrdersFilterOption {
  key: BuyerOrderFilter
  label: string
  count: number
}

export interface OrdersOverviewCard {
  label: string
  value: string
  description: string
  icon: string
  tone: "amber" | "blue" | "green" | "rose"
}

export const buyerOrderFilterLabels: Record<BuyerOrderFilter, string> = {
  all: "Tất cả đơn",
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã hủy",
}

export const buyerOrderStatusMeta: Record<BuyerOrderStatus, {
  label: string
  badgeClass: string
  panelClass: string
  icon: string
  progress: number
  description: string
}> = {
  pending: {
    label: "Chờ xác nhận",
    badgeClass: "border-[#fde7b2] bg-[#fff6dd] text-[#9a5b00]",
    panelClass: "bg-[#fff8ea] text-[#9a5b00]",
    icon: "i-ph-hourglass-medium-fill",
    progress: 1,
    description: "Shop đang chuẩn bị xác nhận đơn hàng của bạn.",
  },
  shipping: {
    label: "Đang giao",
    badgeClass: "border-[#cfe0ff] bg-[#eef4ff] text-[#1d4ed8]",
    panelClass: "bg-[#eef4ff] text-[#1d4ed8]",
    icon: "i-ph-truck-fill",
    progress: 2,
    description: "Đơn hàng đã rời kho và đang trên đường giao.",
  },
  delivered: {
    label: "Hoàn tất",
    badgeClass: "border-[#c7ebd0] bg-[#effaf3] text-[#1f7a38]",
    panelClass: "bg-[#effaf3] text-[#1f7a38]",
    icon: "i-ph-check-circle-fill",
    progress: 3,
    description: "Đơn hàng đã giao thành công và hoàn tất thanh toán.",
  },
  cancelled: {
    label: "Đã hủy",
    badgeClass: "border-[#fecdd3] bg-[#fff1f3] text-[#be123c]",
    panelClass: "bg-[#fff1f3] text-[#be123c]",
    icon: "i-ph-x-circle-fill",
    progress: 0,
    description: "Đơn hàng đã bị hủy và không tiếp tục xử lý.",
  },
}

export function formatOrderCurrency(value: number) {
  return `VND${value.toLocaleString("en-US")}`
}
