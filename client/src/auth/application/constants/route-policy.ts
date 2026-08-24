// English description: Defines public and protected Nuxt route access policy for backend-session auth.

const guestOnlyPaths = new Set([
  "/welcome",
  "/register",
  "/forgot-password",
  "/confirm-login",
  "/confirm-account",
  "/confirm-reset-sms",
])

const publicPaths = new Set([
  ...guestOnlyPaths,
  "/reset-password",
  "/logout",
  "/contact-us",
  "/offers",
  "/products",
  "/site-pages",
])

const publicPrefixes = [
  "/@",
  "/g/",
  "/p/",
  "/post/",
  "/product/",
  "/read-blog/",
  "/terms/",
  "/site-pages/",
]

const protectedPrefixOverrides = [
  "/page-setting/",
  "/group-setting/",
  "/setting/",
]

const publicSegmentPrefixes = new Set(["/g", "/p", "/post", "/product", "/read-blog", "/terms", "/site-pages"])

const hasNonEmptyNestedSegment = (path: string, prefix: string) => {
  if (!path.startsWith(prefix)) {
    return false
  }

  const segment = path.slice(prefix.length).split("/", 1)[0]?.trim()

  return Boolean(segment)
}

const isPublicPrefixPath = (path: string) => {
  if (path.startsWith("/@")) {
    return path.length > 2
  }

  for (const prefix of publicPrefixes) {
    if (prefix === "/@") {
      continue
    }

    const rootSegment = prefix.slice(0, -1)

    if (publicSegmentPrefixes.has(rootSegment) && hasNonEmptyNestedSegment(path, prefix)) {
      return true
    }
  }

  return false
}

export const isPublicPath = (path: string) =>
  !protectedPrefixOverrides.some(prefix => path.startsWith(prefix))
  && (publicPaths.has(path) || isPublicPrefixPath(path))

export const isGuestOnlyPath = (path: string) => guestOnlyPaths.has(path)

export const isProtectedPath = (path: string) => !isPublicPath(path)
