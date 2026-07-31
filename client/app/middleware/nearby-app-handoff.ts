// English description: Redirects a failed native nearby-map handoff to the matching mobile app store.
export default defineNuxtRouteMiddleware((to) => {
  const fallbackValue = Array.isArray(to.query.native_app_fallback)
    ? to.query.native_app_fallback[0]
    : to.query.native_app_fallback

  if (fallbackValue !== "ios" && fallbackValue !== "android") {
    return
  }

  const runtimeConfig = useRuntimeConfig()
  const nativeApp = runtimeConfig.public.nativeApp as {
    iosStoreUrl?: string
    androidStoreUrl?: string
  } | undefined
  const storeUrl = String(
    fallbackValue === "ios" ? nativeApp?.iosStoreUrl : nativeApp?.androidStoreUrl,
  ).trim()

  if (!/^https?:\/\//i.test(storeUrl)) {
    return navigateTo("/search-nearby", { replace: true })
  }

  return navigateTo(storeUrl, {
    external: true,
    redirectCode: 302,
  })
})
