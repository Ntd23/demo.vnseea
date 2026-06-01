import { defineEventHandler, getCookie, getRequestURL, sendRedirect } from "h3"
import { isGuestOnlyPath } from "../../src/auth/application/constants/route-policy"
import { getBackendCurrentUser } from "../utils/backend-current-user"
import { clearBackendSessionCookie } from "../utils/backend-session-cookie"

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (!isGuestOnlyPath(pathname)) {
    return
  }

  const backendUserSession = getCookie(event, "user_id")

  if (backendUserSession) {
    try {
      await getBackendCurrentUser(event)
      return sendRedirect(event, "/home", 302)
    }
    catch {
      clearBackendSessionCookie(event)
    }
  }
})
