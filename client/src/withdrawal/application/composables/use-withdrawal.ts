import { createWithdrawalSnapshot } from "../use-cases/create-withdrawal-snapshot"
import type { WithdrawalHistoryItem, WithdrawalRequestPayload } from "../../domain/types/withdrawal.types"

// Shared state for withdrawal
const availableBalanceState = ref(0)
const pendingAmountState = ref(0)
const localHistory = ref<WithdrawalHistoryItem[]>([])
const isInitialized = ref(false)

export const useWithdrawal = () => {
  const { t } = useI18n()
  const { 
    availableBalance, 
    pendingAmount, 
    minimumWithdrawal, 
    methods, 
    paymentProfiles, 
    history: snapshotHistory 
  } = createWithdrawalSnapshot()

  if (!isInitialized.value) {
    availableBalanceState.value = availableBalance
    pendingAmountState.value = pendingAmount
    isInitialized.value = true
  }

  const allHistory = computed(() => [...localHistory.value, ...snapshotHistory])

  const handleRequest = (payload: WithdrawalRequestPayload) => {
    if (payload.amount < minimumWithdrawal) {
      throw new Error(t("pages.withdrawalPage.errorMinAmount", { min: minimumWithdrawal }))
    }
    if (payload.amount > availableBalanceState.value) {
      throw new Error(t("pages.withdrawalPage.insufficientBalance"))
    }

    const method = methods.find(item => item.value === payload.method)

    availableBalanceState.value -= payload.amount
    pendingAmountState.value += payload.amount

    const newRequest: WithdrawalHistoryItem = {
      id: `wd-${Date.now()}`,
      amount: payload.amount,
      method: method?.label ? t(method.label) : t("pages.withdrawalPage.fallbackMethod"),
      account: payload.accountNumber,
      time: t("pages.withdrawalPage.submittedNow"),
      status: "pending",
    }

    localHistory.value = [newRequest, ...localHistory.value]
  }

  return {
    availableBalance: readonly(availableBalanceState),
    pendingAmount: readonly(pendingAmountState),
    minimumWithdrawal,
    methods: readonly(ref(methods)),
    paymentProfiles: readonly(ref(paymentProfiles)),
    history: allHistory,
    handleRequest,
  }
}
