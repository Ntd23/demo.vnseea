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
  const { t } = useI18n()
  const tr = (key: string, params?: Record<string, string | number>) => t(`settings.data.${key}`, params)

  const pages: SettingPage[] = [
    {
      slug: "general",
      label: tr("pages.general.label"),
      icon: "i-ph-user-circle-fill",
      description: tr("pages.general.description"),
      sections: [
        {
          title: tr("pages.general.sections.account.title"),
          description: tr("pages.general.sections.account.description"),
          kind: "form",
          fields: [
            { label: tr("pages.general.sections.account.fields.username"), key: "username", type: "text", value: "justin", placeholder: tr("pages.general.sections.account.placeholders.username") },
            { label: tr("pages.general.sections.account.fields.email"), key: "email", type: "email", value: "justin@vnseea.test" },
            { label: tr("pages.general.sections.account.fields.phone"), key: "phone", type: "tel", value: "+84 900 000 000" },
            { label: tr("pages.general.sections.account.fields.birthday"), key: "birthday", type: "date", value: "1995-04-17" },
            { label: tr("pages.general.sections.account.fields.gender"), key: "gender", type: "select", value: tr("options.male"), options: [tr("options.male"), tr("options.female"), tr("options.other")] },
            { label: tr("pages.general.sections.account.fields.country"), key: "country", type: "select", value: tr("options.countryVietnam"), options: [tr("options.countryVietnam"), tr("options.countrySingapore"), tr("options.countryThailand"), tr("options.countryUnitedStates")] },
            { label: tr("pages.general.sections.account.fields.website"), key: "website", type: "url", value: "https://vnseea.test" },
          ],
        },
      ],
    },
    {
      slug: "profile",
      label: tr("pages.profile.label"),
      icon: "i-ph-identification-card-fill",
      description: tr("pages.profile.description"),
      sections: [
        {
          title: tr("pages.profile.sections.publicProfile.title"),
          description: tr("pages.profile.sections.publicProfile.description"),
          kind: "form",
          fields: [
            { label: tr("pages.profile.sections.publicProfile.fields.bio"), key: "bio", type: "textarea", value: tr("pages.profile.sections.publicProfile.values.bio") },
            { label: tr("pages.profile.sections.publicProfile.fields.workplace"), key: "workplace", type: "text", value: "VNSEEA" },
            { label: tr("pages.profile.sections.publicProfile.fields.school"), key: "school", type: "text", value: tr("pages.profile.sections.publicProfile.values.school") },
            { label: tr("pages.profile.sections.publicProfile.fields.relationship"), key: "relationship", type: "select", value: tr("options.hidden"), options: [tr("options.hidden"), tr("options.single"), tr("options.dating"), tr("options.married")] },
            { label: tr("pages.profile.sections.publicProfile.fields.city"), key: "city", type: "text", value: tr("pages.profile.sections.publicProfile.values.city") },
            { label: tr("pages.profile.sections.publicProfile.fields.hometown"), key: "hometown", type: "text", value: tr("pages.profile.sections.publicProfile.values.hometown") },
          ],
        },
      ],
    },
    {
      slug: "privacy",
      label: tr("pages.privacy.label"),
      icon: "i-ph-lock-key-fill",
      description: tr("pages.privacy.description"),
      sections: [
        {
          title: tr("pages.privacy.sections.privacyControls.title"),
          description: tr("pages.privacy.sections.privacyControls.description"),
          kind: "form",
          fields: [
            { label: tr("pages.privacy.sections.privacyControls.fields.posts"), key: "posts", type: "select", value: tr("options.friends"), options: [tr("options.public"), tr("options.friends"), tr("options.onlyMe")] },
            { label: tr("pages.privacy.sections.privacyControls.fields.follow"), key: "follow", type: "select", value: tr("options.public"), options: [tr("options.public"), tr("options.friends")] },
            { label: tr("pages.privacy.sections.privacyControls.fields.search"), key: "search", type: "select", value: tr("options.allow"), options: [tr("options.allow"), tr("options.hideFromSearch")] },
            { label: tr("pages.privacy.sections.privacyControls.fields.friends"), key: "friends", type: "select", value: tr("options.friends"), options: [tr("options.public"), tr("options.friends"), tr("options.onlyMe")] },
            { label: tr("pages.privacy.sections.privacyControls.fields.birthdayPrivacy"), key: "birthdayPrivacy", type: "select", value: tr("options.friends"), options: [tr("options.public"), tr("options.friends"), tr("options.onlyMe")] },
            { label: tr("pages.privacy.sections.privacyControls.fields.onlineStatus"), key: "onlineStatus", type: "select", value: tr("options.showOnline"), options: [tr("options.showOnline"), tr("options.alwaysOffline")] },
          ],
        },
      ],
    },
    {
      slug: "avatar",
      label: tr("pages.avatar.label"),
      icon: "i-ph-image-square-fill",
      description: tr("pages.avatar.description"),
      sections: [
        {
          title: tr("pages.avatar.sections.uploadAvatar.title"),
          description: tr("pages.avatar.sections.uploadAvatar.description"),
          kind: "form",
          fields: [
            { label: tr("pages.avatar.sections.uploadAvatar.fields.avatar"), key: "avatar", type: "file", value: "" },
          ],
        },
      ],
    },
    {
      slug: "design",
      label: tr("pages.design.label"),
      icon: "i-ph-palette-fill",
      description: tr("pages.design.description"),
      sections: [
        {
          title: tr("pages.design.sections.appearance.title"),
          description: tr("pages.design.sections.appearance.description"),
          kind: "form",
          fields: [
            { label: tr("pages.design.sections.appearance.fields.nightMode"), key: "nightMode", type: "select", value: tr("options.system"), options: [tr("options.on"), tr("options.off"), tr("options.system")] },
            { label: tr("pages.design.sections.appearance.fields.themeColor"), key: "themeColor", type: "select", value: tr("options.themeBlue"), options: [tr("options.themeBlue"), tr("options.themeEmerald"), tr("options.themeAmber"), tr("options.themeSlate")] },
          ],
        },
      ],
    },
    {
      slug: "password",
      label: tr("pages.password.label"),
      icon: "i-ph-key-fill",
      description: tr("pages.password.description"),
      sections: [
        {
          title: tr("pages.password.sections.changePassword.title"),
          description: tr("pages.password.sections.changePassword.description"),
          kind: "form",
          fields: [
            { label: tr("pages.password.sections.changePassword.fields.currentPassword"), key: "currentPassword", type: "password", value: "" },
            { label: tr("pages.password.sections.changePassword.fields.newPassword"), key: "newPassword", type: "password", value: "" },
            { label: tr("pages.password.sections.changePassword.fields.confirmPassword"), key: "confirmPassword", type: "password", value: "" },
          ],
        },
      ],
    },
    {
      slug: "two-factor",
      label: tr("pages.twoFactor.label"),
      icon: "i-ph-shield-check-fill",
      description: tr("pages.twoFactor.description"),
      sections: [
        {
          title: tr("pages.twoFactor.sections.authenticator.title"),
          description: tr("pages.twoFactor.sections.authenticator.description"),
          kind: "summary",
          items: [
            { title: tr("pages.twoFactor.sections.authenticator.items.enable.title"), description: tr("pages.twoFactor.sections.authenticator.items.enable.description"), action: tr("pages.twoFactor.sections.authenticator.items.enable.action") },
            { title: tr("pages.twoFactor.sections.authenticator.items.qr.title"), description: tr("pages.twoFactor.sections.authenticator.items.qr.description"), meta: "VNSEEA-2FA-2026" },
            { title: tr("pages.twoFactor.sections.authenticator.items.backup.title"), description: tr("pages.twoFactor.sections.authenticator.items.backup.description"), action: tr("pages.twoFactor.sections.authenticator.items.backup.action") },
          ],
        },
      ],
    },
    {
      slug: "notifications",
      label: tr("pages.notifications.label"),
      icon: "i-ph-bell-ringing-fill",
      description: tr("pages.notifications.description"),
      sections: [
        {
          title: tr("pages.notifications.sections.inApp.title"),
          description: tr("pages.notifications.sections.inApp.description"),
          kind: "toggles",
          toggles: [
            "likes", "comments", "follows", "messages", "mentions", "shares", "events", "groups", "pages", "marketplace", "jobs", "funding", "live", "watch", "security",
          ].map((key, index) => ({
            label: tr(`pages.notifications.sections.inApp.toggles.${key}.label`),
            description: tr(`pages.notifications.sections.inApp.toggles.${key}.description`),
            enabled: index < 10,
          })),
        },
      ],
    },
    {
      slug: "email-notifications",
      label: tr("pages.emailNotifications.label"),
      icon: "i-ph-envelope-simple-fill",
      description: tr("pages.emailNotifications.description"),
      sections: [
        {
          title: tr("pages.emailNotifications.sections.email.title"),
          description: tr("pages.emailNotifications.sections.email.description"),
          kind: "toggles",
          toggles: [
            { label: tr("pages.emailNotifications.sections.email.toggles.newMessage.label"), description: tr("pages.emailNotifications.sections.email.toggles.newMessage.description"), enabled: true },
            { label: tr("pages.emailNotifications.sections.email.toggles.mention.label"), description: tr("pages.emailNotifications.sections.email.toggles.mention.description"), enabled: true },
            { label: tr("pages.emailNotifications.sections.email.toggles.weeklyDigest.label"), description: tr("pages.emailNotifications.sections.email.toggles.weeklyDigest.description"), enabled: false },
            { label: tr("pages.emailNotifications.sections.email.toggles.security.label"), description: tr("pages.emailNotifications.sections.email.toggles.security.description"), enabled: true },
          ],
        },
      ],
    },
    {
      slug: "social-links",
      label: tr("pages.socialLinks.label"),
      icon: "i-ph-link-simple-fill",
      description: tr("pages.socialLinks.description"),
      sections: [
        {
          title: tr("pages.socialLinks.sections.socialLinks.title"),
          description: tr("pages.socialLinks.sections.socialLinks.description"),
          kind: "form",
          fields: ["facebook", "twitter", "linkedin", "instagram", "youtube"].map(key => ({
            label: tr(`pages.socialLinks.sections.socialLinks.fields.${key}`),
            key,
            type: "url",
            value: "",
            placeholder: tr(`pages.socialLinks.sections.socialLinks.placeholders.${key}`),
          })),
        },
      ],
    },
    {
      slug: "blocked-users",
      label: tr("pages.blockedUsers.label"),
      icon: "i-ph-user-minus-fill",
      description: tr("pages.blockedUsers.description"),
      sections: [
        {
          title: tr("pages.blockedUsers.sections.blockedUsers.title"),
          description: tr("pages.blockedUsers.sections.blockedUsers.description"),
          kind: "list",
          items: [
            { title: "spam-account", description: tr("pages.blockedUsers.sections.blockedUsers.items.spamAccount.description"), action: tr("pages.blockedUsers.sections.blockedUsers.items.spamAccount.action") },
            { title: "old-bot", description: tr("pages.blockedUsers.sections.blockedUsers.items.oldBot.description"), action: tr("pages.blockedUsers.sections.blockedUsers.items.oldBot.action") },
          ],
        },
      ],
    },
    {
      slug: "sessions",
      label: tr("pages.sessions.label"),
      icon: "i-ph-devices-fill",
      description: tr("pages.sessions.description"),
      sections: [
        {
          title: tr("pages.sessions.sections.activeSessions.title"),
          description: tr("pages.sessions.sections.activeSessions.description"),
          kind: "list",
          items: [
            { title: tr("pages.sessions.sections.activeSessions.items.chrome.title"), description: tr("pages.sessions.sections.activeSessions.items.chrome.description"), meta: tr("pages.sessions.sections.activeSessions.items.chrome.meta"), action: tr("pages.sessions.sections.activeSessions.items.chrome.action") },
            { title: tr("pages.sessions.sections.activeSessions.items.safari.title"), description: tr("pages.sessions.sections.activeSessions.items.safari.description"), meta: tr("pages.sessions.sections.activeSessions.items.safari.meta"), action: tr("pages.sessions.sections.activeSessions.items.safari.action") },
          ],
        },
      ],
    },
    {
      slug: "verification",
      label: tr("pages.verification.label"),
      icon: "i-ph-seal-check-fill",
      description: tr("pages.verification.description"),
      sections: [
        {
          title: tr("pages.verification.sections.request.title"),
          description: tr("pages.verification.sections.request.description"),
          kind: "form",
          fields: [
            { label: tr("pages.verification.sections.request.fields.documents"), key: "documents", type: "file", value: "" },
            { label: tr("pages.verification.sections.request.fields.note"), key: "verificationNote", type: "textarea", value: "" },
          ],
        },
      ],
    },
    {
      slug: "delete-account",
      label: tr("pages.deleteAccount.label"),
      icon: "i-ph-trash-fill",
      description: tr("pages.deleteAccount.description"),
      sections: [
        {
          title: tr("pages.deleteAccount.sections.deleteAccount.title"),
          description: tr("pages.deleteAccount.sections.deleteAccount.description"),
          kind: "danger",
          fields: [
            { label: tr("pages.deleteAccount.sections.deleteAccount.fields.passwordConfirm"), key: "deletePassword", type: "password", value: "" },
          ],
          actions: [{ label: tr("pages.deleteAccount.sections.deleteAccount.action"), icon: "i-ph-trash-fill", tone: "danger" }],
        },
      ],
    },
    {
      slug: "payments",
      label: tr("pages.payments.label"),
      icon: "i-ph-credit-card-fill",
      description: tr("pages.payments.description"),
      sections: [
        {
          title: tr("pages.payments.sections.paymentMethods.title"),
          description: tr("pages.payments.sections.paymentMethods.description"),
          kind: "list",
          items: [
            { title: tr("pages.payments.sections.paymentMethods.items.visa.title"), description: tr("pages.payments.sections.paymentMethods.items.visa.description"), meta: tr("pages.payments.sections.paymentMethods.items.visa.meta"), action: tr("pages.payments.sections.paymentMethods.items.visa.action") },
            { title: tr("pages.payments.sections.paymentMethods.items.wallet.title"), description: tr("pages.payments.sections.paymentMethods.items.wallet.description"), meta: tr("pages.payments.sections.paymentMethods.items.wallet.meta"), action: tr("pages.payments.sections.paymentMethods.items.wallet.action") },
          ],
        },
      ],
    },
    {
      slug: "monetization",
      label: tr("pages.monetization.label"),
      icon: "i-ph-currency-circle-dollar-fill",
      description: tr("pages.monetization.description"),
      sections: [
        {
          title: tr("pages.monetization.sections.plan.title"),
          description: tr("pages.monetization.sections.plan.description"),
          kind: "form",
          fields: [
            { label: tr("pages.monetization.sections.plan.fields.planName"), key: "planName", type: "text", value: "Creator Plus" },
            { label: tr("pages.monetization.sections.plan.fields.price"), key: "price", type: "number", value: 99000 },
            { label: tr("pages.monetization.sections.plan.fields.enabled"), key: "enabled", type: "select", value: tr("options.enable"), options: [tr("options.enable"), tr("options.disable")] },
          ],
        },
      ],
    },
    {
      slug: "invitation-links",
      label: tr("pages.invitationLinks.label"),
      icon: "i-ph-ticket-fill",
      description: tr("pages.invitationLinks.description"),
      sections: [
        {
          title: tr("pages.invitationLinks.sections.links.title"),
          description: tr("pages.invitationLinks.sections.links.description"),
          kind: "list",
          items: [
            { title: "https://vnseea.test/invite/JUSTIN2026", description: tr("pages.invitationLinks.sections.links.items.link.description"), meta: tr("pages.invitationLinks.sections.links.items.link.meta"), action: tr("pages.invitationLinks.sections.links.items.link.action") },
            { title: tr("pages.invitationLinks.sections.links.items.invitees.title"), description: tr("pages.invitationLinks.sections.links.items.invitees.description"), action: tr("pages.invitationLinks.sections.links.items.invitees.action") },
          ],
        },
      ],
    },
    {
      slug: "affiliates",
      label: tr("pages.affiliates.label"),
      icon: "i-ph-handshake-fill",
      description: tr("pages.affiliates.description"),
      sections: [
        {
          title: tr("pages.affiliates.sections.dashboard.title"),
          description: tr("pages.affiliates.sections.dashboard.description"),
          kind: "summary",
          items: [
            { title: tr("pages.affiliates.sections.dashboard.items.referralLink.title"), description: "https://vnseea.test/ref/justin", action: tr("pages.affiliates.sections.dashboard.items.referralLink.action") },
            { title: tr("pages.affiliates.sections.dashboard.items.earnings.title"), description: "VND 12.400.000", meta: tr("pages.affiliates.sections.dashboard.items.earnings.meta") },
            { title: tr("pages.affiliates.sections.dashboard.items.referrals.title"), description: tr("pages.affiliates.sections.dashboard.items.referrals.description"), meta: "2026" },
          ],
        },
      ],
    },
    {
      slug: "my-info",
      label: tr("pages.myInfo.label"),
      icon: "i-ph-download-simple-fill",
      description: tr("pages.myInfo.description"),
      sections: [
        {
          title: tr("pages.myInfo.sections.myInfo.title"),
          description: tr("pages.myInfo.sections.myInfo.description"),
          kind: "summary",
          items: [
            { title: tr("pages.myInfo.sections.myInfo.items.download.title"), description: tr("pages.myInfo.sections.myInfo.items.download.description"), action: tr("pages.myInfo.sections.myInfo.items.download.action") },
          ],
        },
      ],
    },
    {
      slug: "my-points",
      label: tr("pages.myPoints.label"),
      icon: "i-ph-coin-fill",
      description: tr("pages.myPoints.description"),
      sections: [
        {
          title: tr("pages.myPoints.sections.myPoints.title"),
          description: tr("pages.myPoints.sections.myPoints.description"),
          kind: "list",
          items: [
            { title: tr("pages.myPoints.sections.myPoints.items.balance.title"), description: tr("pages.myPoints.sections.myPoints.items.balance.description"), meta: tr("pages.myPoints.sections.myPoints.items.balance.meta") },
            { title: "+10", description: tr("pages.myPoints.sections.myPoints.items.comment.description"), meta: tr("pages.myPoints.sections.myPoints.items.comment.meta") },
            { title: "+25", description: tr("pages.myPoints.sections.myPoints.items.event.description"), meta: tr("pages.myPoints.sections.myPoints.items.event.meta") },
          ],
        },
      ],
    },
    {
      slug: "addresses",
      label: tr("pages.addresses.label"),
      icon: "i-ph-map-pin-fill",
      description: tr("pages.addresses.description"),
      sections: [
        {
          title: tr("pages.addresses.sections.shippingAddresses.title"),
          description: tr("pages.addresses.sections.shippingAddresses.description"),
          kind: "form",
          fields: [
            { label: tr("pages.addresses.sections.shippingAddresses.fields.fullName"), key: "addressName", type: "text", value: "Justin" },
            { label: tr("pages.addresses.sections.shippingAddresses.fields.phone"), key: "addressPhone", type: "tel", value: "+84 900 000 000" },
            { label: tr("pages.addresses.sections.shippingAddresses.fields.address"), key: "addressLine", type: "textarea", value: tr("pages.addresses.sections.shippingAddresses.values.address") },
          ],
        },
      ],
    },
    {
      slug: "career",
      label: tr("pages.career.label"),
      icon: "i-ph-briefcase-fill",
      description: tr("pages.career.description"),
      sections: [
        {
          title: tr("pages.career.sections.profile.title"),
          description: tr("pages.career.sections.profile.description"),
          kind: "list",
          items: [
            { title: tr("pages.career.sections.profile.items.workExperience.title"), description: tr("pages.career.sections.profile.items.workExperience.description"), action: tr("pages.career.sections.profile.items.workExperience.action") },
            { title: tr("pages.career.sections.profile.items.certifications.title"), description: tr("pages.career.sections.profile.items.certifications.description"), action: tr("pages.career.sections.profile.items.certifications.action") },
            { title: tr("pages.career.sections.profile.items.projects.title"), description: tr("pages.career.sections.profile.items.projects.description"), action: tr("pages.career.sections.profile.items.projects.action") },
          ],
        },
      ],
    },
  ]

  return {
    pages,
    defaultSlug: "general",
    findPageBySlug: (slug: string) => pages.find(page => page.slug === slug),
  }
}
