// English description: Provides the shared server-only Redis connection, diagnostics, and graceful shutdown helpers.

import Redis from "ioredis"
import type { H3Event } from "h3"

type RedisRuntimeConfig = {
  url?: string
  prefix?: string
  connectTimeoutMs?: number
  commandTimeoutMs?: number
}

type RedisConnectionState = {
  client: Redis | null
  signature: string
  lastError: string
  lastErrorAt: number
}

type RedisHealth = {
  configured: boolean
  connected: boolean
  status: string
  latencyMs: number | null
  lastError: string
  lastErrorAt: number | null
}

const globalWithRedis = globalThis as typeof globalThis & {
  __vnseeaRedisConnection?: RedisConnectionState
}

const connectionState =
  globalWithRedis.__vnseeaRedisConnection ??
  {
    client: null,
    signature: "",
    lastError: "",
    lastErrorAt: 0,
  }

globalWithRedis.__vnseeaRedisConnection = connectionState

const asPositiveInteger = (value: unknown, fallback: number) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) && normalized > 0
    ? Math.trunc(normalized)
    : fallback
}

const getRedisConfig = (event?: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const redis = (runtimeConfig.redis || {}) as RedisRuntimeConfig

  return {
    url: String(redis.url || "").trim(),
    prefix: String(redis.prefix || "").trim(),
    connectTimeoutMs: asPositiveInteger(redis.connectTimeoutMs, 300),
    commandTimeoutMs: asPositiveInteger(redis.commandTimeoutMs, 500),
  }
}

const rememberRedisError = (error: unknown) => {
  connectionState.lastError =
    error instanceof Error ? error.message : "Unknown Redis error"
  connectionState.lastErrorAt = Date.now()
}

const createRedisClient = (config: ReturnType<typeof getRedisConfig>) => {
  const client = new Redis(config.url, {
    connectTimeout: config.connectTimeoutMs,
    commandTimeout: config.commandTimeoutMs,
    keyPrefix: config.prefix || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (attempt) => Math.min(attempt * 100, 2_000),
  })

  client.on("error", rememberRedisError)
  client.on("ready", () => {
    connectionState.lastError = ""
    connectionState.lastErrorAt = 0
  })

  return client
}

export const isRedisConfigured = (event?: H3Event) =>
  getRedisConfig(event).url.length > 0

export const getRedisClient = (event?: H3Event) => {
  const config = getRedisConfig(event)

  if (!config.url) {
    throw new Error("Redis is not configured")
  }

  const signature = JSON.stringify(config)

  if (connectionState.client && connectionState.signature !== signature) {
    connectionState.client.disconnect()
    connectionState.client = null
  }

  if (!connectionState.client) {
    connectionState.client = createRedisClient(config)
    connectionState.signature = signature
  }

  return connectionState.client
}

export const getRedisHealth = async (
  event?: H3Event,
): Promise<RedisHealth> => {
  if (!isRedisConfigured(event)) {
    return {
      configured: false,
      connected: false,
      status: "disabled",
      latencyMs: null,
      lastError: "",
      lastErrorAt: null,
    }
  }

  const client = getRedisClient(event)
  const startedAt = performance.now()

  try {
    if (client.status === "wait" || client.status === "end") {
      await client.connect()
    }

    await client.ping()

    return {
      configured: true,
      connected: true,
      status: client.status,
      latencyMs: Math.round((performance.now() - startedAt) * 100) / 100,
      lastError: connectionState.lastError,
      lastErrorAt: connectionState.lastErrorAt || null,
    }
  } catch (error) {
    rememberRedisError(error)

    return {
      configured: true,
      connected: false,
      status: client.status,
      latencyMs: Math.round((performance.now() - startedAt) * 100) / 100,
      lastError: connectionState.lastError,
      lastErrorAt: connectionState.lastErrorAt || null,
    }
  }
}

export const closeRedisClient = async () => {
  const client = connectionState.client

  connectionState.client = null
  connectionState.signature = ""

  if (!client) return

  if (client.status === "ready") {
    await client.quit().catch(() => client.disconnect())
    return
  }

  client.disconnect()
}
