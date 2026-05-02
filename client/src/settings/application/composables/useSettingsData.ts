// English description: Settings page view model data that maps Nuxt UI fields to PHP phtml settings handlers.

import { createApiSettingsRepository } from "../../infrastructure/repositories/ApiSettingsRepository"
import type { SettingsFieldValue, SettingsSectionSlug, SettingsUpdateInput, SettingsUser } from "../../domain/types/settings.types"

export type SettingFieldType = "text" | "email" | "tel" | "date" | "select" | "textarea" | "password" | "file" | "number" | "url" | "verification"
export type SettingSectionKind = "form" | "toggles" | "list" | "danger" | "summary"

export type SettingField = {
  label: string
  key: string
  type: SettingFieldType
  value: string | number | boolean | File
  description?: string
  placeholder?: string
  options?: string[]
  span?: "full"
  readOnly?: boolean
}

export type SettingFieldValue = SettingsFieldValue

export type SettingToggle = {
  key: string
  label: string
  description: string
  enabled: boolean
  readOnly?: boolean
}

export type SettingAction = {
  label: string
  icon: string
  tone?: "primary" | "danger" | "neutral"
}

export type SettingItem = {
  title: string
  description: string
  meta?: string
  action?: string
}

export type SettingSection = {
  title: string
  description: string
  kind: SettingSectionKind
  fields?: SettingField[]
  toggles?: SettingToggle[]
  items?: SettingItem[]
  actions?: SettingAction[]
}

export type SettingPage = {
  slug: string
  label: string
  icon: string
  description: string
  sections: SettingSection[]
}

const pageIcons: Record<string, string> = {
  general: "i-ph-user-fill",
  profile: "i-ph-identification-card-fill",
  privacy: "i-ph-lock-key-fill",
  avatar: "i-ph-image-fill",
  design: "i-ph-palette-fill",
  password: "i-ph-key-fill",
  twoFactor: "i-ph-shield-check-fill",
  notifications: "i-ph-bell-fill",
  emailNotifications: "i-ph-envelope-fill",
  socialLinks: "i-ph-link-fill",
  verification: "i-ph-seal-check-fill",
  deleteAccount: "i-ph-warning-octagon-fill",
  myPoints: "i-ph-star-fill",
}

const supportedUpdateSections = new Set<SettingsSectionSlug>([
  "general",
  "profile",
  "privacy",
  "avatar",
  "design",
  "password",
  "twoFactor",
  "notifications",
  "emailNotifications",
  "socialLinks",
  "deleteAccount",
])

const countryOptions = [
  { label: "Vietnam", value: "233" },
  { label: "Singapore", value: "192" },
  { label: "Thailand", value: "213" },
  { label: "United States", value: "1" },
]

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

const relationshipOptions = [
  { label: "None", value: "0" },
  { label: "Single", value: "1" },
  { label: "In a relationship", value: "2" },
  { label: "Married", value: "3" },
  { label: "Engaged", value: "4" },
]

const postPrivacyOptions = [
  { label: "Everyone", value: "everyone" },
  { label: "People I follow", value: "ifollow" },
  { label: "Nobody", value: "nobody" },
]

const binaryOptions = [
  { label: "Enabled", value: "1" },
  { label: "Disabled", value: "0" },
]

const messagePrivacyOptions = [
  { label: "Everyone", value: "0" },
  { label: "People I follow", value: "1" },
  { label: "Nobody", value: "2" },
]

const friendPrivacyOptions = [
  { label: "Everyone", value: "0" },
  { label: "People I follow", value: "1" },
  { label: "People following me", value: "2" },
  { label: "Nobody", value: "3" },
]

const designBackgroundOptions = [
  { label: "Default background", value: "defualt" },
  { label: "My background", value: "my_background" },
]

const cssStatusOptions = [
  { label: "Default CSS", value: "1" },
  { label: "Uploaded CSS", value: "2" },
]

const twoFactorOptions = [
  { label: "Enable", value: "enable" },
  { label: "Disable", value: "disable" },
]

const twoFactorMethodOptions = [
  { label: "Email / SMS code", value: "two_factor" },
  { label: "Google Authenticator", value: "google" },
  { label: "Authy", value: "authy" },
]

