<template>
  <label class="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
    <input
      v-model="model"
      class="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
      type="checkbox"
    >
    <span>{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

defineProps<{ label: string }>()
</script>
