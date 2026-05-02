// English description: Returns the current PHP-authenticated user settings payload for Nuxt settings pages.

import { getBackendCurrentUser } from "../../utils/backend-current-user"

export type SettingsMeResponse = Record<string, unknown> & {
  id: number
  name: string
  username?: string
  email?: string
  phone?: string
  gender?: string
  birthday?: string
  countryId?: string
  website?: string
  about?: string
  verified?: boolean
  wallet?: number | string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : undefined

const asBooleanNumber = (value: unknown) =>
  value === true || value === "1" || value === 1

const roleFromAdminFlag = (value: unknown) => {
  const flag = Number(value ?? 0)

  if (flag === 1) return "admin"
  if (flag === 2) return "moderator"

  return "user"
}

export default defineEventHandler(async (event): Promise<SettingsMeResponse> => {
  const user = await getBackendCurrentUser(event)

  const name = asString(user.name) || asString(user.username) || "User"

  return {
    ...user,
    id: Number(user.user_id ?? user.id),
    name,
    username: asString(user.username),
    email: asString(user.email),
    phone: asString(user.phone_number),
    phoneNumber: asString(user.phone_number),
    gender: asString(user.gender),
    birthday: asString(user.birthday),
    countryId: asString(user.country_id),
    website: asString(user.website),
    about: asString(user.about),
    verified: asBooleanNumber(user.verified),
    wallet: asString(user.wallet),
    role: roleFromAdminFlag(user.admin),
  }
})
