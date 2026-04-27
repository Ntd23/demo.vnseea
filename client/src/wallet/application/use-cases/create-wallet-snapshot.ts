import type { TopupMethod, WalletTransaction } from "../domain/types/wallet.types"

export const createWalletSnapshot = () => {
  const { tm, rt, t } = useI18n()
  
  // Helper to resolve localized data from i18n
  const localized = <T>(key: string): T => {
    const raw = tm(key)
    if (typeof raw === "string") return rt(raw) as T
    if (Array.isArray(raw)) return raw.map(item => (typeof item === "string" ? rt(item) : item)) as T
    return raw as T
  }

  const initialBalance = 9999999

  const topupMethods: TopupMethod[] = [
    { label: "pages.walletPage.methods.bank", value: "bank", icon: "i-ph-bank-duotone" },
    { label: "pages.walletPage.methods.card", value: "card", icon: "i-ph-credit-card-duotone" },
    { label: "pages.walletPage.methods.momo", value: "momo", icon: "i-ph-qr-code-duotone" },
  ]

  const transactions: WalletTransaction[] = [
    {
      id: "tr-001",
      type: "payment",
      title: "pages.walletPage.transactions.0.title",
      description: "pages.walletPage.transactions.0.description",
      amount: -1250000,
      time: "2 giờ trước",
      status: "completed",
    },
    {
      id: "tr-002",
      type: "topup",
      title: "pages.walletPage.transactions.1.title",
      description: "pages.walletPage.transactions.1.description",
      amount: 5000000,
      time: "Hôm qua",
      status: "completed",
    },
    {
      id: "tr-003",
      type: "refund",
      title: "pages.walletPage.transactions.2.title",
      description: "pages.walletPage.transactions.2.description",
      amount: 890000,
      time: "3 ngày trước",
      status: "completed",
    },
    {
      id: "tr-004",
      type: "send",
      title: "pages.walletPage.transactions.3.title",
      description: "pages.walletPage.transactions.3.description",
      amount: -200000,
      time: "1 tuần trước",
      status: "failed",
    },
  ]

  return {
    initialBalance,
    topupMethods,
    transactions,
  }
}
