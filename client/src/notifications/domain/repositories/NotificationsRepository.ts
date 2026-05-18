// English description: Repository contract for notification center data and actions.

import type { NotificationSoundToggleResponse, NotificationSummary, RealtimeTokenResponse } from "../types/notification.types"

export interface NotificationsRepository {
  getSummary(query?: { offset?: string | number }): Promise<NotificationSummary>
  markRead(): Promise<NotificationSummary>
  deleteNotification(id: string | number): Promise<void>
  toggleSound(): Promise<NotificationSoundToggleResponse>
  getRealtimeToken(): Promise<RealtimeTokenResponse>
}
