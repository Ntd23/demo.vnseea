import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

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

export const useMockSettingsData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const pages = computed(() => {
    const localizedPages = structuredClone(localized<SettingPage[]>("pages.settingsPage.pages"))
    const emailField = localizedPages
      .find(page => page.slug === "general")
      ?.sections[0]
      ?.fields
      ?.find(field => field.key === "email")

    if (emailField) emailField.value = "justin@vnseea.test"

    return localizedPages
  })

  return {
    pages,
    defaultSlug: "general",
    findPageBySlug: (slug: string) => pages.value.find(page => page.slug === slug),
  }
}
