<template>
  <AuthSplitShell :hero-props="heroProps">
    <slot />
  </AuthSplitShell>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import AuthSplitShell from "../../src/auth/presentation/components/AuthSplitShell.vue"

const { t } = useI18n()
const route = useRoute()

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

  const title = t('pages.welcomePage.title')

  return {
    title,
    subtitle: t('pages.welcomePage.subtitle'),
    imageAlt: title,
  }
})
</script>
