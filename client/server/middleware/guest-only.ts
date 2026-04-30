import { defineEventHandler, getCookie, getRequestURL, sendRedirect } from "h3"
import { isPublicPath } from "../../src/auth/application/constants/route-policy"

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname

  if (!isPublicPath(pathname) || pathname === "/logout") {
    return
  }

  const backendUserSession = getCookie(event, "user_id")

  if (backendUserSession) {
    return sendRedirect(event, "/home", 302)
  }
})
