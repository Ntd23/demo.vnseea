// English description: Domain repository contract for account settings persistence.

import type { SettingsUpdateInput, SettingsUpdateResult, SettingsUser } from "../types/settings.types"

export interface SettingsRepository {
  getCurrentUser(): Promise<SettingsUser>
  update(input: SettingsUpdateInput): Promise<SettingsUpdateResult>
}
