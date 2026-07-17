// English description: Keeps chat presence alive for the whole browser app session, not only the messages route.

import { isProtectedPath } from "../../src/auth/application/constants/route-policy"

type PresenceAction = "online" | "offline"

declare global {
  interface Window {
    __vnseeaMessagesPresenceCleanup?: () => void
  }
}

const API_PATH = "/_api/messages/presence"
const HEARTBEAT_INTERVAL_MS = 25_000
const TAB_TTL_MS = 45_000
const TAB_ID_KEY = "messages:presence-tab-id"
const TABS_KEY = "messages:presence-tabs"

const hasBackendSession = () =>
  document.cookie
    .split(";")
    .some(cookie => cookie.trim().startsWith("user_id="))

const createTabId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}:${Math.random().toString(36).slice(2)}`

const readPresenceTabs = () => {
  try {
    return JSON.parse(localStorage.getItem(TABS_KEY) || "{}") as Record<string, number>
  }
  catch {
    return {}
  }
}

const writePresenceTabs = (tabs: Record<string, number>) => {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
  }
  catch {
    // Presence still falls back to server TTL if tab coordination storage is unavailable.
  }
}

const postPresence = async (action: PresenceAction) => {
  if (!hasBackendSession()) {
    return
  }

  await $fetch(API_PATH, {
    method: "POST",
    body: { action },
  })
}

const beaconPresence = (action: PresenceAction) => {
  if (!hasBackendSession()) {
    return
  }

  const body = JSON.stringify({ action })
  const blob = new Blob([body], { type: "application/json" })

  if (navigator.sendBeacon?.(API_PATH, blob)) {
    return
  }

  void fetch(API_PATH, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined)
}

export default defineNuxtPlugin(() => {
  window.__vnseeaMessagesPresenceCleanup?.()

  const route = useRoute()

  if (!isProtectedPath(route.path) || !hasBackendSession()) {
    return
  }

  const tabId = (() => {
    try {
      const existingTabId = sessionStorage.getItem(TAB_ID_KEY)
      const nextTabId = existingTabId || createTabId()
      sessionStorage.setItem(TAB_ID_KEY, nextTabId)
      return nextTabId
    }
    catch {
      return createTabId()
    }
  })()
  let isClosing = false
  let heartbeat: number | null = null

  const touchCurrentTab = () => {
    const now = Date.now()
    const tabs = readPresenceTabs()

    for (const [id, expiresAt] of Object.entries(tabs)) {
      if (expiresAt <= now) {
        delete tabs[id]
      }
    }

    tabs[tabId] = now + TAB_TTL_MS
    writePresenceTabs(tabs)
  }

  const closeCurrentTab = () => {
    if (isClosing) {
      return
    }

    isClosing = true

    const now = Date.now()
    const tabs = readPresenceTabs()
    delete tabs[tabId]

    const hasOtherOpenTab = Object.entries(tabs).some(([id, expiresAt]) =>
      id !== tabId && expiresAt > now,
    )

    writePresenceTabs(tabs)

    if (!hasOtherOpenTab) {
      beaconPresence("offline")
    }
  }

  const markOnline = async () => {
    touchCurrentTab()

    try {
      await postPresence("online")
    }
    catch {
      // Presence is best-effort and should not interrupt navigation.
    }
  }

  const startHeartbeat = () => {
    if (heartbeat !== null) {
      return
    }

    heartbeat = window.setInterval(() => {
      void markOnline()
    }, HEARTBEAT_INTERVAL_MS)
  }

  const stopHeartbeat = () => {
    if (heartbeat === null) {
      return
    }

    window.clearInterval(heartbeat)
    heartbeat = null
  }

  const handlePageHide = () => {
    stopHeartbeat()
    closeCurrentTab()
  }

  const handlePageShow = () => {
    isClosing = false
    void markOnline()
    startHeartbeat()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      void markOnline()
    }
  }

  const cleanup = () => {
    stopHeartbeat()
    window.removeEventListener("pagehide", handlePageHide)
    window.removeEventListener("pageshow", handlePageShow)
    document.removeEventListener("visibilitychange", handleVisibilityChange)

    if (window.__vnseeaMessagesPresenceCleanup === cleanup) {
      delete window.__vnseeaMessagesPresenceCleanup
    }
  }

  void markOnline()
  startHeartbeat()

  window.addEventListener("pagehide", handlePageHide)
  window.addEventListener("pageshow", handlePageShow)
  document.addEventListener("visibilitychange", handleVisibilityChange)
  window.__vnseeaMessagesPresenceCleanup = cleanup
  import.meta.hot?.dispose(cleanup)
})
