// English description: Centralizes community creation constraints so forms, view-models, and API bridges enforce the same rules.

export const communityNameMinLength = 5
export const communitySlugMinLength = 5
export const communitySlugMaxLength = 32
export const communityDescriptionMinLength = 24

export function isCommunityNameValid(value: unknown) {
  return String(value ?? "").trim().length >= communityNameMinLength
}

export function isCommunitySlugLengthValid(value: unknown) {
  const slug = String(value ?? "").trim()
  return slug.length >= communitySlugMinLength && slug.length <= communitySlugMaxLength
}

export function isCommunitySlugFormatValid(value: unknown) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value ?? "").trim())
}

export function isCommunitySlugValid(value: unknown) {
  return isCommunitySlugLengthValid(value) && isCommunitySlugFormatValid(value)
}

export function isCommunityDescriptionValid(value: unknown) {
  return String(value ?? "").trim().length >= communityDescriptionMinLength
}
