// English description: Starts the local PHP-CGI upstream watchdog when needed before launching Nuxt dev.

import { dirname, join, resolve } from "node:path"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const clientRoot = resolve(scriptDir, "..")

process.loadEnvFile?.(join(clientRoot, ".env"))

const currentNodeOptions = String(process.env.NODE_OPTIONS || "").trim()
const hasHeapLimit = /(?:^|\s)--max-old-space-size(?:=|\s)/.test(currentNodeOptions)

if (!hasHeapLimit) {
  process.env.NODE_OPTIONS = [currentNodeOptions, "--max-old-space-size=8192"]
    .filter(Boolean)
    .join(" ")
}

const children = new Set()

const devHost = String(process.env.NUXT_DEV_HOST || "127.0.0.1").trim()
const configuredDevPort = Number(process.env.NUXT_DEV_PORT || 3000)
const devPort = Number.isInteger(configuredDevPort) && configuredDevPort > 0
  ? configuredDevPort
  : 3000

const assertDevPortAvailable = () => new Promise((resolvePromise, rejectPromise) => {
  const probe = createServer()

  probe.unref()
  probe.once("error", (error) => {
    const portError = new Error(
      `[vnseea-dev] Nuxt port ${devHost}:${devPort} is already in use. Stop the existing dev server before running pnpm dev again.`,
      { cause: error },
    )

    rejectPromise(portError)
  })
  probe.listen({ host: devHost, port: devPort, exclusive: true }, () => {
    probe.close(resolvePromise)
  })
})

const spawnChild = (command, args, options = {}) => {
  const child = spawn(command, args, {
    cwd: clientRoot,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  })

  children.add(child)
  child.once("exit", () => children.delete(child))

  return child
}

const stopChildren = () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM")
    }
  }
}

process.once("SIGINT", () => {
  stopChildren()
  process.exit(130)
})

process.once("SIGTERM", () => {
  stopChildren()
  process.exit(143)
})

const backendApiBase = String(process.env.NUXT_BACKEND_API_BASE || "").trim()
const watchdogMode = String(process.env.PHP_UPSTREAM_WATCHDOG || "auto").trim().toLowerCase()

const isLocalBackend = () => {
  try {
    const hostname = new URL(backendApiBase).hostname.toLowerCase()
    return hostname === "localhost"
      || hostname === "127.0.0.1"
      || hostname.endsWith(".test")
  }
  catch {
    return false
  }
}

const shouldStartPhpWatchdog = process.platform === "win32"
  && watchdogMode !== "0"
  && watchdogMode !== "off"
  && watchdogMode !== "false"
  && (watchdogMode === "1" || watchdogMode === "on" || watchdogMode === "true" || isLocalBackend())

const realtimeMode = String(process.env.REALTIME_DEV_SERVER || "auto").trim().toLowerCase()
const realtimeHost = String(process.env.REALTIME_HOST || "127.0.0.1").trim()
const configuredRealtimePort = Number(process.env.REALTIME_PORT || 3025)
const realtimePort = Number.isInteger(configuredRealtimePort) && configuredRealtimePort > 0
  ? configuredRealtimePort
  : 3025
const realtimeDisabled = ["0", "off", "false"].includes(realtimeMode)

const isTcpPortAvailable = (host, port) => new Promise((resolvePromise) => {
  const probe = createServer()

  probe.unref()
  probe.once("error", () => resolvePromise(false))
  probe.listen({ host, port, exclusive: true }, () => {
    probe.close(() => resolvePromise(true))
  })
})

try {
  await assertDevPortAvailable()
}
catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

if (shouldStartPhpWatchdog) {
  spawnChild("node", [join("realtime", "php-upstream-watchdog.mjs")])
}

if (!realtimeDisabled && process.env.REALTIME_SECRET) {
  const realtimePortAvailable = await isTcpPortAvailable(realtimeHost, realtimePort)

  if (realtimePortAvailable) {
    spawnChild("node", [join("realtime", "notification-server.mjs")])
  }
  else {
    console.log(`[vnseea-dev] Realtime port ${realtimeHost}:${realtimePort} is already in use; keeping the existing process.`)
  }
}

const nuxt = spawnChild("nuxt", ["dev", "--host", devHost, "--port", String(devPort)])

nuxt.once("exit", (code, signal) => {
  stopChildren()

  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
