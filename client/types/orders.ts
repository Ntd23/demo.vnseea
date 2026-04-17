export type BuyerOrderStatus = "pending" | "shipping" | "delivered" | "cancelled"

export type BuyerOrderFilter = "all" | BuyerOrderStatus

export type BuyerOrderPaymentStatus = "paid" | "refunded"

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  imageStyle?: string
}

export interface OrderTimelineEntry {
  key: string
  label: string
  time: string
  description: string
  done: boolean
}

export interface OrderPresentationShape {
  status: BuyerOrderStatus
  paymentStatus: BuyerOrderPaymentStatus
  shippingFee: number
  total: number
  items: OrderItem[]
}

export interface BuyerOrderItem extends OrderItem {}

export interface BuyerOrderTimelineEntry extends OrderTimelineEntry {}

export interface BuyerOrder extends OrderPresentationShape {
  id: string
  orderNumber: string
  seller: string
  placedAt: string
  deliveryWindow: string
  paymentMethod: string
  paymentReference: string
  shippingAddress: string
  recipientName: string
  recipientPhone: string
  shippingProvider: string
  trackingCode: string
  note?: string
  items: BuyerOrderItem[]
  timeline: BuyerOrderTimelineEntry[]
}

export type SellerOrderPayoutStatus = "queued" | "processing" | "released" | "reversed"

export interface SellerOrderTask {
  key: string
  label: string
  description: string
  done: boolean
}

export interface SellerOrder extends OrderPresentationShape {
  id: string
  orderNumber: string
  storeName: string
  buyerName: string
  buyerPhone: string
  buyerAddress: string
  placedAt: string
  deliveryWindow: string
  paymentMethod: string
  paymentReference: string
  shippingProvider: string
  trackingCode: string
  buyerNote?: string
  sellerNote?: string
  timeline: OrderTimelineEntry[]
  tasks: SellerOrderTask[]
  payoutStatus: SellerOrderPayoutStatus
  payoutAmount: number
  payoutReference: string
  payoutWindow: string
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

export const buyerOrderPaymentStatusMeta: Record<BuyerOrderPaymentStatus, {
  label: string
  badgeClass: string
}> = {
  paid: {
    label: "Đã thanh toán",
    badgeClass: "border-[#c7ebd0] bg-[#effaf3] text-[#1f7a38]",
  },
  refunded: {
    label: "Đã hoàn tiền",
    badgeClass: "border-[#fecdd3] bg-[#fff1f3] text-[#be123c]",
  },
}

export const sellerOrderPayoutStatusMeta: Record<SellerOrderPayoutStatus, {
  label: string
  badgeClass: string
  panelClass: string
  description: string
}> = {
  queued: {
    label: "Chờ đối soát",
    badgeClass: "border-[#fde7b2] bg-[#fff6dd] text-[#9a5b00]",
    panelClass: "bg-[#fff8ea] text-[#9a5b00]",
    description: "Khoản thanh toán đang chờ đơn được xử lý và đủ điều kiện đối soát.",
  },
  processing: {
    label: "Đang đối soát",
    badgeClass: "border-[#cfe0ff] bg-[#eef4ff] text-[#1d4ed8]",
    panelClass: "bg-[#eef4ff] text-[#1d4ed8]",
    description: "Hệ thống đang ghi nhận trạng thái giao nhận và chuẩn bị chuyển tiền.",
  },
  released: {
    label: "Đã ghi có",
    badgeClass: "border-[#c7ebd0] bg-[#effaf3] text-[#1f7a38]",
    panelClass: "bg-[#effaf3] text-[#1f7a38]",
    description: "Khoản thanh toán đã được ghi nhận thành công vào ví/ngân quỹ của shop.",
  },
  reversed: {
    label: "Hoàn tác đối soát",
    badgeClass: "border-[#fecdd3] bg-[#fff1f3] text-[#be123c]",
    panelClass: "bg-[#fff1f3] text-[#be123c]",
    description: "Đơn bị hủy hoặc hoàn tiền nên không tiếp tục đối soát cho người bán.",
  },
}

export function formatOrderCurrency(value: number) {
  return `VND${value.toLocaleString("en-US")}`
}
