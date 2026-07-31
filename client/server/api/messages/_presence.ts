// English description: Stores short-lived message presence in Redis with a process-local fallback.

import type { H3Event } from "h3"
import {
  getRedisClient,
  isRedisConfigured,
} from "../../utils/redis-client"

type PresenceRecord = {
  online: boolean
  expiresAt: number
}

export type MessagePresenceStateMap = ReadonlyMap<number, boolean>

const PRESENCE_TTL_SECONDS = 75
const PRESENCE_TTL_MS = PRESENCE_TTL_SECONDS * 1_000
const PRESENCE_KEY_PREFIX = "presence:user:"
const ONLINE_PRESENCE_VALUE = JSON.stringify({
  status: "online",
  device: "web",
})
const presenceByUserId = new Map<number, PresenceRecord>()

const normalizeUserIds = (userIds: Iterable<number>) =>
  Array.from(new Set(
    Array.from(userIds)
      .map(userId => Number(userId))
      .filter(userId => Number.isInteger(userId) && userId > 0),
  ))

const buildPresenceKey = (userId: number) =>
  `${PRESENCE_KEY_PREFIX}${userId}`

const rememberLocalPresence = (userId: number, online: boolean) => {
  presenceByUserId.set(userId, {
    online,
    expiresAt: Date.now() + PRESENCE_TTL_MS,
  })
}

const readLocalPresenceStates = (userIds: number[]) => {
  const now = Date.now()
  const states = new Map<number, boolean>()

  for (const userId of userIds) {
    const record = presenceByUserId.get(userId)

    if (!record) {
      continue
    }

    if (record.expiresAt <= now) {
      presenceByUserId.delete(userId)
      continue
    }

    states.set(userId, record.online)
  }

  return states
}

const wasLocallyOnline = (userId: number) =>
  readLocalPresenceStates([userId]).get(userId) === true

export const markMessageUserOnline = async (
  event: H3Event,
  userId: number,
) => {
  if (userId <= 0) return false

  const localWasOnline = wasLocallyOnline(userId)
  rememberLocalPresence(userId, true)

  if (!isRedisConfigured(event)) {
    return !localWasOnline
  }

  try {
    const client = getRedisClient(event)
    const key = buildPresenceKey(userId)
    const created = await client.set(
      key,
      ONLINE_PRESENCE_VALUE,
      "EX",
      PRESENCE_TTL_SECONDS,
      "NX",
    )

    if (created === "OK") {
      return true
    }

    if (await client.expire(key, PRESENCE_TTL_SECONDS)) {
      return false
    }

    return await client.set(
      key,
      ONLINE_PRESENCE_VALUE,
      "EX",
      PRESENCE_TTL_SECONDS,
      "NX",
    ) === "OK"
  }
  catch {
    // The local TTL keeps presence usable while Redis is temporarily unavailable.
    return !localWasOnline
  }
}

export const markMessageUserOffline = async (
  event: H3Event,
  userId: number,
) => {
  if (userId <= 0) return false

  const localWasOnline = wasLocallyOnline(userId)
  rememberLocalPresence(userId, false)

  if (!isRedisConfigured(event)) {
    return localWasOnline
  }

  try {
    return await getRedisClient(event).del(buildPresenceKey(userId)) > 0
  }
  catch {
    // The local offline marker prevents a Redis outage from breaking logout.
    return localWasOnline
  }
}

export const getMessageUsersPresenceState = async (
  event: H3Event,
  userIds: Iterable<number>,
): Promise<MessagePresenceStateMap> => {
  const normalizedUserIds = normalizeUserIds(userIds)

  if (normalizedUserIds.length === 0) {
    return new Map()
  }

  if (isRedisConfigured(event)) {
    try {
      const values = await getRedisClient(event).mget(
        normalizedUserIds.map(buildPresenceKey),
      )
      const states = new Map<number, boolean>()

      values.forEach((value, index) => {
        if (value !== null) {
          states.set(normalizedUserIds[index]!, true)
        }
      })

      return states
    }
    catch {
      // Fall through to process-local state and then PHP/MySQL lastseen.
    }
  }

  return readLocalPresenceStates(normalizedUserIds)
}
