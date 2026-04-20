<template>
  <div class="min-h-screen w-full bg-white lg:grid lg:grid-cols-[minmax(0,58%)_minmax(0,42%)] xl:grid-cols-[minmax(0,62%)_minmax(0,38%)]">
    <section class="hidden overflow-hidden bg-[linear-gradient(180deg,#1b1cf0_0%,#0a19d8_100%)] px-6 py-6 text-white sm:px-8 sm:py-8 lg:flex lg:px-10 lg:py-10">
      <slot name="left">
        <AuthHeroPanel v-bind="heroProps" />
      </slot>
    </section>

    <section class="flex min-w-0 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-14">
      <div class="w-full max-w-[420px] min-w-0">
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

