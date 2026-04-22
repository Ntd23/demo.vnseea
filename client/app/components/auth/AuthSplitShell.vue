<template>
  <div class="min-h-screen w-full bg-white lg:grid lg:grid-cols-[minmax(320px,40%)_minmax(0,60%)] 2xl:grid-cols-[minmax(340px,37%)_minmax(0,63%)]">
    <section class="hidden overflow-hidden bg-[linear-gradient(180deg,#1b1cf0_0%,#0a19d8_100%)] px-6 py-6 text-white sm:px-8 sm:py-8 lg:flex lg:px-8 lg:py-8 xl:px-10 xl:py-10">
      <slot name="left">
        <AuthHeroPanel v-bind="heroProps" />
      </slot>
    </section>

    <section class="flex min-w-0 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16 2xl:px-20">
      <div class="w-full max-w-[760px] min-w-0 2xl:max-w-[840px]">
        <slot name="right" />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  heroProps: {
    title: string
    subtitle: string
    imageSrc?: string
    imageAlt?: string
  }
}>()
</script>
