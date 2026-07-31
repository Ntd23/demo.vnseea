// English description: Normalizes message presence subscriptions and Socket.IO presence events for message surfaces.

import type { Socket } from "socket.io-client"
import type { MessageContact } from "../../domain/types/messages.types"

export type MessagePresenceEvent = {
  eventId?: string
  userId: number
  online: boolean
  occurredAt?: number
}

const MAX_PRESENCE_SUBSCRIPTIONS = 200

export function getMessagePresenceUserIds(contacts: Iterable<MessageContact>) {
  return Array.from(new Set(
    Array.from(contacts)
      .filter(contact => contact.type === "user")
      .map(contact => Number(contact.userId ?? 0))
      .filter(userId => Number.isInteger(userId) && userId > 0),
  )).slice(0, MAX_PRESENCE_SUBSCRIPTIONS)
}

export function watchMessagePresenceUsers(
  socket: Socket | null,
  userIds: Iterable<number>,
) {
  if (!socket?.connected) {
    return
  }

  socket.emit("message:presence:watch", {
    userIds: Array.from(new Set(
      Array.from(userIds)
        .map(userId => Number(userId))
        .filter(userId => Number.isInteger(userId) && userId > 0),
    )).slice(0, MAX_PRESENCE_SUBSCRIPTIONS),
  })
}

export function normalizeMessagePresenceEvent(payload: unknown): MessagePresenceEvent | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const candidate = payload as Partial<MessagePresenceEvent>
  const userId = Number(candidate.userId ?? 0)

  if (!Number.isInteger(userId) || userId <= 0 || typeof candidate.online !== "boolean") {
    return null
  }

  return {
    eventId: typeof candidate.eventId === "string" ? candidate.eventId : undefined,
    userId,
    online: candidate.online,
    occurredAt: Number.isFinite(Number(candidate.occurredAt))
      ? Number(candidate.occurredAt)
      : undefined,
  }
}
