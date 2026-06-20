export default defineNuxtPlugin((nuxtApp) => {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args: unknown[]) => {
    const message = args.map(String).join(" ")

    if (message.includes("Hydration") || message.includes("mismatch")) {
      originalWarn("[HYDRATION WARN]", ...args)

      const instance = nuxtApp.vueApp.config.globalProperties
      originalWarn("[HYDRATION DEBUG] route:", window.location.href)
      originalWarn("[HYDRATION DEBUG] document title:", document.title)

      console.trace("[HYDRATION TRACE]")
    }

    originalWarn(...args)
  }

  console.error = (...args: unknown[]) => {
    const message = args.map(String).join(" ")

    if (message.includes("Hydration") || message.includes("mismatch")) {
      originalError("[HYDRATION ERROR]", ...args)
      originalError("[HYDRATION DEBUG] route:", window.location.href)
      console.trace("[HYDRATION TRACE]")
    }

    originalError(...args)
  }
})