const optionLabel = (
  options: Array<{ label: string; value: string }>,
  value: unknown,
) => options.find(option => option.value === String(value ?? ""))?.label ?? ""

const optionValue = (
  options: Array<{ label: string; value: string }>,
  value: SettingsFieldValue,
) => options.find(option => option.label === String(value) || option.value === String(value))?.value ?? String(value)

const toPhpBirthday = (value: SettingsFieldValue) => {
  const textValue = String(value)
  const isoMatch = textValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  return isoMatch ? `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}` : textValue
}

const toHtmlBirthday = (value: unknown) => {
  const textValue = String(value ?? "")
  const phpMatch = textValue.match(/^(\d{2})-(\d{2})-(\d{4})$/)

  return phpMatch ? `${phpMatch[3]}-${phpMatch[2]}-${phpMatch[1]}` : textValue
}

const isTrue = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "on" || value === "enabled"

const hasAdminSettingsRights = (user: SettingsUser | null) =>
  user?.role === "admin" || user?.role === "moderator"

const notificationValue = (user: SettingsUser | null, key: string) => {
  const notificationSettings = user?.notification_settings
  const fromNotificationSettings = notificationSettings?.[key]

  if (fromNotificationSettings !== undefined) {
    return isTrue(fromNotificationSettings)
  }

  return isTrue(user?.[key as keyof SettingsUser])
}

const field = (
  key: string,
  label: string,
  type: SettingFieldType,
  value: SettingField["value"],
  options?: string[],
  extra: Partial<SettingField> = {},
): SettingField => ({
  key,
  label,
  type,
  value,
  options,
  ...extra,
})

const summaryItem = (title: string, description: string, meta?: string): SettingItem => ({
  title,
  description,
  meta,
})

const generalPage = (user: SettingsUser | null): SettingPage => ({
  slug: "general",
  label: "General",
  icon: pageIcons.general,
  description: "Matches the PHP general settings form.",
  sections: [{
    title: "Account information",
    description: "Username, contact, birthday, country, verification, and wallet.",
    kind: "form",
    fields: [
      field("username", "Username", "text", user?.username ?? ""),
      field("phone_number", "Phone", "tel", user?.phone ?? ""),
      field("gender", "Gender", "select", optionLabel(genderOptions, user?.gender), genderOptions.map(option => option.label)),
      field("email", "E-mail", "email", user?.email ?? "", undefined, { span: "full" }),
      field("birthday", "Birthday", "date", toHtmlBirthday(user?.birthday)),
      field("country_id", "Country", "select", optionLabel(countryOptions, user?.countryId), countryOptions.map(option => option.label)),
      field("verified", "Verification", "verification", user?.verified ?? false, undefined, {
        span: "full",
        readOnly: !hasAdminSettingsRights(user),
      }),
      field("wallet", "Wallet", "number", user?.wallet ?? "", undefined, {
        span: "full",
        readOnly: !hasAdminSettingsRights(user),
      }),
    ],
  }],
})

const profilePage = (user: SettingsUser | null): SettingPage => ({
  slug: "profile",
  label: "Profile",
  icon: pageIcons.profile,
  description: "Matches the PHP public profile settings form.",
  sections: [{
    title: "Public profile",
    description: "Name, website, bio, work, school, address, and relationship.",
    kind: "form",
    fields: [
      field("first_name", "First name", "text", user?.first_name ?? ""),
      field("last_name", "Last name", "text", user?.last_name ?? ""),
      field("website", "Website", "url", user?.website ?? "", undefined, { span: "full" }),
      field("about", "About", "textarea", user?.about ?? "", undefined, { span: "full" }),
      field("working", "Working", "text", user?.working ?? ""),
      field("working_link", "Company website", "url", user?.working_link ?? ""),
      field("address", "Address", "text", user?.address ?? "", undefined, { span: "full" }),
      field("school", "School", "text", user?.school ?? ""),
      field("relationship", "Relationship", "select", optionLabel(relationshipOptions, user?.relationship_id), relationshipOptions.map(option => option.label)),
      field("completed", "School completed", "select", isTrue(user?.school_completed) ? "Enabled" : "Disabled", binaryOptions.map(option => option.label)),
    ],
  }],
})

