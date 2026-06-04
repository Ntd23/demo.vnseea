// English description: Removes leaked authentication credentials from guest URLs before Nuxt renders the page.

import { defineEventHandler, getRequestURL, sendRedirect } from "h3"

const sensitiveQueryKeys = new Set([
  "login",
  "password",
  "confirm_password",
  "confirmPassword",
  "new_password",
  "newPassword",
  "repeat_new_password",
  "repeatNewPassword",
])

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)

  if (requestUrl.pathname !== "/welcome") {
    return
  }

  let removedSensitiveValue = false

  for (const key of sensitiveQueryKeys) {
    if (requestUrl.searchParams.has(key)) {
      requestUrl.searchParams.delete(key)
      removedSensitiveValue = true
    }
  }

  if (!removedSensitiveValue) {
    return
  }

  const query = requestUrl.searchParams.toString()
  const cleanPath = query ? `${requestUrl.pathname}?${query}` : requestUrl.pathname

  return sendRedirect(event, cleanPath, 302)
})
