// English description: Strips sensitive auth form fields from client-side route queries.

const sensitiveAuthQueryKeys = new Set([
  "login",
  "password",
  "confirm_password",
  "confirmPassword",
  "new_password",
  "newPassword",
  "repeat_new_password",
  "repeatNewPassword",
])

export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/welcome") {
    return
  }

  const sanitizedQuery = { ...to.query }
  let hasSensitiveQuery = false

  for (const key of sensitiveAuthQueryKeys) {
    if (key in sanitizedQuery) {
      delete sanitizedQuery[key]
      hasSensitiveQuery = true
    }
  }

  if (!hasSensitiveQuery) {
    return
  }

  return navigateTo({
    path: to.path,
    query: sanitizedQuery,
    hash: to.hash,
  }, { replace: true })
})
