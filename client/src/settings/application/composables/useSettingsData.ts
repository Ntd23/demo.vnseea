import { resolveI18nMessage } from "#shared-kernel/application/utils/resolveI18nMessage"
import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"

export type SettingFieldType = "text" | "email" | "tel" | "date" | "select" | "textarea" | "password" | "file" | "number" | "url"
export type SettingSectionKind = "form" | "toggles" | "list" | "danger" | "summary"

export type SettingField = {
  label: string
  key: string
  type: SettingFieldType
  value: string | number
  placeholder?: string
  options?: string[]
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
  toggles?: { label: string; description: string; enabled: boolean }[]
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

type SettingsMe = {
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
}

const fieldValueByKey = (user: SettingsMe | null, key: string) => {
  if (!user) return undefined

  const values: Record<string, string | number | undefined> = {
    username: user.username,
    name: user.name,
    email: user.email,
    phone_number: user.phone,
    phone: user.phone,
    gender: user.gender,
    birthday: user.birthday,
    country_id: user.countryId,
    website: user.website,
    about: user.about,
  }

  return values[key]
}

export const useSettingsData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const user = ref<SettingsMe | null>(null)
  const loading = ref(false)
  const errorMessage = ref("")
  const client = useNuxtApiClient()

  async function hydrate() {
    loading.value = true
    errorMessage.value = ""

    try {
      user.value = await client.get<SettingsMe>(apiRoutes.settings.me)
    }
    catch (error) {
      user.value = null
      errorMessage.value = error instanceof Error ? error.message : "Unable to load settings."
    }
    finally {
      loading.value = false
    }
  }

  const pages = computed(() => {
    const localizedPages = structuredClone(localized<SettingPage[]>("pages.settingsPage.pages"))

    for (const page of localizedPages) {
      for (const section of page.sections) {
        for (const field of section.fields || []) {
          const value = fieldValueByKey(user.value, field.key)

          if (value !== undefined && value !== null && value !== "") {
            field.value = value
          }
        }
      }
    }

    return localizedPages
  })

  void hydrate()

  return {
    pages,
    user,
    loading,
    errorMessage,
    defaultSlug: "general",
    hydrate,
    findPageBySlug: (slug: string) => pages.value.find(page => page.slug === slug),
  }
}
