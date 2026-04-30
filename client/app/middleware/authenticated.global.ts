import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { isProtectedPath } from "../../src/auth/application/constants/route-policy"

export default defineNuxtRouteMiddleware((to) => {
  if (!isProtectedPath(to.path)) {
    return
  }

  const backendUserSession = useCookie<string | null>("user_id", {
    default: () => null,
    sameSite: "lax",
    path: "/",
  })

  if (!backendUserSession.value) {
    return navigateTo(appRoutes.welcome, { replace: true })
  }
})
