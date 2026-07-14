// English description: Declares wallet repository operations used by wallet view-models.

import type {
  WalletMutationResult,
  WalletOverview,
  WalletRecipient,
  WalletTopupDraft,
} from "../types/wallet.types"

export interface WalletRepository {
  getOverview(): Promise<WalletOverview>
  searchRecipients(query: string): Promise<WalletRecipient[]>
  createTopup(input: WalletTopupDraft): Promise<WalletMutationResult>
  checkSepayTopup(orderCode: string): Promise<WalletMutationResult>
}
