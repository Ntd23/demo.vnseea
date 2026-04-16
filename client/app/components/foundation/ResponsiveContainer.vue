<template>
  <div :class="['app-shell w-full px-4 md:px-6 xl:px-8', padded ? 'py-6 md:py-8' : '']">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean }>(), {
  padded: false,
})
</script>
