// English description: Domain repository contract for account settings persistence.

import type {
  SettingSession,
  SettingsAffiliatesOverview,
  SettingsBlockedUser,
  SettingsMonetizationOverview,
  SettingsPointsExchangeInput,
  SettingsPointsExchangeResult,
  SettingsPointsReceiveQr,
  SettingsPointsTransferInput,
  SettingsPointsTransferResult,
  SettingsUpdateInput,
  SettingsUpdateResult,
  SettingsVerificationResult,
  SettingsVerificationState,
  SettingsUser,
} from "../types/settings.types"

export interface SettingsRepository {
  getCurrentUser(): Promise<SettingsUser>
  getVerificationState(): Promise<SettingsVerificationState>
  submitVerification(input: FormData): Promise<SettingsVerificationResult>
  update(input: SettingsUpdateInput): Promise<SettingsUpdateResult>
  getSessions(): Promise<SettingSession[]>
  deleteSession(id: number | "all"): Promise<boolean>
  getBlockedUsers(): Promise<SettingsBlockedUser[]>
  unblockUser(userId: number): Promise<boolean>
  requestMyInfo(options: Record<string, boolean>): Promise<boolean>
  exchangePoints(input: SettingsPointsExchangeInput): Promise<SettingsPointsExchangeResult>
  transferPoints(input: SettingsPointsTransferInput): Promise<SettingsPointsTransferResult>
  getPointsReceiveQr(points?: number | null): Promise<SettingsPointsReceiveQr>
  getMonetization(): Promise<SettingsMonetizationOverview>
  getAffiliates(): Promise<SettingsAffiliatesOverview>
}
