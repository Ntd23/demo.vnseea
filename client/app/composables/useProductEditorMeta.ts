import type {
  CategoryValue,
  ConditionValue,
  CurrencyValue,
  ProductCategoryMeta,
  ProductCurrencyMeta,
  ProductOption,
} from "../../types/product-editor"

const categoryOptions = [
  { label: "Nhà cửa", value: "home" },
  { label: "Thiết bị số", value: "tech" },
  { label: "Làm đẹp", value: "beauty" },
  { label: "Sách & Tài liệu", value: "books" },
  { label: "Ô tô & Xe cộ", value: "vehicles" },
  { label: "Đặc sản", value: "food" },
] satisfies ProductOption<CategoryValue>[]

const conditionOptions = [
  { label: "Mới", value: "new" },
  { label: "Như mới", value: "like-new" },
  { label: "Đã qua sử dụng", value: "used" },
] satisfies ProductOption<ConditionValue>[]

const currencyOptions = [
  { label: "USD ($)", value: "USD" },
  { label: "VND (₫)", value: "VND" },
  { label: "EUR (€)", value: "EUR" },
] satisfies ProductOption<CurrencyValue>[]

const categoryMeta: Record<CategoryValue, ProductCategoryMeta> = {
  home: {
    label: "Nhà cửa",
    icon: "i-ph-armchair-fill",
    background: "linear-gradient(135deg,#78350f 0%,#b45309 38%,#f59e0b 100%)",
  },
  tech: {
    label: "Thiết bị số",
    icon: "i-ph-device-mobile-camera-fill",
    background: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
  },
  beauty: {
    label: "Làm đẹp",
    icon: "i-ph-drop-fill",
    background: "linear-gradient(135deg,#0f766e 0%,#14b8a6 45%,#99f6e4 100%)",
  },
  books: {
    label: "Sách & Tài liệu",
    icon: "i-ph-book-open-text-fill",
    background: "linear-gradient(135deg,#14532d 0%,#16a34a 38%,#bbf7d0 100%)",
  },
  vehicles: {
    label: "Ô tô & Xe cộ",
    icon: "i-ph-car-profile-fill",
    background: "linear-gradient(135deg,#172554 0%,#1d4ed8 48%,#7dd3fc 100%)",
  },
  food: {
    label: "Đặc sản",
    icon: "i-ph-bowl-food-fill",
    background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 40%,#fdba74 100%)",
  },
}

const conditionMap: Record<ConditionValue, string> = {
  new: "Mới",
  "like-new": "Như mới",
  used: "Đã qua sử dụng",
}

const currencyMeta: Record<CurrencyValue, ProductCurrencyMeta> = {
  USD: { label: "USD ($)", locale: "en-US" },
  VND: { label: "VND (₫)", locale: "vi-VN" },
  EUR: { label: "EUR (€)", locale: "de-DE" },
}

const formatProductPrice = (price: string, currency: CurrencyValue) => {
  const parsed = Number(price)
  if (!Number.isFinite(parsed) || parsed <= 0) return "Chưa thiết lập"

  return new Intl.NumberFormat(currencyMeta[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(parsed)
}

const formatProductStockLabel = (stock: string) => {
  const parsed = Number(stock)
  if (!Number.isFinite(parsed) || parsed <= 0) return "Chưa có số lượng"
  return `${parsed} đơn vị`
}

export const useProductEditorMeta = () => ({
  categoryOptions,
  conditionOptions,
  currencyOptions,
  categoryMeta,
  conditionMap,
  currencyMeta,
  formatProductPrice,
  formatProductStockLabel,
})
