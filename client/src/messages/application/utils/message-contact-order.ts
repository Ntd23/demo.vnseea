// English description: Provides the shared user inbox ordering used by the messages page and chat widget.

import type { MessageContact } from "../../domain/types/messages.types"

export function sortUserInboxContacts(contacts: MessageContact[]) {
  return [...contacts].sort((left, right) => {
    const activityDifference = (right.lastActivityAt ?? 0) - (left.lastActivityAt ?? 0)

    if (activityDifference !== 0) {
      return activityDifference
    }

    return right.unreadCount - left.unreadCount
  })
}
