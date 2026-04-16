<template>
  <label class="block space-y-2">
    <span v-if="label" class="text-sm font-semibold text-slate-600">{{ label }}</span>
    <select
      v-model="model"
      class="h-13 w-full rounded-[22px] border border-[#0000ff]/20 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })

defineProps<{
  label?: string
  options: { label: string; value: string }[]
}>()
</script>
