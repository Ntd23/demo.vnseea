<template>
  <label class="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-4">
    <div>
      <p class="text-sm font-semibold text-slate-900">{{ label }}</p>
      <p v-if="description" class="mt-1 text-xs text-slate-500">{{ description }}</p>
    </div>
    <button
      class="relative h-7 w-13 rounded-full transition"
      :class="model ? 'bg-primary-600' : 'bg-slate-200'"
      type="button"
      @click="model = !model"
    >
      <span
        class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition"
        :class="model ? 'left-7' : 'left-1'"
      />
    </button>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

defineProps<{
  label: string
  description?: string
}>()
</script>
