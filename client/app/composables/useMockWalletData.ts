import { useWallet } from "../../src/wallet/application/composables/use-wallet"
export { formatWalletCurrency } from "../../src/wallet/domain/types/wallet.types"

/**
 * Legacy delegate for useMockWalletData.
 * Logic has been moved to src/wallet/application/composables/use-wallet.ts
 */
export const useMockWalletData = () => {
  const { balance, topupMethods, transactions, handleTopup, handleSend } = useWallet()
  
  return {
    initialBalance: balance.value,
    topupMethods,
    transactions,
  }
}

export type { 
  WalletTransaction, 
  WalletTransactionType, 
  WalletTopupPayload, 
  WalletSendPayload 
} from "../../src/wallet/domain/types/wallet.types"
