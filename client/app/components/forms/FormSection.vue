<template>
  <section class="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
    <div>
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
