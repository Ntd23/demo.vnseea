// English description: Adds non-recursive hydration diagnostics in development and restores console hooks during HMR.

declare global {
  interface Window {
    __vnseeaHydrationDebugCleanup?: () => void
  }
}

export default defineNuxtPlugin(() => {
  if (!import.meta.dev) {
    return
  }

  window.__vnseeaHydrationDebugCleanup?.()

  const originalWarn = console.warn
  const originalError = console.error

  const debugWarn = (...args: unknown[]) => {
    const message = args.map(String).join(" ")

    if (message.includes("Hydration") || message.includes("mismatch")) {
      originalWarn("[HYDRATION WARN]", ...args)
      originalWarn("[HYDRATION DEBUG] route:", window.location.href)
      originalWarn("[HYDRATION DEBUG] document title:", document.title)

      console.trace("[HYDRATION TRACE]")
    }

    originalWarn(...args)
  }

  const debugError = (...args: unknown[]) => {
    const message = args.map(String).join(" ")

    if (message.includes("Hydration") || message.includes("mismatch")) {
      originalError("[HYDRATION ERROR]", ...args)
      originalError("[HYDRATION DEBUG] route:", window.location.href)
      console.trace("[HYDRATION TRACE]")
    }

    originalError(...args)
  }

  const cleanup = () => {
    if (console.warn === debugWarn) {
      console.warn = originalWarn
    }
    if (console.error === debugError) {
      console.error = originalError
    }
    if (window.__vnseeaHydrationDebugCleanup === cleanup) {
      delete window.__vnseeaHydrationDebugCleanup
    }
  }

  console.warn = debugWarn
  console.error = debugError
  window.__vnseeaHydrationDebugCleanup = cleanup
  import.meta.hot?.dispose(cleanup)
})
