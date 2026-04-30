import { appRoutes } from "#shared-kernel/application/constants/route-registry"

export default defineNuxtRouteMiddleware(() => {
  const backendUserSession = useCookie<string | null>("user_id", {
    default: () => null,
    sameSite: "lax",
    path: "/",
  })

  if (backendUserSession.value) {
    return navigateTo(appRoutes.feed, { replace: true })
  }
})
