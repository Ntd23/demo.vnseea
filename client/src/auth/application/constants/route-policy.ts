// English description: Defines public and protected Nuxt route access policy for backend-session auth.

const guestOnlyPaths = new Set([
  "/welcome",
  "/register",
  "/forgot-password",
  "/confirm-login",
  "/confirm-account",
  "/confirm-reset-sms",
  "/reset-password",
])

const publicPaths = new Set([
  ...guestOnlyPaths,
  "/logout",
])

const publicPrefixes = [
  "/terms/",
  "/site-pages/",
]

export const isPublicPath = (path: string) =>
  publicPaths.has(path) || publicPrefixes.some(prefix => path.startsWith(prefix))

export const isGuestOnlyPath = (path: string) => guestOnlyPaths.has(path)

export const isProtectedPath = (path: string) => !isPublicPath(path)
