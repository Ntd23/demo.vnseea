// English description: Coordinates visible-post Socket.IO rooms and canonical snapshot refreshes across Nuxt feed surfaces.

import { defineStore } from "pinia"
import { computed, ref, shallowRef } from "vue"
import type { Socket } from "socket.io-client"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type PostMutation = "reaction" | "comment" | "share" | "edited" | "deleted"

type PostChangedEvent = {
  eventId: string
  postId: string
  mutation: PostMutation
  occurredAt: number
}

type RealtimeAuth = {
  enabled: boolean
  token: string
  url: string
}

const MAX_WATCHED_POSTS = 50
const MAX_CONCURRENT_REQUESTS = 3
const REFRESH_DEBOUNCE_MS = 150
const POLLING_INTERVAL_MS = 15000

const normalizePostId = (value: unknown) => {
  const normalized = String(value ?? "").trim()
  return /^[1-9]\d*$/.test(normalized) ? normalized : ""
}

export const usePostRealtimeStore = defineStore("post-realtime", () => {
  const snapshots = shallowRef<Record<string, FeedPostRecord>>({})
  const deletedPostIds = shallowRef<Record<string, true>>({})
  const commentVersions = shallowRef<Record<string, number>>({})
  const connected = ref(false)
  const connecting = ref(false)
  const socket = shallowRef<Socket | null>(null)

  const watchedCounts = new Map<string, number>()
  const debounceTimers = new Map<string, ReturnType<typeof window.setTimeout>>()
  const inFlight = new Set<string>()
  const dirty = new Set<string>()
  const queued = new Set<string>()
  const requestQueue: string[] = []
  const seenEventIds = new Set<string>()
  let activeRequests = 0
  let pollTimer: ReturnType<typeof window.setInterval> | null = null
  let visibilityListenerAttached = false

  const watchedPostIds = computed(() => [...watchedCounts.keys()])

  function snapshotFor(postId: number | string) {
    return snapshots.value[normalizePostId(postId)]
  }

  function applySnapshot(post: FeedPostRecord) {
    const postId = normalizePostId(post.id)
    if (!postId) return

    const nextDeleted = { ...deletedPostIds.value }
    delete nextDeleted[postId]
    deletedPostIds.value = nextDeleted
    snapshots.value = { ...snapshots.value, [postId]: post }
  }

  function isDeleted(postId: number | string) {
    return deletedPostIds.value[normalizePostId(postId)] === true
  }

  function commentVersionFor(postId: number | string) {
    return commentVersions.value[normalizePostId(postId)] ?? 0
  }

  function isPageVisible() {
    return !import.meta.client || document.visibilityState !== "hidden"
  }

  function stopPolling() {
    if (pollTimer) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function refreshWatchedPosts() {
    if (!isPageVisible()) return

    for (const postId of watchedCounts.keys()) {
      enqueueRefresh(postId)
    }
  }

  function startPolling() {
    if (!import.meta.client || pollTimer || connected.value || watchedCounts.size === 0) return

    pollTimer = window.setInterval(() => {
      if (!socket.value) void connectSocket()
      refreshWatchedPosts()
    }, POLLING_INTERVAL_MS)
  }

  function rememberEvent(eventId: string) {
    if (!eventId || seenEventIds.has(eventId)) return false

    seenEventIds.add(eventId)
    if (seenEventIds.size > 500) {
      const oldest = seenEventIds.values().next().value
      if (oldest) seenEventIds.delete(oldest)
    }
    return true
  }

  function applyDeleted(postId: string) {
    const nextSnapshots = { ...snapshots.value }
    delete nextSnapshots[postId]
    snapshots.value = nextSnapshots
    deletedPostIds.value = { ...deletedPostIds.value, [postId]: true }
  }

  function markDeleted(postIdValue: number | string) {
    const postId = normalizePostId(postIdValue)
    if (!postId || deletedPostIds.value[postId]) return

    applyDeleted(postId)
  }

  function scheduleRefresh(postId: string) {
    const previousTimer = debounceTimers.get(postId)
    if (previousTimer) window.clearTimeout(previousTimer)

    debounceTimers.set(postId, window.setTimeout(() => {
      debounceTimers.delete(postId)
      enqueueRefresh(postId)
    }, REFRESH_DEBOUNCE_MS))
  }

  function handlePostChanged(payload: Partial<PostChangedEvent>) {
    const postId = normalizePostId(payload.postId)
    if (!postId || !watchedCounts.has(postId) || !rememberEvent(String(payload.eventId ?? ""))) return

    if (payload.mutation === "deleted") {
      applyDeleted(postId)
      return
    }

    if (payload.mutation === "reaction" || payload.mutation === "comment" || payload.mutation === "share" || payload.mutation === "edited") {
      if (payload.mutation === "comment") {
        commentVersions.value = {
          ...commentVersions.value,
          [postId]: (commentVersions.value[postId] ?? 0) + 1,
        }
      }
      scheduleRefresh(postId)
    }
  }

  function enqueueRefresh(postId: string) {
    if (!watchedCounts.has(postId)) return
    if (inFlight.has(postId)) {
      dirty.add(postId)
      return
    }
    if (queued.has(postId)) return

    queued.add(postId)
    requestQueue.push(postId)
    drainQueue()
  }

  function drainQueue() {
    while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
      const postId = requestQueue.shift()
      if (!postId) continue
      queued.delete(postId)
      if (!watchedCounts.has(postId)) continue
      void refreshPost(postId)
    }
  }

  async function refreshPost(postId: string) {
    activeRequests += 1
    inFlight.add(postId)
    try {
      const post = await createApiFeedRepository().getPostById(Number(postId))
      if (!watchedCounts.has(postId)) return

      if (!post) {
        applyDeleted(postId)
        return
      }

      const nextDeleted = { ...deletedPostIds.value }
      delete nextDeleted[postId]
      deletedPostIds.value = nextDeleted
      snapshots.value = { ...snapshots.value, [postId]: post }
    }
    catch {
      // Keep the last canonical snapshot; disconnected polling or a later event will retry.
    }
    finally {
      inFlight.delete(postId)
      activeRequests -= 1
      if (dirty.delete(postId) && watchedCounts.has(postId)) {
        enqueueRefresh(postId)
      }
      drainQueue()
    }
  }

  function subscribeWatchedRooms() {
    const postIds = [...watchedCounts.keys()].slice(0, MAX_WATCHED_POSTS)
    if (socket.value?.connected && postIds.length > 0) {
      socket.value.emit("posts:watch", { postIds })
    }
  }

  async function connectSocket() {
    if (!import.meta.client || socket.value || connecting.value || watchedCounts.size === 0) return

    connecting.value = true
    try {
      const client = useNuxtApiClient()
      const auth = await client.get<RealtimeAuth>("realtime/token")
      if (!auth.enabled || !auth.token || !auth.url) {
        startPolling()
        return
      }

      const { io } = await import("socket.io-client")
      const realtimeSocket = io(auth.url, {
        auth: { token: auth.token },
        transports: ["websocket"],
        timeout: 5000,
        reconnection: true,
      })

      realtimeSocket.on("connect", () => {
        connected.value = true
        stopPolling()
        subscribeWatchedRooms()
      })
      realtimeSocket.on("disconnect", () => {
        connected.value = false
        startPolling()
      })
      realtimeSocket.on("connect_error", () => {
        realtimeSocket.disconnect()
        if (socket.value === realtimeSocket) socket.value = null
        connected.value = false
        startPolling()
      })
      realtimeSocket.on("post:changed", handlePostChanged)
      socket.value = realtimeSocket
    }
    catch {
      connected.value = false
      startPolling()
    }
    finally {
      connecting.value = false
    }
  }

  function ensureVisibilityListener() {
    if (!import.meta.client || visibilityListenerAttached) return
    visibilityListenerAttached = true
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        stopPolling()
      }
      else if (!connected.value) {
        startPolling()
        refreshWatchedPosts()
      }
    })
  }

  function watchPost(value: number | string) {
    const postId = normalizePostId(value)
    if (!postId) return () => {}

    const currentCount = watchedCounts.get(postId) ?? 0
    if (currentCount === 0 && watchedCounts.size >= MAX_WATCHED_POSTS) return () => {}

    watchedCounts.set(postId, currentCount + 1)
    if (currentCount === 0) {
      ensureVisibilityListener()
      if (socket.value?.connected) socket.value.emit("posts:watch", { postIds: [postId] })
      else {
        void connectSocket()
        startPolling()
      }
    }

    let released = false
    return () => {
      if (released) return
      released = true
      const nextCount = (watchedCounts.get(postId) ?? 1) - 1
      if (nextCount > 0) {
        watchedCounts.set(postId, nextCount)
        return
      }

      watchedCounts.delete(postId)
      const timer = debounceTimers.get(postId)
      if (timer) window.clearTimeout(timer)
      debounceTimers.delete(postId)
      dirty.delete(postId)
      if (socket.value?.connected) socket.value.emit("posts:unwatch", { postIds: [postId] })
      if (watchedCounts.size === 0) stopPolling()
    }
  }

  return {
    connected,
    watchedPostIds,
    snapshotFor,
    applySnapshot,
    markDeleted,
    isDeleted,
    commentVersionFor,
    watchPost,
  }
})