const privacyPage = (user: SettingsUser | null): SettingPage => ({
  slug: "privacy",
  label: "Privacy",
  icon: pageIcons.privacy,
  description: "Matches the PHP privacy settings form.",
  sections: [{
    title: "Privacy controls",
    description: "Who can message, follow, see posts, activity, visits, birthday, and location data.",
    kind: "form",
    fields: [
      field("message_privacy", "Who can message me", "select", optionLabel(messagePrivacyOptions, user?.message_privacy), messagePrivacyOptions.map(option => option.label)),
      field("follow_privacy", "Who can follow me", "select", optionLabel(binaryOptions, user?.follow_privacy), binaryOptions.map(option => option.label)),
      field("friend_privacy", "Who can see friends", "select", optionLabel(friendPrivacyOptions, user?.friend_privacy), friendPrivacyOptions.map(option => option.label)),
      field("post_privacy", "Who can see posts", "select", optionLabel(postPrivacyOptions, user?.post_privacy), postPrivacyOptions.map(option => option.label)),
      field("showlastseen", "Show last seen", "select", optionLabel(binaryOptions, user?.showlastseen), binaryOptions.map(option => option.label)),
      field("confirm_followers", "Confirm followers", "select", optionLabel(binaryOptions, user?.confirm_followers), binaryOptions.map(option => option.label)),
      field("show_activities_privacy", "Show activities", "select", optionLabel(binaryOptions, user?.show_activities_privacy), binaryOptions.map(option => option.label)),
      field("visit_privacy", "Profile visits privacy", "select", optionLabel(binaryOptions, user?.visit_privacy), binaryOptions.map(option => option.label)),
      field("birth_privacy", "Birthday privacy", "select", optionLabel(messagePrivacyOptions, user?.birth_privacy), messagePrivacyOptions.map(option => option.label)),
      field("status", "Online status", "select", optionLabel(binaryOptions, user?.status), binaryOptions.map(option => option.label)),
      field("share_my_location", "Share my location", "select", optionLabel(binaryOptions, user?.share_my_location), binaryOptions.map(option => option.label)),
      field("share_my_data", "Share my data", "select", optionLabel(binaryOptions, user?.share_my_data), binaryOptions.map(option => option.label)),
    ],
  }],
})

const designPage = (user: SettingsUser | null): SettingPage => ({
  slug: "design",
  label: "Appearance",
  icon: pageIcons.design,
  description: "Matches the PHP design settings form for background/CSS status.",
  sections: [{
    title: "Design",
    description: "Switch between default and uploaded profile design assets.",
    kind: "form",
    fields: [
      field("background_image_status", "Background image", "select", isTrue(user?.background_image_status) ? "My background" : "Default background", designBackgroundOptions.map(option => option.label)),
      field("css_status", "CSS file", "select", user?.css_file ? "Uploaded CSS" : "Default CSS", cssStatusOptions.map(option => option.label)),
      field("background_image", "Upload background image", "file", "", undefined, { span: "full" }),
      field("css_file", "Upload CSS file", "file", "", undefined, { span: "full" }),
    ],
  }],
})

const avatarPage = (user: SettingsUser | null): SettingPage => ({
  slug: "avatar",
  label: "Avatar",
  icon: pageIcons.avatar,
  description: "Matches the PHP avatar and cover upload form.",
  sections: [{
    title: "Avatar & cover",
    description: "Choose avatar or cover image and save through the same PHP multipart handler.",
    kind: "form",
    fields: [
      field("avatar", "Avatar image", "file", "", undefined, {
        description: user?.avatar || "Current avatar URL is not available.",
        span: "full",
      }),
      field("cover", "Cover image", "file", "", undefined, {
        description: user?.cover || "Current cover URL is not available.",
        span: "full",
      }),
    ],
  }],
})

const passwordPage = (): SettingPage => ({
  slug: "password",
  label: "Password",
  icon: pageIcons.password,
  description: "Matches the PHP password settings form.",
  sections: [{
    title: "Change password",
    description: "Changing password also clears other app sessions in PHP.",
    kind: "form",
    fields: [
      field("current_password", "Current password", "password", ""),
      field("new_password", "New password", "password", ""),
      field("repeat_new_password", "Confirm password", "password", ""),
    ],
  }],
})

