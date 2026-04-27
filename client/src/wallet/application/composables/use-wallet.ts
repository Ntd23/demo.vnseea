import { createWalletSnapshot } from "../use-cases/create-wallet-snapshot"
import type { WalletSendPayload, WalletTopupPayload, WalletTransaction } from "../../domain/types/wallet.types"

// Shared state for the wallet
const balance = ref(0)
const localTransactions = ref<WalletTransaction[]>([])
const isInitialized = ref(false)

export const useWallet = () => {
  const { t } = useI18n()
  const { initialBalance, topupMethods, transactions: snapshotTransactions } = createWalletSnapshot()

  if (!isInitialized.value) {
    balance.value = initialBalance
    isInitialized.value = true
  }

  const allTransactions = computed(() => [...localTransactions.value, ...snapshotTransactions])

  const walletStats = computed(() => [
    {
      label: t("pages.walletPage.statTransactions"),
      value: allTransactions.value.length,
    },
    {
      label: t("pages.walletPage.statTopups"),
      value: localTransactions.value.filter(item => item.type === "topup").length,
    },
  ])

  const handleTopup = (payload: WalletTopupPayload) => {
    // Find method label (or fallback to value)
    const methodLabel = topupMethods.find(item => item.value === payload.method)?.label 
      ? t(topupMethods.find(item => item.value === payload.method)!.label)
      : payload.method

    balance.value += payload.amount
    
    const newTransaction: WalletTransaction = {
      id: `topup-${Date.now()}`,
      type: "topup",
      title: t("pages.walletPage.topupTransactionTitle"),
      description: t("pages.walletPage.topupTransactionDescription", { method: methodLabel }),
      amount: payload.amount,
      time: t("pages.walletPage.justNow"),
      status: "completed",
    }
    
    localTransactions.value = [newTransaction, ...localTransactions.value]
  }

  const handleSend = (payload: WalletSendPayload) => {
    if (balance.value < payload.amount) {
      throw new Error(t("pages.walletPage.insufficientBalance"))
    }

    balance.value -= payload.amount
    
    const newTransaction: WalletTransaction = {
      id: `send-${Date.now()}`,
      type: "send",
      title: t("pages.walletPage.sendTransactionTitle", { recipient: payload.recipient }),
      description: payload.note || t("pages.walletPage.sendTransactionDescription"),
      amount: -payload.amount,
      time: t("pages.walletPage.justNow"),
      status: "completed",
    }
    
    localTransactions.value = [newTransaction, ...localTransactions.value]
  }

  return {
    balance: readonly(balance),
    topupMethods: readonly(ref(topupMethods)),
    transactions: allTransactions,
    walletStats,
    handleTopup,
    handleSend,
  }
}
