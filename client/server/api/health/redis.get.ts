// English description: Reports sanitized Redis availability and latency for server health monitoring.

import { setResponseStatus } from "h3"
import { getRedisHealth } from "../../utils/redis-client"

export default defineEventHandler(async (event) => {
  const health = await getRedisHealth(event)

  if (!health.connected) {
    setResponseStatus(event, 503)
  }

  return {
    ok: health.connected,
    service: "redis",
    configured: health.configured,
    status: health.status,
    latencyMs: health.latencyMs,
    lastError:
      import.meta.dev && health.lastError ? health.lastError : undefined,
    lastErrorAt: health.lastErrorAt,
  }
})
