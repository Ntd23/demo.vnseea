export const contentAudiencePrivacy = {
  public: "0",
  friends: "1",
  followers: "2",
  only_me: "3",
} as const

export type ContentAudience = keyof typeof contentAudiencePrivacy
export type ContentAudienceSelection = {
  audience: ContentAudience
  privacy: typeof contentAudiencePrivacy[ContentAudience]
  isAnonymous: boolean
}
export type ContentPostContext = "personal" | "page" | "group" | "event"

type ContentPostAudienceInput = {
  context: ContentPostContext
  audience?: unknown
  audienceProvided?: boolean
  isAnonymous?: boolean
}

export type ValidatedContentPostAudience = {
  audience: ContentAudience | null
  privacy: typeof contentAudiencePrivacy[ContentAudience] | null
  isAnonymous: boolean
}

const legacyAnonymousAudience = "postPrivacy4"

const audienceByPrivacy = Object.fromEntries(
  Object.entries(contentAudiencePrivacy).map(([audience, privacy]) => [privacy, audience]),
) as Record<string, ContentAudience>

const parseCanonicalContentAudience = (value: unknown): ContentAudience | null => {
  const raw = String(value ?? "").trim().toLowerCase()
  return raw in contentAudiencePrivacy ? raw as ContentAudience : null
}

export const isCanonicalPublicContentAudience = (value: unknown) => {
  const raw = String(value ?? "").trim().toLowerCase()
  return raw === "public" || raw === contentAudiencePrivacy.public
}

export const normalizeContentAudience = (value: unknown): ContentAudience => {
  const raw = String(value ?? "").trim().toLowerCase()

  if (raw === "connections") return "friends"
  if (raw === "private" || raw === "only-me") return "only_me"
  if (raw in contentAudiencePrivacy) return raw as ContentAudience
  return audienceByPrivacy[raw] ?? "public"
}

export const normalizeContentAudienceSelection = (value: unknown): ContentAudienceSelection => {
  const isLegacyAnonymous = String(value ?? "").trim() === legacyAnonymousAudience
    || String(value ?? "").trim() === "4"
    || String(value ?? "").trim().toLowerCase() === "anonymous"

  return {
    audience: isLegacyAnonymous ? "public" : normalizeContentAudience(value),
    privacy: isLegacyAnonymous ? contentAudiencePrivacy.public : contentAudiencePrivacy[normalizeContentAudience(value)],
    isAnonymous: isLegacyAnonymous,
  }
}

export const validateContentPostAudience = (
  input: ContentPostAudienceInput,
): ValidatedContentPostAudience => {
  const audienceProvided = input.audienceProvided ?? input.audience !== undefined
  const isAnonymous = input.isAnonymous === true

  if (input.context === "group" || input.context === "event") {
    if (isAnonymous) {
      throw new Error(`Anonymous posts are not allowed in ${input.context} context.`)
    }
    if (audienceProvided) {
      throw new Error(`${input.context} post audience is inherited and must not be supplied.`)
    }

    return { audience: null, privacy: null, isAnonymous: false }
  }

  if (isAnonymous && input.context !== "personal") {
    throw new Error("Anonymous posts are only allowed in personal context.")
  }

  const audience = audienceProvided
    ? parseCanonicalContentAudience(input.audience)
    : "public"

  if (!audience) {
    throw new Error("Post audience is invalid for audience_v2.")
  }
  if (input.context === "page" && audience !== "public" && audience !== "followers") {
    throw new Error("Post audience is invalid for page context.")
  }

  const effectiveAudience = isAnonymous ? "public" : audience
  return {
    audience: effectiveAudience,
    privacy: contentAudiencePrivacy[effectiveAudience],
    isAnonymous,
  }
}

export const contentAudienceLabel = (audience: ContentAudience) => ({
  public: "Public",
  friends: "Friends",
  followers: "Followers",
  only_me: "Only me",
}[audience])
