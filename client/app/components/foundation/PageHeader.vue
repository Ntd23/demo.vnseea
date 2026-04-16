<template>
  <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600">
        {{ eyebrow }}
      </p>
      <h1 class="section-title text-2xl font-black text-slate-900 md:text-4xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.trailing" class="shrink-0">
      <slot name="trailing" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  description?: string
}>()
</script>
