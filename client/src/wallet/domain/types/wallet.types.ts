// English description: Defines wallet domain records and mutation payloads for the backend-backed wallet context.

export type WalletCurrencyRule = {
  decimals?: number
  decimal_sep?: string
  thousand_sep?: string
}

export type WalletTopupMethod = {
  value: string
  label: string
  type: "redirect" | "upload"
  note?: string
}

export type WalletTransactionTone = "success" | "warning" | "info" | "danger" | "neutral"

export type WalletTransaction = {
  id: number
  kind: string
  notes: string
  amount: number
  transactionDate: string
  statusTone: WalletTransactionTone
}

export type WalletRecipient = {
  id: number
  name: string
  username: string
  avatarUrl: string
}

export type WalletCurrentUser = {
  id: number
  name: string
  username: string
  avatarUrl: string
}

export type WalletOverview = {
  balance: number
  withdrawableBalance: number
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
  transactions: WalletTransaction[]
  topupMethods: WalletTopupMethod[]
  canWithdraw: boolean
  withdrawalUrl: string
  currentUser: WalletCurrentUser
}

export type WalletSendDraft = {
  recipientUserId: number
  amount: number
}

export type WalletTopupDraft = {
  amount: number
  method: string
  receiptFile?: File | null
}

export type WalletMutationResult = {
  success: boolean
  message: string
  balance?: number
  redirectUrl?: string
}

export type WalletReceiveQr = {
  imageUrl: string
  amount: number | null
}
