<template>
  <div class="min-h-svh w-full bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_100%)] lg:flex">
    <section
      class="hidden overflow-hidden bg-[linear-gradient(160deg,#2747ff_0%,#122ae0_46%,#0916ac_100%)] px-6 py-6 text-white sm:px-8 sm:py-8 lg:flex lg:min-h-svh lg:w-2/5 lg:px-8 lg:py-8 xl:px-10 xl:py-10"
      aria-label="VNSEEA auth hero"
    >
      <slot name="left">
        <AuthHeroPanel v-bind="resolvedHeroProps" />
      </slot>
    </section>

    <main class="relative flex min-w-0 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:min-h-svh lg:flex-1 lg:px-12 xl:px-16 2xl:px-20">
      <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8e4ff] to-transparent lg:hidden" />

      <div class="w-full min-w-0 max-w-[760px] 2xl:max-w-[840px]">
        <div class="mb-8 flex items-center justify-between lg:hidden">
          <slot name="mobile-brand">
            <NavigationHeaderLogo :inverted="false" to="/welcome" />
          </slot>
        </div>

        <slot name="right">
          <slot />
        </slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AuthHeroPanel from "./AuthHeroPanel.vue"
import NavigationHeaderLogo from "../../../navigation/presentation/components/HeaderLogo.vue"

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