const twoFactorPage = (user: SettingsUser | null): SettingPage => ({
  slug: "twoFactor",
  label: "2FA",
  icon: pageIcons.twoFactor,
  description: "Matches the PHP two-factor enable/disable/verify code endpoints.",
  sections: [{
    title: "Two-factor authentication",
    description: `Current status: ${isTrue(user?.two_factor) ? "enabled" : "disabled"}.`,
    kind: "form",
    fields: [
      field("two_factor", "Action", "select", isTrue(user?.two_factor) ? "Disable" : "Enable", twoFactorOptions.map(option => option.label)),
      field("phone_number", "Phone for SMS code", "tel", user?.phone ?? ""),
      field("code", "Verification code", "text", ""),
      field("factor_method", "Verification method", "select", optionLabel(twoFactorMethodOptions, user?.two_factor_method || "two_factor"), twoFactorMethodOptions.map(option => option.label)),
    ],
  }],
})

const notificationKeys = [
  ["e_liked", "Likes"],
  ["e_shared", "Shares"],
  ["e_wondered", "Wonders"],
  ["e_commented", "Comments"],
  ["e_followed", "Followers"],
  ["e_liked_page", "Page likes"],
  ["e_visited", "Profile visits"],
  ["e_mentioned", "Mentions"],
  ["e_joined_group", "Group joins"],
  ["e_accepted", "Accepted requests"],
  ["e_profile_wall_post", "Profile wall posts"],
  ["e_memory", "Memories"],
] as const

const notificationsPage = (user: SettingsUser | null): SettingPage => ({
  slug: "notifications",
  label: "Notifications",
  icon: pageIcons.notifications,
  description: "Matches the PHP in-app notification settings form.",
  sections: [{
    title: "In-app notifications",
    description: "Enable or disable each notification type.",
    kind: "toggles",
    toggles: notificationKeys.map(([key, label]) => ({
      key,
      label,
      description: `Receive ${label.toLowerCase()} notifications.`,
      enabled: notificationValue(user, key),
    })),
  }],
})

const emailNotificationKeys = notificationKeys
  .filter(([key]) => key !== "e_memory")
  .concat([["e_sentme_msg", "Messages"] as const])

const emailNotificationsPage = (user: SettingsUser | null): SettingPage => ({
  slug: "emailNotifications",
  label: "Email",
  icon: pageIcons.emailNotifications,
  description: "Matches the PHP email notification settings form.",
  sections: [{
    title: "Email notifications",
    description: "Choose which emails PHP is allowed to send.",
    kind: "toggles",
    toggles: emailNotificationKeys.map(([key, label]) => ({
      key,
      label,
      description: `Send email for ${label.toLowerCase()}.`,
      enabled: notificationValue(user, key),
    })),
  }],
})

const socialLinksPage = (user: SettingsUser | null): SettingPage => ({
  slug: "socialLinks",
  label: "Social links",
  icon: pageIcons.socialLinks,
  description: "Matches the PHP social links settings form.",
  sections: [{
    title: "Social links",
    description: "Links displayed on the profile.",
    kind: "form",
    fields: [
      field("facebook", "Facebook", "url", user?.facebook ?? ""),
      field("twitter", "Twitter", "url", user?.twitter ?? ""),
      field("linkedin", "LinkedIn", "url", user?.linkedin ?? ""),
      field("instagram", "Instagram", "url", user?.instagram ?? ""),
      field("youtube", "YouTube", "url", user?.youtube ?? ""),
      field("vk", "VK", "url", user?.vk ?? ""),
    ],
  }],
})

const verificationPage = (user: SettingsUser | null): SettingPage => ({
  slug: "verification",
  label: "Verification",
  icon: pageIcons.verification,
  description: "Current verification state from PHP.",
  sections: [{
    title: "Verification",
    description: "Admin/moderator can edit verification in General, matching the phtml general settings form.",
    kind: "summary",
    items: [
      summaryItem(user?.verified ? "Verified" : "Not verified", "Use General settings to change this state when your backend role allows it."),
    ],
  }],
})

const deleteAccountPage = (): SettingPage => ({
  slug: "deleteAccount",
  label: "Delete account",
  icon: pageIcons.deleteAccount,
  description: "Matches the PHP delete account form.",
  sections: [{
    title: "Delete account",
    description: "This action permanently deletes the current PHP account.",
    kind: "danger",
    fields: [
      field("password", "Password confirm", "password", ""),
    ],
    actions: [{ label: "Delete account", icon: "i-ph-trash-duotone", tone: "danger" }],
  }],
})

