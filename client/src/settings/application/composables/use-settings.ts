import { createSettingsSnapshot } from "../use-cases/create-settings-snapshot"
import type { SettingPage } from "../../domain/types/settings.types"

const { pages, defaultSlug } = createSettingsSnapshot()

export const useSettings = () => {
  const findPageBySlug = (slug: string) => {
    return pages.find(p => p.slug === slug)
  }

  return {
    pages: readonly(ref(pages)),
    defaultSlug,
    findPageBySlug
  }
}
