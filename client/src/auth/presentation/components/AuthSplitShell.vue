<!-- English description: Provides the responsive shell for guest authentication routes. -->
<template>
  <AuthHeroPanel v-bind="resolvedHeroProps">
    <slot name="right">
      <slot />
    </slot>
  </AuthHeroPanel>
</template>

<script setup lang="ts">
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"
import AuthHeroPanel from './AuthHeroPanel.vue'

const props = withDefaults(defineProps<{
  heroProps?: {
    title?: string
    subtitle?: string
    imageSrc?: string
    imageAlt?: string
  }
}>(), {
  heroProps: () => ({}),
})

const resolvedHeroProps = computed(() => ({
  title: props.heroProps.title ?? '',
  subtitle: props.heroProps.subtitle ?? '',
  imageSrc: props.heroProps.imageSrc ?? '',
  imageAlt: props.heroProps.imageAlt ?? '',
}))
</script>
