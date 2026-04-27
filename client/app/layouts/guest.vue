<template>
  <AuthSplitShell :hero-props="heroProps">
    <slot />
  </AuthSplitShell>
</template>

<script setup lang="ts">
import AuthSplitShell from "../../src/auth/presentation/components/AuthSplitShell.vue"

const { t } = useI18n()
const route = useRoute()

const heroProps = computed(() => {
  if (route.path.endsWith('/register')) {
    const title = t('pages.registerPage.heroTitle')

    return {
      title,
      subtitle: t('pages.registerPage.subtitle'),
      imageAlt: title,
    }
  }

  if (route.path.endsWith('/forgot-password')) {
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
