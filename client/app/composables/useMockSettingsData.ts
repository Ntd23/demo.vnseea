import { useSettings } from "../../src/settings/application/composables/use-settings"

/**
 * Legacy delegate for useMockSettingsData.
 * Logic and structure moved to src/settings/application/composables/use-settings.ts
 */
export const useMockSettingsData = () => {
  const { pages, defaultSlug, findPageBySlug } = useSettings()

  return {
    pages,
    defaultSlug,
    findPageBySlug
  }
}

export type { 
  SettingPage, 
  SettingSection, 
  SettingField 
} from "../../src/settings/domain/types/settings.types"
