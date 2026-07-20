// English description: Starts optional local PHP-CGI upstream watchdog before launching Nuxt dev.

import { existsSync } from "node:fs"
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

const phpCgiBin = String(process.env.PHP_CGI_BIN || "").trim()
const shouldStartPhpWatchdog = phpCgiBin && existsSync(phpCgiBin)

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
else if (phpCgiBin) {
  console.warn(`[vnseea-dev] PHP_CGI_BIN does not exist: ${phpCgiBin}`)
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
