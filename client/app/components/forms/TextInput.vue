<template>
  <label class="block space-y-2">
    <span v-if="label" class="text-sm font-semibold text-slate-600">{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="h-13 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })

withDefaults(defineProps<{
  label?: string
  type?: string
  placeholder?: string
}>(), {
  type: "text",
  placeholder: "",
})
</script>