const myPointsPage = (user: SettingsUser | null): SettingPage => ({
  slug: "myPoints",
  label: "My points",
  icon: pageIcons.myPoints,
  description: "Current points loaded from the backend user session.",
  sections: [{
    title: "Points",
    description: "This is read from the backend user payload.",
    kind: "summary",
    items: [
      summaryItem(`${user?.points ?? 0} points`, "Current balance", "Backend"),
    ],
  }],
})

const createPages = (user: SettingsUser | null): SettingPage[] => [
  generalPage(user),
  profilePage(user),
  privacyPage(user),
  avatarPage(user),
  designPage(user),
  passwordPage(),
  twoFactorPage(user),
  notificationsPage(user),
  emailNotificationsPage(user),
  socialLinksPage(user),
  verificationPage(user),
  myPointsPage(user),
  deleteAccountPage(),
]

const mapFieldsForSection = (
  section: string,
  fields: Record<string, SettingsFieldValue>,
) => {
  const payload: Record<string, SettingsFieldValue> = {}

  for (const [key, value] of Object.entries(fields)) {
    switch (key) {
      case "gender":
        payload[key] = optionValue(genderOptions, value)
        break
      case "birthday":
        payload[key] = toPhpBirthday(value)
        break
      case "country_id":
        payload[key] = optionValue(countryOptions, value)
        break
      case "relationship":
        payload[key] = optionValue(relationshipOptions, value)
        break
      case "post_privacy":
        payload[key] = optionValue(postPrivacyOptions, value)
        break
      case "message_privacy":
      case "birth_privacy":
        payload[key] = optionValue(messagePrivacyOptions, value)
        break
      case "friend_privacy":
        payload[key] = optionValue(friendPrivacyOptions, value)
        break
      case "follow_privacy":
      case "showlastseen":
      case "confirm_followers":
      case "show_activities_privacy":
      case "visit_privacy":
      case "status":
      case "share_my_location":
      case "share_my_data":
      case "completed":
        payload[key] = optionValue(binaryOptions, value)
        break
      case "background_image_status":
        payload[key] = optionValue(designBackgroundOptions, value)
        break
      case "css_status":
        payload[key] = optionValue(cssStatusOptions, value)
        break
      case "two_factor":
        payload[key] = optionValue(twoFactorOptions, value)
        break
      case "factor_method":
        payload[key] = optionValue(twoFactorMethodOptions, value)
        break
      default:
        payload[key] = value
    }
  }

  if (section === "password") {
    payload.repeat_new_password = payload.repeat_new_password || payload.confirm_password || ""
  }

  return payload
}

export const useSettingsData = () => {
  const user = ref<SettingsUser | null>(null)
  const loading = ref(false)
  const errorMessage = ref("")
  const settingsRepository = createApiSettingsRepository()

  async function hydrate() {
    loading.value = true
    errorMessage.value = ""

    try {
      user.value = await settingsRepository.getCurrentUser()
    }
    catch (error) {
      user.value = null
      errorMessage.value = error instanceof Error ? error.message : "Unable to load settings."
    }
    finally {
      loading.value = false
    }
  }

  async function updateSettings(section: string, fields: Record<string, SettingFieldValue>) {
    errorMessage.value = ""

    if (!supportedUpdateSections.has(section as SettingsSectionSlug)) {
      throw new Error("This settings section is read-only because PHP does not expose a matching phtml update handler.")
    }

    const mappedFields = mapFieldsForSection(section, fields)

    if (Object.keys(mappedFields).length === 0) {
      throw new Error("No backend-supported settings fields were changed.")
    }

    const updateInput: SettingsUpdateInput = {
      section: section as SettingsSectionSlug,
      fields: mappedFields,
    }

    const response = await settingsRepository.update(updateInput)

    await hydrate()

    return response.message
  }

  const pages = computed<SettingPage[]>(() => createPages(user.value))

  void hydrate()

  return {
    pages,
    user,
    loading,
    errorMessage,
    defaultSlug: "general",
    hydrate,
    updateSettings,
    findPageBySlug: (slug: string) => pages.value.find(page => page.slug === slug),
  }
}
