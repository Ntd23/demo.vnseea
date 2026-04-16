<template>
  <section :class="['surface-card rounded-[28px] p-4 md:p-6', toneClass]">
    <slot />
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ tone?: "default" | "soft" }>(), {
  tone: "default",
})

const toneClass = computed(() =>
  props.tone === "soft" ? "bg-white/80" : "bg-white/92",
)
</script>
