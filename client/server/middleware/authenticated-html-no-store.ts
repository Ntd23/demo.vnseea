// Prevents proxies and browsers from reusing authenticated SSR payloads with stale account data.

import { getCookie, getHeader, setHeader } from "h3"

export default defineEventHandler((event) => {
  const method = event.node.req.method || "GET"
  if (method !== "GET" && method !== "HEAD") return
  if (!getCookie(event, "user_id")) return

  const accept = getHeader(event, "accept") || ""
  if (!accept.includes("text/html")) return

  setHeader(event, "Cache-Control", "private, no-store, no-cache, max-age=0, must-revalidate")
  setHeader(event, "Pragma", "no-cache")
  setHeader(event, "Expires", "0")
  setHeader(event, "Vary", "Cookie")
})
