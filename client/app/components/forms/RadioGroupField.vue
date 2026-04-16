<template>
  <div class="space-y-3">
    <p v-if="label" class="text-sm font-semibold text-slate-600">{{ label }}</p>
    <div class="flex flex-wrap gap-3">
      <label
        v-for="option in options"
        :key="option.value"
        class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
        :class="model === option.value ? 'border-[#0000ff] bg-[#0000ff]/5 text-[#0000ff]' : 'border-[#0000ff]/15 bg-white text-[#0000ff]/60'"
      >
        <input v-model="model" :value="option.value" class="hidden" type="radio">
        <span>{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })

defineProps<{
  label?: string
  options: { label: string; value: string }[]
}>()
</script>
