import type { SettingPage } from "../domain/types/settings.types"

export const createSettingsSnapshot = () => {
  const { t } = useI18n()

  const pages: SettingPage[] = [
    {
      slug: "profile",
      label: t("pages.settingsPage.menuProfile"),
      icon: "i-ph-user-duotone",
      description: t("pages.settingsPage.profileDescription"),
      sections: [
        {
          title: t("pages.settingsPage.infoTitle"),
          fields: [
            { label: t("pages.settingsPage.fullName"), value: "Administrator", type: "text" },
            { label: t("pages.settingsPage.email"), value: "admin@example.com", type: "text" },
          ]
        }
      ]
    },
    {
      slug: "privacy",
      label: t("pages.settingsPage.menuPrivacy"),
      icon: "i-ph-lock-duotone",
      description: t("pages.settingsPage.privacyDescription"),
      sections: [
        {
          title: t("pages.settingsPage.privacyTitle"),
          toggles: [
            { label: t("pages.settingsPage.privateAccount"), description: t("pages.settingsPage.privateAccountDesc"), value: false },
          ]
        }
      ]
    },
    {
      slug: "security",
      label: t("pages.settingsPage.menuSecurity"),
      icon: "i-ph-shield-check-duotone",
      description: t("pages.settingsPage.securityDescription"),
      sections: [
        {
          title: t("pages.settingsPage.securityTitle"),
          actions: [
            { label: t("pages.settingsPage.changePassword"), color: "primary", icon: "i-ph-key-duotone" },
          ]
        }
      ]
    }
  ]

  return {
    pages,
    defaultSlug: "profile"
  }
}
