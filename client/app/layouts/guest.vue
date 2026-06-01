<!-- English description: Hosts guest authentication pages with backend-driven branding in the shared auth shell. -->
<template>
  <AuthSplitShell :hero-props="heroProps">
    <slot />
  </AuthSplitShell>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"
import AuthSplitShell from "../../src/auth/presentation/components/AuthSplitShell.vue"

const { t } = useI18n()
const route = useRoute()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const siteName = computed(() => branding.value.siteName || branding.value.siteTitle)
const accountLabel = computed(() => siteName.value ? `your ${siteName.value} account` : "your account")

const heroProps = computed(() => {
  if (route.path.endsWith(appRoutes.register)) {
    const title = t('pages.registerPage.heroTitle')

    return {
      title,
      subtitle: t('pages.registerPage.subtitle'),
      imageAlt: title,
    }
  }

  if (route.path.endsWith(appRoutes.forgotPassword)) {
    const title = t('pages.forgotPasswordPage.heroTitle')

    return {
      title,
      subtitle: t('pages.forgotPasswordPage.heroSubtitle'),
      imageAlt: title,
    }
  }

  if (route.path.endsWith(appRoutes.confirmLogin)) {
    return {
      title: "Confirm your sign in",
      subtitle: "Enter the confirmation code provided by the backend to finish the sign-in flow.",
      imageAlt: "Confirm sign in",
    }
  }

  if (route.path.endsWith(appRoutes.confirmAccount)) {
    return {
      title: `Verify ${accountLabel.value}`,
      subtitle: "Use the code sent by email or SMS so the backend can activate the account and start a real web session.",
      imageAlt: "Verify account",
    }
  }

  if (route.path.endsWith(appRoutes.confirmResetSms)) {
    return {
      title: "Confirm your phone reset code",
      subtitle: siteName.value
        ? `Once the SMS code is verified, ${siteName.value} will open the password reset form for this account.`
        : "Once the SMS code is verified, the password reset form will open for this account.",
      imageAlt: "Confirm phone reset code",
    }
  }

  if (route.path.endsWith(appRoutes.resetPassword)) {
    return {
      title: "Set your new password",
      subtitle: "Finish the password reset flow with the secure token that the backend already issued.",
      imageAlt: "Reset password",
    }
  }

  const title = t('pages.welcomePage.title')

  return {
    title,
    subtitle: t('pages.welcomePage.subtitle'),
    imageAlt: title,
  }
})
</script>
