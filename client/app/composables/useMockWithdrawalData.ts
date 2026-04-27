import { useWithdrawal } from "../../src/withdrawal/application/composables/use-withdrawal"
export { formatWithdrawalCurrency } from "../../src/withdrawal/domain/types/withdrawal.types"

/**
 * Legacy delegate for useMockWithdrawalData.
 * Logic has been moved to src/withdrawal/application/composables/use-withdrawal.ts
 */
export const useMockWithdrawalData = () => {
  const { 
    availableBalance, 
    pendingAmount, 
    minimumWithdrawal, 
    methods, 
    paymentProfiles, 
    history 
  } = useWithdrawal()
  
  return {
    availableBalance: availableBalance.value,
    pendingAmount: pendingAmount.value,
    minimumWithdrawal,
    methods,
    paymentProfiles,
    history,
  }
}

export type { 
  WithdrawalHistoryItem, 
  WithdrawalRequestPayload, 
  WithdrawalMethod 
} from "../../src/withdrawal/domain/types/withdrawal.types"
